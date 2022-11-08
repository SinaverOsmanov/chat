import {ApplicationDb, ensureTypeDatabase} from "../helpers/mongoDatabase";
import {Collection, Db, ModifyResult, ObjectId, WithId} from "mongodb";
import {isModerator} from "../helpers/isModerator";
import {ConnectionEntry, MessageRecord, SendMessage} from "../types";
import {MessageType, MessageTypeLikedByMe, ModeratorMessageType, TypeWSMessage} from "../../common/dto/types";
import {messageDto} from "../helpers/messageDto";
import {
  ConfirmedMessage,
  GetMessages,
  LikeMessage, LoadMoreMessages,
  RemoveMessage,
  ReplyToMessage,
  WsMessage,
} from "../../common/dto/dto";
import {isLikedMessage} from "../helpers/isLikedMessage";
import {getFilteredMessages} from "../services/getFilteredMessages";
import {parseEnvorimentWithModerator} from "../helpers/parseEnvorimentWithModerator";

export class UserSessionProcessor {
  private constructor(
      private sendMessage: SendMessage,
      private db: ApplicationDb,
      private eventGetter: (eventId: string) => Map<string, ConnectionEntry>,
      private clientId: string,
      private eventId: string,
      private isModerator: boolean
  ) {}

  static async init(
      sendMessage: SendMessage,
      db: Db,
      clientId: string,
      eventId: string,
      eventGetter: (eventId: string) => Map<string, ConnectionEntry>,
      forceModerator: boolean
  ): Promise<UserSessionProcessor> {
    const moderator = forceModerator || (await isModerator(db, clientId));

    const { messages } = await ensureTypeDatabase(db);

    let foundMessages: MessageRecord[];

    if (moderator) {
      foundMessages = await messages.find({ eventId }).toArray();
    } else {
      foundMessages = await messages
          .find({
            eventId,
            $or: [{ isConfirmed: true }, { senderId: clientId }],
          }, { sort: {_id: "desc"}})
          .limit(30)
          .toArray();
    }

    const mappedMessages: MessageType[] = foundMessages.map((message) =>
        messageDto(message, clientId)
    );

    await sendMessage({
      type: 'connect',
      data: mappedMessages,
    });

    return new UserSessionProcessor(
        sendMessage,
        await ensureTypeDatabase(db),
        eventGetter,
        clientId,
        eventId,
        moderator
    );
  }

  async processMessage(message: WsMessage) {
    const { data, type }: any = message;

    if (type === 'likes') {
      await this.processLike(data);
    } else if (type === 'replyToMessage') {
      await this.processReply(data);
    } else if (type === 'removeMessage') {
      await this.processRemoveMessage(data);
    } else if (type === 'getMessages') {
      await this.processGetMessages(data);
    } else if (type === 'confirmedMessage') {
      await this.processConfirmedMessages(data);
    } else if (type === 'message') {
      await this.processSendMessage(data);
    } else if (type === 'loadMoreMessages') {
      await this.processLoadMoreMessages(data)
    }
  }

  async processSendMessage(data: MessageType) {
    try {
      const { messages } = this.db;
      const envWithModerator = await parseEnvorimentWithModerator(process.env.ENVIRONMENT_WITH_MODERATOR)
      if (!(await messages.indexExists("eventId"))) {
        await messages.createIndex({ eventId: -1 });
      }
      const moderator = this.isModerator;

      let confirmedMessageData;

      if(envWithModerator){
        confirmedMessageData = {
          dateConfirmed: moderator ? new Date() : null,
          isConfirmed: moderator,
        }
      } else {
        confirmedMessageData = {
          dateConfirmed: new Date(),
          isConfirmed: true,
        }
      }

      const responseMessage: MessageRecord = {
            _id: new ObjectId(),
            senderId: this.clientId,
            sender: data.sender,
            text: data.text,
            likes: [],
            created: new Date(),
            answer: null,
            eventId: this.eventId,
            ...confirmedMessageData
          }

      const { acknowledged } = await messages.insertOne(responseMessage);

      if (!acknowledged) throw new Error("insertOne doesn't acknowledged");

      const eventClients = this.eventGetter(this.eventId);

      const responseData: WsMessage = {
        type: 'message',
        data: messageDto(responseMessage),
      };


      if(envWithModerator) {
        eventClients.forEach((e) => {
          if(responseData.data.isConfirmed && moderator) {
            e.session.sendMessage(responseData)
          } else if (
              e.session.isModerator ||
              responseMessage.senderId === e.ws.clientId
          ) {
            e.session.sendMessage(responseData);
          }
        });
      } else {
        eventClients.forEach((e) => {
          e.session.sendMessage(responseData)
        })
      }
    } catch (e) {
      console.log(e);
    }
  }

  async processLike(data: LikeMessage) {
    try {
      const { messages } = this.db;

      const m = await messages.findOne({ _id: new ObjectId(data.messageId) });
      if(!m) throw new Error('message not found')

      const foundIfHaveLike = isLikedMessage(m.likes, this.clientId)

      let message: ModifyResult<MessageRecord>;

      if (foundIfHaveLike) {
        message = await messages.findOneAndUpdate(
            {
              _id: new ObjectId(data.messageId),
            },
            {
              $pull: {
                likes: new ObjectId(this.clientId),
              },
            },
            {returnDocument: 'after'}
        );
      } else {
        message = await messages.findOneAndUpdate(
            {
              _id: new ObjectId(data.messageId),
            },
            {
              $addToSet: {
                likes: new ObjectId(this.clientId),
              },
            },
            {returnDocument: 'after'}
        );
      }

      if (message.ok && message.value) {
        let eventClients = this.eventGetter(this.eventId);

        if (!eventClients) throw new Error("no event");

        const countLikes = message.value.likes.length

        eventClients.forEach((e) => {
          e.session.sendMessage({
            type: 'likes',
            data: {
              messageId: data.messageId,
              count: countLikes,
            },
          });
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async processReply(data: ReplyToMessage) {
    try {
      const { messages } = this.db;

      const replyObject = {
        _id: new ObjectId(),
        moderatorId: new ObjectId(this.clientId),
        created: new Date(),
        messageId: new ObjectId(data.messageId),
        sender: "Модератор",
        text: data.reply,
      };

      if (this.isModerator) {
        const message = await messages.findOneAndUpdate(
            {
              _id: new ObjectId(data.messageId),
            },
            {
              $set: {
                answer: replyObject,
              },
            }
        );

        if (!!message.ok) {
          let eventClients = this.eventGetter(this.eventId);

          if (!eventClients) throw new Error("no event");

          eventClients.forEach((e) => {
            e.session.sendMessage({
              type: 'replyToMessage',
              data: {
                ...replyObject,
                _id: replyObject._id.toHexString(),
                messageId: data.messageId,
                moderatorId: replyObject.moderatorId.toHexString(),
              },
            });
          });
        }
      } else {
        throw new Error("Please change your account");
      }
    } catch (e) {
      console.log(e);
    }
  }

  async processRemoveMessage(data: RemoveMessage) {
    try {
      if (!this.isModerator) {
        return;
      }
      const { messages } = this.db;

      const removed = await messages.deleteOne({
        _id: new ObjectId(data.messageId),
      });

      if (removed.acknowledged) {
        let eventClients = this.eventGetter(this.eventId);

        if (!eventClients) throw new Error("no event");

        eventClients.forEach((e) => {
          e.session.sendMessage({
            type: 'removeMessage',
            data: { messageId: data.messageId },
          });
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async processConfirmedMessages(data: ConfirmedMessage) {
    if (!this.isModerator) {
      return;
    }
    const { messages } = this.db;
    const { ok, value }: ModifyResult<MessageRecord> = await messages.findOneAndUpdate(
        {
          _id: new ObjectId(data.messageId)
        },
        {
          $set: {
            isConfirmed: true,
            dateConfirmed: new Date()
          }
        },
        {returnDocument: 'after'}
    );

    if (ok && value) {
      let eventClients = this.eventGetter(this.eventId);

      eventClients.forEach((e) => {e.session.sendMessage({
        type: 'confirmedMessage',
        data: messageDto(value),
      })
      });
    }
  }

  async processLoadMoreMessages(data: LoadMoreMessages & {filter: string} ) {
    const {messages} = this.db
    const documentsLength = await messages.countDocuments()
    const isHaveMessages = documentsLength === data.lengthMessages
    let foundMessages: MessageRecord[] = [];


    if(!isHaveMessages) {
      if (data.filter === 'my') {
        foundMessages = await messages
            .find(
                {
                  eventId: this.eventId,
                  senderId: this.clientId,

                  _id: {$lt: new ObjectId(data.firstMessage)}
                },
                {sort: {_id: "desc"}, limit: 30}
            )
            .toArray();
      } else {
        foundMessages = await messages
            .find(
                {
                  eventId: this.eventId,

                  _id: {$lt: new ObjectId(data.firstMessage)}
                },
                {sort: {_id: "desc"}, limit: 30}
            )
            .toArray();
      }
    }


    const mappedMessages: MessageType[] = !!foundMessages.length
        ? foundMessages.map((m)=>messageDto(m))
        : [];

    await this.sendMessage({
      type: 'loadMoreMessages',
      data: {
        messages: mappedMessages,
        isHaveMessages: mappedMessages.length + data.lengthMessages === documentsLength},
    });

  }

  async processGetMessages(data: GetMessages) {
    const { messages } = this.db;

    const foundMessages = await getFilteredMessages(messages, this.isModerator, data.filter, this.clientId, this.eventId)

    const mappedMessages: MessageType[] = foundMessages.map((m)=>messageDto(m));

    await this.sendMessage({
      type: 'getMessages',
      data: mappedMessages,
    });
  }
}

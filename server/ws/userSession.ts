import { ApplicationDb, ensureTypeDatabase } from "../helpers/mongoDatabase";
import { Db, ModifyResult, ObjectId } from "mongodb";
import { isModerator } from "../helpers/isModerator";
import { ConnectionEntry, MessageRecord, SendMessage } from "../types";
import { MessageType, TypeWSMessage } from "../../client/src/common/dto/types";
import { messageDto } from "../helpers/messageDto";
import {
  ClientMessage,
  ConfirmedMessage,
  GetMessages,
  LikeMessage,
  LoadMoreMessages,
  RemoveMessage,
  ReplyToMessage,
  WsServerMessage,
} from "../../client/src/common/dto/dto";
import { isLikedMessage } from "../helpers/isLikedMessage";
import { getFilteredMessages } from "../services/getFilteredMessages";
import { parseEnvorimentWithModerator } from "../helpers/parseEnvorimentWithModerator";
import { getFilteredLoadMoreMessages } from "../services/getFilteredLoadMoreMessages";

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
    const documentsLength = await messages.countDocuments();

    const isHaveMessages = documentsLength > 30;

    let foundMessages: MessageRecord[];

    if (moderator) {
      foundMessages = await messages.find({ eventId }).toArray();
    } else {
      foundMessages = await messages
        .find(
          {
            eventId,
            $or: [{ isConfirmed: true }, { senderId: clientId }],
          },
          { sort: { _id: "desc" } }
        )
        .limit(30)
        .toArray();
    }

    const mappedMessages: MessageType[] = foundMessages.map((message) =>
      messageDto(message, clientId)
    );

    await sendMessage({
      type: TypeWSMessage.CONNECT,
      data: { messages: mappedMessages, isHaveMessages: isHaveMessages },
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

  async processMessage(message: WsServerMessage) {
    const { data, type } = message;

    if (type === TypeWSMessage.LIKES) {
      await this.processLike(data);
    } else if (type === TypeWSMessage.REPLY_TO_MESSAGE) {
      await this.processReply(data);
    } else if (type === TypeWSMessage.REMOVE_MESSAGE) {
      await this.processRemoveMessage(data);
    } else if (type === TypeWSMessage.GET_MESSAGES) {
      await this.processGetMessages(data);
    } else if (type === TypeWSMessage.CONFIRMED_MESSAGE) {
      await this.processConfirmedMessages(data);
    } else if (type === TypeWSMessage.MESSAGE) {
      await this.processSendMessage(data);
    } else if (type === TypeWSMessage.LOAD_MORE) {
      await this.processLoadMoreMessages(data);
    }
  }

  async processSendMessage(data: ClientMessage) {
    try {
      const { messages } = this.db;
      const envWithModerator = await parseEnvorimentWithModerator(
        process.env.ENVIRONMENT_WITH_MODERATOR
      );
      if (!(await messages.indexExists("eventId"))) {
        await messages.createIndex({ eventId: -1 });
      }
      const moderator = this.isModerator;

      let confirmedMessageData;

      if (envWithModerator) {
        confirmedMessageData = {
          dateConfirmed: moderator ? new Date() : null,
          isConfirmed: moderator,
        };
      } else {
        confirmedMessageData = {
          dateConfirmed: new Date(),
          isConfirmed: true,
        };
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
        ...confirmedMessageData,
      };

      const { acknowledged } = await messages.insertOne(responseMessage);

      if (!acknowledged) throw new Error("insertOne doesn't acknowledged");

      const eventClients = this.eventGetter(this.eventId);

      const responseData = {
        type: TypeWSMessage.MESSAGE as const,
        data: messageDto(responseMessage),
      };

      if (envWithModerator) {
        eventClients.forEach((e) => {
          if (responseData.data.isConfirmed && moderator) {
            e.session.sendMessage(responseData);
          } else if (
            e.session.isModerator ||
            responseMessage.senderId === e.ws.clientId
          ) {
            e.session.sendMessage(responseData);
          }
        });
      } else {
        eventClients.forEach((e) => {
          return e.session.sendMessage(responseData);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async processLike(data: { messageId: string }) {
    try {
      const { messages } = this.db;

      const m = await messages.findOne({ _id: new ObjectId(data.messageId) });
      if (!m) throw new Error("message not found");

      const foundIfHaveLike = isLikedMessage(m.likes, this.clientId);

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
          { returnDocument: "after" }
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
          { returnDocument: "after" }
        );
      }

      if (message.ok && message.value) {
        let eventClients = this.eventGetter(this.eventId);

        if (!eventClients) throw new Error("no event");

        const countLikes = message.value.likes.length;

        eventClients.forEach((e) => {
          e.session.sendMessage({
            type: TypeWSMessage.LIKES,
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
              type: TypeWSMessage.REPLY_TO_MESSAGE,
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
            type: TypeWSMessage.REMOVE_MESSAGE,
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
    const { ok, value }: ModifyResult<MessageRecord> =
      await messages.findOneAndUpdate(
        {
          _id: new ObjectId(data.messageId),
        },
        {
          $set: {
            isConfirmed: true,
            dateConfirmed: new Date(),
          },
        },
        { returnDocument: "after" }
      );

    if (ok && value) {
      let eventClients = this.eventGetter(this.eventId);

      eventClients.forEach((e) => {
        e.session.sendMessage({
          type: TypeWSMessage.CONFIRMED_MESSAGE,
          data: messageDto(value),
        });
      });
    }
  }

  async processLoadMoreMessages(data: LoadMoreMessages & GetMessages) {
    const { messages } = this.db;
    const documentsLength = await messages.countDocuments();
    let isHaveNotMessages = documentsLength === data.lengthMessages;

    let foundMessages: MessageRecord[] = [];

    if (!isHaveNotMessages) {
      foundMessages = await getFilteredLoadMoreMessages(
        messages,
        data.lengthMessages,
        data.filter,
        this.clientId,
        this.eventId
      );
    }

    const mappedMessages: MessageType[] = !!foundMessages.length
      ? foundMessages.map((m) => messageDto(m))
      : [];

    await this.sendMessage({
      type: TypeWSMessage.LOAD_MORE,
      data: {
        messages: mappedMessages,
        isHaveMessages: mappedMessages.length > 30,
      },
    });
  }

  async processGetMessages(data: GetMessages) {
    const { messages } = this.db;

    const documentsLength = await messages.countDocuments();
    const isHaveMessages = documentsLength > 30;

    let foundMessages: MessageRecord[] = await getFilteredMessages(
      messages,
      this.isModerator,
      data.filter,
      this.clientId,
      this.eventId
    );

    const mappedMessages: MessageType[] = !!foundMessages.length
      ? foundMessages.map((m) => messageDto(m))
      : [];

    await this.sendMessage({
      type: TypeWSMessage.GET_MESSAGES,
      data: {
        messages: mappedMessages,
        isHaveMessages: mappedMessages.length === 0 ? false : isHaveMessages,
      },
    });
  }
}

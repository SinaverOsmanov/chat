import { ApplicationDb, ensureTypeDatabase } from "../helpers/mongoDatabase";
import { Db, ObjectId } from "mongodb";
import { isModerator } from "../helpers/isModerator";
import { ConnectionEntry, MessageRecord, SendMessage } from "../types";
import { MessageType, TypeWSMessage } from "../../common/dto/types";
import { messageDto } from "../helpers/messageDto";
import {
  ConfirmedMessage,
  LikeMessage,
  RemoveMessage,
  WsMessage,
} from "../../common/dto/dto";

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
        })
        .limit(30)
        .toArray();
    }

    const mappedMessages: MessageType[] = foundMessages.map((message) =>
      messageDto(message)
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
    }
  }

  async processSendMessage(data: MessageType) {
    try {
      const { messages } = this.db;
      if (!(await messages.indexExists("eventId"))) {
        await messages.createIndex({ eventId: -1 });
      }
      const moderator = this.isModerator;

      const responseMessage: MessageRecord = {
        _id: new ObjectId(),
        senderId: this.clientId,
        sender: data.sender,
        text: data.text,
        likes: [],
        dateConfirmed: moderator ? new Date() : null,
        created: new Date(),
        isConfirmed: moderator,
        answer: null,
        eventId: this.eventId,
      };

      const { acknowledged } = await messages.insertOne(responseMessage);

      if (!acknowledged) throw new Error("insertOne doesn't acknowledged");

      const responseData: WsMessage = {
        type: 'message',
        data: messageDto(responseMessage),
      };

      const eventClients = this.eventGetter(this.eventId);

      eventClients.forEach((e) => {
        if (
          e.session.isModerator ||
          responseMessage.senderId === e.ws.clientId
        ) {
          e.session.sendMessage(responseData);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  async processLike(data: LikeMessage) {
    try {
      const { messages } = this.db;

      const m = await messages.findOne({ _id: new ObjectId(data.messageId) });

      const foundIfHaveLike = m?.likes.find(
        (like) => like.toHexString() === this.clientId
      );

      if (foundIfHaveLike) {
        return;
      }

      const message = await messages.findOneAndUpdate(
        {
          _id: new ObjectId(data.messageId),
        },
        {
          $addToSet: {
            likes: new ObjectId(this.clientId),
          },
        }
      );

      if (!!message.ok) {
        let eventClients = this.eventGetter(this.eventId);

        if (!eventClients) throw new Error("no event");

        let likesCount = 0;

        if (message.value) {
          likesCount = message.value.likes.length + 1;
        }

        eventClients.forEach((e) => {
          e.session.sendMessage({
            type: 'likes',
            data: {
              messageId: data.messageId,
              count: likesCount,
            },
          });
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async processReply(data: { messageId: string; reply: string }) {
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
    const message = await messages.findOneAndUpdate(
      {
        _id: new ObjectId(data.messageId),
      },
      {
        $set: {
          isConfirmed: true,
          dateConfirmed: new Date(),
        },
      }
    );

    if (!!message.ok) {
      let eventClients = this.eventGetter(this.eventId);

      eventClients.forEach((e) => {
        e.session.sendMessage({
          type: 'confirmedMessage',
          data: {
            messageId: data.messageId,
            isConfirmed: true,
          },
        });
      });
    }
  }

  async processGetMessages(data: { filter: string }) {
    const { messages } = this.db;

    let foundMessages;
    if (data.filter === "my") {
      const userObjectId = this.clientId;
      if (this.isModerator) {
        foundMessages = await messages
          .find(
            {
              eventId: this.eventId,
              $or: [
                { "answer.moderatorId": userObjectId },
                { senderId: userObjectId },
              ],
            },
            { limit: 30 }
          )
          .toArray();
      } else {
        foundMessages = await messages
          .find(
            {
              eventId: this.eventId,
              senderId: userObjectId,
            },
            { limit: 30 }
          )
          .toArray();
      }
    } else {
      foundMessages = await messages
        .find(
          {
            eventId: this.eventId,
            $or: [{ isConfirmed: true }, { senderId: this.clientId }],
          },
          { limit: 30 }
        )
        .toArray();
    }

    const mappedMessages: MessageType[] = foundMessages.map(messageDto);

    await this.sendMessage({
      type: 'getMessages',
      data: mappedMessages,
    });
  }
}

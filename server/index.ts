import { App, TemplatedApp, WebSocket } from "uWebSockets.js";
import config from "./config";
import { Db, MongoClient, ObjectId } from "mongodb";
import { MessageRecord } from "./types";
import { MessageType, WsMessage } from "../common/dto/dto";
import { ensureTypeDatabase } from "./helpers/mongoDatabase";
import { verify } from "jsonwebtoken";

const app = App(config.options);

type TokenDataType = {
  role: string;
  userName: string;
  userId: string;
  email: string;
  iat: number;
};

function makeServer(db: Db): TemplatedApp {
  function sendMessage(ws: WebSocket, message: WsMessage) {
    const messagesString = JSON.stringify(message);
    ws.send(messagesString);
  }

  function parseMessage(buffer: ArrayBuffer) {
    return JSON.parse(Buffer.from(buffer).toString());
  }

  type ConnectionEntry = { ws: WebSocket; isModerator: boolean };

  const clients = new Map<
    string /* event id */,
    Map<string /* socket/client/connection id */, ConnectionEntry>
  >();

  function getEvent(eventId: string) {
    let eventClients = clients.get(eventId);
    if (!eventClients) {
      console.error("must never happen");
      return;
    }
    return eventClients;
  }

  function checkLike(): boolean {
    return true;
  }

  const server = app.ws("/:event", {
    ...config.behavior,

    upgrade: (res, req, context) => {
      const secWebSocketKey = req.getHeader("sec-websocket-key");
      const secWebSocketProtocolToken = req.getHeader("sec-websocket-protocol");
      const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");

      if (!secWebSocketProtocolToken) {
        res.end("Вы не указали нужные данные", true);
        return;
      }

      const user = verify(
        secWebSocketProtocolToken,
        config.secretKey
      ) as TokenDataType;

      if (!user) {
        res.end("Вы не авторизированны", true);
        return;
      }

      const { userId }: TokenDataType = user;

      /* This immediately calls open handler, you must not use res after this call */
      res.upgrade(
        {
          eventId: req.getParameter(0),
          wsId: secWebSocketKey,
          clientId: userId,
        },
        /* Spell these correctly */
        secWebSocketKey,
        secWebSocketProtocolToken,
        secWebSocketExtensions,
        context
      );
    },
    open: async (ws) => {
      try {
        const eventId = ws.eventId;
        const id = ws.wsId;
        const clientId = ws.clientId;
        const { moderators } = await ensureTypeDatabase(db);

        let eventClients = clients.get(eventId);

        if (!eventClients) {
          eventClients = new Map();
          clients.set(eventId, eventClients);
        }

        if (!(await moderators.indexExists("moderatorId"))) {
          await moderators.createIndex({ moderatorId: -1 });
        }

        const isModerator = await moderators.findOne({
          moderatorId: new ObjectId(clientId),
        });

        eventClients.set(id, { ws, isModerator: !!isModerator });

        const { messages } = await ensureTypeDatabase(db);

        let foundedMessages: MessageRecord[];

        if (!!isModerator) {
          foundedMessages = await messages.find({ eventId }).toArray();
        } else {
          foundedMessages = await messages
            .find({
              eventId,
              isConfirmed: true,
            })
            .limit(30)
            .toArray();
        }

        // when in a collection of the message will a field date with the correct date, need to do right filter

        const mappedMessages: MessageType[] = foundedMessages.map(
          (message) => ({
            ...message,
            _id: message._id.toHexString(),
            likes: message.likes.length,
            answer:
              message.answer !== null
                ? {
                    ...message.answer,
                    _id: message.answer._id.toHexString(),
                  }
                : null,
          })
        );

        sendMessage(ws, {
          type: "connect",
          data: mappedMessages,
        });
      } catch (e) {
        console.log(e);
      }
    },
    message: async (ws, message, isBinary) => {
      const eventId = ws.eventId;
      const { data, type } = parseMessage(message);
      const { messages, likes } = await ensureTypeDatabase(db);
      const clientId = ws.clientId;

      if (type === "likes") {
        const m = await messages.findOne({ _id: new ObjectId(data.messageId) });

        const foundIfHaveLike = m?.likes.find(
          (like) => like.toHexString() === clientId
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
              likes: new ObjectId(clientId),
            },
          }
        );

        if (!!message.ok) {
          let eventClients = getEvent(eventId);

          if (!eventClients) throw new Error("no event");

          const likesCount = message.value!.likes.length + 1;

          eventClients.forEach((e) => {
            if (e.isModerator) {
              sendMessage(e.ws, {
                type: "likes",
                data: {
                  messageId: data.messageId,
                  count: likesCount,
                },
              });
            }
          });
        }
      } else if (type === "message") {
        if (!(await messages.indexExists("eventId"))) {
          await messages.createIndex({ eventId: -1 });
        }

        const responseMessage: MessageRecord = {
          _id: new ObjectId(),
          sender: data.sender,
          text: data.text,
          likes: [],
          dateConfirmed: null,
          created: new Date(),
          isConfirmed: false,
          answer: null,
          eventId: eventId,
        };

        const { acknowledged } = await messages.insertOne(responseMessage);

        if (!acknowledged) throw new Error("insertOne doesn't acknowledged");

        const responseData: WsMessage = {
          type: "message",
          data: {
            ...responseMessage,
            _id: responseMessage._id.toHexString(),
            likes: responseMessage.likes.length,

            answer:
              responseMessage.answer !== null
                ? {
                    ...responseMessage.answer,
                    _id: responseMessage.answer._id.toHexString(),
                  }
                : null,
          },
        };
        let eventClients = clients.get(eventId);
        if (!eventClients) {
          console.error("must never happen");
          return;
        }
        eventClients.forEach((e) => {
          if (e.isModerator) {
            sendMessage(e.ws, responseData);
          }
        });
      }
    },
    drain: (ws) => {
      console.log("WebSocket backpress ure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed");
      console.log(code, message);
      let eventClients = clients.get(ws.eventId);
      if (!eventClients) {
        console.error("must never happen");
        return;
      }
      eventClients.delete(ws.wsId);
    },
  });
  return server;
}

async function start() {
  try {
    const client = new MongoClient(config.config.mongoUrl);
    const db = await client.connect();

    const mongo: Db = db.db(config.config.mongoDbName);

    const server = makeServer(mongo);

    server.listen(config.config.port, (listenSocket) => {
      if (listenSocket) {
        console.log(`Listening to port ${config.config.port}`);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

start();

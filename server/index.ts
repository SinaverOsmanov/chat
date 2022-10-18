import { App, TemplatedApp, WebSocket } from "uWebSockets.js";
import config from "./config";
import { Db, MongoClient, ObjectId } from "mongodb";
import { MessageRecord } from "./types";
import { ConfirmedMessage, LikeMessage, RemoveMessage, WsMessage } from "../common/dto/dto";
import { ensureTypeDatabase, ApplicationDb } from "./helpers/mongoDatabase";
import { verify } from "jsonwebtoken";
import { messageDto } from "./helpers/messageDto";
import { isModerator } from "./helpers/isModerator";
import { MessageType, ModeratorMessageType, TypeWSMessage } from "../common/dto/types";

const app = App(config.options);

type TokenDataType = {
    role: string;
    userName: string;
    userId: string;
    email: string;
    iat: number;
};

type ConnectionEntry = { ws: WebSocket; session: UserSessionProcessor };

type SendMessage = (message: WsMessage) => Promise<void>;

class UserSessionProcessor {
    private constructor(private sendMessage: SendMessage, private db: ApplicationDb,
        private eventGetter: (eventId: string) => Map<string, ConnectionEntry>, private clientId: string, private eventId: string, private isModerator: boolean) {

    }

    static async init(sendMessage: SendMessage, db: Db, clientId: string, eventId: string, eventGetter: (eventId: string) => Map<string, ConnectionEntry>): Promise<UserSessionProcessor> {

        const moderator = await isModerator(db, clientId)

        const { messages } = await ensureTypeDatabase(db);

        let foundMessages: MessageRecord[];

        if (moderator) {
            foundMessages = await messages.find({ eventId }).toArray();
        } else {
            foundMessages = await messages
                .find({ eventId, $or: [{ isConfirmed: true }, { senderId: new ObjectId(clientId) }] })
                .limit(30)
                .toArray();
        }

        // when in a collection of the message will a field date with the correct date, need to do right filter

        const mappedMessages: MessageType[] = foundMessages.map(
            (message) => messageDto(message)
        );

        await sendMessage({
            type: TypeWSMessage.CONNECT,
            data: mappedMessages,
        });
        return new UserSessionProcessor(sendMessage, await ensureTypeDatabase(db), eventGetter, clientId, eventId, isModerator);
    }



    async processMessage(message: WsMessage) {
        const { data, type } = message;

        if (type === TypeWSMessage.LIKES) {
            await this.processLike(data);
        } else if (type === TypeWSMessage.REPLY_TO_MESSAGE) {
            await this.processReply(data);
        } else if (type === TypeWSMessage.REMOVE_MESSAGE) {
            await this.processRemoveMessage(data);
        } else if (type === TypeWSMessage.GET_MESSAGES) {
            await this.processGeMessages(data);
        } else if (type === TypeWSMessage.CONFIRMED_MESSAGE) {
            await this.processConfirmedMessages(data);
        } else if (type === TypeWSMessage.MESSAGE) {
            await this.processSendMessage(data);
        }
    }
    async processSendMessage(data: MessageType) {
        const { messages } = this.db;
        if (!(await messages.indexExists("eventId"))) {
            await messages.createIndex({ eventId: -1 });
        }
        const moderator = this.isModerator

        const responseMessage: MessageRecord = {
            _id: new ObjectId(),
            senderId: new ObjectId(this.clientId),
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
            type: TypeWSMessage.MESSAGE,
            data: messageDto(responseMessage)
        };

        const eventClients = this.eventGetter(this.eventId)

        eventClients.forEach((e) => {
            if (e.session.isModerator || responseData.data.senderId === this.clientId) {
                this.sendMessage(responseData);
            }
        });
    }

    async processLike(data: LikeMessage) {
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

            const likesCount = message.value!.likes.length + 1;

            eventClients.forEach((e) => {
                this.sendMessage({
                    type: TypeWSMessage.LIKES,
                    data: {
                        messageId: data.messageId,
                        count: likesCount,
                    },
                });
            });
        }
    }

    async processReply(data: ModeratorMessageType) {
        const { messages } = this.db;

        const replyObject = {
            _id: new ObjectId(),
            moderatorId: new ObjectId(this.clientId),
            created: new Date(),
            messageId: new ObjectId(data.messageId),
            sender: 'Модератор',
            text: data.reply // ?????
        }

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
                    this.sendMessage({
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
        }
    }

    async processRemoveMessage(data: RemoveMessage) {
        if (!this.isModerator) { return; }
        const { messages } = this.db;

        const removed = await messages.deleteOne({ _id: new ObjectId(data.messageId) })

        if (removed.acknowledged) {
            let eventClients = this.eventGetter(this.eventId);

            if (!eventClients) throw new Error("no event");

            eventClients.forEach((e) => {
                this.sendMessage({
                    type: TypeWSMessage.REMOVE_MESSAGE,
                    data: { messageId: data.messageId },
                });
            });
        }
    }

    async processConfirmedMessages(data: ConfirmedMessage) {
        if (!this.isModerator) { return; }
        const { messages } = this.db;
        const message = await messages.findOneAndUpdate(
            {
                _id: new ObjectId(data.messageId),
            },
            {
                $set: {
                    isConfirmed: true,
                    dateConfirmed: new Date()
                },
            }
        );

        if (!!message.ok) {
            let eventClients = this.eventGetter(this.eventId);

            eventClients.forEach((e) => {
                this.sendMessage({
                    type: TypeWSMessage.CONFIRMED_MESSAGE,
                    data: {
                        messageId: data.messageId,
                        isConfirmed: true,
                    },
                });
            });
        }
    }
    async processGeMessages(data: MessageType[]) {
        const { messages } = this.db;

        let foundMessages;
        if (data.filter === 'my') {
            const userObjectId = new ObjectId(this.clientId)
            if (this.isModerator) {
                foundMessages = await messages.find({ eventId: this.eventId, $or: [{ 'answer.moderatorId': userObjectId }, { senderId: userObjectId }] }, { limit: 30 }).toArray()
            } else {
                foundMessages = await messages.find({ eventId: this.eventId, senderId: userObjectId }, { limit: 30 }).toArray()
            }
        } else {
            foundMessages = await messages.find({ eventId: this.eventId, $or: [{ isConfirmed: true }, { senderId: new ObjectId(this.clientId) }] }, { limit: 30 }).toArray()
        }

        const mappedMessages = foundMessages.map(messageDto)

        this.sendMessage({
            type: TypeWSMessage.GET_MESSAGES,
            data: mappedMessages,
        });
    }

}

function makeServer(db: Db): TemplatedApp {
    function sendMessage(ws: WebSocket, message: WsMessage): Promise<void> { // not sure it is promise or sync return
        const messagesString = JSON.stringify(message);
        ws.send(messagesString);
    }

    function parseMessage(buffer: ArrayBuffer): WsMessage {
        return JSON.parse(Buffer.from(buffer).toString());
    }

    const clients = new Map<string /* event id */,
        Map<string /* socket/client/connection id */, ConnectionEntry>>();

    function getEvent(eventId: string) {
        let eventClients = clients.get(eventId);
        if (!eventClients) {
            console.error("must never happen");
            throw new Error(); // return and check later
        }
        return eventClients;
    }

    const serverApp = app.ws("/:event", {
        ...config.behavior,

        upgrade: (res, req, context) => {
            const secWebSocketKey = req.getHeader("sec-websocket-key");
            const secWebSocketProtocolToken = req.getHeader("sec-websocket-protocol");
            const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");

            if (!secWebSocketProtocolToken) {
                res.end("Вы не указали нужные данные", true);
                return;
            }

            // const createToken = sign({
            //     role: "User",
            //     userName: "User3",
            //     userId: "6325d80fe06688d15a620dba",
            //     email: "some3@email.com",
            //     iat: 1663602541
            // }, config.secretKey)
            //
            // console.log(createToken)

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
                    clientId: userId
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
                const {id, eventId, clientId} = ws;

                let eventClients = clients.get(eventId);

                if (!eventClients) {
                    eventClients = new Map();
                    clients.set(eventId, eventClients);
                }

                const session = await UserSessionProcessor.init((m) => sendMessage(ws, m), db, clientId, eventId, getEvent);

                eventClients.set(id, { ws, session });

            } catch (e) {
                console.log(e);
            }
        },
        message: async (ws, message, isBinary) => {
            const e = getEvent(ws.eventId);
            const m = parseMessage(message);
            const session = e.get(ws.clientId);
            session?.session.processMessage(m);
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
    return serverApp;
}

async function initCollection(db: Db) {
    // const coll = db.collection('messages')
    // const drop = await coll.drop()

    const result = await db.createCollection('messages')
    const result2 = await db.createCollection('moderators')

    if (!result) {
        console.log(result)
    }
}

async function start() {
    try {
        const client = new MongoClient(config.config.mongoUrl);
        const db = await client.connect();

        const mongo: Db = db.db(config.config.mongoDbName);

        // await initCollection(mongo)

        const serverApp = makeServer(mongo);

        serverApp.listen(config.config.port, (listenSocket) => {
            if (listenSocket) {
                console.log(`Listening to port ${config.config.port}`);
            }
        });
    } catch (e) {
        console.log(e);
    }
}

start();

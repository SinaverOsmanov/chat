import {Db, MongoClient} from "mongodb";
import {App, TemplatedApp} from "uWebSockets.js";
import {verify} from "jsonwebtoken";
import {TokenDataType} from "./types";
import {UserSessionProcessor} from "./ws/userSession";
import config from "./config";
import {parseToken} from "./helpers/parseToken";
import {parseMessage} from "./helpers/parseMessage";
import {sendMessage} from "./helpers/sendMessage";
import {clients, getEvent} from "./services/getEvent";

const app = App(config.options);

function makeServer(db: Db): TemplatedApp {

    const serverApp = app.ws("/:event", {
        ...config.behavior,
        upgrade: (res, req, context) => {
            const secWebSocketKey = req.getHeader("sec-websocket-key");
            const secWebSocketProtocol = req.getHeader("sec-websocket-protocol");
            const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");

            const query = req.getQuery()

            const token = parseToken(query)

            if (!token) {
                res.close()
                return;
            }

            const user = verify(
                token,
                config.secretKey
            ) as TokenDataType;

            if (!user) {
                res.end("Вы не авторизированны", true);
                return;
            }

            const {userId}: TokenDataType = user;
            /* This immediately calls open handler, you must not use res after this call */
            res.upgrade(
                {
                    eventId: req.getParameter(0),
                    wsId: secWebSocketKey,
                    clientId: userId
                },

                /* Spell these correctly */
                secWebSocketKey,
                secWebSocketProtocol,
                secWebSocketExtensions,
                context
            );
        },
        open: async (ws) => {
            try {
                const {wsId, eventId, clientId} = ws;

                let eventClients = clients.get(eventId);

                if (!eventClients) {
                    eventClients = new Map();
                    clients.set(eventId, eventClients);
                }

                const session = await UserSessionProcessor.init((m) => sendMessage(ws, m), db, clientId, eventId, getEvent);

                eventClients.set(wsId, {ws, session});

            } catch (e) {
                console.log(e);
            }
        },
        message: async (ws, message, isBinary) => {
            const e = getEvent(ws.eventId);
            const m = parseMessage(message);
            const session = e.get(ws.wsId);
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
    try {
        await db.createCollection('messages')
        await db.createCollection('moderators')
        return
    } catch (e) {
        return
    }
}

async function start() {
    try {
        const client = new MongoClient(config.config.mongoUrl);
        const db = await client.connect();

        const mongo: Db = db.db(config.config.mongoDbName);

        await initCollection(mongo)

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

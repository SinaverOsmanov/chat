import {WebSocket} from "uWebSockets.js";
import {WsMessage} from "../../common/dto/dto";

export async function sendMessage(ws: WebSocket, message: WsMessage): Promise<void> {
    const messagesString = JSON.stringify(message);
    ws.send(messagesString);
}

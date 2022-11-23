import { WebSocket } from "uWebSockets.js";
import { WsClientMessage } from "../../client/src/common/dto/dto";

export async function sendMessage(
  ws: WebSocket,
  message: WsClientMessage
): Promise<void> {
  const messagesString = JSON.stringify(message);
  ws.send(messagesString);
}

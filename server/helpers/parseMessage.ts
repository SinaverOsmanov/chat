import { WsServerMessage } from "../../client/src/common/dto/dto";

export function parseMessage(buffer: ArrayBuffer): WsServerMessage {
  return JSON.parse(Buffer.from(buffer).toString());
}

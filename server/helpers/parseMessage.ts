import {WsMessage} from "../../common/dto/dto";

export function parseMessage(buffer: ArrayBuffer): WsMessage {
    return JSON.parse(Buffer.from(buffer).toString());
}

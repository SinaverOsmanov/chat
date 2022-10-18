import {MessageType, ModeratorMessageType, TypeWSMessage} from "./types";

export type WsMessage =
    | {
    type: TypeWSMessage.CONNECT;
    data: MessageType[];
}
    | {
    type: TypeWSMessage.MESSAGE;
    data: MessageType;
}
    | {
    type: TypeWSMessage.LIKES;
    data: { count: number; messageId: string };
}
    | {
    type: TypeWSMessage.CONFIRMED_MESSAGE
    data: { isConfirmed: true, messageId: string }
}
| {
    type: TypeWSMessage.REPLY_TO_MESSAGE
    data: ModeratorMessageType
}
| {
    type: TypeWSMessage.REMOVE_MESSAGE
    data: {messageId: string}
}
| {
    type: TypeWSMessage.GET_MESSAGES,
    data: MessageType[]
}
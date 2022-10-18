import { MessageType, ModeratorMessageType, TypeWSMessage } from "./types";

export type LikeMessage = { count: number; messageId: string };
export type ConfirmedMessage = { isConfirmed: true, messageId: string };
export type RemoveMessage = { messageId: string }

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
        data: LikeMessage;
    }
    | {
        type: TypeWSMessage.CONFIRMED_MESSAGE
        data: ConfirmedMessage;
    }
    | {
        type: TypeWSMessage.REPLY_TO_MESSAGE
        data: ModeratorMessageType
    }
    | {
        type: TypeWSMessage.REMOVE_MESSAGE
        data: RemoveMessage;
    }
    | {
        type: TypeWSMessage.GET_MESSAGES,
        data: MessageType[]
    }
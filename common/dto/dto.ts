import { MessageType, ModeratorMessageType, TypeWSMessage } from "./types";

export type LikeMessage = { count: number; messageId: string };
export type ConfirmedMessage = { messageId: string };
export type RemoveMessage = { messageId: string }

export type WsMessage =
    | {
        type: TypeWSMessage;
        data: MessageType[];
    }
    | {
        type: TypeWSMessage;
        data: MessageType;
    }
    | {
        type: TypeWSMessage;
        data: LikeMessage;
    }
    | {
        type: TypeWSMessage
        data: ConfirmedMessage;
    }
    | {
        type: TypeWSMessage
        data: ModeratorMessageType
    }
    | {
        type: TypeWSMessage
        data: RemoveMessage;
    }
    | {
        type: TypeWSMessage,
        data: MessageType[]
    }
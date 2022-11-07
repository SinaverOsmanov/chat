import {MessageType, ModeratorMessageType} from "./types";

export type LikeMessage = { count: number; messageId: string };
export type ConfirmedMessage = { messageId: string };
export type RemoveMessage = { messageId: string }
export type ReplyToMessage = { messageId: string, reply: string }
export type GetMessages = { filter:string }
export type LoadMoreMessages = { firstMessage:string, lengthMessages: number}

export type WsMessage =
    | {
    type: 'connect';
    data: MessageType[];
}
    | {
    type: 'message';
    data: MessageType;
}
    | {
    type: 'likes';
    data: LikeMessage;
}
    | {
    type: 'confirmedMessage'
    data: MessageType;
}
    | {
    type: 'replyToMessage'
    data: ReplyToMessage | ModeratorMessageType
}
    | {
    type: 'removeMessage'
    data: RemoveMessage;
}
    | {
    type: 'getMessages',
    data: MessageType[]
} | {
  type: 'loadMoreMessages',
  data: {messages: MessageType[], isHaveMessages: boolean }
}
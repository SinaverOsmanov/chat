export type ModeratorMessageType = {
    _id: string;
    text: string;
    sender: string;
    moderatorId:string;
    messageId: string;
    created: Date;
};

export type MessageType = {
    _id: string;
    sender: string;
    senderId: string;
    text: string;
    likes: number;
    dateConfirmed: Date | null;
    created: Date;
    isConfirmed: boolean;
    answer: ModeratorMessageType | null;
    eventId: string;
};

export type WsMessage =
    | {
    type: "connect";
    data: MessageType[];
}
    | {
    type: "message";
    data: MessageType;
}
    | {
    type: "likes";
    data: { count: number; messageId: string };
}
    | {
    type: 'confirmedMessage'
    data: { isConfirmed: true, messageId: string }
}
| {
    type: 'replyToMessage'
    data: ModeratorMessageType
}
| {
    type: 'removeMessage'
    data: {messageId: string}
}

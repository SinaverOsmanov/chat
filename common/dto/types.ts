
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

export type MessageTypeLikedByMe = MessageType & {isLikedByMe: boolean}

//
//
//
// export enum TypeWSMessage {
//     CONNECT = 'connect',
//     MESSAGE = 'message',
//     LIKES = "likes",
//     CONFIRMED_MESSAGE = 'confirmedMessage',
//     REPLY_TO_MESSAGE = 'replyToMessage',
//     REMOVE_MESSAGE = 'removeMessage',
//     GET_MESSAGES = 'getMessages'
// }



export type TypeWSMessage = 'connect' | 'message' | "likes" | 'confirmedMessage' | 'replyToMessage' | 'removeMessage' | 'getMessages'

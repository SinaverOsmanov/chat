import {MessageRecord} from "../types";
import {MessageType} from "../../common/dto/types";
import {isLikedMessage} from "./isLikedMessage";

export function messageDto(message: MessageRecord, clientId?: string): MessageType & {isLikedByMe: boolean} {
    return {
        ...message,
        _id: message._id.toHexString(),
        likes: message.likes.length,
        isLikedByMe: isLikedMessage(message.likes, clientId),
        senderId: message.senderId,
        answer:
            message.answer !== null
                ? {
                    ...message.answer,
                    _id: message.answer._id.toHexString(),
                    moderatorId: message.answer.moderatorId.toHexString(),
                    messageId: message.answer.messageId.toHexString(),
                }
                : null,
    };
}

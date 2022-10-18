import {MessageRecord} from "../types";
import {MessageType} from "../../common/dto/types";

export function messageDto(message: MessageRecord): MessageType {
    return {
    ...message,
        _id: message._id.toHexString(),
        likes: message.likes.length,
        senderId: message.senderId.toHexString(),
        answer:
        message.answer !== null
            ? {
                ...message.answer,
                _id: message.answer._id.toHexString(),
                moderatorId: message.answer.moderatorId.toHexString(),
                messageId: message.answer.messageId.toHexString()
            }
            : null,
    }
}


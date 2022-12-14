import { MessageRecord } from "../types";
import { MessageTypeLikedByMe } from "../../client/src/common/dto/types";
import { isLikedMessage } from "./isLikedMessage";

export function messageDto(
  message: MessageRecord,
  clientId?: string
): MessageTypeLikedByMe {
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

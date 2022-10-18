import {messageDto} from "./transferObject";
import {MessageType, TypeWSMessage} from "../../../common/dto/types";

type setDataTypeProps = {
    type: TypeWSMessage,
    data: any,
    messages: MessageType[],
}

export function setDataType({type, data, messages}: setDataTypeProps): MessageType[] {
    if (type === 'connect') {
        const messageArrayDto = data.map(messageDto)

        return messageArrayDto
    } else if (type === 'getMessages') {
        const messageArrayDto = data.map(messageDto)

        return messageArrayDto
    } else if (type === 'message') {

        const message = messageDto(data)

        return [...messages, message]

    } else if (type === 'likes') {
        const foundMessage = messages.find(
            message => message._id === data.messageId
        )
        if (foundMessage) {
            foundMessage.likes = data.count
            return [...messages]
        }
        return messages
    } else if (type === 'replyToMessage') {
        const foundMessage = messages.find(
            message => message._id === data.messageId
        )
        if (foundMessage) {
            foundMessage.answer = {...data, created: new Date(data.created)}
            return [...messages]
        }
        return messages
    } else if (type === 'removeMessage') {
        const filteredMessage = messages.filter((m)=> m._id !== data.messageId )
        return filteredMessage
    } else if (type === 'confirmedMessage') {
        const foundMessage = messages.find(
            message => message._id === data.messageId
        )
        if (foundMessage) {
            foundMessage.isConfirmed = data.isConfirmed
            return [...messages]
        }
        return messages
    } else {
        return messages
    }
}
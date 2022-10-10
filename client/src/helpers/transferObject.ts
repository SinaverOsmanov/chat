import {MessageType} from "../../../common/dto/dto";

function messagesDto(message: MessageType) {
    return {...message,
        created: new Date(message.created),
        dateConfirmed: message.dateConfirmed ? new Date(message.dateConfirmed) : null,
        answer: message.answer ? {
            ...message.answer,
            created: new Date(message.answer.created)
        }: null
    }
}

export {messagesDto}
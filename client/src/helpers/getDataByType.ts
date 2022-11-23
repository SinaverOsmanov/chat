import { messageDto } from './transferObject'
import {
    MessageType,
    ModeratorMessageType,
    TypeWSMessage,
} from '../common/dto/types'
import { LikeMessage, RemoveMessage, WsClientMessage } from '../common/dto/dto'

export type setDataTypeProps = WsClientMessage & {
    messages: MessageType[]
}

class WebSocketServices {
    constructor(private messages: MessageType[]) {
        this.messages = messages.map(messageDto)
    }

    findById(id: string) {
        return this.messages.find(message => message._id === id)
    }

    setMessage(message: MessageType) {
        this.messages = [...this.getMessages(), message]
        return this.getMessages()
    }

    setMessages(data: MessageType[]) {
        this.messages = data
        return this.getMessages()
    }

    getMessages(): MessageType[] {
        return this.messages
    }

    setLike(data: LikeMessage): MessageType[] {
        const foundMessage = this.findById(data.messageId)

        if (foundMessage) {
            foundMessage.likes = data.count
            console.log(foundMessage.likes)
        }
        return this.getMessages()
    }

    removeById(data: RemoveMessage) {
        const filteredMessages = this.messages.filter(
            m => m._id !== data.messageId
        )
        return this.setMessages(filteredMessages)
    }

    setConfirmed(data: MessageType) {
        const foundMessage = this.findById(data._id)

        if (foundMessage) {
            foundMessage.isConfirmed = data.isConfirmed
            foundMessage.dateConfirmed = data.dateConfirmed
        } else {
            this.setMessage(data)
        }

        return this.getMessages()
    }

    replyToMessage(data: ModeratorMessageType) {
        const foundMessage = this.findById(data.messageId)
        if (foundMessage) {
            foundMessage.answer = { ...data, created: new Date(data.created) }
        }

        return this.getMessages()
    }

    loadMoreMessages(messages: MessageType[]) {
        const withLoadedMessages = [...messages, ...this.messages]
        return this.setMessages(withLoadedMessages)
    }
}

export function getDataByType({
    type,
    data,
    messages,
}: setDataTypeProps): MessageType[] {
    const ws = new WebSocketServices(messages)

    if (type === TypeWSMessage.CONNECT) {
        return ws.setMessages(data.messages)
    } else if (type === TypeWSMessage.GET_MESSAGES) {
        return ws.setMessages(data.messages)
    } else if (type === TypeWSMessage.MESSAGE) {
        return ws.setMessage(data)
    } else if (type === TypeWSMessage.LIKES) {
        return ws.setLike(data)
    } else if (type === TypeWSMessage.REPLY_TO_MESSAGE) {
        return ws.replyToMessage(data)
    } else if (type === TypeWSMessage.REMOVE_MESSAGE) {
        return ws.removeById(data)
    } else if (type === TypeWSMessage.CONFIRMED_MESSAGE) {
        return ws.setConfirmed(data)
    } else if (type === TypeWSMessage.LOAD_MORE) {
        return ws.loadMoreMessages(data.messages)
    } else {
        return ws.getMessages()
    }
}

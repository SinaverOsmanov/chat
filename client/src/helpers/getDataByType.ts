import {messageDto} from "./transferObject";
import {MessageType, ModeratorMessageType, TypeWSMessage} from "../../../common/dto/types";
import {LikeMessage, RemoveMessage} from "../../../common/dto/dto";

type setDataTypeProps = {
    type: TypeWSMessage,
    data: any,
    messages: MessageType[],
}

class WebSocketServices {
    constructor(private messages: MessageType[]) {
        this.messages = messages.map(messageDto)
    }

    findById(id: string) {
        return this.messages.find(
            message => message._id === id
        )
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
        const filteredMessages = this.messages.filter((m) => m._id !== data.messageId)
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

    replyToMessage(data: ModeratorMessageType){
        const foundMessage = this.findById(data.messageId)
        if (foundMessage) {
            foundMessage.answer = {...data, created: new Date(data.created)}
        }

        return this.getMessages()
    }

    loadMoreMessages(data: {messages: MessageType[], isHaveMessages: boolean }) {

        const withLoadedMessages = [...data.messages, ...this.messages]
        return this.setMessages(withLoadedMessages)
    }
}

export function getDataByType({type, data, messages}: setDataTypeProps): MessageType[] {

    const ws = new WebSocketServices(messages)

    if (type === 'connect') {
        return ws.setMessages(data)
    } else if (type === 'getMessages') {
        return ws.setMessages(data)
    } else if (type === 'message') {
        return ws.setMessage(data)
    } else if (type === 'likes') {
        return ws.setLike(data)
    } else if (type === 'replyToMessage') {
        return ws.replyToMessage(data)
    } else if (type === 'removeMessage') {
        return ws.removeById(data)
    } else if (type === 'confirmedMessage') {
        return ws.setConfirmed(data)
    } else if (type === 'loadMoreMessages') {
        return ws.loadMoreMessages(data)
    } else {
        return ws.getMessages()
    }
}
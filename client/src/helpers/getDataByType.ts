import {messageDto} from "./transferObject";
import {MessageType, ModeratorMessageType, TypeWSMessage} from "../../../common/dto/types";

type setDataTypeProps = {
    type: TypeWSMessage,
    data: any
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

    getMessages() {
        return this.messages
    }

    setLike(id: string, count:number) {
        const foundMessage = this.findById(id)

        if (foundMessage) {
            foundMessage.likes = count
            return [...this.messages]
        }
        return this.getMessages()
    }

    removeById(id: string) {
        const filteredMessages = this.messages.filter((m) => m._id !== id)
        return this.setMessages(filteredMessages)
    }

    setConfirmed(data: {messageId:string, isConfirmed: boolean}) {
        const foundMessage = this.findById(data.messageId)

        if (foundMessage) {
            foundMessage.isConfirmed = data.isConfirmed
            return [...this.messages]
        }
        return this.getMessages()
    }

    replyToMessage(answer: ModeratorMessageType){
        const foundMessage = this.findById(answer.messageId)
        if (foundMessage) {
            foundMessage.answer = {...answer, created: new Date(answer.created)}
            return [...this.messages]
        }
        return this.getMessages()
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
        return ws.setLike(data.messageId, data.count)
    } else if (type === 'replyToMessage') {
        return ws.replyToMessage(data)
    } else if (type === 'removeMessage') {
        return ws.removeById(data.messageId)
    } else if (type === 'confirmedMessage') {
        return ws.setConfirmed(data)
    } else {
        return ws.getMessages()
    }
}
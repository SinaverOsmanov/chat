import { MessageType } from '../common/dto/types'
import { messageDto } from './transferObject'

export function sortMessages(
    messages: MessageType[],
    type: string
): MessageType[] {
    if (messages.length === 0) return messages

    const sortedMessages = messages.map(messageDto)

    if (type === 'desc') {
        sortedMessages.sort(
            (messagePrev, messageNext) =>
                messageNext.created.getTime() - messagePrev.created.getTime()
        )
    } else if (type === 'time') {
        sortedMessages.sort(
            (messagePrev, messageNext) =>
                messagePrev.created.getTime() - messageNext.created.getTime()
        )
    } else if (type === 'like') {
        sortedMessages.sort(
            (messagePrev, messageNext) => messagePrev.likes - messageNext.likes
        )
    } else if (type === 'asc') {
        sortedMessages.sort(
            (messagePrev, messageNext) =>
                messagePrev.created.getTime() - messageNext.created.getTime()
        )
    }

    return sortedMessages
}

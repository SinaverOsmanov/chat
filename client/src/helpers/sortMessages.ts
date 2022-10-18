import {MessageType} from "../../../common/dto/types";

export function sortMessages(messages: MessageType[], type: string): MessageType[] {

    const sortedMessages = [...messages];

    if (type === 'desc') {
        sortedMessages.sort((messagePrev, messageNext) => messageNext.created.getTime() - messagePrev.created.getTime())
    } else if (type === 'time') {
        sortedMessages.sort((messagePrev, messageNext) => messagePrev.created.getTime() - messageNext.created.getTime())
    } else if (type === 'like') {
        sortedMessages.sort((messagePrev, messageNext) => messagePrev.likes - messageNext.likes)
    } else {
        sortedMessages.sort((messagePrev, messageNext) => messagePrev.created.getTime() - messageNext.created.getTime())
    }

    return sortedMessages
}

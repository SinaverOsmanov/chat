import { useCallback, useMemo, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { WebSocketHook } from 'react-use-websocket/src/lib/types'
import { useParams } from 'react-router-dom'
import { parseMessage } from '../helpers/parseMessage'
import { WsClientMessage, WsServerMessage } from '../common/dto/dto'
import { MessageType, TypeWSMessage } from '../common/dto/types'
import { getDataByType, setDataTypeProps } from '../helpers/getDataByType'

export const useChat = (jwt: string) => {
    const [messageHistory, setMessageHistory] = useState<MessageType[]>([])
    const [isAllMessages, setIsAllMessages] = useState(false)

    const { eventId } = useParams()

    const memoizedEvent = useMemo(
        () => `ws://localhost:8080/${eventId}`,
        [eventId]
    )

    const { readyState, sendMessage }: WebSocketHook = useWebSocket(
        memoizedEvent,
        {
            onOpen: event => {
                console.log(event, 'open')
            },
            onMessage: async event => {
                const { type, data }: WsClientMessage = parseMessage(event.data)
                const messages = getDataByType({
                    type,
                    data,
                    messages: messageHistory,
                } as setDataTypeProps)

                if (
                    type === TypeWSMessage.LOAD_MORE ||
                    type === TypeWSMessage.CONNECT ||
                    type === TypeWSMessage.GET_MESSAGES
                )
                    setIsAllMessages(data.isHaveMessages)

                setMessageHistory(messages)
            },
            onClose: () => console.log('Closed'),
            shouldReconnect: () => true,
            reconnectAttempts: 10,
            reconnectInterval: 3000,
            // When registering, write your token here
            queryParams: { Authorization: jwt },
        }
    )

    const sendMessageCallback = useCallback((data: WsServerMessage) => {
        sendMessage(JSON.stringify(data))
    }, [])

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState]

    return {
        sendMessageClick: sendMessageCallback,
        connectionStatus,
        messageHistory,
        isAllMessages,
    }
}

import {useCallback, useMemo, useState} from 'react'
import useWebSocket, {ReadyState} from 'react-use-websocket'
import {WebSocketHook} from 'react-use-websocket/src/lib/types'
import {useParams} from 'react-router-dom'
import {parseMessage} from '../helpers/parseMessage'
import {moderatorToken} from '../authToken/tokens'
import {WsMessage} from '../../../common/dto/dto'
import {MessageType} from "../../../common/dto/types";
import {setDataType} from "../helpers/setDataType";

export const useChat = () => {
    const [messageHistory, setMessageHistory] = useState<MessageType[] | []>([])
    const {eventId} = useParams()

    const memoizedEvent = useMemo(
        () => `ws://localhost:8080/${eventId}`,
        [eventId]
    )

    const {readyState, sendJsonMessage}: WebSocketHook = useWebSocket(
        memoizedEvent,
        {
            onOpen: event => {
                console.log(event, 'open')
            },
            onMessage: event => {
                const {type, data}: WsMessage = parseMessage(event.data)
                const messages = setDataType({
                    type,
                    data,
                    messages: messageHistory
                })

                setMessageHistory(messages)
            },
            onClose: () => console.log('Closed'),
            // When registering, write your token here
            protocols: moderatorToken,
            shouldReconnect: () => true,
        }
    )

    const sendMessageCallback = useCallback(
        (data: any, type = 'message') => {
            sendJsonMessage({type, data})
        },
        []
    )

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
    }
}

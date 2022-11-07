import { useCallback, useEffect, useMemo, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { WebSocketHook } from 'react-use-websocket/src/lib/types'
import { useParams } from 'react-router-dom'
import { parseMessage } from '../helpers/parseMessage'
import { WsMessage } from '../../../common/dto/dto'
import { MessageType } from '../../../common/dto/types'
import { getDataByType } from '../helpers/getDataByType'

export const useChat = (jwt: string) => {
	const [messageHistory, setMessageHistory] = useState<MessageType[]>([])
	const [isAllMessages, setIsAllMessages] = useState(false)

	const { eventId } = useParams()

	const memoizedEvent = useMemo(
		() => `ws://localhost:8080/${eventId}`,
		[eventId]
	)

	const { readyState, sendJsonMessage }: WebSocketHook = useWebSocket(
		memoizedEvent,
		{
			onOpen: event => {
				console.log(event, 'open')
			},
			onMessage: async event => {
				const { type, data }: WsMessage  = parseMessage(event.data)
				const messages = getDataByType({
					type,
					data,
					messages: messageHistory,
				})

				if(type === 'loadMoreMessages') setIsAllMessages(data.isHaveMessages)

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

	const sendMessageCallback = useCallback((data: any, type = 'message') => {
		sendJsonMessage({ type, data })
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
		isAllMessages
	}
}

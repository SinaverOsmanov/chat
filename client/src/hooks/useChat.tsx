import { useCallback, useMemo, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { WebSocketHook } from 'react-use-websocket/src/lib/types'
import { useParams } from 'react-router-dom'
import { parseMessage } from '../helpers/parseMessage'
import {moderatorToken, user2Token, userToken} from '../authToken/tokens'
import { MessageType, WsMessage } from '../../../common/dto/dto'

export const useChat = () => {
	const [messageHistory, setMessageHistory] = useState<MessageType[] | []>([])
	const { eventId } = useParams()

	const memoizedEvent = useMemo(
		() => `ws://localhost:8080/${eventId}`,
		[eventId]
	)

	const { readyState, sendJsonMessage }: WebSocketHook = useWebSocket(
		memoizedEvent,
		{
			onOpen: event => {
				console.log(event)
			},
			onMessage: event => {
				const { data, type }: WsMessage = parseMessage(event.data)

				if (type === 'connect') {
					setMessageHistory(data)
				} else if (type === 'message') {
					setMessageHistory(prev => [...prev, data])
				} else if (type === 'likes') {
					const foundMessage = messageHistory.find(
						message => message._id === data.messageId
					)
					if (foundMessage) {
						foundMessage.likes = data.count
						setMessageHistory(prev => [...prev])
					}
				} else if (type === 'replyToMessage') {
					const foundMessage = messageHistory.find(
						message => message._id === data.messageId
					)
					if (foundMessage) {
						foundMessage.answer = {...data}
						setMessageHistory(prev => [...prev])
					}
				} else if (type === 'removeMessage') {
					const filteredMessage = messageHistory.filter((m)=> m._id !== data.messageId )
					setMessageHistory(filteredMessage)
				} else if (type === 'confirmedMessage') {
					const foundMessage = messageHistory.find(
						message => message._id === data.messageId
					)
					if (foundMessage) {
						foundMessage.isConfirmed = data.isConfirmed
						setMessageHistory(prev => [...prev])
					}
				}
			},
			onClose: () => console.log('Closed'),
			protocols: moderatorToken,
			shouldReconnect: () => true,
		}
	)

	const handleClickSendMessage = useCallback(
		(data: any, type = 'message') => {
			sendJsonMessage({ type, data })
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
		sendMessageClick: handleClickSendMessage,
		connectionStatus,
		messageHistory,
	}
}

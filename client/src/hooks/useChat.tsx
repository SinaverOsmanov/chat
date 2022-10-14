import { useCallback, useMemo, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { WebSocketHook } from 'react-use-websocket/src/lib/types'
import { useParams } from 'react-router-dom'
import { parseMessage } from '../helpers/parseMessage'
import {moderatorToken, user2Token, userToken} from '../authToken/tokens'
import { MessageType, WsMessage } from '../../../common/dto/dto'
import {messageDto} from "../helpers/transferObject";

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
				console.log(event, 'open')
			},
			onMessage: event => {
				const { data, type }: WsMessage = parseMessage(event.data)

				if (type === 'connect') {

					const messageArrayDto = data.map(messageDto)

					setMessageHistory(messageArrayDto)
				} else if (type === 'getMessages') {
					const messageArrayDto = data.map(messageDto)

					setMessageHistory(messageArrayDto)
				} else if (type === 'message') {

					const message = messageDto(data)

					setMessageHistory(prev => [...prev, message])

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
						foundMessage.answer = {...data, created: new Date(data.created)}
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
			protocols: userToken,
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

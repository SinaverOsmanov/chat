import styled from 'styled-components'
import Select from './ui/Select'
import React, { useState } from 'react'
import {
	ChatStyle,
	DialogWrapper,
	FlexColumn,
	FlexRow,
	MessageWrapperStyle,
} from '../styled'
import Input from './ui/Input'
import Button from './ui/Button'
import Icon from './ui/Icon'
import { like, send } from '../assets/svg'
import { useChat } from '../hooks/useChat'
import { RadioGroup } from './RadioGroup'
import { MessageType } from '../../../common/dto/dto'

const SelectStyle = styled(Select)`
	border-radius: 5px;
	position: relative;

	width: 140px;
	border: 2px solid #cccccc;
	padding: 10px;

	margin: 0;
	-webkit-box-sizing: border-box;
	-moz-box-sizing: border-box;
	box-sizing: border-box;

	-webkit-appearance: none;
	-moz-appearance: none;

	background-image: url('../assets/png/arrow-down.png');
	background-position: calc(100% - 12px) 49%;
	background-size: 9.6px 6px;
	background-repeat: no-repeat;

	& option {
		width: 100%;
	}
`
//
// const users = [
// 	{
// 		user_id: '6325d80fe06688d15a620dbf',
// 		email: 'some@email.com',
// 		name: 'User',
// 		isModerator: true,
// 	},
// 	{
// 		user_id: '6325d9b2024a807aa45c563a',
// 		email: 'some2@email.com',
// 		name: 'User2',
// 		isModerator: false,
// 	},
// ]

export function Chat() {
	const [textMessage, setTextMessage] = useState('')
	const [selectedFilter, setSelectedFilter] = useState('time')
	const [selectedSender, setSelectedSender] = useState('Аноним')

	const { messageHistory, connectionStatus, sendMessageClick } = useChat()

	if (connectionStatus === 'Closed') {
		return <ChatStyle>Loading... </ChatStyle>
	}

	function countClick(id: string) {
		sendMessageClick({ messageId: id }, 'likes')
	}

	function sendMessage(data: any) {
		if (textMessage !== '') {
			sendMessageClick(data)
		}
	}

	return (
		<ChatStyle>
			{connectionStatus === 'Open' ? (
				<FlexRow justifyContent="center">
					<FlexColumn flex={1}>
						<FlexRow justifyContent="center">
							<h2>Вопросы</h2>
						</FlexRow>
						<FlexRow justifyContent="space-between">
							<FlexColumn>
								<FlexRow>
									<ul>
										<li>Все вопросы</li>
										<li>Мои вопросы</li>
									</ul>
								</FlexRow>
							</FlexColumn>
							<FlexColumn>
								<SelectStyle
									name="filter"
									id="filter"
									value={selectedFilter}
									onChange={e =>
										setSelectedFilter(e.target.value)
									}
								>
									<option value="time">По времени</option>
									<option value="count">По количеству</option>
									{}
								</SelectStyle>
							</FlexColumn>
						</FlexRow>
						<DialogWrapper>
							<FlexColumn flex={1}>
								{messageHistory.map(message => {
									return (
										<MessageWrapper
											key={message._id}
											message={message}
											onCountLike={countClick}
										/>
									)
								})}
							</FlexColumn>
						</DialogWrapper>
						<FlexRow>
							<FlexColumn>
								<FlexRow>
									<FlexColumn>
										<FlexRow>
											<span>Задать вопрос как:</span>
										</FlexRow>
									</FlexColumn>
									<FlexColumn>
										<RadioGroup
											selectedSender={selectedSender}
											setSelectedSender={
												setSelectedSender
											}
										/>
									</FlexColumn>
								</FlexRow>
								<FlexRow>
									<FlexColumn>
										<FlexRow>
											<Input
												type="text"
												value={textMessage}
												onChange={({ target }) =>
													setTextMessage(target.value)
												}
											/>
										</FlexRow>
									</FlexColumn>
									<FlexColumn>
										<FlexRow>
											<Button
												onClick={() =>
													sendMessage({
														sender: selectedSender,
														text: textMessage,
													})
												}
											>
												<Icon icon={send} />
											</Button>
										</FlexRow>
									</FlexColumn>
								</FlexRow>
							</FlexColumn>
						</FlexRow>
					</FlexColumn>
				</FlexRow>
			) : (
				<FlexRow>Чат закрыт</FlexRow>
			)}
		</ChatStyle>
	)
}

type MessageWrapperType = {
	message: MessageType
	onCountLike: (id: string) => void
}

function MessageWrapper({ message, onCountLike }: MessageWrapperType) {
	return (
		<MessageWrapperStyle style={{ marginBottom: 40 }}>
			<FlexColumn flex={1}>
				<FlexRow justifyContent="space-between">
					<FlexColumn span={12}>
						<FlexRow justifyContent="space-between">
							<FlexColumn>{message.sender}</FlexColumn>
							<FlexColumn>{'8/6/2022'}</FlexColumn>
							{/* this date from field the message's date  */}
							<FlexColumn>{'15:33'}</FlexColumn>
							{/* this time from field the message's date  */}
						</FlexRow>
					</FlexColumn>
					<FlexColumn span={12}>
						<FlexRow
							justifyContent={'flex-end'}
							alignItems="center"
						>
							<FlexColumn>
								<span onClick={() => onCountLike(message._id)}>
									<Icon icon={like} />
								</span>
							</FlexColumn>
							{message.likes > 0 && (
								<FlexColumn>{message.likes}</FlexColumn>
							)}
						</FlexRow>
					</FlexColumn>
				</FlexRow>
				<FlexRow>{message.text}</FlexRow>
				{!message.isConfirmed && (
					<FlexRow justifyContent="flex-end">
						<FlexColumn span={5} flex={1}>
							<Button style={{ color: 'white' }}>
								Подтвердить
							</Button>
						</FlexColumn>
						<FlexColumn span={5} flex={1} offset={1}>
							<Button
								style={{
									background: '#e52a2a',
									color: 'white',
								}}
							>
								Удалить
							</Button>
						</FlexColumn>
					</FlexRow>
				)}
				{message.isConfirmed && message.answer && (
					<FlexRow
						style={{ marginTop: 16, borderLeft: '4px solid #ccc' }}
					>
						<FlexColumn>
							<FlexRow>
								<FlexColumn>{message.answer.sender}</FlexColumn>
								<FlexColumn>{'8 / 6 / 2022'}</FlexColumn>
								{/* this date from field the answer's date  */}
								<FlexColumn>{'15:33'}</FlexColumn>
								{/* this time from field the answer's date  */}
							</FlexRow>
							<FlexRow>{message.answer.text}</FlexRow>
						</FlexColumn>
					</FlexRow>
				)}
			</FlexColumn>
		</MessageWrapperStyle>
	)
}

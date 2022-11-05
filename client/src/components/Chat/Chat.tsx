import React, { useCallback, useEffect, useState } from 'react'

import type { RadioChangeEvent } from 'antd'

import { useChat } from '../../hooks/useChat'
import { useInput } from '../../hooks/useInput'

import { sortMessages } from '../../helpers/sortMessages'

import MessageWrapper from '../MessageWrapper/MessageWrapper'
import RadioGroup from '../RadioGroup'

import Select from '../ui/Select/Select'
import Input from '../ui/Input/Input'
import Tabs from '../ui/Tabs'
import { SendButton } from '../ui/Button/Button'
import Icon from '../ui/Icon'

import { MessageType } from '../../../../common/dto/types'
import { send } from '../../assets/svg'
import { Style, DialogLayout, DialogWrapper } from './style'
import { Loading } from '../ui/Loading'
import { items, options } from '../../constants'
import { FlexColumn, FlexRow } from 'helpers/layoutStyle'
import { useScroll } from '../../hooks/useScroll'
import { Title } from '../ui/Title'

type ChatTypeProps = { jwt: string, isModerator: boolean, userName: string }

export function Chat({ jwt, isModerator, userName }: ChatTypeProps) {
	const [selectedSort, setSelectedSort] = useState('asc')
	const [selectedSender, setSelectedSender] = useState('anonym')
	const [tab, setTab] = useState('all')
	const [messages, setMessages] = useState<MessageType[]>([])
	const messageInput = useInput('')

	// TODO: Scroll
	// const scroll = useScroll({ messages: messages })

	const { messageHistory, connectionStatus, sendMessageClick } = useChat(jwt)

	function getTabItems(isModerator: boolean) {
		return isModerator ? [...items, {label: 'Не подтвержденные', key: 'unconfirmed', children: ''}] : items
	}

	function sendMessage() {
		if (messageInput.value !== '') {
			const senderName =
				selectedSender === 'anonym' ? 'Аноним' : userName

			const data = {
				sender: isModerator ? 'Модератор' : senderName,
				text: messageInput.value,
			}

			sendMessageClick(data)
			messageInput.onReset()
		}
	}

	const changeTabCallback = useCallback((item: string) => setTab(item), [])
	const selectedSortCallback = useCallback(
		(event: React.SetStateAction<string>) => setSelectedSort(event),
		[]
	)
	const selectedSenderCallback = useCallback(
		({ target }: RadioChangeEvent) => setSelectedSender(target.value),
		[]
	)

	useEffect(() => {
		if (messageHistory.length > 0) {
			const sortedMessage = sortMessages(messageHistory, selectedSort)
			setMessages(sortedMessage)
		} else {
			setMessages(messageHistory)
		}
	}, [messageHistory, selectedSort])

	useEffect(() => {
		if (connectionStatus === 'Open') {
			sendMessageClick({ filter: tab }, 'getMessages')
		}
	}, [tab])

	useEffect(()=>{
		const person = isModerator ? 'moderator' : 'anonym'
		setSelectedSender(person)
	},[isModerator])

	// TODO: Scroll
	// useEffect(() => {
	// 	if (scroll.checked) {
	// 		const scrollElement: Element | null =
	// 			document.querySelector('.scroll')
	// 		const scrollHeightElement: Element | null =
	// 			document.querySelector('.scrollHeight')
	//
	// 		if (!!scrollElement && !!scrollHeightElement) {
	// 			scrollElement.scrollTo(0, scrollHeightElement.scrollHeight)
	// 		}
	// 	}
	// }, [messages.length, scroll])

	function keyPressEnter(e: React.KeyboardEvent<HTMLInputElement>) {
		if(e.key === 'Enter') {
			sendMessage()
		}
	}

	return (
		<Style>
			<FlexRow justify="center">
				{connectionStatus === 'Open' && (
					<FlexColumn flex={1}>
						<FlexRow justify="center" style={{ marginBottom: 25 }}>
							<Title level={2}>Вопросы</Title>
						</FlexRow>
						<FlexRow justify="space-between">
							<FlexColumn>
								<FlexRow>
									<Tabs
										defaultActiveKey={'all'}
										onChange={changeTabCallback}
										items={getTabItems(isModerator)}
									/>
								</FlexRow>
							</FlexColumn>
							<FlexColumn>
								<FlexRow>
									<Select
										defaultValue={selectedSort}
										onChange={selectedSortCallback}
										options={options}
									/>
								</FlexRow>
							</FlexColumn>
						</FlexRow>
						<DialogLayout>
							<FlexColumn flex={1}>
								<DialogWrapper className={'scroll'}>
									<FlexColumn className={'scrollHeight'}>
										{messages.map(message => {
											return (
												<MessageWrapper
													key={message._id}
													message={message}
													onSendMessage={
														sendMessageClick
													}
													isModerator={isModerator}
												/>
											)
										})}
									</FlexColumn>
								</DialogWrapper>
							</FlexColumn>
						</DialogLayout>
						<FlexRow>
							<FlexColumn flex={1}>
								<FlexRow>
									<FlexColumn>
										<FlexRow>
											<span>Задать вопрос как:</span>
										</FlexRow>
									</FlexColumn>
									<FlexColumn>
                                        <RadioGroup
                                            onChange={selectedSenderCallback}
                                            value={selectedSender}
                                            isModerator={isModerator}
											userName={userName}
                                        />
									</FlexColumn>
								</FlexRow>
								<FlexRow style={{ marginTop: 5 }}>
									<FlexColumn span={21}>
										<FlexRow style={{ height: 50 }}>
											<Input
												onKeyDown={keyPressEnter}
												placeholder={'Введите вопрос'}
												{...messageInput}
											/>
										</FlexRow>
									</FlexColumn>
									<FlexColumn span={2} offset={1}>
										<FlexRow align={'middle'}>
											<SendButton onClick={sendMessage}>
												<Icon icon={send} color={'#fff'} />
											</SendButton>
										</FlexRow>
									</FlexColumn>
								</FlexRow>
							</FlexColumn>
						</FlexRow>
					</FlexColumn>
				)}
				{connectionStatus === 'Closed' && 'Чат закрыт'}
				{connectionStatus === 'Connecting' && <Loading />}
			</FlexRow>
		</Style>
	)
}

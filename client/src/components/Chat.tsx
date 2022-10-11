import styled from 'styled-components'
// import Select from './ui/Select'
import React, {useEffect, useState} from 'react'
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
import {like, send} from '../assets/svg'
import {useChat} from '../hooks/useChat'
import {RadioGroup} from './RadioGroup'
import {MessageType} from '../../../common/dto/dto'
import {getDateTime} from "../helpers/getDateTime";
import { LoadingOutlined } from '@ant-design/icons';
import MessageWrapper from "./MessageWrapper";
import {Tabs, Select, Spin, Radio} from "antd";
import type {RadioChangeEvent} from "antd";

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

const isModerator = false

const {Option} = Select;

export function Chat() {
    const [textMessage, setTextMessage] = useState('')
    const [selectedSort, setSelectedSort] = useState('asc')
    const [selectedSender, setSelectedSender] = useState('anonym')
    const [tab, setTab] = useState('all')
    const [messages, setMessages] = useState<MessageType[]>([])

    const {messageHistory, connectionStatus, sendMessageClick} = useChat()

    function countClick(id: string) {
        sendMessageClick({messageId: id}, 'likes')
    }

    function confirmClick(id: string) {
        sendMessageClick({messageId: id}, 'confirmedMessage')
    }

    function replyClick(id: string, reply: string) {
        sendMessageClick({messageId: id, reply}, 'replyToMessage')
    }

    function removeClick(id: string) {
        sendMessageClick({messageId: id}, 'removeMessage')
    }

    function sendMessage(data: any) {
        if (textMessage !== '') {
            sendMessageClick(data)
        }
    }

    const items = [
        {label: 'Все вопросы', key: 'all', children: ''},
        {label: 'Мои вопросы', key: 'my', children: ''},
        // {label: 'Не подтвержденные вопросы', key: 'item-3', children: 'Content 3'}
    ]

    function getTab(item: string) {
        setTab(item)
    }

    // TODO: create filter by count likes, asc & desc the date


    function sortMessages(messages: MessageType[], type: string) {

        const sortedMessages = [...messages];

        if (type === 'desc') {
            sortedMessages.sort((messagePrev, messageNext) => messageNext.created.getTime() - messagePrev.created.getTime())
        } else if (type === 'time') {
            sortedMessages.sort((messagePrev, messageNext) => messageNext.created.getTime() - messagePrev.created.getTime())
        } else if (type === 'like') {
            sortedMessages.sort((messagePrev, messageNext) => messagePrev.likes - messageNext.likes)
        } else {
            sortedMessages.sort((messagePrev, messageNext) => messagePrev.created.getTime() - messageNext.created.getTime())
        }

        return sortedMessages
    }

    function selectSender(e: RadioChangeEvent) {
        setSelectedSender(e.target.value);
    }

    useEffect(() => {
        const sortedMessage = sortMessages(messageHistory, selectedSort)
        setMessages(sortedMessage)

    }, [messageHistory, selectedSort])

    useEffect(() => {
        if (connectionStatus === 'Open') {
            sendMessageClick({filter: tab}, 'getMessages')
        }
    }, [tab])

    if (connectionStatus === 'Connecting') {
        const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

        return <ChatStyle><Spin indicator={antIcon} /> </ChatStyle>
    }

    return (
        <ChatStyle>
            {connectionStatus === 'Open' && (
                <FlexRow justifyContent="center">
                    <FlexColumn flex={1}>
                        <FlexRow justifyContent="center">
                            <h2>Вопросы</h2>
                        </FlexRow>
                        <FlexRow justifyContent="space-between">
                            <FlexColumn>
                                <FlexRow>
                                    <Tabs defaultActiveKey={'all'} onChange={getTab} items={items}/>
                                </FlexRow>
                            </FlexColumn>
                            <FlexColumn>
                                <Select defaultValue={selectedSort} onChange={setSelectedSort}>
                                    <Option value="time">По времени</Option>
                                    <Option value="like">По лайкам</Option>
                                    <Option value="asc">По возрастанию</Option>
                                    <Option value="desc">По убыванию</Option>
                                </Select>
                            </FlexColumn>
                        </FlexRow>
                        <DialogWrapper>
                            <FlexColumn flex={1}>
                                {messages.map(message => {
                                    return (
                                        <MessageWrapper
                                            key={message._id}
                                            message={message}
                                            onRemove={removeClick}
                                            onConfirm={confirmClick}
                                            onCountLike={countClick}
                                            onReply={replyClick}
                                            isModerator={isModerator}
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
                                        <Radio.Group onChange={selectSender} value={selectedSender}>
                                            <Radio value={'person'}>Пользователь</Radio>
                                            <Radio value={'anonym'}>Анонимно</Radio>
                                        </Radio.Group>
                                    </FlexColumn>
                                </FlexRow>
                                <FlexRow>
                                    <FlexColumn>
                                        <FlexRow>
                                            <Input
                                                type="text"
                                                value={textMessage}
                                                onChange={({target}) =>
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
                                                        sender: selectedSender === 'anonym' ? 'Аноним' : 'Пользователь',
                                                        text: textMessage,
                                                    })
                                                }
                                            >
                                                <Icon icon={send}/>
                                            </Button>
                                        </FlexRow>
                                    </FlexColumn>
                                </FlexRow>
                            </FlexColumn>
                        </FlexRow>
                    </FlexColumn>
                </FlexRow>
            )}
            {connectionStatus === 'Closed' &&
            (
                <FlexRow>Чат закрыт</FlexRow>
            )}
        </ChatStyle>
    )
}

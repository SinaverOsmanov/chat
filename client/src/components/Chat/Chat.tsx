import React, {useEffect, useState} from 'react'
import {
    FlexColumn,
    FlexRow
} from '../../styled'
import Input from '../ui/Input'
import Icon from '../ui/Icon'
import {send} from '../../assets/svg'
import {useChat} from '../../hooks/useChat'
import {MessageType} from '../../../../common/dto/dto'
import {LoadingOutlined} from '@ant-design/icons';
import MessageWrapper from "../MessageWrapper/MessageWrapper";
import {Spin, Typography} from "antd";
import type {RadioChangeEvent} from "antd";
import {sortMessages} from "../../helpers/sortMessages";
import {RadioGroup} from "../RadioGroup";
import Select from "../ui/Select";
import {Tabs} from "../ui/Tabs";
import {ChatStyle, DialogLayout, DialogWrapper} from './ChatStyle'
import { SendButton } from 'components/ui/Button/Button'

const isModerator = false

const {Title} = Typography

const items = [
    {label: 'Все вопросы', key: 'all', children: ''},
    {label: 'Мои вопросы', key: 'my', children: ''},
]

const options = [
    {value: 'time', title: 'По времени'},
    {value: 'like', title: 'По лайкам'},
    {value: 'asc', title: 'По возрастанию'},
    {value: 'desc', title: 'По убыванию'}
]

export function Chat() {
    const [textMessage, setTextMessage] = useState('')
    const [selectedSort, setSelectedSort] = useState('asc')
    const [selectedSender, setSelectedSender] = useState(isModerator ? 'moderator' : 'anonym')
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

    function sendMessage() {
        if (textMessage !== '') {
            const senderName = selectedSender === 'anonym' ? 'Аноним' : 'Пользователь'

            const data = {
                sender: isModerator ? 'Модератор' : senderName,
                text: textMessage,
            }

            sendMessageClick(data)
            setTextMessage('')
        }
    }

    function getTab(item: string) {
        setTab(item)
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
        const antIcon = <LoadingOutlined style={{fontSize: 24}} spin/>

        return (
            <ChatStyle>
                <FlexRow justify='center'>
                    <Spin indicator={antIcon}/>
                </FlexRow>
            </ChatStyle>
        )
    }

    return (
        <ChatStyle>
            {connectionStatus === 'Open' && (
                <FlexRow justify="center">
                    <FlexColumn flex={1}>
                        <FlexRow justify="center" style={{marginBottom: 24}}>
                            <Title style={{margin: 0}} level={2}>Вопросы</Title>
                        </FlexRow>
                        <FlexRow justify="space-between">
                            <FlexColumn>
                                <FlexRow>
                                    <Tabs defaultActiveKey={'all'} onChange={getTab} items={items}/>
                                </FlexRow>
                            </FlexColumn>
                            <FlexColumn>
                                <FlexRow>
                                    <Select defaultValue={selectedSort} onChange={setSelectedSort} options={options}/>
                                </FlexRow>
                            </FlexColumn>
                        </FlexRow>
                        <DialogLayout>
                            <FlexColumn flex={1}>
                                <DialogWrapper>
                                    <FlexColumn>
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
                            </FlexColumn>
                        </DialogLayout>
                        <FlexRow style={{marginTop: 58}}>
                            <FlexColumn flex={1}>
                                <FlexRow>
                                    <FlexColumn>
                                        <FlexRow>
                                            <span>Задать вопрос как:</span>
                                        </FlexRow>
                                    </FlexColumn>
                                    <FlexColumn>
                                        <RadioGroup
                                            onChange={selectSender}
                                            value={selectedSender}
                                            isModerator={isModerator}
                                        />
                                    </FlexColumn>
                                </FlexRow>
                                <FlexRow style={{marginTop: 5}}>
                                    <FlexColumn span={21}>
                                        <FlexRow style={{height: 48}}>
                                            <Input
                                                style={{border: '2px solid #ccc'}}
                                                placeholder={'Введите вопрос'}
                                                value={textMessage}
                                                onChange={({target}) =>
                                                    setTextMessage(target.value)
                                                }
                                            />
                                        </FlexRow>
                                    </FlexColumn>
                                    <FlexColumn span={2} offset={1}>
                                        <FlexRow align={'middle'}>
                                            <SendButton
                                                onClick={sendMessage}
                                            >
                                                <Icon icon={send}/>
                                            </SendButton>
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

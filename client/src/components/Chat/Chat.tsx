import React, {useCallback, useEffect, useState} from 'react'

import type {RadioChangeEvent} from "antd";
import {Typography} from "antd";

import {useChat} from '../../hooks/useChat'
import {useInput} from "../../hooks/useInput";

import {sortMessages} from "../../helpers/sortMessages";
import {
    FlexColumn,
    FlexRow
} from '../../styled'

import MessageWrapper from "../MessageWrapper/MessageWrapper";
import RadioGroup from "../RadioGroup";

import Select from "../ui/Select/Select";
import Input from '../ui/Input/Input'
import Tabs from "../ui/Tabs";
import {SendButton} from "../ui/Button/Button";
import Icon from '../ui/Icon'

import {MessageType} from '../../../../common/dto/types'
import {send} from '../../assets/svg'
import {Style, DialogLayout, DialogWrapper} from './style'
import {Loading} from "../ui/Loading";
import {items, options} from "../../constants";


// change logic when will have created auth
const isModerator = true

const {Title} = Typography

export function Chat() {
    const [selectedSort, setSelectedSort] = useState('asc')
    const [selectedSender, setSelectedSender] = useState(isModerator ? 'moderator' : 'anonym')
    const [tab, setTab] = useState('all')
    const [messages, setMessages] = useState<MessageType[]>([])
    const message = useInput('')

    const {messageHistory, connectionStatus, sendMessageClick} = useChat()

    function sendMessage() {
        if (message.value !== '') {
            const senderName = selectedSender === 'anonym' ? 'Аноним' : 'Пользователь'

            const data = {
                sender: isModerator ? 'Модератор' : senderName,
                text: message.value,
            }

            sendMessageClick(data)
            message.onReset()
        }
    }

    const changeTabCallback = useCallback((item: string) => setTab(item), [])
    const selectedSortCallback = useCallback((event: React.SetStateAction<string>) => setSelectedSort(event), [])
    const selectedSenderCallback = useCallback(({target}: RadioChangeEvent) => setSelectedSender(target.value), [])


    useEffect(() => {
        const sortedMessage = sortMessages(messageHistory, selectedSort)
        setMessages(sortedMessage)

    }, [messageHistory, selectedSort])

    useEffect(() => {
        if (connectionStatus === 'Open') {
            sendMessageClick({filter: tab}, 'getMessages')
        }
    }, [tab])

    useEffect(()=>{
        const el:Element | null = document.querySelector('.scroll')
        const scroll: Element | null = document.querySelector('.scrollHeight')

        if(!!el && !!scroll) {
            el.scrollTo(0, scroll.scrollHeight)
        }

    },[messages.length])

    return (
        <Style>
            <FlexRow justify="center">
                {connectionStatus === 'Open' && (
                    <FlexColumn flex={1}>
                        <FlexRow justify="center" style={{marginBottom: 24}}>
                            <Title style={{margin: 0}} level={2}>Вопросы</Title>
                        </FlexRow>
                        <FlexRow justify="space-between">
                            <FlexColumn>
                                <FlexRow>
                                    <Tabs defaultActiveKey={'all'} onChange={changeTabCallback} items={items}/>
                                </FlexRow>
                            </FlexColumn>
                            <FlexColumn>
                                <FlexRow>
                                    <Select defaultValue={selectedSort} onChange={selectedSortCallback}
                                            options={options}/>
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
                                                    onSendMessage={sendMessageClick}
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
                                        />
                                    </FlexColumn>
                                </FlexRow>
                                <FlexRow style={{marginTop: 5}}>
                                    <FlexColumn span={21}>
                                        <FlexRow style={{height: 48}}>
                                            <Input
                                                placeholder={'Введите вопрос'}
                                                {...message}
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
                )}
                {connectionStatus === 'Closed' && 'Чат закрыт'}
                {connectionStatus === 'Connection' && <Loading/>}
            </FlexRow>
        </Style>
    )
}

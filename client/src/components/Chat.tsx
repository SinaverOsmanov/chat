import styled from 'styled-components'
import Select from './ui/Select'
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
import MessageWrapper from "./MessageWrapper";
import {Tabs} from "antd";

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

export function Chat() {
    const [textMessage, setTextMessage] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('time')
    const [selectedSender, setSelectedSender] = useState('Аноним')
    const [tab, setTab] = useState('all')

    const {messageHistory, connectionStatus, sendMessageClick} = useChat()

    if (connectionStatus === 'Closed') {
        return <ChatStyle>Loading... </ChatStyle>
    }

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

    function getTab(item:string) {
        setTab(item)
    }

    // TODO: create filter by count likes, asc & desc the date

    useEffect(()=>{
        if(connectionStatus === 'Open') {
            sendMessageClick({filter: tab}, 'getMessages')
        }
    }, [tab])

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
                                    <Tabs defaultActiveKey={'all'} onChange={getTab} items={items} />
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
                                                        sender: selectedSender,
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
            ) : (
                <FlexRow>Чат закрыт</FlexRow>
            )}
        </ChatStyle>
    )
}

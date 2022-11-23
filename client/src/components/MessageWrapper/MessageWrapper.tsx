import React, { useState } from 'react'
import { getDateTime } from '../../helpers/getDateTime'
import Icon from '../UI/Icon'
import { like } from '../../assets/svg'
import Input from '../UI/Input/Input'
import { MessageTypeLikedByMe, TypeWSMessage } from '../../common/dto/types'
import { Button, RemoveButton } from '../UI/Button/Button'
import {
    DateMessageStyle,
    MessageWrapperStyle,
    ModeratorAnswerStyle,
    SenderMessageStyle,
    TextMessageStyle,
} from './style'
import { useInput } from '../../hooks/useInput'
import { FlexColumn, FlexRow } from 'helpers/layoutStyle'
import { WsServerMessage } from '../../common/dto/dto'

type MessageWrapperType = {
    message: MessageTypeLikedByMe
    onSendMessage: (data: WsServerMessage) => void
    isModerator: boolean
}

function MessageWrapper({
    isModerator,
    message,
    onSendMessage,
}: MessageWrapperType) {
    const [isLiked, setIsLiked] = useState(message.isLikedByMe)

    const answerInput = useInput('')

    function confirmedMessage(id: string) {
        onSendMessage({
            data: {
                messageId: id,
            },
            type: TypeWSMessage.CONFIRMED_MESSAGE,
        })
    }

    function removeMessage(id: string) {
        onSendMessage({
            data: { messageId: id },
            type: TypeWSMessage.REMOVE_MESSAGE,
        })
    }

    function replyToMessage(id: string) {
        const { value } = answerInput

        if (value) {
            onSendMessage({
                data: { messageId: id, reply: value },
                type: TypeWSMessage.REPLY_TO_MESSAGE,
            })
        }
    }

    function likeMessage(id: string) {
        setIsLiked(!isLiked)
        onSendMessage({
            data: {
                messageId: id,
            },
            type: TypeWSMessage.LIKES,
        })
    }

    return (
        <MessageWrapperStyle>
            <FlexColumn flex={1}>
                <FlexRow justify="space-between">
                    <FlexColumn span={16}>
                        <FlexRow>
                            <SenderMessageStyle>
                                {message.sender}
                            </SenderMessageStyle>
                            <DateMessageStyle>
                                {message.dateConfirmed ? (
                                    <FlexRow>
                                        <FlexColumn>
                                            {
                                                getDateTime(
                                                    message.dateConfirmed
                                                ).newDate
                                            }
                                        </FlexColumn>
                                        <FlexColumn>
                                            {
                                                getDateTime(
                                                    message.dateConfirmed
                                                ).time
                                            }
                                        </FlexColumn>
                                    </FlexRow>
                                ) : (
                                    <FlexRow>
                                        <FlexColumn>
                                            Не подтвержденно
                                        </FlexColumn>
                                    </FlexRow>
                                )}
                            </DateMessageStyle>
                        </FlexRow>
                    </FlexColumn>
                    <FlexColumn span={8}>
                        {message.isConfirmed && (
                            <FlexRow justify={'end'} align="middle">
                                <FlexColumn>
                                    <span
                                        onClick={() => likeMessage(message._id)}
                                    >
                                        <Icon
                                            icon={like}
                                            color={
                                                isLiked === undefined
                                                    ? ''
                                                    : isLiked
                                                    ? 'blue'
                                                    : ''
                                            }
                                        />
                                    </span>
                                </FlexColumn>
                                {message.likes > 0 && (
                                    <FlexColumn style={{ color: '#AEAEAE' }}>
                                        {message.likes}
                                    </FlexColumn>
                                )}
                            </FlexRow>
                        )}
                    </FlexColumn>
                </FlexRow>
                <TextMessageStyle>{message.text}</TextMessageStyle>
                {!message.isConfirmed && isModerator && (
                    <FlexRow justify="end">
                        <FlexColumn span={5} flex={1}>
                            <Button
                                onClick={() => confirmedMessage(message._id)}
                            >
                                Подтвердить
                            </Button>
                        </FlexColumn>
                        <FlexColumn span={5} flex={1} offset={1}>
                            <RemoveButton
                                onClick={() => removeMessage(message._id)}
                            >
                                Удалить
                            </RemoveButton>
                        </FlexColumn>
                    </FlexRow>
                )}
                {!message.answer && isModerator && message.isConfirmed && (
                    <FlexRow style={{ marginTop: 10 }}>
                        <FlexColumn flex={1} span={19}>
                            <FlexRow>
                                <Input
                                    placeholder={'Введите ответ'}
                                    {...answerInput}
                                />
                            </FlexRow>
                        </FlexColumn>
                        <FlexColumn flex={1} span={4} offset={1}>
                            <FlexRow>
                                <Button
                                    onClick={() => replyToMessage(message._id)}
                                >
                                    Ответить
                                </Button>
                            </FlexRow>
                        </FlexColumn>
                    </FlexRow>
                )}
                {message.isConfirmed && message.answer && (
                    <ModeratorAnswerStyle>
                        <FlexColumn flex={1}>
                            <FlexRow>
                                <SenderMessageStyle>
                                    {message.answer.sender}
                                </SenderMessageStyle>
                                <DateMessageStyle>
                                    <FlexRow>
                                        <FlexColumn>
                                            {
                                                getDateTime(
                                                    message.answer.created
                                                ).newDate
                                            }
                                        </FlexColumn>
                                        <FlexColumn>
                                            {
                                                getDateTime(
                                                    message.answer.created
                                                ).time
                                            }
                                        </FlexColumn>
                                    </FlexRow>
                                </DateMessageStyle>
                            </FlexRow>
                            <TextMessageStyle>
                                {message.answer.text}
                            </TextMessageStyle>
                        </FlexColumn>
                    </ModeratorAnswerStyle>
                )}
                {message.isConfirmed && isModerator && (
                    <FlexRow justify="end" style={{ marginTop: 15 }}>
                        <FlexColumn span={5} flex={1} offset={1}>
                            <RemoveButton
                                onClick={() => removeMessage(message._id)}
                            >
                                Удалить
                            </RemoveButton>
                        </FlexColumn>
                    </FlexRow>
                )}
            </FlexColumn>
        </MessageWrapperStyle>
    )
}

export default React.memo(MessageWrapper)

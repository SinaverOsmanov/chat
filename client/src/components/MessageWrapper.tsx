import React, {useCallback, useState} from "react";
import {FlexColumn, FlexRow, MessageWrapperStyle} from "../styled";
import {getDateTime} from "../helpers/getDateTime";
import Icon from "./ui/Icon";
import {like} from "../assets/svg";
import Button from "./ui/Button";
import Input from "./ui/Input";
import {MessageType} from "../../../common/dto/dto";

type MessageWrapperType = {
    message: MessageType
    onCountLike: (id: string) => void
    onConfirm: (id: string) => void
    onRemove: (id: string) => void
    onReply: (id: string, reply: string) => void
    isModerator: boolean
}

function MessageWrapper({isModerator,message, onCountLike, onConfirm, onReply, onRemove}: MessageWrapperType) {
    const [textMessage, setTextMessage] = useState('')

    function confirmedMessage(id: string) {
        onConfirm(id)
    }

    function removeMessage(id: string) {
        onRemove(id)
    }

    function replyToMessage(id: string) {
        if (textMessage) {
            onReply(id, textMessage)
        }
    }

    return (
        <MessageWrapperStyle style={{marginBottom: 40}}>
            <FlexColumn flex={1}>
                <FlexRow justifyContent="space-between">
                    <FlexColumn span={12}>
                        <FlexRow justifyContent="space-between">
                            <FlexColumn>{message.sender}</FlexColumn>
                            {
                                message.dateConfirmed && <>
                                    <FlexColumn>{getDateTime(message.dateConfirmed).newDate}</FlexColumn>
                                    <FlexColumn>{getDateTime(message.dateConfirmed).time}</FlexColumn>

                                </>
                            }
                        </FlexRow>
                    </FlexColumn>
                    <FlexColumn span={12}>
                        {message.isConfirmed &&
                            <FlexRow
                                justifyContent={'flex-end'}
                                alignItems="center"
                            >
                                <FlexColumn>
								<span onClick={() => onCountLike(message._id)}>
									<Icon icon={like}/>
								</span>
                                </FlexColumn>
                                {message.likes > 0 && (
                                    <FlexColumn>{message.likes}</FlexColumn>
                                )}
                            </FlexRow>
                        }
                    </FlexColumn>
                </FlexRow>
                <FlexRow>{message.text}</FlexRow>
                {!message.isConfirmed && isModerator && (
                    <FlexRow justifyContent="flex-end">
                        <FlexColumn span={5} flex={1}>
                            <Button style={{color: 'white'}} onClick={() => confirmedMessage(message._id)}>
                                Подтвердить
                            </Button>
                        </FlexColumn>
                        <FlexColumn span={5} flex={1} offset={1}>
                            <Button
                                style={{
                                    background: '#e52a2a',
                                    color: 'white',
                                }}
                                onClick={() => removeMessage(message._id)}
                            >
                                Удалить
                            </Button>
                        </FlexColumn>
                    </FlexRow>
                )}
                {!message.answer && isModerator && message.isConfirmed && <FlexRow>
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
                        <FlexRow>
                            <Button onClick={() => replyToMessage(message._id)}>Ответить</Button>
                        </FlexRow>
                    </FlexColumn>
                </FlexRow>}
                {message.isConfirmed && message.answer && (
                    <FlexRow
                        style={{marginTop: 16, borderLeft: '4px solid #ccc'}}
                    >
                        <FlexColumn span={12}>
                            <FlexRow justifyContent="space-between">
                                <FlexColumn>{message.answer.sender}</FlexColumn>
                                <FlexColumn>{getDateTime(message.answer.created).newDate}</FlexColumn>
                                <FlexColumn>{getDateTime(message.answer.created).time}</FlexColumn>
                            </FlexRow>
                            <FlexRow>{message.answer.text}</FlexRow>
                        </FlexColumn>
                    </FlexRow>
                )}
            </FlexColumn>
        </MessageWrapperStyle>
    )
}

export default React.memo(MessageWrapper)

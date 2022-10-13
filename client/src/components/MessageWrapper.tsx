import React, {useState} from "react";
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
                <FlexRow justify="space-between">
                    <FlexColumn span={16}>
                        <FlexRow>
                            <FlexColumn style={{color:'#666'}}>{message.sender}</FlexColumn>
                            {
                                message.dateConfirmed && <>
                                    <FlexColumn style={{color:'#AEAEAE', marginLeft: 15}}>{getDateTime(message.dateConfirmed).newDate}</FlexColumn>
                                    <FlexColumn style={{color:'#AEAEAE', marginLeft: 15}}>{getDateTime(message.dateConfirmed).time}</FlexColumn>
                                </>
                            }
                        </FlexRow>
                    </FlexColumn>
                    <FlexColumn span={8}>
                        {message.isConfirmed &&
                            <FlexRow
                                justify={'end'}
                                align="middle"
                            >
                                <FlexColumn>
								<span onClick={() => onCountLike(message._id)}>
									<Icon icon={like}/>
								</span>
                                </FlexColumn>
                                {message.likes > 0 && (
                                    <FlexColumn style={{color:'#AEAEAE'}}>{message.likes}</FlexColumn>
                                )}
                            </FlexRow>
                        }
                    </FlexColumn>
                </FlexRow>
                <FlexRow style={{color:'#1D1D1B', marginTop: 10}}>{message.text}</FlexRow>
                {!message.isConfirmed && isModerator && (
                    <FlexRow justify="end" style={{marginTop: 15}}>
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
                {!message.answer && isModerator && message.isConfirmed && <FlexRow style={{marginTop: 10}}>
                    <FlexColumn flex={1} span={19}>
                        <FlexRow>
                            <Input
                                placeholder={'Введите ответ'}
                                value={textMessage}
                                onChange={({target}) =>
                                    setTextMessage(target.value)
                                }
                            />
                        </FlexRow>
                    </FlexColumn>
                    <FlexColumn flex={1} span={4} offset={1}>
                        <FlexRow>
                            <Button onClick={() => replyToMessage(message._id)}>Ответить</Button>
                        </FlexRow>
                    </FlexColumn>
                </FlexRow>}
                {message.isConfirmed && message.answer && (
                    <FlexRow
                        style={{marginTop: 20, borderLeft: '4px solid #ccc'}}
                    >
                        <FlexColumn style={{paddingLeft: 10}} flex={1}>
                            <FlexRow>
                                <FlexColumn style={{color:'#666'}}>{message.answer.sender}</FlexColumn>
                                <FlexColumn style={{color:'#AEAEAE', marginLeft: 15}}>{getDateTime(message.answer.created).newDate}</FlexColumn>
                                <FlexColumn style={{color:'#AEAEAE', marginLeft: 15}}>{getDateTime(message.answer.created).time}</FlexColumn>
                            </FlexRow>
                            <FlexRow style={{color:'#1D1D1B', marginTop: 15}}>{message.answer.text}</FlexRow>
                        </FlexColumn>
                    </FlexRow>
                )}
            </FlexColumn>
        </MessageWrapperStyle>
    )
}

export default React.memo(MessageWrapper)

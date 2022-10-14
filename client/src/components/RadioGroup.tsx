import React from "react";
import {Radio as RadioButton, RadioChangeEvent} from 'antd'
import Radio from "./ui/Radio";
import styled from "styled-components";
import {FlexRow} from "../styled";

type RadioGroupProps = { onChange(e: RadioChangeEvent): void, value: string, isModerator: boolean }

const RadioStyle = styled(Radio)`
  .ant-radio-wrapper {
    margin: 0 0 0 24px;
  }
`

export const RadioGroup:React.FC<RadioGroupProps> = ({onChange, value, isModerator}) => {

    return (
        <FlexRow>
            <RadioStyle onChange={onChange} value={value}>
                {isModerator ?
                    <RadioButton value={'moderator'}>Модератор</RadioButton>
                    :
                    <>
                        <RadioButton value={'person'}>Пользователь</RadioButton>
                        <RadioButton value={'anonym'}>Анонимно</RadioButton>
                    </>
                }
            </RadioStyle>
        </FlexRow>
    )
}

import React from "react";
import {Radio as RadioButton, RadioChangeEvent} from 'antd'
import styled from "styled-components";
import RadioGroupWrapper from "./ui/RadioGroupWrapper";
import { FlexRow } from "helpers/layoutStyle";

type RadioGroupProps = { onChange(e: RadioChangeEvent): void, value: string, isModerator: boolean }

const RadioGroupStyle = styled(RadioGroupWrapper)`
  .ant-radio-wrapper {
    margin: 0 0 0 24px;
  }
`

const RadioGroup:React.FC<RadioGroupProps> = ({onChange, value, isModerator}) => {
    return (
        <FlexRow>
            <RadioGroupStyle onChange={onChange} value={value}>
                {isModerator ?
                    <RadioButton value={'moderator'}>Модератор</RadioButton>
                    :
                    <>
                        <RadioButton value={'person'}>Пользователь</RadioButton>
                        <RadioButton value={'anonym'}>Анонимно</RadioButton>
                    </>
                }
            </RadioGroupStyle>
        </FlexRow>
    )
}

export default React.memo(RadioGroup)
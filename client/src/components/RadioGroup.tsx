import React from 'react'
import {FlexRow} from '../styled'
import Radio from './ui/Radio'
import {Radio as RadioButton} from 'antd'
import {RadioChangeEvent} from "antd";
import styled from "styled-components";

type RadioGroupProps = { onChange(e: RadioChangeEvent): void, value: string, isModerator: boolean }

const RadioStyle = styled(Radio)`
  .ant-radio-wrapper {
    margin: 0 0 0 24px;
  }
`

export const RadioGroup = ({onChange, value, isModerator}: RadioGroupProps) => {

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

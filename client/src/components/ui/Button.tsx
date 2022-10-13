import React from 'react'
import styled from 'styled-components'
import {Button as ButtonAntd, ButtonProps} from 'antd'

type ButtonType = {
	background?: string
}

type ButtonPropsType = React.PropsWithChildren<ButtonType> &
	ButtonProps

const ButtonStyle = styled(ButtonAntd)`
	border: none;
	background: #00a88e;
	border-radius: 8px;
	padding: 7px 13px;
	cursor: pointer;
	width: 100%;
	height: auto;
`

const Button: React.FC<ButtonPropsType> = ({ children, ...rest }) => {
	return <ButtonStyle {...rest}>{children}</ButtonStyle>
}

export default Button

import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

type ButtonType = {
	background?: string
}

type ButtonPropsType = React.PropsWithChildren<ButtonType> &
	ButtonHTMLAttributes<HTMLButtonElement>

const ButtonStyle = styled.button`
	border: none;
	background: #00a88e;
	border-radius: 8px;
	padding: 7px 13px;
	cursor: pointer;
`

const Button: React.FC<ButtonPropsType> = ({ children, ...rest }) => {
	return <ButtonStyle {...rest}>{children}</ButtonStyle>
}

export default Button

import React from 'react'
import { ButtonProps} from 'antd'
import {FlexRow, FlexColumn} from "../../../styled";
import {Style} from './style'
import styled from "styled-components";

type ButtonType = {
	background?: string
}

type ButtonPropsType = React.PropsWithChildren<ButtonType> &
	ButtonProps

const Button: React.FC<ButtonPropsType> = ({ children, background, ...rest }) => {
	return <Style background={background} {...rest}>
		<FlexRow align={'middle'} justify={'center'}>
			<FlexColumn flex={1}>
				{children}
			</FlexColumn>
		</FlexRow>
	</Style>
}


const RemoveButton = styled(Button)`
	background: #e52a2a;
	
	&:hover {
		background: #e52a2a
	}
`

const SendButton = styled(Button)`
  width: 48px;
  height: 48px;
`

export {Button, RemoveButton, SendButton}
import React from 'react'
import styled from 'styled-components'
import { Radio as RadioAntd } from 'antd'
import type {RadioGroupProps} from "antd";

const RadioStyle = styled(RadioAntd.Group)``

const RadioGroupWrapper: React.FC<RadioGroupProps> = ({children, ...props}) => {
	return <RadioStyle {...props}>
			{children}
	</RadioStyle>
}

export default RadioGroupWrapper

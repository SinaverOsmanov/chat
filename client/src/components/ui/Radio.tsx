import React, { InputHTMLAttributes } from 'react'
import styled from 'styled-components'

type RadioType = {
	background?: string
}

type RadioPropsType = React.PropsWithChildren<RadioType> &
	InputHTMLAttributes<HTMLInputElement>

const RadioStyle = styled.input``

const Radio: React.FC<RadioPropsType> = props => {
	return <RadioStyle type="radio" {...props} />
}

export default Radio

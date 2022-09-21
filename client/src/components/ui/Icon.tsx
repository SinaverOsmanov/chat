import React from 'react'
import styled from 'styled-components'

type IconType = {
	icon: React.ReactNode | JSX.Element
}

type IconPropsType = React.PropsWithChildren<IconType>

const IconStyle = styled.i`
	color: black;
	cursor: pointer;
`

const Icon: React.FC<IconPropsType> = ({ icon, ...rest }) => {
	return <IconStyle {...rest}>{icon}</IconStyle>
}

export default Icon

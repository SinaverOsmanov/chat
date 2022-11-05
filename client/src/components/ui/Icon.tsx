import React from 'react'
import styled from 'styled-components'

type IconType = {
	icon: React.ReactNode | JSX.Element,
	color?: string
}

type IconPropsType = React.PropsWithChildren<IconType>

const IconStyle = styled.i<{color?: string}>`
	color: black;
	
	&:hover {
		cursor: pointer;
	}
	
	path {
		fill: ${({color}) => color || 'gray' };
		stroke: ${({color}) => color || 'gray' };
		stroke-width: 0;
	}
`

const Icon: React.FC<IconPropsType> = ({ icon, ...rest }) => {
	return <IconStyle {...rest}>{icon}</IconStyle>
}

export default Icon

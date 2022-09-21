import styled from 'styled-components'
import React from 'react'

type ColSize = {
	span?: number
	offset?: number
}

type CSSFlexRule = Pick<
	React.CSSProperties,
	'alignItems' | 'justifyContent' | 'flex' /* add others */
>

export const FlexRow = styled.div<CSSFlexRule>`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;

	justify-content: ${({ justifyContent }) => justifyContent ?? 'flex-start'};
	align-items: ${({ alignItems }) => alignItems ?? 'stretch'};
`

type ColumnProps = CSSFlexRule & ColSize

export const FlexColumn = styled.div<ColumnProps>`
	display: flex;
	flex-direction: column;

	${props => `flex:${countFlex(props)};`}
	${({ offset }) => offset && `margin-left:${getWidthWithPercent(offset)};`}
`

function countFlex({ flex, span }: ColumnProps): string | number {
	if (span) {
		return '0 0 ' + getWidthWithPercent(span)
	}

	return flex ?? '0 1 auto'
}

function getWidthWithPercent(number: number) {
	if (number <= 0 || number > 24) return '100%'

	return (number / 24) * 100 + '%'
}

export const ChatStyle = styled(FlexColumn)`
	max-width: 650px;
	background: #fff;
	/* Grayscale/#FFFFFF */

	background: linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
	box-shadow: 0 4px 40px rgba(92, 133, 150, 0.2);
	border-radius: 16px;
	padding: 30px;
`

export const DialogWrapper = styled(FlexColumn)`
	height: 500px;
	background: #f8f8f8;
	overflow-y: auto;
	padding: 25px;
	margin-top: 30px;

	& {
		scrollbar-width: auto;
		scrollbar-color: #00a88e #cccccc;
	}

	/* Chrome, Edge, and Safari */

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: #cccccc;
	}

	&::-webkit-scrollbar-thumb {
		background-color: #00a88e;
		border-radius: 5px;
		border: 0 solid #ffffff;
	}
`

export const MessageWrapperStyle = styled(FlexRow)<{ status?: boolean }>`
	//border-left: ${status => (status ? '4px solid #ccc' : 'none')};
`

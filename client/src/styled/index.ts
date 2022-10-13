import styled from 'styled-components'
import React from 'react'
import {Col, Row} from "antd";

type ColSize = {
	span?: number
	offset?: number
}

type CSSFlexRule = Pick<
	React.CSSProperties,
	'alignItems' | 'justifyContent' | 'flex' /* add others */
>

export const FlexRow = styled(Row)`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow-wrap: anywhere;
`

type ColumnProps = CSSFlexRule & ColSize

export const FlexColumn = styled(Col)`
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
	padding-right: 25px;
	
	& {
		scrollbar-width: auto;
		scrollbar-color: #00a88e #cccccc;
	}

	/* Chrome, Edge, and Safari */

	&::-webkit-scrollbar {		
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: rgba(204,204,204,.4);
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

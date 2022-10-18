import styled from 'styled-components'
import {Col, Row} from "antd";

// type ColSize = {
// 	span?: number
// 	offset?: number
// }

// type CSSFlexRule = Pick<
// 	React.CSSProperties,
// 	'alignItems' | 'justifyContent' | 'flex' /* add others */
// >

export const FlexRow = styled(Row)`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow-wrap: anywhere;
`

// type ColumnProps = CSSFlexRule & ColSize

export const FlexColumn = styled(Col)`
`
//
// function countFlex({ flex, span }: ColumnProps): string | number {
// 	if (span) {
// 		return '0 0 ' + getWidthWithPercent(span)
// 	}
//
// 	return flex ?? '0 1 auto'
// }

// function getWidthWithPercent(number: number) {
//     if (number <= 0 || number > 24) return '100%'
//
//     return (number / 24) * 100 + '%'
// }
//


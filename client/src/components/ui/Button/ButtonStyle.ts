import styled from "styled-components";
import {Button as ButtonAntd} from "antd";

type ButtonAntdStyle = {background?: string}

const ButtonStyle = styled(ButtonAntd)<ButtonAntdStyle>`
	border: none;
	background: #00a88e;
	border-radius: 8px;
	cursor: pointer;
	width: 100%;
	line-height: 0;
	color: #fff;

	&:hover {
		background: #00a88e;
		color: #fff
	}
`
//
// const RemoveButton = styled(Button)`
// 	background: #e52a2a;
//
// 	&:hover {
// 		background: #e52a2a
// 	}
// `
//
// const SendButton = styled(Button)`
//   width: 48px;
//   height: 48px;
// `

export {ButtonStyle}
import styled from "styled-components";
import {FlexColumn, FlexRow} from "../../helpers/layoutStyle";

export const Style = styled(FlexColumn)`
	max-width: 650px;
	background: #fff;
	/* Grayscale/#FFFFFF */

	background: linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
	box-shadow: 0 4px 40px rgba(92, 133, 150, 0.2);
	border-radius: 16px;
	padding: 30px;
`

export const DialogLayout = styled(FlexRow)`
	padding: 24px;
	background: #f8f8f8;
	margin: 30px 0 60px;
`

export const DialogWrapper = styled(FlexColumn)`
	height: 500px;
	background: #f8f8f8;
	overflow-y: auto;
	padding-right: 25px;
  
    &.scroll {
      
    }
  
  
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
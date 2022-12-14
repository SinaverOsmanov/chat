import styled from "styled-components";
import {FlexColumn, FlexRow} from "../../helpers/layoutStyle";


export const MessageWrapperStyle = styled(FlexRow)<{ status?: boolean }>`
	//border-left: ${status => (status ? '4px solid #ccc' : 'none')};
  margin-bottom: 40px;
`

export const DateMessageStyle = styled(FlexColumn)`
  div div {
    color: #AEAEAE;
    margin-left: 15px;
  }
`

export const SenderMessageStyle = styled(FlexColumn)`
  color: #666
`

export const TextMessageStyle = styled(FlexRow)`
  color: #1D1D1B;
  margin: 15px 0;
  font-weight: 500
`

export const ModeratorAnswerStyle = styled(FlexRow)`
  margin-top: 20px; 
  border-left: 4px solid #ccc;
  
  & > div {
    padding-left: 10px;
  }
`


import { WsMessage } from '../../../common/dto/dto'

export function parseMessage(data: string): WsMessage {
	const r: WsMessage = JSON.parse(data)
	if (typeof r.type !== 'string') {
		throw new Error()
	}

	return r
}

//
// function messageDatesDto(message: any): MessageType {
// 	return {
//
// 	}
// }

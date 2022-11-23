import { WsClientMessage } from '../common/dto/dto'

export function parseMessage(data: string): WsClientMessage {
    const r: WsClientMessage = JSON.parse(data)
    if (typeof r.type !== 'string') {
        throw new Error()
    }

    return r
}

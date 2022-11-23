import {
    MessageType,
    MessageTypeLikedByMe,
    ModeratorMessageType,
    TypeWSMessage,
} from './types'

export type ConfirmedMessage = { messageId: string }
export type RemoveMessage = { messageId: string }
export type ReplyToMessage = { messageId: string; reply: string }
export type GetMessages = { filter: string }
export type LoadMoreMessages = {
    firstMessage: string
    lengthMessages: number
} & GetMessages
export type ClientMessage = { sender: string; text: string }

// Client -> Server
export type WsServerMessage =
    | {
          type: TypeWSMessage.CONNECT
          data: MessageType[]
      }
    | {
          type: TypeWSMessage.MESSAGE
          data: ClientMessage
      }
    | {
          type: TypeWSMessage.LIKES
          data: { messageId: string }
      }
    | {
          type: TypeWSMessage.CONFIRMED_MESSAGE
          data: ConfirmedMessage
      }
    | {
          type: TypeWSMessage.REPLY_TO_MESSAGE
          data: ReplyToMessage
      }
    | {
          type: TypeWSMessage.REMOVE_MESSAGE
          data: RemoveMessage
      }
    | {
          type: TypeWSMessage.GET_MESSAGES
          data: GetMessages
      }
    | {
          type: TypeWSMessage.LOAD_MORE
          data: LoadMoreMessages
      }

export type LikeMessage = { count: number; messageId: string }

// Server -> Client
export type WsClientMessage =
    | {
          type: TypeWSMessage.CONNECT
          data: { messages: MessageTypeLikedByMe[]; isHaveMessages: boolean }
      }
    | {
          type: TypeWSMessage.MESSAGE
          data: MessageTypeLikedByMe
      }
    | {
          type: TypeWSMessage.LIKES
          data: LikeMessage
      }
    | {
          type: TypeWSMessage.CONFIRMED_MESSAGE
          data: MessageTypeLikedByMe
      }
    | {
          type: TypeWSMessage.REPLY_TO_MESSAGE
          data: ModeratorMessageType
      }
    | {
          type: TypeWSMessage.REMOVE_MESSAGE
          data: RemoveMessage
      }
    | {
          type: TypeWSMessage.GET_MESSAGES
          data: { messages: MessageTypeLikedByMe[]; isHaveMessages: boolean }
      }
    | {
          type: TypeWSMessage.LOAD_MORE
          data: { messages: MessageTypeLikedByMe[]; isHaveMessages: boolean }
      }

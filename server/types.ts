import { ObjectId } from "mongodb";
import {WebSocket} from "uWebSockets.js";
import {WsMessage} from "../common/dto/dto";
import {UserSessionProcessor} from "./ws/userSession";


export type ConnectionEntry = { ws: WebSocket; session: UserSessionProcessor };

export type SendMessage = (message: WsMessage) => Promise<void>;

export type TokenDataType = {
  role: string;
  userName: string;
  userId: string;
  email: string;
  iat: number;
};

export type ModeratorMessageRecord = {
  _id: ObjectId;
  text: string;
  sender: string;
  moderatorId: ObjectId;
  created: Date;
  messageId: ObjectId
};

export type MessageRecord = {
  _id: ObjectId;
  text: string;
  senderId: ObjectId;
  sender: string;
  likes: ObjectId[];
  dateConfirmed: Date | null;
  created: Date;
  isConfirmed: boolean;
  answer: ModeratorMessageRecord | null;
  eventId: string;
};

export type LikeRecord = {
  _id: ObjectId;
  userId: ObjectId;
  messageId: ObjectId;
};

export type ModeratorRecord = {
  _id: ObjectId;
  moderatorId: ObjectId;
};

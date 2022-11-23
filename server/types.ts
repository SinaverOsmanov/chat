import { ObjectId } from "mongodb";
import { WebSocket } from "uWebSockets.js";
import { UserSessionProcessor } from "./ws/userSession";
import { WsClientMessage, WsServerMessage } from "../client/src/common/dto/dto";

export type ConnectionEntry = { ws: WebSocket; session: UserSessionProcessor };

export type SendMessage = (message: WsClientMessage) => Promise<void>;

export type TokenDataType = {
  role: string;
  userName: string;
  userId: string;
  email: string;
  iat: number;
  isModerator: boolean;
};

export type ModeratorMessageRecord = {
  _id: ObjectId;
  text: string;
  sender: string;
  moderatorId: ObjectId;
  created: Date;
  messageId: ObjectId;
};

export type MessageRecord = {
  _id: ObjectId;
  text: string;
  senderId: string;
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
  moderatorId: string;
};

export type ModeratorMessageType = {
  _id: string;
  text: string;
  sender: string;
  created: Date;
};

export type MessageType = {
  _id: string;
  sender: string;
  text: string;
  likes: number;
  dateConfirmed: Date | null;
  created: Date;
  isConfirmed: boolean;
  answer: ModeratorMessageType | null;
  eventId: string;
};

export type WsMessage =
  | {
      type: "connect";
      data: MessageType[];
    }
  | {
      type: "message";
      data: MessageType;
    }
  | {
      type: "likes";
      data: { count: number; messageId: string };
    };

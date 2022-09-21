import { ObjectId } from "mongodb";

// export type DbWrapper = {
//   getCollection: (name: string) => Promise<Collection>;
// };

export type ModeratorMessageRecord = {
  _id: ObjectId;
  text: string;
  sender: string;
  created: Date;
};

export type MessageRecord = {
  _id: ObjectId;
  text: string;
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

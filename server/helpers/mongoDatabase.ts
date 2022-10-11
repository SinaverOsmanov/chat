import { Collection, Db } from "mongodb";
import { LikeRecord, MessageRecord, ModeratorRecord } from "../types";

export type ApplicationDb = {
  mongoDb: Db;
  messages: Collection<MessageRecord>;
  moderators: Collection<ModeratorRecord>;
  likes: Collection<LikeRecord>;
};

export async function ensureTypeDatabase(db: Db): Promise<ApplicationDb> {
  if (!db) {
    throw new Error();
  }

  return {
    mongoDb: db,
    messages: db.collection("messages"),
    moderators: db.collection("moderators"),
    likes: db.collection("likes"),
  };
}


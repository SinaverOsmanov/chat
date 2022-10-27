import { Db, ObjectId } from "mongodb";
import { ensureTypeDatabase } from "./mongoDatabase";

export async function isModerator(db: Db, clientId: string): Promise<boolean> {
  const { moderators } = await ensureTypeDatabase(db);

  const result = await moderators.findOne({
    moderatorId: clientId,
  });

  return !!result;
}

import {Db, ObjectId} from "mongodb";
import {ensureTypeDatabase} from "./mongoDatabase";

export async function isModerator(db: Db, clientId: string): Promise<boolean> {

    const {moderators} = await ensureTypeDatabase(db);

    if (!(await moderators.indexExists("moderatorId"))) {
        await moderators.createIndex({moderatorId: -1});
    }

    const result = await moderators.findOne({
        moderatorId: new ObjectId(clientId),
    });

    return !!result
}
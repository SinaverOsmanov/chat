import {ObjectId} from "mongodb";

export function isLikedMessage(likes: ObjectId[], clientId: string | undefined ) {

    if(clientId === undefined) return false

    const foundResult = likes.find(
        (like) => like.toHexString() === clientId
    );

    return !!foundResult

}
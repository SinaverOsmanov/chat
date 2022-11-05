import {ObjectId} from "mongodb";

export function isLikedMessage(likes: ObjectId[], clientId: string ) {

    const foundResult = likes.find(
        (like) => like.toHexString() === clientId
    );

    return !!foundResult

}
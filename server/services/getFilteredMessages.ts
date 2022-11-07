import {Collection} from "mongodb";
import {MessageRecord} from "../types";

export async function getFilteredMessages(messages: Collection<MessageRecord>, isModerator: boolean, filter: string, clientId: string, eventId: string): Promise<MessageRecord[]> {
    if (filter === "my") {
        if (isModerator) {
            return await messages
                .find(
                    {
                        eventId: eventId,
                        $or: [
                            { "answer.moderatorId": clientId },
                            { senderId: clientId },
                        ],
                    },
                    { sort: {_id: "desc"}}
                )
                .toArray();
        } else {
            return await messages
                .find(
                    {
                        eventId: eventId,
                        senderId: clientId,
                    },
                    { sort: {_id: "desc"}, limit: 30}
                )
                .toArray();
        }
    } else if (filter === 'unconfirmed') {
        return await messages.find({ eventId: eventId, isConfirmed: false }).toArray();
    } else {
        if (isModerator) {
            return await messages.find({ eventId: eventId }).toArray();
        } else {
            return await messages
                .find(
                    {
                        eventId: eventId,
                        $or: [{ isConfirmed: true }, { senderId: clientId }],
                    },

                    { sort: {_id: "desc"}, limit: 30}
                )
                .toArray();
        }
    }

}
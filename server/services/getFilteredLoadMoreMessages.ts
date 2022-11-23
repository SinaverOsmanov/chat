import { Collection } from "mongodb";
import { MessageRecord } from "../types";

export async function getFilteredLoadMoreMessages(
  messages: Collection<MessageRecord>,
  skipLengthMessages: number,
  filter: string,
  clientId: string,
  eventId: string
) {
  if (filter === "my") {
    return await messages
      .find(
        {
          eventId: eventId,
          senderId: clientId,
        },
        { sort: { _id: "desc" }, limit: 30, skip: skipLengthMessages }
      )
      .toArray();
  } else {
    return await messages
      .find(
        {
          eventId: eventId,
        },
        { sort: { _id: "desc" }, limit: 30, skip: skipLengthMessages }
      )
      .toArray();
  }
}

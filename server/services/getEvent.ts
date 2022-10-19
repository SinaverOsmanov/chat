import {ConnectionEntry} from "../types";

export const clients = new Map<string /* event id */,
    Map<string /* socket/client/connection id */, ConnectionEntry>>();


export function getEvent(eventId: string) {
    let eventClients = clients.get(eventId);
    if (!eventClients) {
        console.error("must never happen");
        throw new Error(); // return and check later
    }
    return eventClients;
}

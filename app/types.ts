import { Loggings } from "loggings";

export type AnyReturn = unknown | Promise<unknown>;
declare global {
    interface globalThis {
        loggings:Loggings
    }
}

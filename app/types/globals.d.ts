import { Lang } from "@/controllers/langs";

declare global {
    var Language:typeof Lang;
    interface globalThis {
        Language:typeof Lang;
    }
}

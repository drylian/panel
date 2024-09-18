import { FastifyJsonResponse, FastifyMetadataJson } from "@/types/fastify";
import Plugin from "fastify-plugin";

/**
 * Plugin for standardizing JSON response
 */
export const JsonPlugin = Plugin(async function (fastify) {
    fastify.decorateReply("json", function (_opts: FastifyJsonResponse | FastifyMetadataJson) {
        const opts = _opts as (FastifyJsonResponse | FastifyMetadataJson) & { lang:object }
        if (!opts.timestamp) opts.timestamp = Date.now();
        if (!opts.status) opts.status = this.statusCode ?? 200;
        if(typeof opts.message === "object") {
            opts.lang = opts.message;
            opts.message =
        }
        this.status(opts.status)
            .header("Content-Type", "application/json")
            .header("X-Timestamp", opts.timestamp.toString())
            .send({
                status: opts.status,
                timestamp: opts.timestamp,
                ...opts
            });

        return this;
    });
});
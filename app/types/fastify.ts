export interface FastifyJsonResponse {
    status?: number;
    code: string;
    timestamp?:number;
    message: string | object;
    data?:object;
}

export interface FastifyMetadataJson extends FastifyJsonResponse {
    meta: {
        total: number;
        count: number;
        per_page: number;
        current_page: number;
        total_pages: number;
    };
}

declare module "fastify" {
    interface FastifyReply {
        /**
         * Sends a JSON response with the specified options.
         * @param {FastifyJsonResponse} options - The options for the JSON response.
         */
        json(options: FastifyJsonResponse | FastifyMetadataJson): FastifyReply;
    }
}

export {};

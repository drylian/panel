import { Loggings } from '@loggings/beta';
import { Logger, QueryRunner } from 'typeorm';

/**
 * Custom implements loggings in Typeorm
 */
class LoggingsTypeORM implements Logger {
    private core: InstanceType<typeof Loggings> = new Loggings("SQL", "magenta", {
        format:"[{status}] [{hours}:{minutes}:{seconds}].gray {title}::{message}",
    })
    /**
     * Method to log debug messages.
     * @param query The executed SQL query.
     * @param parameters The query parameters (optional).
     * @param queryRunner The associated query runner (optional).
     */
    public logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.core.debug(`[Query].blue-b: [${query}].pink-b`);
        if (parameters) {
            this.core.debug('[Params].blue-b:', parameters);
        }
    }

    /**
     * Method to log error messages.
     * @param error The error message.
     * @param query The SQL query that caused the error.
     * @param parameters The query parameters (optional).
     * @param queryRunner The associated query runner (optional).
     */
    public logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.core.warn(`Sql Error`);
        this.core.warn(`[Query].blue-b: [${query}].pink-b`);
        if (parameters) {
            this.core.warn('[Params].blue-b:', parameters);
        }
        this.core.error(`[Message].red-b: [${error}].yellow-b`);
    }

    /**
     * Method to log successful execution messages.
     * @param time The query execution time.
     * @param query The executed SQL query.
     * @param parameters The query parameters (optional).
     * @param queryRunner The associated query runner (optional).
     */
    public logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.core.warn(`Slow Query Alert!`);
        this.core.warn(`[Query].blue-b: [${query}].pink-b`);
        this.core.warn(`[Time].blue-b: [${time}].yellow-b`);
        if (parameters) {
            this.core.warn('[Params].blue-b:', parameters);
        }
    }

    /**
     * Method to log schema build messages.
     * @param message The schema build message.
     * @param queryRunner The associated query runner (optional).
     */
    public logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        this.core.log(`[Schema].lime-b :${message}`);
    }

    /**
     * Method to log migration messages.
     * @param message The migration message.
     * @param queryRunner The associated query runner (optional).
     */
    public logMigration(message: string, queryRunner?: QueryRunner) {
        this.core.log(`[Migration].lime-b :${message}`);
    }

    /**
     * Method to log SQL command execution messages.
     * @param level The log level (log, info, warn).
     * @param message The log message.
     * @param queryRunner The associated query runner (optional).
     */
    public log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
        this.core[level](message);
    }
}

export default LoggingsTypeORM;

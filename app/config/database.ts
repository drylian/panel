import { EnvConfiguration } from "@/controllers/configs/EnvConfiguration";
import { DBDialect } from "@/types/types";

const Config = EnvConfiguration.type;

/**
 * Database Configuration
 *
 * This configuration object holds all necessary settings for connecting to the database.
 */
export const DatabaseConf = {
    /**
     * The database dialect (sqlite | mysql).
     *
     * @type {Configuration}
     */
    db_dialect: new EnvConfiguration<DBDialect>({
        env: "DB_DIALECT",
        def: "sqlite",
        chk(value, def) {
            if (["sqlite", "mysql", "postgres", "mongodb"].includes(value)) {
                return value as DBDialect;
            } else return def;
        },
        type: Config.String,
    }),

    /**
     * The username used for database authentication.
     *
     * @type {Configuration}
     */
    db_username: new EnvConfiguration({
        env: "DB_USERNAME",
        def: "root",
        type: Config.String,
    }),

    /**
     * The password used for database authentication.
     *
     * @type {Configuration}
     */
    db_password: new EnvConfiguration({
        env: "DB_PASSWORD",
        def: "password",
        type: Config.String,
    }),

    /**
     * The name of the database to connect to.
     *
     * @type {Configuration}
     */
    db_database: new EnvConfiguration({
        env: "DB_DATABASE",
        def: "my_database",
        type: Config.String,
    }),

    /**
     * The host address of the database server.
     *
     * @type {Configuration}
     */
    db_hostname: new EnvConfiguration({
        env: "DB_HOST",
        def: "localhost",
        type: Config.String,
    }),
};

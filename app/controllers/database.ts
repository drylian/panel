import { Global } from "@/config/index.ts";
import {
    Model,
    Database as DB,
    MongoDBConnector,
    MySQLConnector,
    PostgresConnector,
    SQLite3Connector,
} from "denodb";

export type DBConnection =
    | MongoDBConnector
    | MySQLConnector
    | PostgresConnector
    | SQLite3Connector;

export type DBDialect = "sqlite3" | "mysql" | "postgres" | "mongo";

/**
 * Controller do banco de dados
 */
export class Database {
    public inited: boolean;
    static connection: DBConnection | null = null;
    static database: DB | null = null;

    static readonly schemas: typeof Model[] = [];
    
    constructor() {
        this.inited = false;
    }

    /**
     * Configura a conexão com o banco de dados baseada no dialeto especificado.
     */
    static preset() {
        switch (Global.db_dialect.get as DBDialect) {
            case "sqlite3":
                Database.connection = new SQLite3Connector({
                    filepath: Global.db_database.get || ":memory:",
                });
                break;

            case "mysql":
                Database.connection = new MySQLConnector({
                    database: Global.db_database.get,
                    host: Global.db_hostname.get,
                    username: Global.db_username.get,
                    password: Global.db_password.get,
                    port: Global.port.get,
                });
                break;

            case "postgres":
                Database.connection = new PostgresConnector({
                    database: Global.db_database.get,
                    host: Global.db_hostname.get,
                    username: Global.db_username.get,
                    password: Global.db_password.get,
                    port: Global.port.get,
                });
                break;

            case "mongo":
                Database.connection = new MongoDBConnector({
                    uri: Global.db_hostname.get,
                    database: Global.db_database.get,
                });
                break;

            default:
                throw new Error(`Unsupported database dialect: ${Global.db_dialect.get}`);
        }

    }
    static async initialize() {
        if (Database.connection) {
            // Inicializar o Database com a conexão configurada
            this.database = new DB(Database.connection);
        }
        this.database!.link(this.schemas);
        await this.database!.sync();

    }
}

export const db = new Database();

import { DataSource, BaseEntity,  } from 'typeorm';
import LoggingsTypeORM from '@/controllers/database/logger';

export class DatabaseConnection {
    public inited: boolean;
    static connection: InstanceType<typeof DataSource> | null = null;
    static models: typeof BaseEntity[] = [];
    constructor() {
        this.inited = false;
    }
    public static preset() {
        DatabaseConnection.connection = new DataSource({
            type: Config.get("db_dialect"),
            database: Config.get("db_database") ?? ':memory:',
            synchronize: true,
            logger: new LoggingsTypeORM(),
            entities: DatabaseConnection.models
        })
    }
}

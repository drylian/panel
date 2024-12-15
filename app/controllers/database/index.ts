import { DataSource, BaseEntity,  } from 'typeorm';
import LoggingsTypeORM from '@/controllers/database/logger';
import { DBDialect } from '@/types/types';

export class DatabaseConnection {
    public inited: boolean;
    static connection: InstanceType<typeof DataSource> | null = null;
    static models: typeof BaseEntity[] = [];
    constructor() {
        this.inited = false;
    }
    public static preset() {
        DatabaseConnection.connection = new DataSource({
            type: Env.get("db.dialect") as DBDialect,
            database: Env.get("db.database") ?? ':memory:',
            synchronize: true,
            logger: new LoggingsTypeORM(),
            entities: DatabaseConnection.models
        })
    }
}

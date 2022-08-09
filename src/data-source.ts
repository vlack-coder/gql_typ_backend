import "reflect-metadata"
import { DataSource } from "typeorm"
import { Access } from "./entity/Access"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    // port: 5432,
    username: "postgres",
    password: "ROOT",
    database: "userLog",
    synchronize: true,
    logging: true, 
    entities: [User, Access],
    // migrations: [],
    // migrations: [/*...*/],
    migrations: ["src/migration/**/*.ts"],
    // migrationsTableName: "custom_migration_table",
    // subscribers: ["src/migration/**/*.ts"],
    // subscribers: [],
})

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export type Database = NodePgDatabase;

export type DatabaseConnection = {
  database: Database;
  close: () => Promise<void>;
};

export function createDatabaseConnection(
  connectionString: string
): DatabaseConnection {
  const pool = new Pool({ connectionString });

  return {
    database: drizzle(pool),
    close: () => pool.end(),
  };
}

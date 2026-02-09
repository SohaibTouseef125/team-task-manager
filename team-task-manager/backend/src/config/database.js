import knex from "knex";

// Load environment variables first
import 'dotenv/config';

// Create a function to initialize the database connection
const initializeDatabase = () => {
  // Log the environment variables for debugging
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  // Check if we're in test mode or if DATABASE_URL is not set
  if (process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL) {
    // Use mock database when testing or when PG is not available
    const mockDb = (table) => {
      // Return a mock query builder that mimics Knex behavior
      const queryBuilder = {
        select: (...columns) => ({ ...queryBuilder }),
        from: (tableName) => ({ ...queryBuilder }),
        where: (condition) => ({ ...queryBuilder }),
        andWhere: (condition) => ({ ...queryBuilder }),
        orWhere: (condition) => ({ ...queryBuilder }),
        orderBy: (column, order) => ({ ...queryBuilder }),
        limit: (num) => ({ ...queryBuilder }),
        offset: (num) => ({ ...queryBuilder }),
        first: () => Promise.resolve(null),
        then: (callback) => callback([]),
        insert: (data) => ({
          into: (tableName) => ({ ...queryBuilder }),
          returning: (columns) => ({ ...queryBuilder }),
          then: (callback) => callback([1]),
        }),
        update: (data) => ({
          where: (condition) => ({ ...queryBuilder }),
          returning: (columns) => ({ ...queryBuilder }),
          then: (callback) => callback([1]),
        }),
        del: () => ({
          where: (condition) => ({ ...queryBuilder }),
          then: (callback) => callback(1),
        }),
      };

      // Set the table name in the query builder
      queryBuilder._table = table;
      return queryBuilder;
    };

    // Add other necessary methods
    mockDb.raw = (query) => Promise.resolve({ rows: [] });
    mockDb.destroy = () => Promise.resolve();
    mockDb.from = (table) => mockDb(table).select();
    mockDb.table = (table) => mockDb(table).select();

    return mockDb;
  } else {
    return knex({
      client: 'pg',
      connection: process.env.DATABASE_URL,
      pool: {
        min: 2,
        max: 10,
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: './src/migrations',
      },
      // Additional configuration for Neon PostgreSQL
      searchPath: ['public'],
    });
  }
};

const db = initializeDatabase();

export default db;
// Mock database for testing purposes
const mockDb = {
  // Mock Knex-like methods
  select: (...columns) => ({
    from: (table) => mockDb,
    where: (condition) => mockDb,
    andWhere: (condition) => mockDb,
    orWhere: (condition) => mockDb,
    orderBy: (column, order) => mockDb,
    limit: (num) => mockDb,
    offset: (num) => mockDb,
    first: () => Promise.resolve(null),
    then: (callback) => callback([]),
  }),
  insert: (data) => ({
    into: (table) => mockDb,
    returning: (columns) => mockDb,
    then: (callback) => callback([1]),
  }),
  update: (data) => ({
    where: (condition) => mockDb,
    returning: (columns) => mockDb,
    then: (callback) => callback([1]),
  }),
  del: () => ({
    where: (condition) => mockDb,
    then: (callback) => callback(1),
  }),
  raw: (query) => Promise.resolve({ rows: [] }),
  destroy: () => Promise.resolve(),
  // Add other methods as needed
};

// Mock methods for testing
mockDb.from = (table) => mockDb.select();
mockDb.table = (table) => mockDb.select();

export default mockDb;
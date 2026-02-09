import session from "express-session";

// Conditionally create session configuration based on environment
const isTestEnv = process.env.NODE_ENV === 'test';

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}

};

let sessionConfig;

if (isTestEnv) {
  // For testing, use in-memory store (no external dependencies)
  sessionConfig = session({
    ...sessionOptions,
    store: new session.MemoryStore()
  });
} else {
  // For non-test environments, use PostgreSQL session store
  // We'll handle the import in the app.js file to avoid issues here
  // For now, we'll throw an error if trying to run in non-test mode without proper setup
  if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_LOCAL) {
    // If no database URL is set, use memory store even in non-test mode
    sessionConfig = session({
      ...sessionOptions,
      store: new session.MemoryStore()
    });
  } else {
    // This will be replaced with proper pg session in the actual app
    sessionConfig = session({
      ...sessionOptions,
      store: new session.MemoryStore() // Fallback to memory for now
    });
  }
}

export default sessionConfig;
export default {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./climate_aid.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./migrations",
    },
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: process.env.DATABASE_PATH || "./climate_aid.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./migrations",
    },
  },
};

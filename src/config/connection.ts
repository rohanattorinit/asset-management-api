import { knex } from "knex";
const dbPort = process.env.DB_PORT;

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(dbPort as string, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    timezone: 'UTC',
    dateStrings: true
  },
});

export default db;

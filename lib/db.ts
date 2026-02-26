import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type SqlClient = NeonQueryFunction<false, false>;

let client: SqlClient | null = null;

function getClient(): SqlClient {
  if (client) {
    return client;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  }

  client = neon(databaseUrl);
  return client;
}

const sqlClient = ((strings: TemplateStringsArray, ...params: any[]) =>
  getClient()(strings, ...params)) as SqlClient;

sqlClient.query = (...args) => getClient().query(...args);
sqlClient.unsafe = (rawSQL) => getClient().unsafe(rawSQL);
sqlClient.transaction = ((queriesOrFn, opts) => getClient().transaction(queriesOrFn, opts)) as SqlClient["transaction"];

export const sql = sqlClient;

import { pool } from "./db";

export async function createSchema() {
  
  await pool.query(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

  await pool.query(`DROP TABLE IF EXISTS trades CASCADE;`);


 await pool.query(`
    CREATE TABLE trades (
      time        TIMESTAMPTZ       NOT NULL,
    symbol      TEXT              NOT NULL,
    bid_price   DOUBLE PRECISION  NOT NULL,
    ask_price   DOUBLE PRECISION  NOT NULL
    );
`);

await pool.query(`
  SELECT create_hypertable(
    'trades',
      'time',
    if_not_exists => TRUE,
    chunk_time_interval => INTERVAL '1 hour'
  );
`);

}

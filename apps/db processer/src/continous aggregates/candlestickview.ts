import { pool } from "../db/db";

export async function createContinuousAggregates() {
  // Ensure TimescaleDB extension is enabled
  await pool.query(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

  // Ensure hypertable exists
  await pool.query(`
    SELECT create_hypertable(
      'trades',
      'trade_time',
      if_not_exists => TRUE,
      chunk_time_interval => INTERVAL '1 hour'
    );
  `);

  // Create 1-minute candlestick continuous aggregate
  await pool.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_1m
    WITH (timescaledb.continuous) AS
    SELECT
      time_bucket('1 minute', time) AS bucket,
      symbol,
      FIRST(ask_price, time) AS open,
      MAX(ask_price) AS high,
      MIN(bid_price) AS low,
      LAST(bid_price, time) AS close
    FROM trades
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  // Add 1-minute refresh policy only if it doesn't exist
  const policy1m = await pool.query(`
    SELECT 1 FROM timescaledb_information.jobs
    WHERE proc_name = 'policy_refresh_continuous_aggregate'
    AND hypertable_name = 'candlestick_1m';
  `);

  if (policy1m.rowCount === 0) {
    await pool.query(`
        SELECT add_continuous_aggregate_policy(
        'candlestick_1m',
        start_offset => INTERVAL '1 hour',
        end_offset => INTERVAL '1 minute',
        schedule_interval => INTERVAL '1 minute'
      );
    `);
  }

  // Create 5-minute candlestick continuous aggregate
  await pool.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_5m
    WITH (timescaledb.continuous) AS
    SELECT
      time_bucket('5 minutes', time) AS bucket,
      symbol,
      FIRST(ask_price, time) AS open,
      MAX(ask_price) AS high,
      MIN(bid_price) AS low,
      LAST(bid_price, time) AS close
    FROM trades
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  // Add 5-minute refresh policy only if it doesn't exist
  const policy5m = await pool.query(`
    SELECT 1 FROM timescaledb_information.jobs
    WHERE proc_name = 'policy_refresh_continuous_aggregate'
      AND hypertable_name = 'candlestick_5m';
  `);

  if (policy5m.rowCount === 0) {
    await pool.query(`
      SELECT add_continuous_aggregate_policy(
        'candlestick_5m',
        start_offset => INTERVAL '2 hours',
        end_offset => INTERVAL '5 minutes',
        schedule_interval => INTERVAL '5 minutes'
      );
    `);
  }


  // Create 15-minute candlestick continuous aggregate
  await pool.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_15m
    WITH (timescaledb.continuous) AS
    SELECT
      time_bucket('15 minutes', time) AS bucket,
      symbol,
      FIRST(ask_price, time) AS open,
      MAX(ask_price) AS high,
      MIN(bid_price) AS low,
      LAST(bid_price, time) AS close
    FROM trades
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  // Add 15-minute refresh policy only if it doesn't exist
    const policy15m = await pool.query(`
      SELECT 1 FROM timescaledb_information.jobs
      WHERE proc_name = 'policy_refresh_continuous_aggregate'
        AND hypertable_name = 'candlestick_15m';
    `);

    if (policy15m.rowCount === 0) {
      await pool.query(`
        SELECT add_continuous_aggregate_policy(
          'candlestick_15m',
          start_offset => INTERVAL '6 hours',
          end_offset => INTERVAL '15 minutes',
          schedule_interval => INTERVAL '15 minutes'
        );
      `);
    }
    // Create 30-minute candlestick continuous aggregate
    await pool.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_30m
      WITH (timescaledb.continuous) AS
      SELECT
        time_bucket('30 minutes', time) AS bucket,
        symbol,
        FIRST(ask_price, time) AS open,
        MAX(ask_price) AS high,
        MIN(bid_price) AS low,
        LAST(bid_price, time) AS close
      FROM trades
      GROUP BY bucket, symbol
      WITH NO DATA;
    `);

    // Add 30-minute refresh policy only if it doesn't exist
    const policy30m = await pool.query(`
      SELECT 1 FROM timescaledb_information.jobs
      WHERE proc_name = 'policy_refresh_continuous_aggregate'
        AND hypertable_name = 'candlestick_30m';
    `);

    if (policy30m.rowCount === 0) {
      await pool.query(`
        SELECT add_continuous_aggregate_policy(
          'candlestick_30m',
          start_offset => INTERVAL '12 hours',
          end_offset => INTERVAL '30 minutes',
          schedule_interval => INTERVAL '30 minutes'
        );
      `);
    }
}

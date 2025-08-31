import { pool } from "./db/db";
import { initializeDatabase } from "./db/schema"; 

import { connectredis } from "./db/connectToRedis";
import express, { Request, Response } from "express";
const app = express();
app.use(express.json());

app.get("/candles", async (req: Request, res: Response) => {
  try {
    const { symbol = "BTC", interval = "1m", limit = "10" } = req.query;

    const allowedIntervals = ["1m", "5m", "15m", "1h", "1d"];
    if (!allowedIntervals.includes(interval as string)) {
      res.status(400).json({ error: "Invalid interval" });
      return;
    }

    const tableName = `candlestick_${interval}`;
    const query = `
      SELECT bucket, symbol, open, high, low, close
      FROM ${tableName}
      WHERE symbol = $1
      ORDER BY bucket DESC
      LIMIT $2;
    `;

    const result = await pool.query(query, [symbol, Number(limit)]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching candles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


(async () => {
  await initializeDatabase();
  await connectredis();

  app.listen(3000, () => {
    console.log("✅ Server running on port 3000");
  });
})();
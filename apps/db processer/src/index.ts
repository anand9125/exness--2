import { createClient, type RedisClientType } from "redis"
import { pool } from "./db/db";
import { Data } from "./type";
import  {createSchema}  from "./db/schema";
import { createContinuousAggregates } from "./continous aggregates/candlestickview";


export const pub: RedisClientType = createClient({
  url: process.env.redis_Url || "redis://localhost:6379",
});

export async function connectredis(){
  await pub.connect()
  pub.pSubscribe("*",async(message:any)=>{
      console.log(message)
      if (!message ) return; 
      console.log("hii")
      
      const trade = JSON.parse(message); 
      await pool.query(
      `INSERT INTO trades (time, symbol, bid_price, ask_price)
        VALUES (NOW(), $1, $2, $3)`,
      [
        trade.symbol,
        trade.bidPrice,
        trade.askPrice,
      ]
    );
 })
}

(async () => {
  await createSchema(); 
  await connectredis(); 
  await createContinuousAggregates(); 
})();


import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { LoadBalancer } from "./LoadBalancer";
import { StrategyType } from "./strategy/StrategyTypes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const loadBalancer = new LoadBalancer(
  ["url1", "url2", "url3"],
  {},
  StrategyType.ROUND_ROBIN
);

app.post("/query", (req: Request, res: Response) => {
  const { sql, type } = req.body;
  loadBalancer.routeQuery({ sql, type });
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

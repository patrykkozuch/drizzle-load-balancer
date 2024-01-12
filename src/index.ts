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

app.post("/query", async (req: Request, res: Response) => {
  const { sql, type } = req.body;
  const response: any = await loadBalancer.routeQuery({ sql, type });
  res.send(response);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { LoadBalancer } from "./LoadBalancer";
import { StrategyType } from "./strategy/StrategyTypes";
import { Logger } from "./Logger";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const ports = [3301, 3302, 3303];
const urls = ports.map(
  (port) => `mysql://dp_user:dp_password@localhost:${port}/dp`
);

const allowedOperations = [
  "select",
  "insert",
  "update",
  "delete",
  "create",
  "drop",
  "use",
];

const loadBalancer = new LoadBalancer(urls, {}, StrategyType.RANDOM);

app.post("/query", async (req: Request, res: Response) => {
  const { sql } = req.body;
  const method = sql.split(" ")[0].toLowerCase();
  const type = method === "select" ? "read" : "write";
  if (!allowedOperations.includes(method)) {
    res.send({ status: 400, message: "Invalid operation" });
    Logger.error(`Invalid operation: ${method}`);
    return;
  }
  Logger.info(`Executing query: ${sql}`);
  const response: any = await loadBalancer.routeQuery({ sql, type });
  res.send(response);
});

app.listen(port, () => {
  Logger.log(`Server is running at http://localhost:${port}`);
  Logger.error(`This is an error message`);
  Logger.warn(`This is a warning message`);
  Logger.info(`This is an info message`);
});

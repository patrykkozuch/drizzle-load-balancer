import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { LoadBalancer } from "./LoadBalancer";
import { StrategyType } from "./strategy/StrategyTypes";
import { Logger } from "./Logger";
import cors from "cors";
import { BeginQuery, CommitQuery, RollbackQuery } from "./query/Query";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const ports = [3301, 3302, 3303];
const urls = ports.map(
  (port, index) => `mysql://dp_user:dp_password@db_${index + 1}:3306/dp`
);

const loadBalancer = new LoadBalancer(urls, {}, StrategyType.ROUND_ROBIN);

app.get("/health", async (req: Request, res: Response) => {
  res.send("OK");
});

app.post("/query", async (req: Request, res: Response) => {
  const { sql, params, method } = req.body;
  console.log("Req.body: ", req.body)
  console.log("sql: ", sql, " params: ", params, " method: ", method)
  // prevent multiple queries
  const sqlBody = sql.replace(/;/g, '');

  const statement = sqlBody.split(" ")[0].toLowerCase();
  const type = ["select", "show"].includes(statement) ? "read" : "write";

  Logger.info(`Executing query: ${sqlBody}`);

  const response: any = await loadBalancer.routeQuery({ sql: sqlBody, params, method, type });
  console.log("response: ", response)
  if (method === 'all') {
    res.send(response);
    return
  } else if (method === 'execute') {
    res.send(response);
    return
  }

  res.status(500).json({ error: 'Unknown method value' });
});

app.post('/migrate', async (req, res) => {
  console.log("Migration request received", req.body);
  const { queries } = req.body;

  await loadBalancer.routeQuery(BeginQuery)

  try {
    for (const query of queries) {
      await loadBalancer.routeQuery({ sql: query, params: [], method: 'execute', type: 'write' })
    }
    await loadBalancer.routeQuery(CommitQuery)
  } catch {
    await loadBalancer.routeQuery(RollbackQuery)
    res.send({ error: 'Error running migrations' })
  }

  res.send({});
});

app.listen(port, () => {
  Logger.log(`Server is running at http://localhost:${port}`);
  Logger.error(`This is an error message`);
  Logger.warn(`This is a warning message`);
  Logger.info(`This is an info message`);
});

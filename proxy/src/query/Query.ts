export type Query = {
  sql: string;
  params: string[];
  method: string;
  type: "read" | "write";
};

export const BeginQuery: Query = {
    sql: "BEGIN",
    params: [],
    method: "execute",
    type: "write",
}

export const CommitQuery: Query = {
    sql: "COMMIT",
    params: [],
    method: "execute",
    type: "write",
}

export const RollbackQuery: Query = {
    sql: "ROLLBACK",
    params: [],
    method: "execute",
    type: "write",
}

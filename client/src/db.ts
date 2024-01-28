import {drizzle} from "drizzle-orm/mysql-proxy";
import axios from "axios";

export const db = drizzle(async (sql, params, method): Promise<any> => {
    try {
        console.log("sql", sql);
        const rows = await axios.post("http://localhost:4000/query", {
            sql: sql,
            params: params,
            method: method,
        });

        if (rows.data == "No connection available") {
            alert(rows.data);
            return { rows: [] };
        }
        if (rows.data.message) {
            alert(rows.data.message);
            return { rows: [] };
        } else {
            alert(JSON.stringify(rows.data[0]));
        }
        return { rows: rows.data[0] };
    } catch (err) {
        return { rows: [] };
    }
});
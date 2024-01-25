import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import axios from "axios";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const db = drizzle(async (sql, params, method): Promise<any> => {
    try {
      console.log("sql", sql);
      const rows = await axios.post("http://localhost:4000/query", {
        sql: params[0],
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

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.center}></div>

        <div className={styles.grid}>
          <div
            className={styles.card}
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const result = await db.select().from("USE dp;" as any);
            }}
          >
            <h2>
              USE <span>-&gt;</span>
            </h2>
          </div>

          <div
            className={styles.card}
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const result = await db
                .select()
                .from(
                  "CREATE TABLE et ( id INT PRIMARY KEY NOT NULL AUTO_INCREMENT);" as any
                );
            }}
          >
            <h2>
              CREATE <span>-&gt;</span>
            </h2>
          </div>

          <div
            className={styles.card}
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const result = await db
                .select()
                .from("DROP TABLE IF EXISTS et;" as any);
            }}
          >
            <h2>
              DROP <span>-&gt;</span>
            </h2>
          </div>

          <div
            className={styles.card}
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const result = await db
                .select()
                .from("INSERT INTO et VALUES(NULL);" as any);
            }}
          >
            <h2>
              INSERT <span>-&gt;</span>
            </h2>
          </div>

          <div
            className={styles.card}
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const result = await db.select().from("SELECT * FROM et" as any);
            }}
          >
            <h2>
              SELECT <span>-&gt;</span>
            </h2>
          </div>
        </div>
      </main>
    </>
  );
}

import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { MySqlRawQueryResult } from "drizzle-orm/mysql-proxy";
import React from "react";
import { users } from "@/schema";
import { db } from "@/db";
import { _db } from "@/db";
import { eq } from "drizzle-orm";

const inter = Inter({ subsets: ["latin"] });


export type NewUser = typeof users.$inferInsert; // insert type


export default function Home() {
  async function insertUser(user: NewUser): Promise<MySqlRawQueryResult> {
    return db.insert(users).values(user);
  }

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
              const result = await insertUser({ fullName: 'John Doe' })
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
              const result = await db.select().from(users);
            }}
          >
            <h2>
              SELECT <span>-&gt;</span>
            </h2>
          </div>

          <div
            className={styles.card}
            style={{ cursor: "pointer" }}
            onClick={async () => {
              let userInput = window.prompt('Enter the id of the user to search');
              if (!userInput) {
                alert('Invalid input');
                return;
              }
              const selected_id = Number.parseInt(userInput);
              const newName = window.prompt('Enter the new name') || '';
              const result = await await db.update(users).set({ fullName: newName }).where(eq(users.id, selected_id));
            }}
          >
            <h2>
              UPDATE <span>-&gt;</span>
            </h2>
          </div>

          <div
            className={styles.card}
            style={{ cursor: "pointer" }}
            onClick={async () => {
              let userInput = window.prompt('Enter the id of the user to search');
              if (!userInput) {
                alert('Invalid input');
                return;
              }
              const selected_id = Number.parseInt(userInput);
              const result = await db.delete(users).where(eq(users.id, selected_id));
            }}
          >
            <h2>
              DELETE <span>-&gt;</span>
            </h2>
          </div>
        </div>
      </main>
    </>
  );
}

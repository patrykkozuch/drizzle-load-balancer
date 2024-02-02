import { migrate } from 'drizzle-orm/mysql-proxy/migrator';
import { db } from './db';
import axios from "axios";

// This will run migrations on the database, skipping the ones already applied
await migrate(db, async (queries) => {
    try {
        await axios.post(`http://proxy:4000/migrate`, { queries });
    } catch (e) {
        console.log(e);
        throw new Error('Proxy server cannot run migrations');
    }
}, { migrationsFolder: './drizzle' });
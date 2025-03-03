import { drizzle } from 'drizzle-orm/node-postgres';  
import pkg from 'pg'; 
import dotenv from 'dotenv';  
import * as schema from './schema';  

dotenv.config();


const pool = new pkg.Pool({
  connectionString: process.env.DATABASE_URL,  
});

const db = drizzle(pool, { schema }); 

export { db };  
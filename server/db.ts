import dotenv from "dotenv";
// Load environment variables
dotenv.config();

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use permanent DATABASE_URL directly for reliable connection
let databaseUrl = "postgresql://neondb_owner:npg_r9K3HpZxnMRO@ep-spring-bird-aftrflk6-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log("✓ Using permanent DATABASE_URL for Neon database connection");



export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
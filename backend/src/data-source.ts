import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: true, // в проде лучше false + миграции
  logging: true,

  entities: isProd ? ["dist/entities/**/*.js"] : ["src/entities/**/*.ts"],

  migrations: isProd ? ["dist/migrations/**/*.js"] : ["src/migrations/**/*.ts"],

  subscribers: [],
});

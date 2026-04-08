import { MongoClient } from 'mongodb';

// Using the full replica set connection string for Atlas
const uri = process.env.CONNECTION_STRING || "mongodb://localhost:27017";

// Remove directConnection: true to allow Atlas to find the primary node
const client = new MongoClient(uri, {
  tls: true,
  retryWrites: true,
  serverSelectionTimeoutMS: 10000,
});

export class Database {
  static #instance: Database | null = null;
  private client: MongoClient;

  private constructor() {
    this.client = client;
  }

  public static getInstance(): Database {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }
  
  public getClient() {
    return this.client;
  }
}

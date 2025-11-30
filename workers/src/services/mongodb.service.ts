import mongoose from 'mongoose';
import { join } from 'path';
const envPath = join(process.cwd(), ".env");
console.log("Loading env from:", envPath);  
require('dotenv').config({
  path: envPath
});
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/productify';

/**
 * MongoDB connection service
 */
class MongoDBService {
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await mongoose.connect(MONGODB_URI);
      this.connected = true;
      console.log('[MongoDB] Connected successfully');
      console.log('[MongoDB] URI (masked):', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
      console.log('[MongoDB] Connection host:', mongoose.connection.host);
      console.log('[MongoDB] Database:', mongoose.connection.db?.databaseName);
      console.log('[MongoDB] Collections:', await mongoose.connection.db?.listCollections().toArray());
    } catch (error) {
      console.error('[MongoDB] Connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.connected = false;
      console.log('[MongoDB] Disconnected successfully');
    } catch (error) {
      console.error('[MongoDB] Disconnect failed:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected && mongoose.connection.readyState === 1;
  }
}

export const mongoService = new MongoDBService();

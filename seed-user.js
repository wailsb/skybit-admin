import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
config({ path: '.env' });

const { MongoClient } = MongoClient;


// Fallback to local if env isn't loaded (though it should be)
const hosts = [
  "ac-hf6plth-shard-00-00.qayhyha.mongodb.net",
  "ac-hf6plth-shard-00-01.qayhyha.mongodb.net",
  "ac-hf6plth-shard-00-02.qayhyha.mongodb.net"
];

const email = "wail.saribey@gmail.com";
const plaintextPassword = "1234";

async function seedUser() {
  console.log("Hashing password...");
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(plaintextPassword, salt);

  for (const host of hosts) {
    const nodeUri = `mongodb://skybitagency_db_user:hOXeUduLufAlYaN7@${host}:27017/skybit?authSource=admin`;
    const client = new MongoClient(nodeUri, { tls: true, directConnection: true });
    
    try {
      console.log(`\nTrying host: ${host}...`);
      await client.connect();
      const db = client.db('skybit');
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        console.log(`User ${email} already exists! Updating password instead...`);
        await usersCollection.updateOne({ email }, { $set: { passwordHash, updatedAt: new Date() } });
      } else {
        console.log(`Creating new user...`);
        await usersCollection.insertOne({
          email,
          passwordHash,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      console.log("SUCCESS! Wrote to the primary node.");
      await client.close();
      return; // Exit script gracefully on success
    } catch (err) {
      console.error(`Failed on ${host}:`, err.message);
      await client.close();
    }
  }
}

seedUser();

const { MongoClient, ObjectId } = require('mongodb');

async function checkJob() {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://celosinacio:xxxxxx@cluster0.xxxxxxx.mongodb.net/productify');
  const db = client.db('productify');
  const job = await db.collection('jobs').findOne({ _id: new ObjectId('692ccc8b36fc8c728062914c') });
  console.log(JSON.stringify(job, null, 2));
  await client.close();
}

checkJob().catch(console.error);

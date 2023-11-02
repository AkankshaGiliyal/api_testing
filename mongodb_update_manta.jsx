const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3001;

// MongoDB connection
const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';

// update the data in the MongoDB collection
async function updateData() {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();

    const db = client.db('fetchdata');
    const collection = db.collection('fetchdata2');

    // multiply each value by 1.1 and updat
    const updateResult = await collection.updateMany(
      {},
      {
        $mul: { "manta.$[].value": 1.1 }
      }
    );

    console.log(`Updated ${updateResult.modifiedCount} documents.`);
    
    client.close();
  } catch (error) {
    console.error('Error updating data in MongoDB:', error);
  }
}

// schedule the data update every ten minutes 
setInterval(updateData, 600000);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API server is running on port ${port}`);
});

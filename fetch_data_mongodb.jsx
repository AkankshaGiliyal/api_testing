const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 80;

// mongoDB connection URI
const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';

app.get('/mantle', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();

    const db = client.db('fetchdata');
    const collection = db.collection('fetchdata1');

    // fetching the data from MongoDB
    const data = await collection.find({}).toArray();

    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/manta', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();

    const db = client.db('fetchdata');
    const collection = db.collection('fetchdata2');

    // fetching the data from the second collection
    const data = await collection.find({}).toArray();

    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from the second collection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/price', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db('sample');
    const collection = database.collection('sample1');

    const data = await collection.find().toArray();
    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB (data):', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, '0.0.0.0',() => {
  console.log(`API server is running on port ${port}`);
});

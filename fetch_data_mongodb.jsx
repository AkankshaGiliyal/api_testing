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

    const database = client.db('backend');
    const collection = database.collection('price_usd');

    const data = await collection.find().toArray();
    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB (data):', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tvl_usd_sum', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db('backend');
    const collection1 = database.collection('tvl');
    const collection2 = database.collection('tvl_manta');

    const pipeline1 = [
      {
        $group: {
          _id: null,
          totalCollection1: { $sum: '$tvl_usd' },
        },
      },
      {
        $project: {
          _id: 0,
          totalCollection1: 1,
        },
      },
    ];

    const pipeline2 = [
      {
        $group: {
          _id: null,
          totalCollection2: { $sum: '$tvl_usd' }, 
        },
      },
      {
        $project: {
          _id: 0,
          totalCollection2: 1,
        },
      },
    ];

    const [result1, result2] = await Promise.all([
      collection1.aggregate(pipeline1).toArray(),
      collection2.aggregate(pipeline2).toArray(),
    ]);

    client.close();

    const sum1 = result1[0]?.totalCollection1 || 0;
    const sum2 = result2[0]?.totalCollection2 || 0;
    const combinedSum = sum1 + sum2;

    res.json({ sum: combinedSum });
  } catch (error) {
    console.error('Error calculating combined TVL sum:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/allvaults', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db('backend');
    const collection1 = database.collection('tvl');
    const collection2 = database.collection('tvl_manta');

    const projection = { _id: 0 }; 

    const data1 = await collection1.find({}, projection).toArray();
    const data2 = await collection2.find({}, projection).toArray();

    client.close();

    res.json({ tvl: data1, tvl_manta: data2 });
  } catch (error) {
    console.error('Error fetching TVL data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/xriv/users/:walletAddress', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db('xRIV'); 
    const collection = db.collection('users'); 

    const walletAddress = req.params.walletAddress;

    // find the user document by wallet address
    const user = await collection.findOne({ wallet_address: walletAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    client.close();

    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, '0.0.0.0',() => {
  console.log(`API server is running on port ${port}`);
});

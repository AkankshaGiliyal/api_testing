const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const mntABI = require('./ABI.jsx');

const provider1 = new ethers.providers.JsonRpcProvider("https://pacific-rpc.manta.network/http");
const provider2 = new ethers.providers.JsonRpcProvider("https://rpc.mantle.xyz");
const provider3 = new ethers.providers.JsonRpcProvider("https://mainnet.telos.net/evm")

const dbUrl = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
const dbName = 'vaults';

async function connectToDatabase() {
  const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function fetchDataFromContract(client, address, provider, collectionName, chainName) {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const contract = new ethers.Contract(address, mntABI, provider);

    const name = await contract.name();
    const symbol = await contract.symbol();
    const owner = await contract.owner();
    const strategy = await contract.strategy();

    const name1 = name.toString();
    const symbol1 = symbol.toString();
    const owner1 = owner.toString();
    const strategy1 = strategy.toString();

    const filter = { "vaultAddress": address, "chain": chainName };
    const updateDocument = {
      $set: { 
        name: name1, 
        symbol: symbol1, 
        owner: owner1,
        strategy: strategy1,
        chain: chainName  
      },
    };

    const result = await collection.updateOne(filter, updateDocument, { upsert: true });

    if (result.modifiedCount === 1 || result.upsertedCount === 1) {
      console.log(`Data for ${address} (${chainName}) updated/inserted in MongoDB:`, { name1, symbol1, owner1, strategy1 });
    } else {
      console.error(`Document for ${address} (${chainName}) not updated/inserted in MongoDB.`);
    }
  } catch (error) {
    console.error(`Error fetching and updating data for ${address} (${chainName}):`, error);
  }
}

async function watchCollectionForChanges(client, collectionName, chainName) {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const changeStream = collection.watch();

    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const newDocument = change.fullDocument;
        const { vaultAddress } = newDocument;

        await fetchDataFromContract(client, vaultAddress, provider, collectionName, chainName);
      }
    });

    console.log(`Watching for changes in ${collectionName} collection for ${chainName} chain...`);
  } catch (error) {
    console.error('Error watching collection for changes:', error);
    throw error;
  }
}

async function runWatchers() {
  let client;

  try {
    client = await connectToDatabase();
    console.log('Connected to the database.');

    await watchCollectionForChanges(client, 'vault', 'manta-pacific');
    await watchCollectionForChanges(client, 'vault', 'mantle');
    await watchCollectionForChanges(client, 'vault', 'telos');
  } catch (error) {
    console.error('Error running watchers:', error);
  }
}

runWatchers();








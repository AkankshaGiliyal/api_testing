const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const mntABI = require('./ABI.jsx');
const provider = new ethers.providers.JsonRpcProvider("https://rpc.mantle.xyz");

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

const addressFunctions = [
  {
    address: "0xfa944c1996efBF9FbFF1a378903F4AD82C172D72",
    processFunction: (totalAssets) => totalAssets / 1
  },
  {
    address: "0x945438ef559EFf400429DFb101e57a6299B5ceE2",
    processFunction: (totalAssets) => totalAssets / 1
  },
  {
    address: "0xA25d1843eedE1E1D0631b979da605606412e64f7",
    processFunction: (totalAssets) => totalAssets / 1
  },
  {
    address: "0xAa81F912D09Fd313Bbc1d5638632aB6bf59aB495",
    processFunction: (totalAssets) => totalAssets / 1
  },
  {
    address: "0x0DB2BA00bCcf4F5e20b950bF954CAdF768D158Aa",
    processFunction: (totalAssets) => totalAssets / 1
  },
  {
    address: "0x713C1300f82009162cC908dC9D82304A51F05A3E",
    processFunction: (totalAssets) => totalAssets / 1
  },
  {
    address: "0xDc63179CC57783493DD8a4Ffd7367DF489Ae93BF",
    processFunction: (totalAssets) => totalAssets / 1
  },
  {
    address: "0x5f247B216E46fD86A09dfAB377d9DBe62E9dECDA",
    processFunction: (totalAssets) => totalAssets / 1
  },
  
];


async function fetchTotalAssetsWithFunction(client, address, processFunction) {
  try {
    const db = client.db(dbName);
    const collection = db.collection('mantle');

    const contract = new ethers.Contract(address, mntABI, provider);
    const totalAssets = await contract.totalSupply();
    const processedValue = processFunction(totalAssets);

    const filter = { "vaultAddress": address };
    const updateDocument = {
      $set: { totalSupply: processedValue },
    };

    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
      console.log(`Total Supply for ${address} (processed) updated in MongoDB:`, processedValue);
    } else {
      console.error(`Document for ${address} not found in MongoDB.`);
    }
  } catch (error) {
    console.error(`Error fetching and updating total supply for ${address}:`, error);
  }
}

async function updateTotalAssets() {
  let client;
  try {
    client = await connectToDatabase();
    for (const { address, processFunction } of addressFunctions) {
      await fetchTotalAssetsWithFunction(client, address, processFunction);
    }
  } catch (error) {
    console.error('Error updating total assets:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

updateTotalAssets();

const interval = setInterval(async () => {
  await updateTotalAssets();
}, 1 * 60 * 1000);



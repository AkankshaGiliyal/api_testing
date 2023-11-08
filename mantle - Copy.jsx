const { ethers } = require('ethers');
const { MongoClient } = require('mongodb'); 

const mntABI = require('./ABI.jsx');
const provider = new ethers.providers.JsonRpcProvider("https://rpc.mantle.xyz");

// MongoDB configuration
const dbUrl = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/'; // Update with your MongoDB connection URL
const dbName = 'backend'; // Update with your database name

async function connectToDatabase() {
  const client = new MongoClient(dbUrl, { useUnifiedTopology: true });

  try {
    await client.connect();
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// array of objects where each object contains an address and a corresponding function
  
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


// function to fetch totalAssets for an address and apply the corresponding function
async function fetchTotalAssetsWithFunction(address, processFunction) {
  try {
    const contract = new ethers.Contract(address, mntABI, provider);
    const totalAssets = await contract.totalAssets();
    const processedValue = processFunction(totalAssets);

    const db = await connectToDatabase();
    const collection = db.collection('tvl'); // Update with your collection name

    // Update the existing document with the new TVL value
    const filter = { "Vault Address": address };
    const updateDocument = {
      $set: {
        totalAssets: processedValue,
      },
    };

    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
      console.log(`Total Assets for ${address} (processed) updated in MongoDB:`, processedValue);
    } else {
      console.error(`Document for ${address} not found in MongoDB.`);
    }
  } catch (error) {
    console.error(`Error fetching and updating total assets for ${address}:`, error);
  }
}

// calling function for each address-function pair in the array
for (const { address, processFunction } of addressFunctions) {
  fetchTotalAssetsWithFunction(address, processFunction);
}




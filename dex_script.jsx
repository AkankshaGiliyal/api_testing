const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
const dbName = 'backend';

async function updateStats() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    const database = client.db(dbName);
    const statsCollection = database.collection('stats');
    const tvlCollection = database.collection('tvl');
    const tvlMantaCollection = database.collection('tvl_manta');

    const statsDocuments = await statsCollection.find({}).toArray();

    for (const doc of statsDocuments) {
      const chainNameStats = doc.chain_name; 
      const dex = doc.dex;

      const tvlCount = await tvlCollection.countDocuments({ 'Chain Name': chainNameStats, dex });
      const tvlMantaCount = await tvlMantaCollection.countDocuments({ 'Chain Name': chainNameStats, dex });

      const tvlDocuments = await tvlCollection.find({ 'Chain Name': chainNameStats, dex }).toArray();
      const tvlMantaDocuments = await tvlMantaCollection.find({ 'Chain Name': chainNameStats, dex }).toArray();

      const tvlSum = tvlDocuments.reduce((sum, tvlDoc) => sum + (tvlDoc.tvl_usd || 0), 0);
      const tvlMantaSum = tvlMantaDocuments.reduce((sum, tvlMantaDoc) => sum + (tvlMantaDoc.tvl_usd || 0), 0);

      const totalSum = tvlSum + tvlMantaSum;

      
      await statsCollection.updateOne(
        { chain_name: chainNameStats, dex },
        {
          $set: {
            total_vaults: tvlCount + tvlMantaCount, 
            tvl_usd: totalSum 
          }
        }
      );
    }

    console.log('Stats collection updated successfully.');
  } catch (error) {
    console.error('Error updating stats collection:', error);
  } finally {
    client.close();
  }
}

updateStats();

setInterval(() => {
  console.log('Running the updateStats function...');
  updateStats();
}, 30 * 60 * 1000);
const { MongoClient } = require('mongodb');

(async () => {
  const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
  const dbName = 'backend';

  async function updateTVLData() {
    try {
      const client = new MongoClient(uri, { useUnifiedTopology: true });
      await client.connect();
      const database = client.db(dbName);
      const tvlCollection = database.collection('tvl');
      const priceCollection = database.collection('price_usd');

      // Fetch TVL documents with "Chain Name" equal to "mantle"
      const tvlDocs = await tvlCollection.find({ 'Chain Name': 'mantle' }).toArray();

      for (const tvlDoc of tvlDocs) {
        const asset = tvlDoc.id; // Assuming 'id' is the correct field name

        console.log(`Checking TVL document with asset: ${asset}`);

        // Find the corresponding price document in 'price_usd' collection
        const priceDoc = await priceCollection.findOne({ id: asset });

        if (priceDoc) {
          // Calculate tvl_usd by multiplying price_usd and totalAssets
          const price_usd = parseFloat(priceDoc.price_usd);
          const totalAssets = parseFloat(tvlDoc.totalAssets);
          const tvl_usd = price_usd * totalAssets;

          // Update the TVL document with tvl_usd
          await tvlCollection.updateOne({ _id: tvlDoc._id }, { $set: { tvl_usd } });
          console.log(`Updated TVL document with _id: ${tvlDoc._id} with tvl_usd: ${tvl_usd}`);
        } else {
          console.error(`Price document not found for asset: ${asset}`);
        }
      }

      client.close();
    } catch (error) {
      console.error(error);
    }
  }

  // Update TVL data initially
  updateTVLData();

  // Schedule periodic updates
  setInterval(updateTVLData, 600000);
})();





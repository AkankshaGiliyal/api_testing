const { MongoClient } = require('mongodb');
let fetch; 

(async () => {
  const fetchModule = await import('node-fetch'); 
  fetch = fetchModule.default; 

  const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
  const dbName = 'backend';
  const apiUrl = 'https://api.geckoterminal.com/api/v2/networks/manta-pacific/tokens/multi/0xf417f5a458ec102b90352f697d6e2ac3a3d2851f%2C0xb73603c5d87fa094b7314c74ace2e64d165016fb%2C0x0dc808adce2099a9f62aa87d9670745aba741746';

  async function fetchAndInsertData() {
    try {
      const response = await fetch(apiUrl);
      if (response.status === 200) {
        const data = await response.json();

        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection('price_usd');

        for (const item of data.data) {
          const { id, attributes: { price_usd } } = item;

          // Extract the desired part of the id
          const extractedId = id.split('_')[1];

          await collection.updateOne({ id: extractedId }, { $set: { price_usd } }, { upsert: true });
          console.log(`Updated document with id: ${extractedId}`);
        }

        client.close();
      } else {
        console.error('Failed to fetch data from the API');
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Fetch and insert data initially
  fetchAndInsertData();

  // Schedule periodic data updates (e.g., every 10 minutes)
  setInterval(fetchAndInsertData, 600000);
})();































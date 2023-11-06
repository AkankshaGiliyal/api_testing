const { MongoClient } = require('mongodb');
let fetch; 

(async () => {
  const fetchModule = await import('node-fetch'); 
  fetch = fetchModule.default; 

  const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
  const dbName = 'sample';
  const apiUrl = 'https://api.geckoterminal.com/api/v2/networks/mantle/tokens/multi/0x201eba5cc46d216ce6dc03f6a759e8e766e956ae%2C0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9%2C0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111';

  async function fetchAndInsertData() {
    try {
      const response = await fetch(apiUrl);
      if (response.status === 200) {
        const data = await response.json();

        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection('sample1');

        for (const item of data.data) {
          const { id, attributes: { price_usd } } = item;

          
          await collection.updateOne({ id }, { $set: { price_usd } }, { upsert: false });
          console.log(`Updated document with id: ${id}`);
        }

        client.close();
      } else {
        console.error('Failed to fetch data from the API');
      }
    } catch (error) {
      console.error(error);
    }
  }

  
  setInterval(fetchAndInsertData, 600000);

  
  fetchAndInsertData();
})();

































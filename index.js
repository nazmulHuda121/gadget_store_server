const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Gadget store Server is running!');
});

// Use MongoDB URI from .env
const uri = process.env.DATABASE_URL;

// Create client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Start DB + API
async function run() {
  try {
    await client.connect();
    console.log('MongoDB Connected!!!');

    const productsCollection = client
      .db('gadget_storeDB')
      .collection('products');
    const contactCollection = client
      .db('gadget_storeDB')
      .collection('messages');

    /* ----------------------------------------
       CONTACT US (POST)
    ---------------------------------------- */
    app.post('/contact', async (req, res) => {
      const result = await contactCollection.insertOne(req.body);

      res.send({
        success: true,
        message: 'Message received!',
        data: result,
      });
    });

    /* ----------------------------------------
       ADD PRODUCT (POST)
    ---------------------------------------- */
    app.post('/products', async (req, res) => {
      try {
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        res.status(201).send({
          message: 'product created successfully',
          result,
        });
      } catch (error) {
        message: 'product is not created', error;
      }
    });

    /* ----------------------------------------
       GET ALL PRODUCTS
    ---------------------------------------- */
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.status(200).send({
        message: 'get the all products',
        result,
      });
    });

    /* ----------------------------------------
       GET SINGLE PRODUCT BY ID
    ---------------------------------------- */
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    /* ----------------------------------------
       DELETE PRODUCT
    ---------------------------------------- */
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;

      const result = await productsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: 'Product not found' });
      }

      res.send({ success: true });
    });
  } catch (error) {
    console.log('Error:', error);
  }
}

run().catch(console.dir);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

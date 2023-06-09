const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ktqos2d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const toysCollection = client.db("toysDB").collection("toys");

    // GET All Toys from server
    app.get("/toys", async (req, res) => {
      const result = await toysCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      res.send(result);
    });

    // get a specific toy by ID
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // GET data based on email
    app.get("/my-Toys/", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // POST a toy data
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      toy.createdAt = new Date();
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    //API for UPDATE a toy
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToyData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedData = {
        $set: {
          ...updatedToyData,
        },
      };
      const result = await toysCollection.updateOne(
        filter,
        updatedData,
        options
      );
      res.send(result);
    });

    // DELETE a toy
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // search by name
    app.get("/searchToyByName/:name", async (req, res) => {
      const name = req.params.name;
      const result = await toysCollection
        .find({ toyName: { $regex: name, $options: "i" } })
        .toArray();
      res.send(result);
    });

    // sort data by price
    app.get("/sortedByPrice", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const sortType = req.query.sort
      if(sortType === 'ascending'){
        const result = await toysCollection
        .find(query)
        .sort({ price: -1 })
        .toArray();
        return res.send(result);
       
      }
      else{
        const result = await toysCollection
        .find(query)
        .sort({ price: 1 })
        .toArray();
        return res.send(result);
      }
  
      
      
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("I am playing with action figure toy.");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

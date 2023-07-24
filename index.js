const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 1111;
const cors = require("cors");
require("dotenv").config();

// middlewere
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ola amigos");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ocircleo.zgezjlp.mongodb.net/?retryWrites=true&w=majority`;

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
    const databse = client.db("sunshine");
    const jobs = databse.collection("jobs");
    const companys = databse.collection("companys");

    app.get("/jobs", async (req, res) => {
      const result = await jobs.find().toArray();
      res.send(result);
    });
    app.get("/topcompanys/:isbd/:num", async (req, res) => {
      const isBd = req.params.isbd;
      const number = parseInt(req.params.num);
      const query = {};
      if (isBd == "bd") {
        query.location = "Bangladesh";
      } else {
        query.location = { $ne: "Bangladesh" };
      }
      const result = await companys.find(query).limit(number).toArray();
      res.send(result);
    });
    app.get("/serch", async (req, res) => {
      const type = req.query.type;
      const serchText = req.query.keyword;
      const query = {
        job_type: type,
        job_title: { $regex: serchText, $options: "i" },
      };
      const result = await jobs.find(query).toArray();
      res.send(result);
    });
    app.get("/job/:catagory", async (req, res) => {
      const catagory = req.params.catagory;
      const query = { job_type: catagory };
      const result = await jobs.find(query).limit(6).toArray();
      res.send(result);
    });
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
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

app.listen(port, () => {
  console.log(`app is running at port ${port}`);
});

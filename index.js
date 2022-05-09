const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_DB_USER}:${process.env.MONG_PASS_WORD}@cluster0.4cfxo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const warehouse = client.db("bikes").collection("store");

    app.get("/bikedata", async (req, res) => {
      const query = {};
      const cursor = warehouse.find(query);
      const storedata = await cursor.toArray();
      res.send(storedata);
    });

    app.get("/bikedata/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = await warehouse.findOne(query);
      res.send(data);
    });

    app.get("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    app.post("/bikedata", async (req, res) => {
      const newdata = req.body;
      const updateData = await warehouse.insertOne(newdata);
      res.send(updateData);
    });

    app.put("/bikedata/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateData.quantity,
        },
      };
      const result = await warehouse.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    app.delete("/bikedata/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await warehouse.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(port, () => {
  console.log("server is running .........");
});

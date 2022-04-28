const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World wdwddcc!");
});
function verifyJWT(req, res, next) {
  const reqauth = req.headers.authorization;

  if (!reqauth) {
    res.status(401).send({ message: "Unauthorize Access" });
  }
  const token = reqauth.split(" ")[1];
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden text" });
    }
    req.decoded = decoded;
  });

  // console.log("inside Verification auth", headerAuth);
  next();
}
// const { decode } = require("jsonwebtoken");
const uri =
  "mongodb+srv://geniusCar:QdPQP44VjhgWHwdv@cluster0.eqxbe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// `mongodb+srv://${process.env.S3_BUCKET}:${process.env.DB_PASS}@cluster0.vwx9p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("geniusCar").collection("service");
    const orderCollection = client.db("geniusCar").collection("order");
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // AUTH

    app.post("/login", (req, res) => {
      const data = req.body;
      const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // POST
    app.post("/service", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });

    // DELETE
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/order", async (req, res) => {
      const data = req.body;
      const result = await orderCollection.insertOne(data);

      res.send(result);
    });

    app.get("/order", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;

      if (email == decodedEmail) {
        const query = { email };
        const cursor = orderCollection.find(query);
        const service = await cursor.toArray();
        res.send(service);
      }
    });
    app.get("/hero", (req, res) => {
      req.send("Hit the hero");
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

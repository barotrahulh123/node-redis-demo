const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();

//Redis config
const redisconfig = {
  host: "localhost", //host url incase ig you are using 3rd party service like Aws redis service
  port: "6379", //post where yout redis server will start
  pass: "", //password if you have set any default is empty
};

//create client for use redis
const client = redis.createClient(redisconfig);

//wait for connect client
(async () => {
  await client.connect();
})();

client.on("error", (err) => {
  console.error("Redis connection error", err);
});

client.on("connect", () => {
  console.log("Redis Server Connected!");
});

//start server on this port
const port = 3000;

//dummy json api url from where porduct data will get

const PRODUCT_API = "https://dummyjson.com/products";

//Get prouct list
app.get("/list-products", (req, res) => {
  try {
    axios.get(`${PRODUCT_API}`).then(function (response) {
      const products = response.data;
      console.log("products retrieved from the API");
      res.status(200).send(products);
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

//Get Product list store in redis and display
app.get("/list-products-redis", async (req, res) => {
  try {

    const cacheProducts = await client.get("products");

    if(cacheProducts){

      console.log("Product retrieved from Redis");
      res.status(200).send(JSON.parse(cacheProducts));
   
    }
    else {
        axios.get(`${PRODUCT_API}`).then(function (response) {
          const products = response.data;

          client.set("products",JSON.stringify(products));
          console.log("Product retrieved from the API");
          res.status(200).send(products);
        });
    }
   
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Serever started on port ${port}`);
});

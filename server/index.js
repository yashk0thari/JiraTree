// GLOBAL CONSTANTS: (will be moved to a centeralized file!)
const DATABASE_URL = "postgresql://jira-tree:dd8gZvd2OBBZLCprvrxNMg@free-tier4.aws-us-west-2.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Djira-tree-4145"

const express = require("express");
const app = express();

// Database Connection:
const { Client } = require("pg");
const client = new Client(DATABASE_URL);

(async () => {
  await client.connect();
  try {
    const results = await client.query("SELECT NOW()");
    console.log(results);
  } catch (err) {
    console.error("error executing query:", err);
  } finally {
    client.end();
  }
})();

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(3001, () => {
    console.log("Running on port 3001.");
});
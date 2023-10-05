const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/", (req, res) => {
  setTimeout(() => {
    console.log("req: ", req.body);
    res.status(200).send("Pushed successfully!");
  }, 100);
});

app.get("/", (req, res) => {
  setTimeout(() => {
    console.log("req: ", req.body);
    const data = { key: "value" };
    res.status(200).json(data);
  }, 100);
});

app.listen(3000, () => {
  console.log("running server");
});

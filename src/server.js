require("dotenv").config();
import express from "express";
import viewEngine from "./config/viewEngine";
import initWebRoute from "./routes/web";
import bodyParser from "body-parser";

let app = express();

//confing view engine
viewEngine(app);

//user body-parser to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//init all web route
initWebRoute(app);

let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

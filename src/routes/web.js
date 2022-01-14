import express from "express";
import homePageController from "../controller/homepageController";

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homePageController.getHomePage);

  return app.use("/", router);
};

module.exports = initWebRoutes;

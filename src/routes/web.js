import express from "express";
import chatBotController from "../controller/chatBotController";
import homePageController from "../controller/homepageController";

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homePageController.getHomePage);
  router.get("/webhook", chatBotController.getWebHook);
  router.post("/webhook", chatBotController.postWebHook);

  return app.use("/", router);
};

module.exports = initWebRoutes;

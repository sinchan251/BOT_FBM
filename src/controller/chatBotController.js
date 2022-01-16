require("dotenv").config();
import request from "request";

let postWebHook = (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

let getWebHook = (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.TOKEN_M_FB;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: { text: response },
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v6.0/me/messages",
      qs: { access_token: process.env.TOKEN_M_FB },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

// // Handles messages events
// function handleMessage(sender_psid, received_message) {
//   let response;

//   // Check if the message contains text
//   if (received_message.text) {
//     // Create the payload for a basic text message
//     response = {
//       text: `You sent the message: "${received_message.text}". Now send me an image!`,
//     };
//   }

//   // Sends the response message
//   callSendAPI(sender_psid, response);
// }

function firstTrait(nlp, name) {
  return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
}

// function handleMessage(sender_psid, message) {
//   // check greeting is here and is confident
//   //   let entitiesArr = ["greetings", "thanks", "bye"];
//   //   let entityChosen = "";
//   //   entitiesArr.forEach((name) => {
//   //     let entity = firstTrait(message.nlp, name);
//   //     if (entity && entity.confidence > 0.8) {
//   //       entityChosen = name;
//   //     }
//   //   });

//   //   if (entityChosen === "") {
//   //     //default
//   //     callSendAPI(
//   //       sender_psid,
//   //       `The bot still in development , try to say anything greeting, thanks and by word`
//   //     );
//   //   } else {
//   //     if (entityChosen === "greetings") {
//   //       //send greeting mesasge
//   //       callSendAPI(sender_psid, `HI GREETINGSS`);
//   //     }
//   //     if (entityChosen === "thanks") {
//   //       //send thanks mesasge
//   //       callSendAPI(sender_psid, `your welcome :)`);
//   //     }
//   //     if (entityChosen === "bye") {
//   //       //send greeting mesasge
//   //       callSendAPI(sender_psid, `See You ${entityChosen.name}`);
//   //     }
//   //   }

// check greeting is here and is confident
const greeting = firstTrait(message.nlp, "wit$greetings");
const lahir = firstTrait(message.nlp, "wit$datetime:$datetime");

//get today today
let today = new Date();
let date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

if (lahir && lahir.confidence > 0.8) {
  let a = lahir.toISOString().split("T")[0];
  callSendAPI(sender_psid, `this ur birday ? ${(a, lahir)}`);
} else {
  callSendAPI(sender_psid, `salah cok ${date}`);
}

if (greeting && greeting.confidence > 0.8) {
  callSendAPI(sender_psid, `Hi there!, What is your name? :) `);
  // response = {
  //   attachment: {
  //     type: "template",
  //     payload: {
  //       template_type: "generic",
  //       elements: [
  //         {
  //           title:
  //             "did u want wants to know how many days till his next birthday ?",
  //           subtitle: "Tap a button to answer.",
  //           buttons: [
  //             {
  //               type: "postback",
  //               title: "Yes!",
  //               payload: "yes",
  //             },
  //             {
  //               type: "postback",
  //               title: "No!",
  //               payload: "no",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   },
  // };
} else {
  // default logic
  callSendAPI(sender_psid, "Defaultasdasd");
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === "yes") {
    // hitung birtday
    function _calculateAge(birthday) {
      // birthday is a date
      var ageDifMs = Date.now() - birthday.getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
    response = {
      text: "ntar kita itung kawokaw",
    };
  } else if (payload === "no") {
    response = { text: "Thanks, Goodbye." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

module.exports = {
  postWebHook: postWebHook,
  getWebHook: getWebHook,
};

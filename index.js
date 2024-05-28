require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const axios = require("axios");

app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

let history = {
  sentence: "",
  lastWord: "",
  currentWord: "",
  suggestedWords: []
};

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Server connected!");
});

app.post("/nodemcu", async (req, res) => {
  console.log("Request Received!");
  const char = req.body.message;
  const mode = req.body.mode;
  console.log(char);
  if (mode === "0") {
    if (char == " ") {
      console.log("REACHING SPACE");
      history.lastWord = history.currentWord;
      history.currentWord = "";
      history.sentence += char;
      // make api call to ML model
      const response = await axios.post(
        "https://ocutype-next-word-predictor.onrender.com/predict",
        {
          sentence: history.sentence
        }
      );
      history.suggestedWords = response.data[0];
    } else {
      history.currentWord += char;
      history.sentence += char;
    }
    console.log("Request Received!");
    io.emit("recieve", {
      alphabet: char,
      suggestions: history.suggestedWords,
      sentence: history.sentence
    });
    console.log(history);
    res.status(200).json({ status: "success" });
  } else if (mode === "1") {
    if (char === "!") {
      history.sentence.slice(0, -1);
      io.emit("recieve", {
        alphabet: char,
        suggestions: ["Manjeet", "Man", "Mannu"],
        sentence: history.sentence
      });
    }

    if (char === "a" || char === "b" || char === "c") {
      history.sentence +=
        history.suggestedWords[char === "a" ? 0 : char === "b" ? 1 : 2];
      console.log("INSIDE MODE 1");
      console.log(history.sentence);
      history.lastWord = history.currentWord;
      history.currentWord = "";
      history.sentence += " ";
      const response = await axios.post(
        "https://ocutype-next-word-predictor.onrender.com/predict",
        {
          sentence: history.sentence
        }
      );
      history.suggestedWords = response.data[0];
      io.emit("recieve", {
        alphabet: char,
        suggestions: history.suggestedWords,
        sentence: history.sentence
      });
    }

    if (char === "d") {
      console.log("ALERT");
      client.messages
        .create({
          body: "Hi this is an alert message, I need help!",
          to: "+918847099350",
          from: "+13203146245"
        })
        .then((message) => console.log(message.sid));
      console.log("ALERT SENT");
    }

    res.status(200).json({ status: "success" });
  }
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

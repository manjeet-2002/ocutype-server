const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

let history = {
  sentence: "",
  lastWord: "",
  currentWord: "",
  suggestedWords: [],
};

const io = new Server(server, {
  cors: {
    origin: "*",
  },
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

app.post("/nodemcu", (req, res) => {
  console.log("Request Received!");
  const char = req.body.message;
  console.log(char);
  if (char == " ") {
    history.lastWord = history.currentWord;
    history.currentWord = "";
    history.sentence += char;
  } else {
    history.currentWord += char;
    history.sentence += char;
  }
  console.log("Request Received!");
  io.emit("recieve", {
    alphabet: char,
    suggestions: ["Manjeet", "Man", "Mannu"],
  });
  console.log(history);
  res.status(200).json({ status: "success" });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

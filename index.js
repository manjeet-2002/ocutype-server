const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

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

app.post("/nodemcu", (req, res) => {
  console.log("Request Received!");
  console.log(req.body.message);
  io.emit("recieve", { alphabet: req.body.message, suggestions:["Manjeet", "Man", req.body.message]});
  res.status(200).json({ status: "success" });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

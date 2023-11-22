const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());
app.use(express.json());  // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on('connection', (socket) => {
    console.log('A client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
});

app.post('/', (req, res) => {
    const message = req.body.char;
    console.log(message);
    
    io.emit('recieve', {char : message});

    res.status(200).json({ status: 'success'});
});

app.post('/nodemcu',(req,res)=>{
  io.emit('nodemcu',{ message : req.body.message });
  res.status(200).json({status:'success'});
})

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
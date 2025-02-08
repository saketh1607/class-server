const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], 
    methods: ['GET', 'POST'],
    credentials: true
}));
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

let questions = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("loadQuestions", questions);

  socket.on("askQuestion", (q) => {
    const question = { id: Date.now(), text: q, upvotes: 0 };
    questions.push(question);
    io.emit("newQuestion", question);
  });

  socket.on("upvote", (id) => {
    const q = questions.find((q) => q.id === id);
    if (q) {
      q.upvotes++;
      io.emit("updateQuestions", questions);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000; // Ensure compatibility with Render
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*' } // Allow all origins for testing
});

const corsOptions = {
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], 
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

let questions = [];

io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

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
        console.log("❌ User disconnected:", socket.id);
    });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

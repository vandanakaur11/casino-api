const express = require("express");
const path = require("path");
const { connectDataBase } = require("./db/index");

const PORT = process.env.PORT || 5050;
const cors = require('cors');
// Connect Database
connectDataBase();

// Integrate Express
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const STATIC_CHANNELS = ['global_notifications', 'global_chat'];
// Parse json 
app.use(express.json({ extended: false }));
app.use(cors());
app.use((req, res, next) => {
  req.io = io;
  return next();
});
// Route to check api is working or not
app.get('/api/v1/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Health 100%'
  })
});

// Transfer requests to Route Folder
app.use("/api/v1", require("./routes/index"));

// Check Route is exsist or not
app.get("*", (req, res) => {
  res.status(404).json({
    error: true,
    message: "api not found",
  });
});


// Identify port for app
http.listen(PORT, () => {
  console.log(`app is running on port:${PORT}`);
});

io.on('connection', (socket) => {
  console.log("new user connected");
  socket.emit('connection', null);
})

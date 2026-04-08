require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const initSocket = require("./socket");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//  Initialize socket logic
initSocket(io);

server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});

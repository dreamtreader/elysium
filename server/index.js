import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import * as http from "http";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import SocketHandler from "./socket/handleSocket.js";

import cloudinary from "cloudinary";

cloudinary.v2.config({
  secure: true,
  cloud_name: "dnpgwek4e",
  api_key: "858247739637558",
  api_secret: "BsRErNkpQq9ANqDA6VXV6__j-OY",
});

dotenv.config();

import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import serverRoutes from "./routes/servers.js";
import channelRoutes from "./routes/channels.js";

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    optionSuccessStatus: 200,
  })
);

SocketHandler.initialize(server);

app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/servers", serverRoutes);
app.use("/channels", channelRoutes);

const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      server.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
      });
    },
    (error) => console.log(error.message)
  );

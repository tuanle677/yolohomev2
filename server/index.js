const express = require("express");
const app = express();
const mqtt = require("mqtt");
const { spawn } = require("child_process");

const AIO_USERNAME = "dynabit";
const AIO_KEY = "aio_DpWC444jLZSgFHnuHKIRMiElY3wB";
const feedName = "topic";
const feadAtom = "feeds/atom";
const feadAtom2 = "feeds/atom2";
const feadAtom3 = "feeds/atom3";
const feadAtom4 = "feeds/atom4";

// Create an MQTT client and connect to Adafruit IO
const client = mqtt.connect(`mqtt://io.adafruit.com`, {
  username: AIO_USERNAME,
  password: AIO_KEY,
});

// Subscribe to a feed

client.on("connect", () => {
  console.log(client.connected);
  client.subscribe(`${AIO_USERNAME}/feeds/${feedName}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feadAtom}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feadAtom2}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feadAtom3}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feadAtom4}`, () => {});
});
// Receive data from a feed
client.on("message", (topic, message) => {
  console.log(`Received data from ${topic}: ${message}`);
});

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

const server = app.listen(3001, () => {
  console.log("listen on port 3001!!!!");
});

const io = require("socket.io")(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.emit("data", { message: "Welcome to the server!" });
  client.on("message", (topic, message) => {
    console.log(`Received data from ${topic}: ${message}`);
    if (topic === `${AIO_USERNAME}/feeds/${feedName}`) socket.emit("topic", { message: `${message.toString()}` });
    if (topic === `${AIO_USERNAME}/feeds/${feadAtom}`) socket.emit("atom", { message: `Received data from ${topic}: ${message.toString()}` });
    if (topic === `${AIO_USERNAME}/feeds/${feadAtom2}`) socket.emit("atom2", { message: `Received data from ${topic}: ${message.toString()}` });
    if (topic === `${AIO_USERNAME}/feeds/${feadAtom3}`) socket.emit("atom3", { message: `Received data from ${topic}: ${message.toString()}` });
    if (topic === `${AIO_USERNAME}/feeds/${feadAtom4}`) socket.emit("atom4", { message: `Received data from ${topic}: ${message.toString()}` });
  });

  socket.on("atom", (data) => {
    console.log(data);
    client.publish(`${AIO_USERNAME}/${feadAtom}`, data === "1" ? "1" : "2");
  });

  socket.on("atom2", (data) => {
    console.log(data);
    client.publish(`${AIO_USERNAME}/${feadAtom2}`, data === "1" ? "1" : "2");
  });

  socket.on("atom3", (data) => {
    console.log(data);
    client.publish(`${AIO_USERNAME}/${feadAtom3}`, data === "1" ? "1" : "2");
  });

  socket.on("atom4", (data) => {
    console.log(data);
    client.publish(`${AIO_USERNAME}/${feadAtom4}`, data === "1" ? "1" : "2");
  });

  // socket.on("fan", (data) => {
  //   console.log(data);
  //   client.publish(`${AIO_USERNAME}/${feedNameFan}`, data.toString());
  // });

  // socket.on("rgb", (data) => {
  //   console.log(data);
  //   client.publish(`${AIO_USERNAME}/feeds/${feedNameRgb}`, data === "Green" ? "#00ff00" : data === "Red" ? "#FF0000" : "#0084FF");
  // });
});

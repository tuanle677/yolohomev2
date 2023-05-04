const express = require("express");
const app = express();
const mqtt = require("mqtt");
const { spawn } = require("child_process");

const AIO_USERNAME = "ntr18";
const AIO_KEY = "aio_sYBT12frtgJHKgZXbiDN5lKrECht";
const feedNameLed = "bbc-led";
const feedNameTemp = "bbc-temp";
const feedNameFan = "bbc-fan";
const feedNameHum = "bbc-hum";
const feedNameHex = "bbc-hex";
const feedNameRgb = "bbc-rgb";
const feedNameAss = "bbc-ass";

// Create an MQTT client and connect to Adafruit IO
const client = mqtt.connect(`mqtt://io.adafruit.com`, {
  username: AIO_USERNAME,
  password: AIO_KEY,
});

// Subscribe to a feed

client.on("connect", () => {
  console.log(client.connected);
  client.subscribe(`${AIO_USERNAME}/feeds/${feedNameLed}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feedNameTemp}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feedNameHum}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feedNameHex}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feedNameRgb}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feedNameAss}`, () => {});
  client.subscribe(`${AIO_USERNAME}/feeds/${feedNameFan}`, () => {});
});
// Receive data from a feed

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

app.use("/face", (req, res) => {
  const pythonProcess = spawn("python", ["faceDetect.py"]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    res.send(`Python script exited with code ${code}`);
  });
});

app.use("/voice", (req, res) => {
  const pythonProcess = spawn("python", ["voiceDetect.py"]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    res.send(`Python script exited with code ${code}`);
  });
});

const server = app.listen(3001, () => {
  console.log("listen on port 3001!!!!");
});

const io = require("socket.io")(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  client.on("message", (topic, message) => {
    console.log(`Received data from ${topic}: ${message}`);
    if (topic === "ntr18/feeds/bbc-hex") socket.emit("hex", message.toString());
    if (topic === "ntr18/feeds/bbc-hum") socket.emit("hum", message.toString());
    if (topic === "ntr18/feeds/bbc-temp") socket.emit("temp", message.toString());
    if (topic === "ntr18/feeds/bbc-ass") socket.emit("ass", message.toString());
  });

  socket.on("light-on", (data) => {
    console.log(data);
    client.publish(`${AIO_USERNAME}/feeds/${feedNameLed}`, data ? "1" : "0");
  });

  socket.on("fan", (data) => {
    console.log(data);
    client.publish(`${AIO_USERNAME}/feeds/${feedNameFan}`, data.toString());
  });

  socket.on("rgb", (data) => {
    console.log(data);
    client.publish(`${AIO_USERNAME}/feeds/${feedNameRgb}`, data === "Green" ? "#00ff00" : data === "Red" ? "#FF0000" : "#0084FF");
  });
});

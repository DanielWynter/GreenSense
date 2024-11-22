const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");

const app = express();
const PORT = 5173;

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos simulada
let users = [];
let plants = [];
let wateringStatus = "OFF";
let temp = 0;
let humidity = 0;

// Conexión al broker MQTT
const mqttClient = mqtt.connect("mqtt://broker.hivemq.com:1883");

mqttClient.on("connect", () => {
  console.log("Conectado al broker MQTT");
  mqttClient.subscribe("sensor/temperatura");
  mqttClient.subscribe("sensor/humedad");
  mqttClient.subscribe("estado/riego");
});

mqttClient.on("message", (topic, message) => {
  if (topic === "sensor/temperatura") {
    temp = parseFloat(message.toString());
  } else if (topic === "sensor/humedad") {
    humidity = parseFloat(message.toString());
  } else if (topic === "estado/riego") {
    wateringStatus = message.toString();
  }
});

// Rutas de usuario
app.post("/api/register", (req, res) => { const { nombre, correo, contraseña } = req.body; if (users.some(user => user.correo === correo)) { return res.status(400).json({ message: "El correo ya está registrado" }); } const user = { nombre, correo, contraseña }; users.push(user); res.status(201).json({ message: "Usuario registrado exitosamente", user }); // Incluye el usuario en la respuesta });
});

app.post("/api/login", (req, res) => {
  const { correo, contraseña } = req.body;
  const user = users.find(user => user.correo === correo && user.contraseña === contraseña);
  if (user) {
    res.json({ message: "Inicio de sesión exitoso", user });
  } else {
    res.status(401).json({ message: "Correo o contraseña incorrectos" });
  }
});

// Rutas de plantas
app.get("/api/plants", (req, res) => {
  res.json(plants);
});

app.post("/api/plants", (req, res) => {
  const { name, image } = req.body;
  const newPlant = { name, image };
  plants.push(newPlant);
  res.status(201).json({ message: "Planta agregada exitosamente", newPlant });
});

// Rutas de monitoreo
app.get("/api/monitoring", (req, res) => {
  res.json({
    temp,
    humidity,
    wateringStatus,
  });
});

app.post("/api/watering", (req, res) => {
  const { status } = req.body;
  if (status === "ON" || status === "OFF") {
    mqttClient.publish("home/watering/control", status);
    wateringStatus = status;
    res.json({ message: `Riego ${status === "ON" ? "activado" : "desactivado"}` });
  } else {
    res.status(400).json({ message: "Estado inválido, debe ser 'ON' o 'OFF'" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

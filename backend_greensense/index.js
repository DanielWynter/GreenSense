const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const mysql = require("mysql"); // Cambiado a mysql2
const app = express();
const PORT = 3001;

// Conexión a la base de datos MariaDB
const db = mysql.createPool({
  host: "192.168.1.78", // IP de tu Raspberry Pi
  user: "root", // Usuario de tu base de datos
  password: "", // Contraseña de tu base de datos
  database: "app_plantas", // Nombre de tu base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Conexión al broker MQTT
const mqttClient = mqtt.connect("mqtt://broker.hivemq.com:1883");

mqttClient.on("connect", () => {
  console.log("Conectado al broker MQTT");
  mqttClient.subscribe("sensor/temperatura");
  mqttClient.subscribe("sensor/humedad");
  mqttClient.subscribe("estado/riego");
});

let temp = 0;
let humidity = 0;
let wateringStatus = "OFF";

mqttClient.on("message", (topic, message) => {
  if (topic === "sensor/temperatura") {
    temp = parseFloat(message.toString());
  } else if (topic === "sensor/humedad") {
    humidity = parseFloat(message.toString());
  } else if (topic === "estado/riego") {
    wateringStatus = message.toString();
  }
});

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Backend para monitoreo de plantas está funcionando.");
});

// Rutas de usuarios
app.post("/api/register", (req, res) => {
  const { nombre_usuario, correo, contraseña } = req.body;

  const query = "INSERT INTO usuarios (nombre_usuario, correo, contraseña) VALUES (?, ?, ?)";
  db.query(query, [nombre_usuario, correo, contraseña], (err, result) => {
    if (err) {
      console.error("Error al registrar usuario:", err);
      return res.status(500).json({ message: "Error al registrar usuario" });
    }
    const newUserQuery = "SELECT * FROM usuarios WHERE correo = ?";
    db.query(newUserQuery, [correo], (err, results) => {
      if (err) {
        console.error("Error al recuperar usuario registrado:", err);
        return res.status(500).json({ message: "Error al recuperar usuario registrado" });
      }
      res.status(201).json({ message: "Usuario registrado exitosamente", user: results[0] });
    });
  });
});

app.post("/api/login", (req, res) => {
  const { correo, contraseña } = req.body;

  const query = "SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?";
  db.query(query, [correo, contraseña], (err, results) => {
    if (err) {
      console.error("Error al iniciar sesión:", err);
      return res.status(500).json({ message: "Error al iniciar sesión" });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }
    res.json({ message: "Inicio de sesión exitoso", user: results[0] });
  });
});

// Rutas de plantas
app.get("/api/plants/:id_usuario", (req, res) => {
  const { id_usuario } = req.params;

  const query = "SELECT * FROM plants WHERE id_usuario = ?";
  db.query(query, [id_usuario], (err, results) => {
    if (err) {
      console.error("Error al obtener plantas:", err);
      return res.status(500).json({ message: "Error al obtener plantas" });
    }
    res.json(results);
  });
});

app.post("/api/plants", (req, res) => {
  const { id_usuario, nombre, foto, temp_min, temp_max, humedad_min, humedad_max } = req.body;

  // Validación de datos
  if (
    !id_usuario ||
    !nombre ||
    typeof temp_min !== "number" ||
    typeof temp_max !== "number" ||
    typeof humedad_min !== "number" ||
    typeof humedad_max !== "number"
  ) {
    return res.status(400).json({ message: "Todos los campos son obligatorios y deben tener el formato correcto" });
  }

  const checkUserQuery = "SELECT id FROM usuarios WHERE id = ?";
  db.query(checkUserQuery, [id_usuario], (err, results) => {
    if (err) {
      console.error("Error al verificar usuario:", err);
      return res.status(500).json({ message: "Error al verificar usuario" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const query = `
      INSERT INTO plants (id_usuario, nombre, foto, temp_min, temp_max, humedad_min, humedad_max)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [id_usuario, nombre, foto || null, temp_min, temp_max, humedad_min, humedad_max];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error al agregar planta:", err);
        return res.status(500).json({ message: "Error al agregar planta" });
      }
      res.status(201).json({
        message: "Planta agregada exitosamente",
        newPlant: {
          id: result.insertId,
          id_usuario,
          nombre,
          foto,
          temp_min,
          temp_max,
          humedad_min,
          humedad_max,
        },
      });
    });
  });
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

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("¡Ocurrió un error en el servidor!");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

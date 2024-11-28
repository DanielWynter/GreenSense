const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const mysql = require("mysql");
const app = express();
const PORT = 3001;

// Conexión a la base de datos MariaDB
const db = mysql.createConnection({
  host: "10.43.100.149", // IP de tu Raspberry Pi
  user: "root", // Usuario de tu base de datos
  password: "", // Contraseña de tu base de datos
  database: "app_plantas", // Nombre de tu base de datos
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err);
    process.exit(1);
  }
  console.log("Conexión exitosa a la base de datos MariaDB");
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
  mqttClient.subscribe("home/camera/equipo1/feed"); // Suscripción al tópico de la cámara
});

let cameraFeed = null; // Variable para almacenar la imagen
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
  } else if (topic === "home/camera/equipo1/feed") {
    cameraFeed = message.toString(); // Guardar el mensaje recibido (Base64)
    console.log("Imagen recibida de la cámara.");
  }
});

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Backend para monitoreo de plantas está funcionando.");
});

// Rutas de usuarios
app.post("/api/register", (req, res) => {
  const { nombre_usuario, correo, contraseña } = req.body;

  const query =
    "INSERT INTO usuarios (nombre_usuario, correo, contraseña) VALUES (?, ?, ?)";
  db.query(query, [nombre_usuario, correo, contraseña], (err, result) => {
    if (err) {
      console.error("Error al registrar usuario:", err);
      return res.status(500).json({ message: "Error al registrar usuario" });
    }
    const newUserQuery = "SELECT * FROM usuarios WHERE correo = ?";
    db.query(newUserQuery, [correo], (err, results) => {
      if (err) {
        console.error("Error al recuperar usuario registrado:", err);
        return res
          .status(500)
          .json({ message: "Error al recuperar usuario registrado" });
      }
      res
        .status(201)
        .json({ message: "Usuario registrado exitosamente", user: results[0] });
    });
  });
});

app.post("/api/login", (req, res) => {
  const { correo, contraseña } = req.body;

  const query =
    "SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?";
  db.query(query, [correo, contraseña], (err, results) => {
    if (err) {
      console.error("Error al iniciar sesión:", err);
      return res.status(500).json({ message: "Error al iniciar sesión" });
    }
    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos" });
    }
    res.json({ message: "Inicio de sesión exitoso", user: results[0] });
  });
});

// Rutas de plantas
app.get("/api/plants", (req, res) => {
  const query = "SELECT * FROM plants";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener plantas:", err);
      return res.status(500).json({ message: "Error al obtener plantas" });
    }
    res.json(results);
  });
});

app.post("/api/plants", (req, res) => {
  const { id_usuario, nombre, foto, temp_min, temp_max, humedad_min, humedad_max } =
    req.body;

  // Validación de datos
  if (
    !id_usuario ||
    !nombre ||
    isNaN(temp_min) ||
    isNaN(temp_max) ||
    isNaN(humedad_min) ||
    isNaN(humedad_max)
  ) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios y deben ser válidos.",
    });
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
    res.json({
      message: `Riego ${status === "ON" ? "activado" : "desactivado"}`,
    });
  } else {
    res.status(400).json({ message: "Estado inválido, debe ser 'ON' o 'OFF'" });
  }
});

// Ruta para obtener la imagen de la cámara
app.get("/api/camera", (req, res) => {
  if (cameraFeed) {
    res.send({ image: cameraFeed }); // Enviar la imagen en Base64
  } else {
    res.status(404).json({ message: "No hay imagen disponible" });
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

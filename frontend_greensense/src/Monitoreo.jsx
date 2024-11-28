import React, { useState, useEffect } from "react";
import mqtt from "mqtt"; // Importar MQTT para recibir las imágenes
import "./Monitoreo.css";

function Monitoreo() {
  const [temp, setTemp] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [isWateringActive, setIsWateringActive] = useState(false);
  const [cameraFeed, setCameraFeed] = useState(null); // Para almacenar la imagen de la cámara

  // Conectar a MQTT
  const client = mqtt.connect("ws://10.43.100.149:9001"); // Dirección de tu broker MQTT

  useEffect(() => {
    // Conectar al broker MQTT y suscribirse al feed de la cámara
    client.on("connect", () => {
      console.log("Conectado al broker MQTT");
      client.subscribe("home/camera/equipo1/feed", (err) => {
        if (err) {
          console.error("Error al suscribirse al feed de la cámara", err);
        } else {
          console.log("Suscrito al feed de la cámara");
        }
      });
    });

    // Manejar los mensajes recibidos en el feed de la cámara
    client.on("message", (topic, message) => {
      console.log("Mensaje recibido:", message.toString()); // Log para depuración
      if (topic === "home/camera/equipo1/feed") {
        console.log("Imagen recibida:", message.toString()); // Log para verificar la imagen recibida
        setCameraFeed("data:image/jpeg;base64," + message.toString()); // Mostrar imagen
      }
    });

    // Manejar errores y reconexiones
    client.on("error", (err) => {
      console.error("Error de conexión MQTT:", err);
    });

    client.on("reconnect", () => {
      console.log("Reconectando al broker MQTT...");
    });

    // Limpiar la conexión MQTT cuando el componente se desmonte
    return () => {
      client.end();
    };
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/monitoring");
      if (response.ok) {
        const data = await response.json();
        setTemp(data.temp);
        setHumidity(data.humidity);
        setIsWateringActive(data.wateringStatus === "ON");
      }
    } catch (error) {
      console.error("Error al obtener datos de monitoreo:", error);
    }
  };

  const toggleWatering = async () => {
    const newStatus = isWateringActive ? "OFF" : "ON";
    try {
      const response = await fetch("http://localhost:3001/api/watering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        setIsWateringActive(newStatus === "ON");
      }
    } catch (error) {
      console.error("Error al cambiar el estado del riego:", error);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  return (
    <div className="monitoreo">
      <h1>Monitoreo de Plantas</h1>

      {/* Mostrar datos de sensores */}
      <div className="sensor-data">
        <p>Temperatura: {temp}°C</p>
        <p>Humedad: {humidity}%</p>
      </div>

      {/* Mostrar el feed de la cámara */}
      <div className="camera-section">
        {cameraFeed ? (
          <div className="camera-feed">
            <img src={cameraFeed} alt="Cámara en vivo" />
          </div>
        ) : (
          <p>Esperando feed de la cámara...</p>
        )}
      </div>

      {/* Botón de riego */}
      <button
        onClick={toggleWatering}
        className={`irrigation-btn ${isWateringActive ? "on" : "off"}`}
      >
        {isWateringActive ? "Desactivar Riego" : "Activar Riego"}
      </button>
    </div>
  );
}

export default Monitoreo;

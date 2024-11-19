import React, { useState, useEffect } from "react";
import "./Monitoreo.css";

function Monitoreo({ client }) {
  const [isCameraConnected, setIsCameraConnected] = useState(false);
  const [temp, setTemp] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [isWateringActive, setIsWateringActive] = useState(false);

  // Función para publicar mensaje en MQTT
  const mqttPublish = (topic, message) => {
    if (client && client.connected) {
      client.publish(topic, message, { qos: 1 }, (error) => {
        if (error) console.error("Error al publicar:", error);
      });
    }
  };

  // Suscribirse a los datos de los sensores
  useEffect(() => {
    if (client) {
      client.subscribe("sensor/temperatura");
      client.subscribe("sensor/humedad");

      client.on("message", (topic, message) => {
        if (topic === "sensor/temperatura") {
          setTemp(parseFloat(message.toString()));
        } else if (topic === "sensor/humedad") {
          setHumidity(parseFloat(message.toString()));
        } else if (topic === "estado/riego") {
          setIsWateringActive(message.toString() === "ON");
        }
      });
    }
  }, [client]);

  // Función para alternar el riego
  const toggleWatering = () => {
    const newStatus = isWateringActive ? "OFF" : "ON";
    mqttPublish("home/watering/control", newStatus);
    setIsWateringActive(!isWateringActive);
  };

  return (
    <div className="monitoreo">
      <h1>Monitoreo de Plantas</h1>
      <div className="camera-section">
        {isCameraConnected ? (
          <div className="camera-feed">
            <p>Conectado a la cámara</p>
            <img src="https://via.placeholder.com/400x300" alt="Monitoreo" />
          </div>
        ) : (
          <button onClick={() => setIsCameraConnected(true)}>
            Conectar Cámara
          </button>
        )}
      </div>
      <div className="sensor-data">
        <p>Temperatura: {temp}°C</p>
        <p>Humedad: {humidity}%</p>
      </div>
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

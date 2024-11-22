import React, { useState, useEffect } from "react";
import "./Monitoreo.css";

function Monitoreo() {
  const [temp, setTemp] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [isWateringActive, setIsWateringActive] = useState(false);

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

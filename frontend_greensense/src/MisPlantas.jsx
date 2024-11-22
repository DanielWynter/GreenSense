//MIsPlantas.jsx
import React, { useState } from "react";
import "./MisPlantas.css";

function MisPlantas({ plants, addPlant }) {
  const [nombrePlanta, setNombrePlanta] = useState("");
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");
  const [humedadMin, setHumedadMin] = useState("");
  const [humedadMax, setHumedadMax] = useState("");
  const [foto, setFoto] = useState("");

  const handleAgregarPlanta = (e) => {
    e.preventDefault();
    const nuevaPlanta = {
      nombrePlanta,
      tempMin,
      tempMax,
      humedadMin,
      humedadMax,
      foto,
    };
    addPlant(nuevaPlanta);
    setNombrePlanta("");
    setTempMin("");
    setTempMax("");
    setHumedadMin("");
    setHumedadMax("");
    setFoto("");
  };

  return (
    <div className="mis-plantas">
      <h1>Mis Plantas</h1>
      <form onSubmit={handleAgregarPlanta} className="plant-form">
        <input
          type="text"
          placeholder="Nombre de la Planta"
          value={nombrePlanta}
          onChange={(e) => setNombrePlanta(e.target.value)}
        />
        <input
          type="number"
          placeholder="Temperatura Mínima"
          value={tempMin}
          onChange={(e) => setTempMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Temperatura Máxima"
          value={tempMax}
          onChange={(e) => setTempMax(e.target.value)}
        />
        <input
          type="number"
          placeholder="Humedad Mínima"
          value={humedadMin}
          onChange={(e) => setHumedadMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Humedad Máxima"
          value={humedadMax}
          onChange={(e) => setHumedadMax(e.target.value)}
        />
        <input
          type="text"
          placeholder="URL de la Foto de la Planta"
          value={foto}
          onChange={(e) => setFoto(e.target.value)}
        />
        <button type="submit">Agregar Planta</button>
      </form>

      <div className="plant-list">
        {plants.map((planta, index) => (
          <div key={index} className="plant-item">
            <h2>{planta.nombrePlanta}</h2>
            <img
              src={planta.foto}
              alt={planta.nombrePlanta}
              style={{ borderRadius: "50%", width: "50px", height: "50px" }} // Circular
            />
            <p>
              Temperatura: {planta.tempMin}°C - {planta.tempMax}°C
            </p>
            <p>
              Humedad: {planta.humedadMin}% - {planta.humedadMax}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisPlantas;

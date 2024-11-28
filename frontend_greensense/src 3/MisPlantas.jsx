import React, { useState } from "react";
import "./MisPlantas.css";

function MisPlantas({ addPlant }) {
  const [nombrePlanta, setNombrePlanta] = useState("");
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");
  const [humedadMin, setHumedadMin] = useState("");
  const [humedadMax, setHumedadMax] = useState("");
  const [foto, setFoto] = useState("");

  const handleAgregarPlanta = (e) => {
    e.preventDefault();

    if (!nombrePlanta || !tempMin || !tempMax || !humedadMin || !humedadMax) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const nuevaPlanta = {
      nombre: nombrePlanta,
      temp_min: parseFloat(tempMin),
      temp_max: parseFloat(tempMax),
      humedad_min: parseFloat(humedadMin),
      humedad_max: parseFloat(humedadMax),
      foto: foto || null, // Si no se proporciona foto, se envía como null
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
    </div>
  );
}

export default MisPlantas;

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
      id_usuario: 1, // Cambia este valor según el usuario autenticado
      nombre: nombrePlanta,
      temp_min: tempMin,
      temp_max: tempMax,
      humedad_min: humedadMin,
      humedad_max: humedadMax,
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

      {/* Formulario para agregar una nueva planta */}
      <form onSubmit={handleAgregarPlanta} className="plant-form">
        <input
          type="text"
          placeholder="Nombre de la Planta"
          value={nombrePlanta}
          onChange={(e) => setNombrePlanta(e.target.value)}
        />
        <input
          type="number"
          placeholder="Temperatura Mínima (°C)"
          value={tempMin}
          onChange={(e) => setTempMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Temperatura Máxima (°C)"
          value={tempMax}
          onChange={(e) => setTempMax(e.target.value)}
        />
        <input
          type="number"
          placeholder="Humedad Mínima (%)"
          value={humedadMin}
          onChange={(e) => setHumedadMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Humedad Máxima (%)"
          value={humedadMax}
          onChange={(e) => setHumedadMax(e.target.value)}
        />
        <input
          type="text"
          placeholder="URL de la Foto"
          value={foto}
          onChange={(e) => setFoto(e.target.value)}
        />
        <button type="submit">Agregar Planta</button>
      </form>

      {/* Lista de plantas */}
      <div className="plantas-list">
        {plants.map((planta, index) => (
          <div key={index} className="planta">
            <img src={planta.foto} alt={planta.nombre} />
            <h2>{planta.nombre}</h2>
            <p>
              <strong>Temperatura:</strong> {planta.temp_min}°C -{" "}
              {planta.temp_max}°C
            </p>
            <p>
              <strong>Humedad:</strong> {planta.humedad_min}% -{" "}
              {planta.humedad_max}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisPlantas;

import React from "react";
import "./Home.css";

function Home({
  user,
  handleLogout,
  plants,
  addPlant,
  profilePic,
  setProfilePic,
}) {
  return (
    <div className="home-container">
      <h1>Bienvenido, {user.nombre}</h1>
      <button onClick={handleLogout}>Cerrar Sesión</button>
      <div className="profile-section">
        <h2>Perfil</h2>
        <img
          src={profilePic || "/default-profile.png"}
          alt="Perfil"
          className="profile-picture"
        />
        <p>Correo: {user.correo}</p>
      </div>
      <div className="plants-section">
        <h2>Tus Plantas</h2>
        {plants.length > 0 ? (
          plants.map((plant, index) => (
            <div key={index} className="plant-card">
              <img src={plant.image} alt={plant.name} />
              <p>{plant.name}</p>
            </div>
          ))
        ) : (
          <p>No tienes plantas registradas</p>
        )}
        <button
          onClick={() =>
            addPlant({ name: "Nueva Planta", image: "/plant.png" })
          }
        >
          Agregar Planta
        </button>
      </div>
    </div>
  );
}

export default Home;

import React from "react";
import "./Inicio_Temp.css";

function Inicio({ user, handleLogout, profilePic, setProfilePic }) {
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="inicio">
      <h1>Bienvenid@, {user.nombre}</h1>
      <div className="profile-section">
        <img
          src={profilePic || "https://via.placeholder.com/150"}
          alt="Foto de Perfil"
          className="profile-pic"
        />
        <label htmlFor="profilePicInput" className="profile-pic-btn">
          Seleccionar Foto de Perfil
        </label>
        <input
          id="profilePicInput"
          type="file"
          accept="image/*"
          onChange={handleProfilePicChange}
          style={{ display: "none" }}
        />
      </div>
      <div className="user-info">
        <p>
          <strong>Correo:</strong> {user.correo}
        </p>
        <p>
          <strong>Contraseña:</strong> {user.contraseña.replace(/./g, "*")}
        </p>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
}

export default Inicio;

//Formulario.jsx
import "./Formulario.css";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

export function Formulario({ onRegister, onLogin }) {
  const [step, setStep] = useState(1); // Paso del formulario
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (correo === "" || contraseña === "") {
      setError(true);
      return;
    }
    setError(false);
    setStep(2); // Ir al paso de elegir el nombre de usuario
  };

  const handleUserNameSubmit = (e) => {
    e.preventDefault();
    if (nombreUsuario === "") {
      setError(true);
      return;
    }
    setError(false);
    onRegister({ correo, contraseña, nombre_usuario: nombreUsuario });
  };

  const handleGoogleLogin = () => {
    alert("Iniciar sesión con Google (Función simulada)");
  };

  return (
    <section className="formulario">
      <div className="header">GreenSense</div>
      <h1>{step === 1 ? "Iniciar Sesión" : "Elige tu nombre de usuario"}</h1>

      {step === 1 ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />
          <button type="submit">Continuar</button>
        </form>
      ) : (
        <form onSubmit={handleUserNameSubmit}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
          />
          <button type="submit">Finalizar Registro</button>
        </form>
      )}

      {error && (
        <p style={{ color: "red" }}>Todos los campos son obligatorios</p>
      )}

      <p>
        <a href="#">¿Es tu primera vez? Regístrate</a> |{" "}
        <a href="#">¿Olvidaste tu contraseña?</a>
      </p>
      {step === 1 && (
        <button className="google" onClick={handleGoogleLogin}>
          <FaGoogle /> Iniciar sesión con Google
        </button>
      )}
    </section>
  );
}

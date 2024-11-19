import React, { useEffect, useState } from "react";
import { Formulario } from "./Formulario";
import Inicio from "./Inicio";
import MisPlantas from "./MisPlantas";
import Monitoreo from "./Monitoreo";
import SplashScreen from "./SplashScreen"; // Pantalla de carga inicial
import NavBar from "./NavBar"; // Barra de navegación horizontal
import "./App.css";

// URL del servidor WebSocket
const WS_SERVER = "wss://broker.hivemq.com:8083";

function App() {
  const [registeredUser, setRegisteredUser] = useState(null);
  const [user, setUser] = useState(null);
  const [plants, setPlants] = useState([]);
  const [profilePic, setProfilePic] = useState("");
  const [wateringStatus, setWateringStatus] = useState("desconocido");
  const [isWateringActive, setIsWateringActive] = useState(false);
  const [socket, setSocket] = useState(null);
  const [selectedPage, setSelectedPage] = useState("inicio"); // Página seleccionada
  const [showSplash, setShowSplash] = useState(true); // Control de la Splash Screen

  // Función para registrar un nuevo usuario
  const handleRegister = (userData) => {
    setRegisteredUser(userData);
    setUser(userData);
  };

  // Función para iniciar sesión
  const handleLogin = (userData) => {
    if (
      registeredUser &&
      userData.correo === registeredUser.correo &&
      userData.contraseña === registeredUser.contraseña
    ) {
      setUser(userData);
    } else {
      alert("Correo o contraseña incorrectos");
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setUser(null);
    setPlants([]);
  };

  // Función para agregar plantas
  const addPlant = (plantData) => {
    setPlants([...plants, plantData]);
  };

  // Función para enviar mensajes por WebSocket
  async function sendMessage(topic, message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        const messageObj = { topic, message };
        socket.send(JSON.stringify(messageObj));
        console.log(`Mensaje enviado a ${topic}:`, message);
      } catch (err) {
        console.error("Error al enviar mensaje:", err);
      }
    } else {
      console.log("El WebSocket no está conectado.");
    }
  }

  useEffect(() => {
    // Mostrar Splash Screen durante 2 segundos
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    // Establecer la conexión WebSocket
    const webSocket = new WebSocket(WS_SERVER);
    setSocket(webSocket);

    webSocket.onopen = () => {
      console.log("Conectado al servidor WebSocket");
    };

    webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.topic === "estado/riego") {
        setWateringStatus(message.message);
        setIsWateringActive(message.message === "ON");
      }
    };

    webSocket.onerror = (error) => {
      console.error("Error de conexión WebSocket:", error);
    };

    webSocket.onclose = () => {
      console.log("Conexión WebSocket cerrada");
    };

    return () => {
      if (webSocket) {
        webSocket.close();
      }
      clearTimeout(splashTimeout);
    };
  }, []);

  const toggleWatering = async () => {
    const newStatus = isWateringActive ? "OFF" : "ON";
    setIsWateringActive(!isWateringActive);

    // Enviar el nuevo estado de riego
    await sendMessage("home/watering/control", newStatus);
  };

  const renderPage = () => {
    switch (selectedPage) {
      case "inicio":
        return (
          <Inicio
            user={user}
            handleLogout={handleLogout}
            profilePic={profilePic}
            setProfilePic={setProfilePic}
          />
        );
      case "mis-plantas":
        return <MisPlantas plants={plants} addPlant={addPlant} />;
      case "monitoreo":
        return (
          <Monitoreo
            wateringStatus={wateringStatus}
            toggleWatering={toggleWatering}
          />
        );
      default:
        return <Inicio />;
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="App">
      {user ? (
        <>
          {renderPage()}
          <NavBar selected={selectedPage} onNavigate={setSelectedPage} />
        </>
      ) : (
        <Formulario onRegister={handleRegister} onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

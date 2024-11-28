import React, { useEffect, useState } from "react";
import { Formulario } from "./Formulario";
import Inicio from "./Inicio";
import MisPlantas from "./MisPlantas";
import Monitoreo from "./Monitoreo";
import SplashScreen from "./SplashScreen"; // Pantalla de carga inicial
import NavBar from "./NavBar"; // Barra de navegación horizontal
import "./App.css";

function App() {
  const [registeredUser, setRegisteredUser] = useState(null);
  const [user, setUser] = useState(null);
  const [plants, setPlants] = useState([]);
  const [profilePic, setProfilePic] = useState("");
  const [wateringStatus, setWateringStatus] = useState("desconocido");
  const [isWateringActive, setIsWateringActive] = useState(false);
  const [selectedPage, setSelectedPage] = useState("inicio"); // Página seleccionada
  const [showSplash, setShowSplash] = useState(true); // Control de la Splash Screen
  const [cameraFeed, setCameraFeed] = useState(null);

  // Función para registrar un nuevo usuario
  const handleRegister = async (userData) => {
    try {
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const data = await response.json();
        setRegisteredUser(data.user);
        setUser(data.user);
        setSelectedPage("inicio");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (err) {
      console.error("Error al registrar:", err);
    }
  };

  // Función para iniciar sesión
  const handleLogin = async (userData) => {
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        alert("Correo o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setUser(null);
    setPlants([]);
  };

  // Función para obtener plantas
  const fetchPlants = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/plants/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPlants(data);
      }
    } catch (err) {
      console.error("Error al obtener plantas:", err);
    }
  };

  // Función para agregar plantas
  const addPlant = async (plantData) => {
    try {
      const plantWithUser = { ...plantData, id_usuario: user.id };
      const response = await fetch("http://localhost:3001/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plantWithUser),
      });
      if (response.ok) {
        const data = await response.json();
        setPlants((prevPlants) => [...prevPlants, data.newPlant]);
      }
    } catch (err) {
      console.error("Error al agregar planta:", err);
    }
  };

  const fetchCameraFeed = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/camera");
      if (response.ok) {
        const data = await response.json();
        setCameraFeed(`data:image/jpeg;base64,${data.image}`);
      }
    } catch (err) {
      console.error("Error al obtener el feed de la cámara:", err);
    }
  };
  

  useEffect(() => {
    // Mostrar Splash Screen durante 2 segundos
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    if (user) {
      fetchPlants();
      fetchCameraFeed();
    }

    return () => clearTimeout(splashTimeout);
  }, [user]);

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
        return <Monitoreo cameraFeed={cameraFeed} />; // Pasar cameraFeed
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

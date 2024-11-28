import React from "react";
import "./NavBar.css";

function NavBar({ selected, onNavigate }) {
  return (
    <nav className="nav-bar">
      <button
        className={selected === "inicio" ? "active" : ""}
        onClick={() => onNavigate("inicio")}
      >
        Inicio
      </button>
      <button
        className={selected === "mis-plantas" ? "active" : ""}
        onClick={() => onNavigate("mis-plantas")}
      >
        Mis Plantas
      </button>
      <button
        className={selected === "monitoreo" ? "active" : ""}
        onClick={() => onNavigate("monitoreo")}
      >
        Monitoreo
      </button>
    </nav>
  );
}

export default NavBar;

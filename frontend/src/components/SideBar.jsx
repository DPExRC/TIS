import {
  Home,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Footprints,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import React from "react";

const SidebarItem = ({ icon, label, onClick, children, hoverClass = "hover:bg-blue-600 hover:text-white" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (children) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-md 
          cursor-pointer transition-colors select-none text-gray-900 font-semibold
          ${hoverClass} ${isOpen ? "bg-blue-600 text-white shadow-md" : ""}
        `}
        aria-expanded={isOpen}
        role={children ? "button" : "menuitem"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="flex items-center gap-5">
          <div className="w-5 h-5 text-current">{icon}</div>
          <span className="text-sm">{label}</span>
        </div>
        {children && (
          <span
            className={`inline-block transform transition-transform duration-300 ease-in-out
            ${isOpen ? "rotate-180" : "rotate-90"}`}
            aria-hidden="true"
          >
            ▶
          </span>
        )}
      </div>
      {children && isOpen && (
        <ul className="ml-10 mt-2 text-sm text-gray-700">
          {React.Children.map(children, (child, idx) =>
            React.cloneElement(child, {
              className:
                "block rounded-md px-3 py-2 hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors font-normal border-b border-gray-300 last:border-0",
              key: idx,
              tabIndex: 0,
              role: "menuitem",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  child.props.onClick();
                }
              },
            })
          )}
        </ul>
      )}
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <div className="h-screen w-50 bg-white flex flex-col fixed left-0 top-0 shadow-sm">
        <nav className="flex-1 px-4 py-20 space-y-2 overflow-y-auto">
          <SidebarItem
            icon={<Home />}
            label="Inicio"
            onClick={() => navigate("/panel")}
          />

          <SidebarItem icon={<Footprints className="w-5 h-5" />} label="Ganado">
            <li
              onClick={() => navigate("/registroanimales")}
              className="cursor-pointer"
            >
              Registro de animales
            </li>
            <li
              onClick={() => navigate("/conteoypresencia")}
              className="cursor-pointer"
            >
              Conteo y presencia
            </li>
            <li
              onClick={() => navigate("/alertas")}
              className="cursor-pointer"
            >
              Alertas de discrepancia
            </li>
            <li
              onClick={() => navigate("/totalanimales")}
              className="cursor-pointer"
            >
              Total de animales
            </li>
          </SidebarItem>

          <SidebarItem icon={<FileText className="w-5 h-5" />} label="Reportes">
            <li onClick={() => navigate("/reportes")} className="cursor-pointer">
              Generales
            </li>
            <li
              onClick={() => navigate("/reportes/mensuales")}
              className="cursor-pointer"
            >
              Mensuales
            </li>
          </SidebarItem>
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <SidebarItem
            icon={<LogOut />}
            label="Cerrar sesión"
            onClick={() => setShowModal(true)}
            hoverClass="hover:bg-red-600 hover:text-white"
          />
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              ¿Deseas cerrar sesión?
            </h2>
            <p className="text-sm text-gray-600">
              Esta acción te llevará al inicio de sesión.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                Sí, cerrar sesión
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

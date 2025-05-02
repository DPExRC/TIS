// firebase-config.js
import { initializeApp } from "firebase/app";

// Configuración de Firebase (obténla desde tu consola de Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyCOYO-9fKelup8sTkZZALZ_4X0WlwDYS3g",
    authDomain: "tis1-b2cf9.firebaseapp.com",
    projectId: "tis1-b2cf9",
    storageBucket: "tis1-b2cf9.firebasestorage.app",
    messagingSenderId: "320619354217",
    appId: "1:320619354217:web:71ac0f9ea34a20552b6af8",
    measurementId: "G-FF5TKYFXYD"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

export {app};

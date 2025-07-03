// firebase-config.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuración de Firebase (ya la tienes)
const firebaseConfig = {
    apiKey: "AIzaSyCOYO-9fKelup8sTkZZALZ_4X0WlwDYS3g",
    authDomain: "tis1-b2cf9.firebaseapp.com",
    projectId: "tis1-b2cf9",
    storageBucket: "tis1-b2cf9.appspot.com",  // CORRECCIÓN aquí (firebasestorage.app → appspot.com)
    messagingSenderId: "320619354217",
    appId: "1:320619354217:web:71ac0f9ea34a20552b6af8",
    measurementId: "G-FF5TKYFXYD"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Storage y expórtalo
const storage = getStorage(app);

export { app, storage };

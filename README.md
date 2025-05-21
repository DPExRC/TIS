# Sistema de Conteo y Gestión de Ganado

Este proyecto es una aplicación web desarrollada con React + Vite y Tailwind CSS en el frontend, y Django REST Framework con Python, Firestore Database y Firebase Authentication en el backend. Su objetivo principal es permitir a los dueños de granjas llevar un conteo preciso de su ganado por establo, registrar nuevos animales y mantener un historial de los conteos.

## Características Principales

* **Conteo de Ganado por Establo:** Permite registrar la cantidad de ganado presente en cada establo, guardando la hora, fecha y el usuario que realizó el registro.
* **Registro de Animales:** Permite registrar nuevos animales especificando la especie, el tipo de animal y su fecha de nacimiento. El sistema genera automáticamente un código único para cada animal, el cual se almacena en la base de datos.
* **Autenticación de Usuarios:** Utiliza Firebase Authentication para asegurar que solo usuarios autorizados puedan acceder y realizar operaciones en el sistema.
* **Base de Datos en Tiempo Real:** Los datos se almacenan en Firestore, proporcionando una experiencia en tiempo real para la gestión de la información.

## Tecnologías Utilizadas

**Frontend:**

* React - Biblioteca de JavaScript para construir interfaces de usuario.
* Vite - Herramienta de construcción que proporciona una experiencia de desarrollo extremadamente rápida.
* Tailwind CSS - Framework CSS de utilidad-primera para un diseño rápido.

**Backend:**

* Django - Framework web de Python de alto nivel.
* Django REST Framework - Toolkit potente y flexible para construir APIs Web.
* Python - Lenguaje de programación.
* Firebase - Plataforma de desarrollo de Google Cloud, utilizada para:
    * Firestore - Base de datos NoSQL en la nube.
    * Firebase Authentication - Servicio para autenticar usuarios.

**Deployment:**

* Vercel - Plataforma para el despliegue del frontend.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

* Node.js (para el frontend)
* npm o yarn (gestores de paquetes para el frontend)
* Python (para el backend)
* pip (gestor de paquetes para Python)

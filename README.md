# Proyecto Finanzas (Gestor de Finanzas Personales)

## 📌 Descripción General
**Proyecto Finanzas** es una aplicación web full-stack diseñada para ayudar a los usuarios a gestionar eficazmente sus finanzas personales. Proporciona una plataforma segura para registrar ingresos y gastos, visualizar datos financieros a través de gráficos interactivos intuitivos y generar informes detallados. Construida con tecnologías modernas, esta aplicación garantiza una experiencia responsiva, segura y fácil de usar.

## 🚀 Características Clave
* **Autenticación Segura:** Sistema robusto de registro e inicio de sesión de usuarios utilizando JSON Web Tokens (JWT) para una autenticación segura y sin estado. Se implementan guardias de rutas en el frontend para proteger las áreas sensibles.
* **Dashboard Interactivo:** Un panel de control visualmente atractivo que proporciona una vista rápida de tu salud financiera. Cuenta con gráficos dinámicos para visualizar la proporción de ingresos totales frente a gastos, desgloses de gastos por categoría y fuentes de ingresos.
* **Gestión Integral de Transacciones:** Añade, edita, elimina y visualiza transacciones financieras fácilmente. El sistema categoriza automáticamente los movimientos como ingresos o gastos.
* **Exportación de Datos:** Funcionalidad integrada para exportar el historial de transacciones e informes financieros directamente a formato PDF para su conservación o para compartirlos.
* **UI/UX Responsiva:** Una interfaz limpia y responsiva diseñada para funcionar perfectamente en ordenadores de escritorio, tablets y dispositivos móviles, mejorada con elegantes alertas para la retroalimentación del usuario.

## 💻 Tecnologías Utilizadas

### Frontend
* **Framework:** Angular 20
* **Lenguaje:** TypeScript, HTML5, SCSS/CSS
* **Visualización de Datos:** Chart.js, ng2-charts
* **Generación de Documentos:** jsPDF, jsPDF-AutoTable
* **Notificaciones UI:** SweetAlert2
* **Gestión de Estado/Reactividad:** RxJS

### Backend
* **Lenguaje:** PHP
* **Base de Datos:** MySQL
* **Autenticación:** Implementación personalizada de JWT (JSON Web Tokens)
* **Arquitectura API:** Endpoints RESTful

## 📂 Estructura del Proyecto
El repositorio está dividido en dos directorios principales:
* `/frontend-finanzas`: Contiene la aplicación Angular (UI, componentes, servicios, guards de autenticación).
* `/api-finanzas`: Contiene los scripts PHP que sirven como API REST, manejando conexiones a la base de datos, operaciones CRUD y verificación JWT.

## 🛠️ Configuración e Instalación

### Requisitos Previos
* **Node.js** y **npm** (para el frontend)
* **Angular CLI** (`npm install -g @angular/cli`)
* Un entorno de servidor local como **XAMPP**, **WAMP** o **Laragon** (para PHP y MySQL)

### Configuración del Backend (api-finanzas)
1. Navega al directorio `api-finanzas`.
2. Duplica `conexion.example.php` (si existe) o crea un archivo `conexion.php` basado en las credenciales de tu base de datos MySQL local.
3. Importa el esquema de base de datos requerido en tu servidor MySQL (asegúrate de que las tablas de usuarios y transacciones estén creadas).
4. Aloja esta carpeta en tu servidor local (ej. `http://localhost/Proyecto-Finanzas/api-finanzas`).

### Configuración del Frontend (frontend-finanzas)
1. Abre una terminal y navega al directorio `frontend-finanzas`:
   ```bash
   cd frontend-finanzas
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Actualiza el servicio `api.ts` si la URL de tu backend es diferente a la configuración por defecto.
4. Inicia el servidor de desarrollo:
   ```bash
   ng serve
   ```
5. Abre tu navegador y navega a `http://localhost:4200/`.

## 🔒 Medidas de Seguridad
* **Sesiones sin Estado:** Utiliza `sessionStorage` para almacenar JWTs en el lado del cliente, mitigando ciertos riesgos de XSS en comparación con el almacenamiento local.
* **Validación en Backend:** Todos los endpoints sensibles verifican la firma del JWT antes de ejecutar consultas en la base de datos para asegurar que el usuario solo acceda o modifique sus propios datos.
* **Rutas Protegidas:** Los Guards de Rutas de Angular previenen que usuarios no autenticados accedan al dashboard y otras rutas privadas.

## 🤝 Contribución
¡Las contribuciones, problemas y solicitudes de nuevas características son bienvenidos! Siéntete libre de revisar la página de issues si deseas contribuir.

## 📝 Licencia
Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).

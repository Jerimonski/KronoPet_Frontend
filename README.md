# 🐾 Vety - Sistema Clínico Veterinario (Frontend Desktop/Web)

## 📌 Descripción General

Frontend interactivo desarrollado con **React**, **Vite** y **Tailwind CSS** para la plataforma de escritorio y gestión clínica de uso profesional exclusivo del **Médico Veterinario**.

El sistema administra la atención médica en un entorno cerrado integrado con el backend en NestJS (puerto `3001`). Permite el flujo continuo desde la landing page pública hasta el inicio de sesión y el registro de eventos médicos inmutables.

---

## 📂 Arquitectura de Directorios y Carpetas (`src/`)

A continuación se detalla la responsabilidad y el contenido de cada carpeta del proyecto:

### ⚙️ `src/config/`

* Contiene los archivos de configuración global de la aplicación.
* **Uso:** Variables de entorno centralizadas (`env.config.js`) e integración de temas visuales o modo oscuro (`theme.config.js`).

### 🧠 `src/core/` (Núcleo Compartido)

Contiene la lógica transversal y no ligada a un módulo específico:

* **`core/api/`**: Instancia centralizada de cliente Axios o Fetch (`api.client.js`) con interceptores para enviar el token JWT en las peticiones. Definición de rutas y endpoints (`endpoints.js`).
* **`core/utils/`**: Funciones auxiliares puras como validadores de formularios (RUT, formato de números) y formateadores de fechas ISO.
* **`core/hooks/`**: Custom Hooks reutilizables para llamadas a la API o gestión de estados de carga (`useFetch.js`).

### 📦 `src/features/` (Módulos de Negocio)

Estructura modular dividida por características (Feature-First):

1. **`features/landing/`**
   * **`pages/LandingPage.jsx`**: Home o página web comercial pública de Vety.
   * **`components/`**: Componentes específicos de la web comercial como `Navbar.jsx` (con botón de acceso al login), `Hero.jsx` y tarjetas informativas.
2. **`features/auth/`**
   * **`pages/LoginPage.jsx`**: Vista principal del portal de acceso.
   * **`components/LoginForm.jsx`**: Formulario de credenciales (email y contraseña).
   * **`context/AuthContext.jsx`**: Estado global de la sesión, manejo del token JWT de NestJS y funciones de login/logout.
3. **`features/dashboard/`**
   * **`pages/DashboardPage.jsx`**: Pantalla principal post-login del veterinario.
   * **`components/`**: `Sidebar.jsx` (menú lateral), `Header.jsx` (perfil del médico y botón de cierre de sesión) y `MetricsGrid.jsx` (tarjetas con resúmenes del día).
4. **`features/medical-events/`**
   * **`pages/NewConsultationPage.jsx`**: Vista para registrar atenciones de salud.
   * **`components/`**: Formulario de registro clínico (`ConsultationForm.jsx`) y el menú cerrado/readonly para categorías de consulta (`ReasonSelect.jsx`).
5. **`features/pets/`**
   * **`pages/RegisterPatientPage.jsx`**: Pantalla para enrolamiento de pacientes.
   * **`components/`**: Formulario de registro para tutores/dueños (`TutorForm.jsx`) y para asociar mascotas (`PetForm.jsx`).
6. **`features/history/`**
   * **`pages/ClinicalHistoryPage.jsx`**: Vista de la ficha médica y búsquedas.
   * **`components/`**: Buscador por paciente/dueño (`PatientSearch.jsx`) y la línea de tiempo médica (`Timeline.jsx`).

### 🎨 `src/shared/` (Recursos Reutilizables de UI)

* **`shared/components/`**: Componentes de UI atómicos como botones estilizados (`Button.jsx`), inputs (`Input.jsx`), modales (`Modal.jsx`) y el panel simulador de API (`ApiDebugger.jsx`).
* **`shared/layouts/`**: Envoltorios de diseño base como `MainLayout.jsx` que estructura la navegación del Dashboard (Sidebar + Header + Contenido).

---

## 🛠️ Especificación de Endpoints (Backend NestJS - Puerto 3001)

### 1. Autenticación (`/api/v1/auth`)

* `POST /auth/login` → Envía `{ email, password }` y recibe el token JWT de acceso.

### 2. Pacientes y Tutores (`/api/v1`)

* `POST /users` → Registra los datos del tutor (nombre, email, teléfono, RUT).
* `POST /pets` → Asocia una mascota al ID del tutor.
* `GET /pets` → Obtiene el listado de pacientes registrados para los selectores de la app.

### 3. Registro de Atenciones Clínicas (`/api/v1/medical-events`)

* `POST /medical-events` → Registra el evento médico. El campo `reason` debe restringirse a un listado cerrado:
  * *"Consulta General"*
  * *"Control Sano y Rutina"*
  * *"Urgencia / Emergencia"*
  * *"Procedimiento Quirúrgico"*
  * *"Examen de Laboratorio"*
  * *"Desparasitación"*
* `GET /medical-events/pet/:petId` → Obtiene la línea de tiempo de atenciones de una mascota.

---

## 💻 Comandos de Inicialización

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

# 🐾 KronoPet - Sistema Clínico Veterinario (Frontend Desktop/Web)

## 📌 Descripción General

Frontend interactivo desarrollado con **React**, **Vite** y **Tailwind CSS** para una plataforma de escritorio y gestión clínica de uso profesional exclusivo del **Médico Veterinario**.

El sistema administra la atención médica en un entorno cerrado integrado con un backend NestJS bajo el prefijo `/api/v1` y el puerto `3001`. El flujo contempla la landing page pública, el inicio de sesión con JWT, la gestión de pacientes y el registro de eventos médicos inmutables.

La arquitectura mantiene un enfoque **Feature-First**: cada módulo de negocio agrupa sus páginas, componentes y servicios, mientras que `core/` concentra la lógica transversal y `shared/` contiene recursos reutilizables de interfaz.

---

## 📂 Arquitectura de Directorios y Carpetas (`src/`)

El siguiente árbol representa la estructura completa objetivo del frontend, incluyendo los archivos existentes y las extensiones arquitectónicas incorporadas:

```text
src/
├── assets/
│   ├── icons/                         # Iconos propios del proyecto
│   └── images/                        # Logos e ilustraciones de la landing
├── config/
│   ├── env.config.js                  # Lectura centralizada de variables Vite
│   └── theme.config.js                # Tema visual y modo oscuro
├── core/
│   ├── api/
│   │   ├── api.client.js              # Cliente HTTP e interceptor JWT
│   │   └── endpoints.js               # Rutas del backend
│   ├── constants/
│   │   └── medicalReasons.js          # Enum compartido de motivos clínicos
│   ├── hooks/
│   │   ├── useFetch.js                # Estado reutilizable de peticiones
│   │   └── useNotification.js         # Acceso al sistema global de notificaciones
│   ├── schemas/
│   │   ├── consultationSchema.js      # Schema Zod para consultas
│   │   ├── petSchema.js               # Schema Zod para mascotas
│   │   └── tutorSchema.js             # Schema Zod para tutores
│   ├── utils/
│   │   ├── date.utils.js              # Formateadores de fechas ISO
│   │   └── rut.utils.js               # Utilidades y validación de RUT
│   └── ProtectedRoute.jsx             # Guard de autenticación JWT
├── features/
│   ├── landing/
│   │   ├── pages/LandingPage.jsx
│   │   └── components/
│   │       ├── Hero.jsx
│   │       └── Navbar.jsx
│   ├── auth/
│   │   ├── pages/LoginPage.jsx
│   │   ├── components/LoginForm.jsx
│   │   ├── context/AuthContext.jsx
│   │   └── authService.js             # Operaciones de autenticación
│   ├── dashboard/
│   │   ├── pages/DashboardPage.jsx
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── MetricsGrid.jsx
│   │       └── Sidebar.jsx
│   ├── medical-events/
│   │   ├── pages/NewConsultationPage.jsx
│   │   ├── components/
│   │   │   ├── ConsultationForm.jsx
│   │   │   └── ReasonSelect.jsx
│   │   └── medicalEventsService.js    # Registro y consulta de eventos
│   ├── pets/
│   │   ├── pages/RegisterPatientPage.jsx
│   │   ├── components/
│   │   │   ├── PetForm.jsx
│   │   │   └── TutorForm.jsx
│   │   └── petsService.js             # Operaciones de tutores y mascotas
│   └── history/
│       ├── pages/ClinicalHistoryPage.jsx
│       ├── components/
│       │   ├── PatientSearch.jsx
│       │   └── Timeline.jsx
│       └── historyService.js           # Consulta de fichas e historial
├── routes/
│   └── AppRouter.jsx                  # Definición central de rutas
└── shared/
    ├── components/
    │   ├── ApiDebugger.jsx             # Panel simulador de API
    │   ├── Button.jsx                  # Botón reutilizable
    │   ├── ErrorBoundary.jsx           # Captura global de errores de render
    │   ├── Input.jsx                   # Input reutilizable
    │   ├── Modal.jsx                   # Modal reutilizable
    │   ├── Notification.jsx            # Toast/notificación visual
    │   └── *.test.jsx                  # Pruebas de componentes shared
    └── layouts/
        └── MainLayout.jsx              # Sidebar, Header y contenido
```

### 🧭 Ruteo y protección de acceso

1. **`routes/AppRouter.jsx`** centraliza las rutas públicas y privadas de la aplicación.
2. **`core/ProtectedRoute.jsx`** valida la existencia y vigencia del token JWT antes de permitir el acceso a `dashboard` y sus subrutas. Cuando no existe una sesión válida, redirige al login.
3. Esta separación evita duplicar reglas de autorización en cada página y mantiene el control de navegación en un único punto.

### 🧠 `src/core/` (Núcleo Compartido)

Contiene la lógica transversal y no ligada a un módulo específico:

- **`core/api/`**: Cliente Axios o Fetch centralizado, con interceptor para enviar el token JWT, y definición de endpoints.
- **`core/constants/medicalReasons.js`**: Array único con los seis motivos de consulta permitidos. `ReasonSelect.jsx` y los schemas de formularios reutilizan esta constante para evitar duplicaciones.
- **`core/utils/`**: Funciones puras para RUT, números y fechas.
- **`core/hooks/`**: `useFetch.js` para peticiones y `useNotification.js` para publicar feedback consistente de éxito o error.
- **`core/schemas/`**: Schemas de **Zod** para validar mascotas, tutores y consultas antes de enviar datos al backend.

### 📦 `src/features/` (Módulos de Negocio)

Cada feature encapsula sus vistas, componentes y acceso a datos:

1. **`features/landing/`**: Página comercial pública, `Navbar.jsx` y `Hero.jsx`.
2. **`features/auth/`**: Login, contexto de sesión y `authService.js`, que encapsula `POST /auth/login`.
3. **`features/dashboard/`**: Vista principal post-login, navegación lateral, cabecera y métricas.
4. **`features/medical-events/`**: Formulario de consulta, selector de motivos y `medicalEventsService.js`, responsable de crear eventos y consultar su historial.
5. **`features/pets/`**: Formularios de tutor y mascota, junto con `petsService.js` para las operaciones de pacientes.
6. **`features/history/`**: Búsqueda y línea de tiempo clínica, con `historyService.js` para consultar eventos por mascota.

Los servicios por feature son la única capa autorizada para armar llamadas de negocio hacia `core/api/`; los componentes no llaman directamente a Axios o Fetch. Esto facilita las pruebas, centraliza errores y mantiene la UI desacoplada del contrato HTTP.

### 🎨 `src/shared/` (Recursos Reutilizables de UI)

- **`shared/components/`**: Componentes atómicos (`Button`, `Input`, `Modal`) y `Notification.jsx`, que representa toasts de éxito, advertencia o error.
- **`shared/components/ErrorBoundary.jsx`**: Captura errores inesperados de renderizado y muestra una interfaz de recuperación sin dejar la aplicación en un estado silenciosamente inconsistente.
- **`shared/layouts/`**: Envoltorios de diseño como `MainLayout.jsx`.

### 🧪 Testing

La estructura admite **Vitest** y **React Testing Library**. Los archivos `*.test.jsx` se ubican junto al componente que prueban para mantener la relación entre código y cobertura:

- `shared/components/Button.test.jsx`: ejemplo de prueba de un componente compartido.
- `features/auth/components/LoginForm.test.jsx`: ejemplo de prueba de un componente de feature.

Las pruebas deben cubrir renderizado, interacción, validaciones y estados de error, especialmente antes de confirmar registros médicos inmutables.

### 🖼️ Assets y variables de entorno

- **`src/assets/images/`** y **`src/assets/icons/`** contienen recursos importados por la aplicación y se versionan junto al código.
- **`public/`** queda reservado para archivos servidos directamente por Vite, sin procesamiento por el bundler.
- **`.env.example`** documenta las variables requeridas sin incluir secretos.

---

## 🛠️ Especificación de Endpoints (Backend NestJS - Puerto 3001)

Todos los servicios consumen el backend mediante `VITE_API_URL` y el prefijo `/api/v1`. El cliente HTTP adjunta el JWT en las rutas protegidas.

### 1. Autenticación (`/api/v1/auth`)

- `POST /auth/login` → `authService.js` envía `{ email, password }` y recibe el token JWT de acceso.
- `ProtectedRoute.jsx` utiliza el estado de `AuthContext.jsx` para proteger el dashboard y sus subrutas.

### 2. Pacientes y Tutores (`/api/v1`)

- `POST /users` → `petsService.js` registra nombre, email, teléfono y RUT del tutor. Los datos se validan con `tutorSchema.js`.
- `POST /pets` → `petsService.js` asocia una mascota al ID del tutor. Los datos se validan con `petSchema.js`.
- `GET /pets` → `petsService.js` obtiene pacientes para los selectores de la aplicación.

### 3. Registro de Atenciones Clínicas (`/api/v1/medical-events`)

- `POST /medical-events` → `medicalEventsService.js` registra el evento después de validarlo con `consultationSchema.js`.
- `reason` solo acepta los valores definidos en `core/constants/medicalReasons.js`:
  - _"Consulta General"_
  - _"Control Sano y Rutina"_
  - _"Urgencia / Emergencia"_
  - _"Procedimiento Quirúrgico"_
  - _"Examen de Laboratorio"_
  - _"Desparasitación"_
- `GET /medical-events/pet/:petId` → `historyService.js` obtiene la línea de tiempo de atenciones de una mascota.

Los errores de guardado deben propagarse hasta `useNotification.js` para mostrar `Notification.jsx`. Los errores inesperados de renderizado son gestionados por `ErrorBoundary.jsx`, evitando fallos silenciosos en un sistema de registros clínicos inmutables.

---

## 🔐 Variables de Entorno

Crear una copia de `.env.example` como `.env.local` para desarrollo:

```env
VITE_API_URL=http://localhost:3001
```

No versionar credenciales, tokens ni secretos en archivos `.env`.

---

## 💻 Comandos de Inicialización

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Ejecutar pruebas unitarias y de componentes
npm run test

# Ejecutar pruebas en modo cobertura
npm run test:coverage

# Ejecutar lint
npm run lint

# Crear build de producción
npm run build
```

### 🎨 Integración de Tailwind CSS

Tailwind CSS v4 está integrado mediante `@tailwindcss/vite`. El plugin se registra en `vite.config.ts` y las utilidades se habilitan globalmente desde `src/index.css` mediante `@import "tailwindcss";`. No se requiere un archivo `tailwind.config.js` para la configuración base.

Las clases utilitarias pueden utilizarse directamente en los componentes React:

```jsx
<button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
  Guardar registro
</button>
```

### 📦 Dependencias de testing

La configuración de pruebas utiliza **Vitest**, **React Testing Library**, `@testing-library/jest-dom` y `jsdom`. Estas herramientas permiten probar componentes compartidos y features con un entorno DOM controlado, además de verificar las validaciones Zod y los estados de error/notificación.

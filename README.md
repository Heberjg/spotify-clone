# 🎵 Spotify Clone con Astro  

Un clon funcional de Spotify con gestión de estado avanzado, construido con Astro, JS y Tailwind.  

<div align="center">

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

## 🚀 Características  
- **Reproductor musical completo** con controles (play/pause, skip, volumen)  
- **PlayerStore centralizado** (gestión de estado de canciones/playlists)  
- **Diseño responsive** con CSS Grid + Tailwind  
- **Optimización de assets** (Astro Assets)  
- **Transiciones fluidas** (Astro Transitions API)  
- **Búsqueda en tiempo real**
  
## 📂 Estructura del Código

```bash
src/
├── components/      # Componentes reutilizables (Player, Navbar)
├── layouts/         # Wrappers de páginas
├── stores/          # Lógica de PlayerStore (zustand/jotai)
├── assets/          # Imágenes optimizadas con Astro
└── pages/           # Rutas principales
````

## 🧩 Arquitectura  

### 🔄 Flujo de Datos (Data Flow)

```mermaid
graph LR
    A[User] -->|Interactúa con| B[Song Item]
    B -->|playSong| C[playerStore.mjs]
    C -->|Actualiza| D[HTML Audio Element]
    D -->|Eventos: timeupdate, ended| C
    C -->|Estado actualizado| E[Player UI Components]
    C -->|Estado actualizado| F[Now Playing Display]
````

### 🏗️ Estructura Principal
```mermaid
graph TD
    A[Layout.astro] --> B[Header.astro]
    A --> C[SideBar.astro]
    A --> D[Footer.astro]
    A --> E[Main Content Area]
    E --> F[Songs.mjs]
    E --> G[NowPlaying.astro]
    H[playerStore.mjs] -->|Gestiona estado| F
    H -->|Gestiona estado| G
    H -->|Controla| I[Player.mjs]
````

## 🔧 Instalación
Clona el repositorio:

````bash
git clone https://github.com/tu-usuario/spotify-clone-astro.git
````
Instala dependencias:

````bash
npm install
````

Inicia el servidor de desarrollo:

````bash
npm run dev
````

## 🤝 Cómo Contribuir
Haz fork del proyecto

Crea una rama para tu funcionalidad:

````bash
git checkout -b feat/nueva-funcionalidad
````
Envía un Pull Request con:

Descripción clara de los cambios

Capturas de pantalla (si aplica)

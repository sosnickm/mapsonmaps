# Maps on Maps 🗺️

A modern, interactive web application for exploring and manipulating geographic maps with different projections. Built with React, TypeScript, Vite, and Leaflet.

## ✨ Features

- **Full-screen Interactive Map**: Draggable OpenStreetMap interface covering the entire viewport
- **Sliding Control Panel**: Clean, modern UI with a toggleable sidebar for map controls
- **Map Selection**: Choose from different predefined locations (New York, Los Angeles, Chicago, Houston, Phoenix)
- **Projection Controls**: Adjust map projection settings and parameters
- **Responsive Design**: Mobile-friendly with overlay controls
- **Real-time Updates**: Hot module replacement for development

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd mapsonmaps.com-vite
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.0
- **Mapping Library**: Leaflet with react-leaflet
- **Styling**: Tailwind CSS 3.4
- **Map Data**: OpenStreetMap
- **Additional Libraries**:
  - react-dnd (drag and drop functionality)
  - axios (HTTP requests)

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx          # App header component
│   │   └── MainLayout.tsx      # Main layout wrapper
│   ├── MapControlsPanel.tsx    # Sidebar with map controls
│   ├── MapDragger.tsx          # Draggable map interface
│   ├── MapSelector.tsx         # Location selection dropdown
│   ├── MapView.tsx             # Main map component with Leaflet
│   └── ProjectionControls.tsx  # Map projection settings
├── data/
│   └── openstreetmap.ts        # OSM API integration
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   ├── projections.ts          # Map projection utilities
│   └── sizeUtils.ts            # Size calculation helpers
├── App.tsx                     # Main application component
├── main.tsx                    # Application entry point
└── index.css                   # Global styles with Tailwind
```

## 🔧 Development Setup Process

### 1. Initial Project Setup
- Created Vite + React + TypeScript project
- Configured Tailwind CSS for styling
- Set up ESLint and TypeScript configurations

### 2. Dependency Management
- Resolved React version conflicts (downgraded from 19 to 18 for react-leaflet compatibility)
- Installed mapping dependencies: `leaflet`, `react-leaflet`, `@types/leaflet`
- Added utility libraries: `react-dnd`, `axios`

### 3. Component Architecture
- Implemented component-based architecture with separation of concerns
- Created reusable layout components
- Built specialized map components for different functionalities

### 4. Map Integration
- Integrated OpenStreetMap with Leaflet
- Fixed Vite-specific marker icon issues
- Implemented full-screen draggable map interface
- Added responsive control panel with slide-out functionality

### 5. TypeScript Configuration
- Configured `verbatimModuleSyntax` for strict module imports
- Used type-only imports for interfaces
- Created comprehensive type definitions for map data structures

## 🎯 Key Components

### MapView
The core map component that renders a full-screen OpenStreetMap interface with:
- Draggable and zoomable map
- Touch support for mobile devices
- Configurable center point and zoom level

### MapControlsPanel
A sliding sidebar containing:
- Location selector with predefined cities
- Projection control settings
- Map display options

### Layout Components
- `MainLayout`: Responsive container with proper spacing
- `Header`: Floating header with glass-morphism effect

## 🌍 Map Features

- **Default View**: Atlantic Ocean view (38.001722, -39.471810) at zoom level 3
- **Interactive Controls**: Pan, zoom, keyboard navigation
- **Tile Source**: OpenStreetMap with proper attribution
- **Responsive**: Adapts to different screen sizes

## 📱 Mobile Support

- Touch-friendly map interactions
- Responsive control panel
- Overlay background for mobile menu
- Optimized for both desktop and mobile experiences

## 🚧 Current Development Status

### ✅ Completed
- [x] Basic React + Vite + TypeScript setup
- [x] Tailwind CSS integration
- [x] Leaflet map integration
- [x] Component architecture
- [x] Responsive design
- [x] TypeScript type safety
- [x] Full-screen map interface
- [x] Sliding control panel

### 🔄 In Progress
- [ ] Map projection implementations
- [ ] Enhanced location data
- [ ] Drag and drop functionality
- [ ] Advanced map controls

### 📋 Planned Features
- [ ] Custom map projections
- [ ] Map overlay capabilities
- [ ] Export functionality
- [ ] User preferences storage
- [ ] Additional map data sources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenStreetMap for providing free map data
- Leaflet for the excellent mapping library
- React team for the robust framework
- Vite for the fast build tooling

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

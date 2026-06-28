<<<<<<< HEAD
# Memory Ticket App

A cinematic, offline-first memory vault built with React, Vite, and Tailwind CSS. Every memory deserves a ticket!

The app transforms your personal memories into beautifully styled digital tickets, reminiscent of boarding passes, cinema stubs, and retro keepsakes. 

## 🎟️ Key Features

- **Authentic Ticket Design**: Uses custom SVG masking to create realistic ticket notches and perforation lines.
- **Dynamic Theming**: 
  - *Travel*: Boarding pass aesthetic with airport-inspired gradients.
  - *Concert*: Energetic layouts for musical milestones.
  - *Cinematic*: Movie-stub style for film buffs.
  - *Retro & Minimal*: Clean, timeless designs for any occasion.
- **Rich Metadata**: Every ticket includes a title, location, mood, tags, a generated barcode, and a date stub.
- **Interactive Timeline**: A chronological journey through your past, with smooth "unfolding" animations for new entries.
- **Offline-First Storage**: Uses browser-native **IndexedDB** for fast, reliable data persistence without needing a server.
- **Privacy Focused**: Your data stays on your device. No cloud syncing or external tracking.
- **Data Portability**: Full JSON backup functionality allows you to export your entire vault in seconds.

## ✨ Visual Polish

- **Glassmorphism**: Heavy use of backdrop blurs and semi-transparent borders for a premium "Apple-style" feel.
- **Phone Frame**: A dedicated mobile-first layout that centers the experience within a sleek device frame on desktop screens.
- **Ambient Effects**: Floating particle background and subtle "shimmer" effects on ticket images.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Storage**: IndexedDB (Native Web API)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- npm (comes with Node.js)

### Installation

1. Navigate to the project directory.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

### Building for Production
The project uses `vite-plugin-singlefile` to create a highly portable distribution.
```bash
npm run build
```
The application will be accessible at `http://localhost:5173`.

## 📂 Project Structure

- `src/main.tsx`: Application entry point.
- `src/App.tsx`: Root component managing application state, authentication flow, and navigation.
- `src/storage.ts`: Database abstraction layer handling all IndexedDB transactions.
- `src/components/`: Reusable UI components (e.g., `Ticket`, `BottomNav`, `Particles`).
- `src/screens/`: Main application views (Home, Gallery, Timeline, Profile, etc.).

## 🎨 Customization

### Adding New Ticket Themes
The app uses a flexible theme system defined in `src/types.ts`. To add a new theme:
1. Define a new entry in the `TICKET_THEMES` array.
2. Provide a unique ID, a display label, an emoji, and a Tailwind-compatible gradient string.
3. The `Ticket.tsx` component will automatically pick up the new theme and apply the corresponding gradients and labels.

### SVG Masking logic
The unique "perforated stub" look is achieved using a dynamic SVG mask within the `Ticket` component. This allows the background image and content to be clipped perfectly into a ticket shape without complex CSS `clip-path` calculations.

## 🏗️ Architecture

- **State Management**: Uses React's `useState` and `useEffect` at the root (`App.tsx`) to manage the global "Single Source of Truth" for memories and user sessions.
- **Database Layer**: `src/storage.ts` acts as a repository pattern, abstracting the complex asynchronous IndexedDB API into clean, Promise-based functions (`getMemories`, `saveMemory`, etc.).
- **Styling Strategy**: Utilizes Tailwind CSS v4 for a utility-first approach, combined with CSS variables for dynamic theming and glassmorphism effects.

## 🛣️ Roadmap

- [ ] **Image Compression**: Automatically resize and compress uploaded photos to save IndexedDB space.
- [ ] **Cloud Sync**: Optional Supabase or Firebase integration for cross-device synchronization.
- [ ] **QR Code Actions**: Make the generated barcodes functional (e.g., scanning a physical print opens the digital memory).
- [ ] **PDF Export**: Generate a print-ready PDF sheet of your favorite tickets.
- [ ] **Mood Analytics**: A dashboard showing your memory trends over time.

## 🤝 Contributing

Contributions are welcome! Whether it's a bug report, a new feature idea, or a UI enhancement:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

MIT

<!-- npm run dev -->
<!-- npm run build -->
<!-- npm run preview -->
<!-- npm run start -->
<!-- npm run lint -->
<!-- npm run test -->
<!-- npm run check -->
<!-- npm run format -->
<!-- npm run release -->
<!-- npm run bump -->
=======
# Memory-Ticket-App
>>>>>>> 1426be8d15286e358bca1fbbdf49adc1b97e336a

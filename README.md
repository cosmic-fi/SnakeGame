# Snake Game 🐍

A modern, responsive Snake game built with Svelte and Vite, featuring a shared online leaderboard powered by Supabase.

## Features

- **Classic Snake Gameplay**: Smooth controls with WASD or arrow keys
- **Modern UI**: Dark theme with beautiful gradients and animations
- **Online Leaderboard**: Shared global leaderboard with real-time updates
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Game Statistics**: Track your best scores, games played, and average score
- **Offline Support**: Fallback to local storage when offline
- **Custom Scrollbars**: Sleek transparent white scrollbars
- **Anti-Cheat Protection**: Server-side validation and score limits

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SnakeGame
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` and start playing!

## Supabase Setup (Optional)

The game works offline by default, but to enable the shared leaderboard:

1. Follow the detailed setup instructions in `SUPABASE_SETUP.md`
2. Create a Supabase project and database
3. Update the configuration in `src/lib/config.js`

## Game Controls

- **Movement**: WASD keys or Arrow keys
- **Pause/Resume**: Spacebar
- **New Game**: Click "New Game" button

## Technology Stack

- **Frontend**: Svelte + Vite
- **Backend**: Supabase (PostgreSQL)
- **Styling**: CSS with custom properties and gradients
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure

```
src/
├── lib/
│   ├── SnakeGame.svelte    # Main game component
│   ├── config.js           # Game and API configuration
│   └── supabase.js         # Supabase client and API
├── App.svelte              # Root component
└── main.js                 # Application entry point
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Security

The game implements several security measures:
- Row Level Security (RLS) policies in Supabase
- Server-side score validation
- Rate limiting and anti-cheat measures
- Input sanitization for player names

For more details, see the security section in `SUPABASE_SETUP.md`.

## Contributing

Feel free to submit issues and pull requests to improve the game!

## License

MIT License - feel free to use this project for learning or building your own games.

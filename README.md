# Jerry OS 🤖

Executive Assistant Interface for OpenClaw - A Mac OS X-inspired operating system interface for managing AI operations, intelligence, and experimentation.

## Features

### Ops Module 🛠️
- **Mission Control**: Real-time system monitoring
  - Current model display
  - Active sessions preview
  - Cron health overview
  - System status monitoring

### Brain Module 🧠 (Coming Soon)
- Task automation
- Agent coordination
- Learning hub

### Laboratory Module 🧪 (Coming Soon)
- Experiments
- Code sandbox
- Analytics

## UI/UX Highlights

- **Mac OS X Aesthetic**: Beautiful gradient backgrounds, glass morphism effects
- **Floating Dock**: Large icons at bottom with smooth animations
- **Draggable Tabs**: Browser-style tab bar that's repositionable
- **Responsive Design**: Works seamlessly across all screen sizes
- **Real-time Updates**: Auto-refreshes data every 30 seconds

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://127.0.0.1:3000
```

## Development

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /api/model` - Get current model information
- `GET /api/sessions` - Get active sessions list
- `GET /api/crons` - Get cron health status

## Architecture

```
jerry-os/
├── index.html          # Main HTML structure
├── styles.css          # Mac OS X styling
├── app.js              # Client-side logic
├── server.js           # Express server
├── package.json        # Dependencies
└── README.md          # This file
```

## OpenClaw Integration

Jerry OS integrates with OpenClaw for real-time data:

- **Model Info**: Uses `openclaw status --json`
- **Sessions**: Uses `openclaw sessions list --json`
- **Crons**: Uses `openclaw cron list --json`

## Future Enhancements

- [ ] Brain Module - Task automation and agent coordination
- [ ] Lab Module - Experiments and code sandbox
- [ ] Real notifications integration
- [ ] Dark mode toggle
- [ ] Customizable dock layouts
- [ ] Additional monitoring metrics
- [ ] Export reports functionality

## License

MIT

---

Built with ❤️ for OpenClaw

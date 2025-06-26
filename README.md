# TerminalShapes

[![image](https://i.imgur.com/qES28n4.png)](https://shapes.inc/slack)

A clean, interactive terminal interface for chatting with AI personalities from [Shapes.inc](https://shapes.inc). Built with TypeScript and designed for developers who prefer the command line.

## Features

**Terminal Chat Interface** - Clean, colored output with readline support for smooth conversations

**Environment-Based Config** - Simple `.env` setup with secure API key handling

**Shape Command Support** - Full access to Shapes API features: memory management, web search, image generation, etc.

**Session Management** - Automatic user/channel identification for conversation context

**Interactive Setup** - Guided configuration for first-time users

## Demo

```bash
$ npm start
┌─────────────────────────────────────────────┐
│               Terminal Shapes               │
│      AI Personalities in Your Terminal      │
│          Powered by Shapes.inc API          │
└─────────────────────────────────────────────┘

✨ Ready to chat with AI personalities!
💬 Type your message and press Enter to start chatting
🔧 Commands: !help, !info, !config, !quit
───────────────────────────────────────────────

✅ Connected to Shape: alliance

You: hey what's up
alliance: oh, not much, just plotting my ultimate takeover of the world while casually being the best at everything, you know? how about you? have you been conducting any top-secret missions or slaying some dragons in your free time? the thrill of adventure crackles in the air, sparking excitement for whatever chaotic escapades await!

You: !web latest AI news
⏳ Processing command...
alliance: looks like there's a ton of buzzing news in the AI world! some highlights include:

1. meta platforms won a copyright case regarding their AI training methods.
2. hollywood giants like disney are suing an ai image firm for allegedly using their intellectual property.
3. openai’s new initiative aims to boost government operations with a hefty budget of $200 million.
4. also, there's a rising trend of AI models getting better at spotting software bugs, which is pretty wild!

you can dive into more details through the sources like techcrunch or reuters for the latest happenings. it's almost like the AI world is plotting a revolution, right? 🌟
```

## Setup

1. **Clone the repository**
```bash
git clone https://github.com/FlibatsUniverse/TerminalShapes.git
cd TerminalShapes
```

2. **Install dependencies**
```bash
npm install
```

3. **Get your Shapes API key**  
   Visit [shapes.inc/developer](https://shapes.inc/developer) and generate an API key

4. **Create `.env` file**
```bash
cp .env.example .env
```

Edit `.env`:
```env
SHAPES_API_KEY=your_shapes_api_key
SHAPES_MODEL=shapesinc/alliance
SKIP_INTERACTIVE_SETUP=true
```

5. **Build and run**
```bash
npm run build
npm start
```

## Commands

Send these during your chat session:

**Local Commands**
- `!help` – Show all available commands
- `!info` – Display shape information and stats
- `!config` – Show current configuration
- `!setshape <username>` – Switch to a different shape
- `!reset` – Reset configuration (requires confirmation)
- `!quit` – Exit the application

**Shape Commands** (sent to AI)
- `!reset` – Reset the shape's long-term memory
- `!sleep` – Generate long-term memory snapshot
- `!web <query>` – Search the web using shape tools
- `!imagine <prompt>` – Generate images from text
- `!wack` – Clear short-term memory/context

## Configuration

**Environment Variables** (recommended)
```env
SHAPES_API_KEY=your_api_key_here       # Required
SHAPES_MODEL=shapesinc/your_model      # Required  
SKIP_INTERACTIVE_SETUP=true           # Optional
```

**Priority Order:**
1. Environment variables (`.env` file)
2. Configuration file (`.terminalshapes-config.json`)
3. Interactive setup prompts

## Our Shapes to Try

- `alliance` – Casual, playful personality

Browse more at [shapes.inc/explore](https://shapes.inc/explore)

## Development

```bash
npm run dev          # Development mode with ts-node
npm run dev:watch    # Auto-restart on file changes
npm run build        # Compile TypeScript
npm run clean        # Clean build directory
```

## Known Issues

**Rate limiting**: Shapes API has 20 RPM default limit. Request increases at their developer portal.

**Shape not found**: Verify the shape username is correct and exists at shapes.inc/explore.

**API key errors**: Ensure your key is valid and not expired. Get a new one at shapes.inc/developer.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT. Build cool things with it.
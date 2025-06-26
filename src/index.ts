#!/usr/bin/env node

import { ChatSession } from './chat-session.js';

async function main(): Promise<void> {
  try {
    const session = new ChatSession();
    await session.start();
  } catch (error) {
    console.error('Failed to start Terminal AI Chat:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});

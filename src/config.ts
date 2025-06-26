import fs from 'fs';
import path from 'path';
import { config as loadDotenv } from 'dotenv';
import { ShapeConfig } from './shapes-client.js';

export interface Config extends ShapeConfig {
  userId: string;
  channelId: string;
}

const CONFIG_FILE = path.join(process.cwd(), '.terminalshapes-config.json');

export class ConfigManager {
  private config: Config | null = null;

  constructor() {
    // Load environment variables from .env file if it exists
    loadDotenv();
  }

  async loadConfig(): Promise<Config | null> {
    // First, try to load from environment variables
    const envConfig = this.loadFromEnv();
    if (envConfig) {
      this.config = envConfig;
      return envConfig;
    }

    // If no env config, try to load from file
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = await fs.promises.readFile(CONFIG_FILE, 'utf-8');
        this.config = JSON.parse(data);
        return this.config;
      }
    } catch (error) {
      console.error('Error loading config file:', error);
    }
    return null;
  }

  private loadFromEnv(): Config | null {
    const apiKey = process.env['SHAPES_API_KEY'];
    const model = process.env['SHAPES_MODEL'];
    
    if (!apiKey || !model) {
      return null;
    }

    // Extract shape username from model format "shapesinc/username"
    const shapeUsername = model.startsWith('shapesinc/') ? model.slice(10) : model;

    return {
      apiKey,
      shapeUsername,
      userId: `user_${Date.now()}`,
      channelId: `terminal_${Date.now()}`
    };
  }

  canSkipInteractiveSetup(): boolean {
    return process.env['SKIP_INTERACTIVE_SETUP'] === 'true' && 
           !!process.env['SHAPES_API_KEY'] && 
           !!process.env['SHAPES_MODEL'];
  }

  async saveConfig(config: Config): Promise<void> {
    try {
      this.config = config;
      await fs.promises.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  getConfig(): Config | null {
    return this.config;
  }

  async updateConfig(updates: Partial<Config>): Promise<Config> {
    const currentConfig = this.config || this.getDefaultConfig();
    const newConfig = { ...currentConfig, ...updates };
    await this.saveConfig(newConfig);
    return newConfig;
  }

  private getDefaultConfig(): Config {
    return {
      apiKey: '',
      shapeUsername: '',
      userId: `user_${Date.now()}`,
      channelId: `terminal_${Date.now()}`
    };
  }

  async resetConfig(): Promise<void> {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        await fs.promises.unlink(CONFIG_FILE);
      }
      this.config = null;
    } catch (error) {
      console.error('Error resetting config:', error);
      throw error;
    }
  }
}

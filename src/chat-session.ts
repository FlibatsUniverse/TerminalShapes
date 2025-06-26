import { TerminalUI } from './terminal-ui.js';
import { ShapesAPIClient } from './shapes-client.js';
import { ConfigManager, Config } from './config.js';
import chalk from 'chalk';

export class ChatSession {
  private ui: TerminalUI;
  private client: ShapesAPIClient | null = null;
  private configManager: ConfigManager;
  private isRunning = false;

  constructor() {
    this.ui = new TerminalUI({
      welcomeMessage: 'Ready to chat with AI personalities!'
    });
    this.configManager = new ConfigManager();
  }

  async start(): Promise<void> {
    this.ui.showWelcome();
    
    // Load or create configuration
    let config = await this.configManager.loadConfig();
    
    if (!config) {
      if (this.configManager.canSkipInteractiveSetup()) {
        this.ui.showError('Environment variables are incomplete. Please check your .env file.');
        process.exit(1);
      }
      config = await this.setupInitialConfig();
    } else if (config && process.env['SHAPES_API_KEY']) {
      // If we have both env vars and config file, prefer env vars
      const envConfig = await this.configManager.loadConfig();
      if (envConfig && (envConfig.apiKey !== config.apiKey || envConfig.shapeUsername !== config.shapeUsername)) {
        this.ui.showInfo('Using configuration from environment variables');
        config = envConfig;
      }
    }

    this.client = new ShapesAPIClient(config);
    this.ui.showSuccess(`Connected to Shape: ${chalk.bold(config.shapeUsername)}`);
    
    this.isRunning = true;
    this.ui.startInput((input) => this.handleUserInput(input));
  }

  private async setupInitialConfig(): Promise<Config> {
    this.ui.showInfo('Initial setup required. Please provide your Shapes API configuration.');
    
    const apiKey = await this.ui.promptSecret('Enter your Shapes API Key: ');
    if (!apiKey) {
      this.ui.showError('API key is required!');
      process.exit(1);
    }

    const shapeUsername = await this.ui.prompt('Enter the Shape username (e.g., alliance): ');
    if (!shapeUsername) {
      this.ui.showError('Shape username is required!');
      process.exit(1);
    }

    const config: Config = {
      apiKey,
      shapeUsername,
      userId: `user_${Date.now()}`,
      channelId: `terminal_${Date.now()}`
    };

    await this.configManager.saveConfig(config);
    this.ui.showSuccess('Configuration saved!');
    
    return config;
  }

  private async handleUserInput(input: string): Promise<void> {
    if (!this.isRunning || !this.client) return;

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      this.ui.showPrompt();
      return;
    }

    // Handle commands
    if (trimmedInput.startsWith('!')) {
      await this.handleCommand(trimmedInput);
      this.ui.showPrompt();
      return;
    }

    // Send message to Shape
    try {
      this.ui.showLoading('Shape is thinking...');
      const response = await this.client.chat(trimmedInput);
      this.ui.clearLoading();
      
      const config = this.configManager.getConfig();
      this.ui.showMessage(config?.shapeUsername || 'Shape', response, chalk.magenta);
    } catch (error) {
      this.ui.clearLoading();
      if (error instanceof Error) {
        this.ui.showError(error.message);
      } else {
        this.ui.showError('An unexpected error occurred');
      }
    }

    this.ui.showPrompt();
  }

  private async handleCommand(command: string): Promise<void> {
    const [cmd, ...args] = command.slice(1).split(' ');
    
    if (!cmd) {
      this.ui.showError('Invalid command');
      return;
    }
    
    switch (cmd.toLowerCase()) {
      case 'help':
        this.showHelp();
        break;
        
      case 'info':
        await this.showShapeInfo();
        break;
        
      case 'reset':
        await this.handleResetCommand();
        break;
        
      case 'config':
        await this.showConfig();
        break;
        
      case 'setshape':
        await this.setShape(args.join(' '));
        break;
        
      case 'quit':
      case 'exit':
        this.quit();
        break;
        
      default:
        // Send the command to the Shape (it might be a Shape command like !web, !imagine)
        if (this.client) {
          try {
            this.ui.showLoading('Processing command...');
            const response = await this.client.chat(command);
            this.ui.clearLoading();
            
            const config = this.configManager.getConfig();
            this.ui.showMessage(config?.shapeUsername || 'Shape', response, chalk.magenta);
          } catch (error) {
            this.ui.clearLoading();
            this.ui.showError(`Unknown command: ${command}`);
            this.ui.showInfo('Type !help for available commands');
          }
        }
    }
  }

  private showHelp(): void {
    console.log(chalk.bold.cyan('Available Commands:'));
    console.log(chalk.gray('Local Commands:'));
    console.log(`  ${chalk.green('!help')}     - Show this help message`);
    console.log(`  ${chalk.green('!info')}     - Show information about the current Shape`);
    console.log(`  ${chalk.green('!config')}   - Show current configuration and source`);
    console.log(`  ${chalk.green('!setshape')} <username> - Switch to a different Shape`);
    console.log(`  ${chalk.green('!reset')}    - Reset configuration`);
    console.log(`  ${chalk.green('!quit')}     - Exit the application`);
    console.log();
    console.log(chalk.gray('Shape Commands (sent to API):'));
    console.log(`  ${chalk.yellow('!reset')}   - Reset the Shape's long-term memory`);
    console.log(`  ${chalk.yellow('!sleep')}   - Generate long-term memory on demand`);
    console.log(`  ${chalk.yellow('!web')}     - Search the web`);
    console.log(`  ${chalk.yellow('!imagine')} - Generate images`);
    console.log(`  ${chalk.yellow('!wack')}    - Reset short-term memory`);
    console.log();
    console.log(chalk.gray('Configuration:'));
    console.log(`  ${chalk.blue('💡 Tip:')} Use a ${chalk.bold('.env')} file for easier configuration`);
    console.log(`  ${chalk.blue('📁 File:')} Copy ${chalk.bold('.env.example')} to ${chalk.bold('.env')} and edit`);
    console.log(`  ${chalk.blue('🔑 Variables:')} ${chalk.bold('SHAPES_API_KEY')}, ${chalk.bold('SHAPES_MODEL')}`);
    console.log();
  }

  private async showShapeInfo(): Promise<void> {
    if (!this.client) return;
    
    try {
      this.ui.showLoading('Fetching Shape information...');
      const info = await this.client.getShapeInfo();
      this.ui.clearLoading();
      
      console.log(chalk.bold.cyan('Shape Information:'));
      console.log(`  ${chalk.green('Name:')} ${info.name}`);
      console.log(`  ${chalk.green('Username:')} ${info.username}`);
      console.log(`  ${chalk.green('Description:')} ${info.search_description}`);
      console.log(`  ${chalk.green('Category:')} ${info.category}`);
      console.log(`  ${chalk.green('Users:')} ${info.user_count?.toLocaleString() || 'N/A'}`);
      console.log(`  ${chalk.green('Messages:')} ${info.message_count?.toLocaleString() || 'N/A'}`);
      if (info.tagline) {
        console.log(`  ${chalk.green('Tagline:')} ${info.tagline}`);
      }
      console.log();
    } catch (error) {
      this.ui.clearLoading();
      this.ui.showError('Failed to fetch Shape information');
    }
  }

  private async showConfig(): Promise<void> {
    const config = this.configManager.getConfig();
    if (!config) {
      this.ui.showError('No configuration found');
      return;
    }

    const usingEnvVars = !!process.env['SHAPES_API_KEY'];
    const configSource = usingEnvVars ? 'Environment Variables (.env)' : 'Config File (.terminalshapes-config.json)';

    console.log(chalk.bold.cyan('Current Configuration:'));
    console.log(`  ${chalk.green('Config Source:')} ${configSource}`);
    console.log(`  ${chalk.green('Shape Username:')} ${config.shapeUsername}`);
    console.log(`  ${chalk.green('User ID:')} ${config.userId}`);
    console.log(`  ${chalk.green('Channel ID:')} ${config.channelId}`);
    console.log(`  ${chalk.green('API Key:')} ${'*'.repeat(Math.min(config.apiKey.length, 20))}`);
    console.log();
    
    if (usingEnvVars) {
      this.ui.showInfo('Configuration is loaded from environment variables. File-based config is ignored.');
    }
  }

  private async setShape(username: string): Promise<void> {
    if (!username) {
      this.ui.showError('Please provide a Shape username: !setshape <username>');
      return;
    }

    try {
      const config = await this.configManager.updateConfig({ shapeUsername: username });
      this.client?.updateConfig(config);
      this.ui.showSuccess(`Switched to Shape: ${chalk.bold(username)}`);
    } catch (error) {
      this.ui.showError('Failed to update configuration');
    }
  }

  private async handleResetCommand(): Promise<void> {
    const confirm = await this.ui.prompt('Are you sure you want to reset the configuration? (yes/no): ');
    if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
      try {
        await this.configManager.resetConfig();
        this.ui.showSuccess('Configuration reset. Please restart the application.');
        this.quit();
      } catch (error) {
        this.ui.showError('Failed to reset configuration');
      }
    }
  }

  private quit(): void {
    this.isRunning = false;
    this.ui.showInfo('Thanks for using Shapes Terminal! 👋');
    this.ui.close();
    process.exit(0);
  }
}

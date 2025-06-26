import readline from 'readline';
import chalk from 'chalk';

export interface TerminalUIOptions {
  prompt?: string;
  welcomeMessage?: string;
}

export class TerminalUI {
  private rl: readline.Interface;
  private options: TerminalUIOptions;

  constructor(options: TerminalUIOptions = {}) {
    this.options = {
      prompt: chalk.cyan('You: '),
      welcomeMessage: chalk.green('Welcome to Terminal Shapes!'),
      ...options
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: this.options.prompt
    });

    this.setupSignalHandlers();
  }

  showWelcome(): void {
    console.clear();
    
    // Clean text banner with Shapes.inc brand colors
    console.log(chalk.hex('#2563eb')('┌─────────────────────────────────────────────┐'));
    console.log(chalk.hex('#2563eb')('│') + chalk.bold.hex('#2563eb')('               Terminal Shapes               ') + chalk.hex('#2563eb')('│'));
    console.log(chalk.hex('#2563eb')('│') + chalk.hex('#1e3a8a')('   🤖 AI Personalities in Your Terminal      ') + chalk.hex('#2563eb')('│'));
    console.log(chalk.hex('#2563eb')('│') + chalk.gray('          Powered by ') + chalk.bold.hex('#2563eb')('Shapes.inc') + chalk.gray(' API          ') + chalk.hex('#2563eb')('│'));
    console.log(chalk.hex('#2563eb')('└─────────────────────────────────────────────┘'));
    
    console.log();
    
    // Welcome message with modern styling
    if (this.options.welcomeMessage) {
      console.log(chalk.bold.green('✨ ' + this.options.welcomeMessage));
    }
    
    // Instructions with icons
    console.log(chalk.gray('💬 ') + chalk.white('Type your message and press Enter to start chatting'));
    console.log(chalk.gray('🔧 ') + chalk.white('Commands: ') + chalk.hex('#2563eb')('!help') + chalk.gray(', ') + 
                chalk.hex('#2563eb')('!info') + chalk.gray(', ') + chalk.hex('#2563eb')('!config') + chalk.gray(', ') + 
                chalk.hex('#2563eb')('!quit'));
    
    // Decorative separator
    console.log(chalk.gray('─'.repeat(47)));
    console.log();
  }

  showMessage(speaker: string, message: string, color: (str: string) => string = chalk.white): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${chalk.gray(`[${timestamp}]`)} ${color(`${speaker}:`)} ${message}`);
    console.log();
  }

  showError(message: string): void {
    console.log(chalk.red(`❌ Error: ${message}`));
    console.log();
  }

  showSuccess(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
    console.log();
  }

  showInfo(message: string): void {
    console.log(chalk.blue(`ℹ️  ${message}`));
    console.log();
  }

  showWarning(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`));
    console.log();
  }

  showLoading(message: string = 'Processing...'): void {
    process.stdout.write(chalk.gray(`⏳ ${message}`));
  }

  clearLoading(): void {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }

  async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(chalk.cyan(question), (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async promptSecret(question: string): Promise<string> {
    return new Promise((resolve) => {
      // Disable echoing for password input
      const stdin = process.stdin;
      stdin.setRawMode?.(true);
      
      process.stdout.write(chalk.cyan(question));
      
      let password = '';
      const onData = (char: Buffer) => {
        const str = char.toString();
        
        switch (str) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            stdin.setRawMode?.(false);
            stdin.removeListener('data', onData);
            console.log();
            resolve(password);
            break;
          case '\u0003': // Ctrl+C
            stdin.setRawMode?.(false);
            stdin.removeListener('data', onData);
            console.log();
            process.exit(0);
          case '\u007f': // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += str;
            process.stdout.write('*');
        }
      };
      
      stdin.on('data', onData);
    });
  }

  startInput(onLine: (input: string) => void): void {
    this.rl.on('line', onLine);
    this.rl.prompt();
  }

  showPrompt(): void {
    this.rl.prompt();
  }

  close(): void {
    this.rl.close();
  }

  private setupSignalHandlers(): void {
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n👋 Goodbye!'));
      this.close();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.close();
      process.exit(0);
    });
  }
}

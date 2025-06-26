import { OpenAI } from 'openai';

export interface ShapeConfig {
  apiKey: string;
  shapeUsername: string;
  userId?: string;
  channelId?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ShapeResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ShapesAPIClient {
  private client: OpenAI;
  private config: ShapeConfig;

  constructor(config: ShapeConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.shapes.inc/v1/',
    });
  }

  async chat(message: string): Promise<string> {
    try {
      const headers: Record<string, string> = {};
      
      if (this.config.userId) {
        headers['X-User-Id'] = this.config.userId;
      }
      
      if (this.config.channelId) {
        headers['X-Channel-Id'] = this.config.channelId;
      }

      const response = await this.client.chat.completions.create({
        model: `shapesinc/${this.config.shapeUsername}`,
        messages: [
          { role: 'user', content: message }
        ],
      }, {
        headers: Object.keys(headers).length > 0 ? headers : undefined
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received from Shape');
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Shapes API Error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while communicating with Shapes API');
    }
  }

  async getShapeInfo(): Promise<any> {
    try {
      const response = await fetch(`https://api.shapes.inc/shapes/public/${this.config.shapeUsername}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch shape info: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get shape info: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching shape info');
    }
  }

  updateConfig(updates: Partial<ShapeConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.apiKey) {
      this.client = new OpenAI({
        apiKey: updates.apiKey,
        baseURL: 'https://api.shapes.inc/v1/',
      });
    }
  }
}

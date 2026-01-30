export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: Date;
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  stream?: boolean;
  params?: Record<string, any>;
}

export interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
  stream?(request: AIRequest): AsyncGenerator<string, void, undefined>;
  listModels?(): Promise<string[]>;
}

export enum AIProviderType {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Google = 'google',
  AzureOpenAI = 'azure-openai',
  Ollama = 'ollama',
  Custom = 'custom'
}
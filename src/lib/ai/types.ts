export interface AIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: string; // Added provider identifier
}

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  name?: string; // For function calls
}

export interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: Array<any>; // For function calling
  function_call?: any;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: Message;
    finish_reason: string;
    index: number;
  }>;
  created: number;
  model: string;
  object: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface AIAdapter {
  generate(prompt: string): Promise<string>;
  chat(messages: Message[]): Promise<string>;
  streamChat(messages: Message[]): AsyncGenerator<string, void, undefined>;
}

// New interface for unified AI provider
export interface AIProvider {
  initialize(config: AIConfig): void;
  chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  streamCompletion?(request: ChatCompletionRequest): AsyncGenerator<string, void, undefined>;
  getName(): string;
}
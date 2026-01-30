import { AIConfig, Message, ChatCompletionRequest, ChatCompletionResponse, AIProvider } from './types';

/**
 * Base class for AI providers that implements common functionality
 */
export abstract class BaseAIProvider implements AIProvider {
  protected config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * Initialize the provider with configuration
   */
  initialize(config: AIConfig): void {
    this.config = config;
  }

  /**
   * Abstract method to be implemented by subclasses
   */
  abstract chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;

  /**
   * Optional streaming implementation
   */
  async *streamCompletion?(request: ChatCompletionRequest): AsyncGenerator<string, void, undefined> {
    // Default implementation could convert non-streaming to streaming
    // Subclasses should override for native streaming support
    const response = await this.chatCompletion(request);
    yield response.choices[0]?.message?.content || '';
  }

  /**
   * Get the name of this provider
   */
  abstract getName(): string;

  /**
   * Helper method to get the API URL
   */
  protected getApiUrl(endpoint: string): string {
    return `${this.config.baseURL || 'https://api.openai.com/v1'}${endpoint}`;
  }

  /**
   * Helper method to build request headers
   */
  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }

  /**
   * Helper method to merge config values with request values
   */
  protected mergeConfig(request: ChatCompletionRequest): ChatCompletionRequest {
    return {
      ...request,
      model: request.model || this.config.model || 'gpt-3.5-turbo',
      temperature: request.temperature ?? this.config.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? this.config.maxTokens ?? 1024,
    };
  }
}
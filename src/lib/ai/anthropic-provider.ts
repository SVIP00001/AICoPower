import { BaseAIProvider } from './base-provider';
import { 
  AIConfig, 
  Message, 
  ChatCompletionRequest, 
  ChatCompletionResponse 
} from './types';

/**
 * Anthropic Claude Provider Implementation
 * Note: Anthropic API has different structure than OpenAI
 */
export class AnthropicProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super({
      ...config,
      provider: 'anthropic',
      model: config.model || 'claude-3-haiku-20240307' // Default to Claude 3 Haiku
    });
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Convert OpenAI-style messages to Anthropic format
    const anthropicMessages = this.convertToAnthropicFormat(request.messages);
    
    const systemPrompt = this.extractSystemMessage(request.messages);
    const filteredMessages = this.removeSystemMessages(request.messages);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        messages: filteredMessages.map(msg => ({
          role: msg.role,
          content: [{ type: 'text', text: msg.content }]
        })),
        max_tokens: request.maxTokens || this.config.maxTokens || 1024,
        temperature: request.temperature ?? this.config.temperature ?? 0.7,
        ...(systemPrompt && { system: systemPrompt }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Anthropic API request failed: ${response.status} ${errorData}`);
    }

    const data = await response.json();

    // Convert Anthropic response to OpenAI-compatible format
    return this.convertAnthropicToOpenAIFormat(data);
  }

  async *streamCompletion(request: ChatCompletionRequest): AsyncGenerator<string, void, undefined> {
    // Anthropic streaming implementation would go here
    // For now, we'll use the non-streaming version and yield the full response
    const response = await this.chatCompletion(request);
    yield response.choices[0]?.message?.content || '';
  }

  getName(): string {
    return 'anthropic';
  }

  /**
   * Extract system message from messages array
   */
  private extractSystemMessage(messages: Message[]): string | undefined {
    const systemMsg = messages.find(msg => msg.role === 'system');
    return systemMsg ? systemMsg.content : undefined;
  }

  /**
   * Remove system messages from the array (Anthropic handles system separately)
   */
  private removeSystemMessages(messages: Message[]): Message[] {
    return messages.filter(msg => msg.role !== 'system');
  }

  /**
   * Convert OpenAI-style messages to Anthropic format
   */
  private convertToAnthropicFormat(messages: Message[]): any[] {
    return messages
      .filter(msg => msg.role !== 'system') // System messages handled separately
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }

  /**
   * Convert Anthropic response to OpenAI-compatible format
   */
  private convertAnthropicToOpenAIFormat(anthropicResponse: any): ChatCompletionResponse {
    // Generate a random ID for compatibility
    const id = `chatcmpl-${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      id,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: anthropicResponse.content[0]?.text || '',
          },
          finish_reason: anthropicResponse.stop_reason || 'stop',
        }
      ],
      created: Math.floor(Date.now() / 1000),
      model: anthropicResponse.model || this.config.model || 'claude-3-haiku-20240307',
      object: 'chat.completion',
      usage: {
        prompt_tokens: anthropicResponse.usage?.input_tokens || 0,
        completion_tokens: anthropicResponse.usage?.output_tokens || 0,
        total_tokens: (anthropicResponse.usage?.input_tokens || 0) + (anthropicResponse.usage?.output_tokens || 0),
      }
    };
  }
}
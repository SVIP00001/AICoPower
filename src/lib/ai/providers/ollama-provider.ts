import { BaseAIProvider } from '../base-provider';
import { 
  AIConfig, 
  Message, 
  ChatCompletionRequest, 
  ChatCompletionResponse 
} from '../types';

/**
 * Ollama Provider Implementation for local models
 */
export class OllamaProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super({
      ...config,
      provider: 'ollama',
      model: config.model || 'llama2' // Default to llama2
    });
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const mergedRequest = this.mergeConfig(request);
    
    // Convert messages to Ollama format
    const ollamaMessages = this.convertToOllamaFormat(mergedRequest.messages);

    const response = await fetch(
      `${this.config.baseURL || 'http://localhost:11434'}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'llama2',
          messages: ollamaMessages,
          options: {
            temperature: mergedRequest.temperature,
            num_predict: mergedRequest.maxTokens,
          },
          stream: false, // We want sync response for chatCompletion
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Ollama API request failed: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    
    // Convert Ollama response to OpenAI-compatible format
    return this.convertOllamaToOpenAIFormat(data);
  }

  async *streamCompletion(request: ChatCompletionRequest): AsyncGenerator<string, void, undefined> {
    const mergedRequest = this.mergeConfig(request);
    
    // Convert messages to Ollama format
    const ollamaMessages = this.convertToOllamaFormat(mergedRequest.messages);

    const response = await fetch(
      `${this.config.baseURL || 'http://localhost:11434'}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'llama2',
          messages: ollamaMessages,
          options: {
            temperature: mergedRequest.temperature,
            num_predict: mergedRequest.maxTokens,
          },
          stream: true, // Enable streaming for Ollama
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Ollama API request failed: ${response.status} ${errorData}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader');
    }

    try {
      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                fullResponse += parsed.message.content;
                yield parsed.message.content;
              }
            } catch (error) {
              // Skip malformed JSON
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  getName(): string {
    return 'ollama';
  }

  /**
   * Convert OpenAI-style messages to Ollama format
   */
  private convertToOllamaFormat(messages: Message[]): Array<{role: string, content: string}> {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Convert Ollama response to OpenAI-compatible format
   */
  private convertOllamaToOpenAIFormat(ollamaResponse: any): ChatCompletionResponse {
    // Generate a random ID for compatibility
    const id = `chatcmpl-${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      id,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: ollamaResponse.message?.content || '',
          },
          finish_reason: ollamaResponse.done ? 'stop' : 'length',
        }
      ],
      created: Math.floor(Date.now() / 1000),
      model: ollamaResponse.model || this.config.model || 'llama2',
      object: 'chat.completion',
      usage: {
        prompt_tokens: ollamaResponse.prompt_eval_count || 0,
        completion_tokens: ollamaResponse.eval_count || 0,
        total_tokens: (ollamaResponse.prompt_eval_count || 0) + (ollamaResponse.eval_count || 0),
      }
    };
  }
}
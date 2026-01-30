import { BaseAIProvider } from './base-provider';
import { 
  AIConfig, 
  Message, 
  ChatCompletionRequest, 
  ChatCompletionResponse 
} from './types';

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super({
      ...config,
      provider: 'openai',
      model: config.model || 'gpt-3.5-turbo'
    });
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const mergedRequest = this.mergeConfig(request);
    
    const response = await fetch(this.getApiUrl('/chat/completions'), {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: mergedRequest.model,
        messages: mergedRequest.messages as Message[],
        temperature: mergedRequest.temperature,
        max_tokens: mergedRequest.maxTokens,
        ...(mergedRequest.functions && { functions: mergedRequest.functions }),
        ...(mergedRequest.function_call && { function_call: mergedRequest.function_call }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API request failed: ${response.status} ${errorData}`);
    }

    const data: ChatCompletionResponse = await response.json();
    return data;
  }

  async *streamCompletion(request: ChatCompletionRequest): AsyncGenerator<string, void, undefined> {
    const mergedRequest = this.mergeConfig(request);
    
    const response = await fetch(this.getApiUrl('/chat/completions'), {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: mergedRequest.model,
        messages: mergedRequest.messages as Message[],
        temperature: mergedRequest.temperature,
        max_tokens: mergedRequest.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API request failed: ${response.status} ${errorData}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
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
    return 'openai';
  }
}
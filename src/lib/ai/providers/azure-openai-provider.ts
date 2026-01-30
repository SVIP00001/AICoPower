import { BaseAIProvider } from '../base-provider';
import { 
  AIConfig, 
  Message, 
  ChatCompletionRequest, 
  ChatCompletionResponse 
} from '../types';

/**
 * Azure OpenAI Provider Implementation
 */
export class AzureOpenAIProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super({
      ...config,
      provider: 'azure-openai',
      model: config.model || 'gpt-35-turbo' // Default to gpt-35-turbo for Azure
    });
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const mergedRequest = this.mergeConfig(request);
    
    // Construct the Azure-specific endpoint
    const deploymentName = this.config.model || 'gpt-35-turbo';
    const apiVersion = '2023-05-15'; // Latest stable API version
    
    const response = await fetch(
      `${this.config.baseURL}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey, // Azure uses api-key header instead of Authorization
        },
        body: JSON.stringify({
          messages: mergedRequest.messages as Message[],
          temperature: mergedRequest.temperature,
          max_tokens: mergedRequest.maxTokens,
          ...(mergedRequest.functions && { functions: mergedRequest.functions }),
          ...(mergedRequest.function_call && { function_call: mergedRequest.function_call }),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Azure OpenAI API request failed: ${response.status} ${errorData}`);
    }

    const data: ChatCompletionResponse = await response.json();
    // Add the deployment/model name to the response
    data.model = deploymentName;
    return data;
  }

  async *streamCompletion(request: ChatCompletionRequest): AsyncGenerator<string, void, undefined> {
    const mergedRequest = this.mergeConfig(request);
    
    // Construct the Azure-specific endpoint for streaming
    const deploymentName = this.config.model || 'gpt-35-turbo';
    const apiVersion = '2023-05-15';
    
    const response = await fetch(
      `${this.config.baseURL}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          messages: mergedRequest.messages as Message[],
          temperature: mergedRequest.temperature,
          max_tokens: mergedRequest.maxTokens,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Azure OpenAI API request failed: ${response.status} ${errorData}`);
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
    return 'azure-openai';
  }

  /**
   * Override the base getApiUrl method to construct Azure-specific URLs
   */
  protected getApiUrl(endpoint: string): string {
    // For Azure, we don't use the standard OpenAI URL pattern
    // Instead, the full URL is constructed in the methods above
    return `${this.config.baseURL || 'https://YOUR_RESOURCE_NAME.openai.azure.com'}`;
  }
}
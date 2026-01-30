import { BaseAIProvider } from '../base-provider';
import { 
  AIConfig, 
  Message, 
  ChatCompletionRequest, 
  ChatCompletionResponse 
} from '../types';

/**
 * Google AI Provider Implementation (for Gemini)
 */
export class GoogleProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super({
      ...config,
      provider: 'google',
      model: config.model || 'gemini-pro'
    });
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Convert OpenAI-style messages to Google format
    const googleMessages = this.convertToGoogleFormat(request.messages);

    // Prepare the request payload for Google's API
    const requestBody = {
      contents: googleMessages,
      generationConfig: {
        temperature: request.temperature ?? this.config.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? this.config.maxTokens ?? 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Google AI API request failed: ${response.status} ${errorData}`);
    }

    const data = await response.json();

    // Convert Google response to OpenAI-compatible format
    return this.convertGoogleToOpenAIFormat(data);
  }

  async *streamCompletion(request: ChatCompletionRequest): AsyncGenerator<string, void, undefined> {
    // Google streaming implementation would go here
    // For now, we'll use the non-streaming version and yield the full response
    const response = await this.chatCompletion(request);
    yield response.choices[0]?.message?.content || '';
  }

  getName(): string {
    return 'google';
  }

  /**
   * Convert OpenAI-style messages to Google format
   */
  private convertToGoogleFormat(messages: Message[]): Array<{role: string, parts: Array<{text: string}>}> {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Convert Google response to OpenAI-compatible format
   */
  private convertGoogleToOpenAIFormat(googleResponse: any): ChatCompletionResponse {
    // Generate a random ID for compatibility
    const id = `chatcmpl-${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      id,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: googleResponse.candidates?.[0]?.content?.parts?.[0]?.text || '',
          },
          finish_reason: this.mapFinishReason(googleResponse.candidates?.[0]?.finishReason) || 'stop',
        }
      ],
      created: Math.floor(Date.now() / 1000),
      model: googleResponse.model || this.config.model || 'gemini-pro',
      object: 'chat.completion',
      usage: {
        prompt_tokens: 0, // Google API doesn't always provide input token count in response
        completion_tokens: 0, // Google API doesn't always provide output token count in response
        total_tokens: 0, // Google API doesn't always provide total token count in response
      }
    };
  }

  /**
   * Map Google finish reasons to OpenAI equivalents
   */
  private mapFinishReason(googleFinishReason: string): string {
    const mapping: Record<string, string> = {
      'STOP': 'stop',
      'MAX_TOKENS': 'length',
      'SAFETY': 'content_filter',
      'RECITATION': 'content_filter',
      'OTHER': 'stop'
    };
    
    return mapping[googleFinishReason] || 'stop';
  }
}
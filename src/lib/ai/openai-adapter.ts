import { AIAdapter, AIConfig, Message, ChatCompletionResponse } from './types';

export class OpenAIAdapter implements AIAdapter {
  private config: AIConfig;
  private baseUrl: string;

  constructor(config: AIConfig) {
    this.config = config;
    this.baseUrl = config.baseURL || 'https://api.openai.com/v1';
  }

  async generate(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices[0].text.trim();
  }

  async chat(messages: Message[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status} ${await response.text()}`);
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices[0].message.content.trim();
  }

  async *streamChat(messages: Message[]): AsyncGenerator<string, void, undefined> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status} ${await response.text()}`);
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
}
import { AIProvider, AIConfig } from './types';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { GoogleProvider } from './providers/google-provider';
import { OllamaProvider } from './providers/ollama-provider';
import { AzureOpenAIProvider } from './providers/azure-openai-provider';

/**
 * AI Manager to handle multiple AI providers
 */
export class AIManager {
  private providers: Map<string, AIProvider> = new Map();
  
  /**
   * Register a new AI provider
   */
  registerProvider(name: string, provider: AIProvider): void {
    this.providers.set(name, provider);
  }

  /**
   * Get a registered provider by name
   */
  getProvider(name: string): AIProvider | null {
    return this.providers.get(name) || null;
  }

  /**
   * Initialize providers with configurations
   */
  initializeProviders(configs: Record<string, AIConfig>): void {
    for (const [name, config] of Object.entries(configs)) {
      switch (config.provider) {
        case 'openai':
          this.registerProvider(name, new OpenAIProvider(config));
          break;
        case 'anthropic':
          this.registerProvider(name, new AnthropicProvider(config));
          break;
        case 'google':
          this.registerProvider(name, new GoogleProvider(config));
          break;
        case 'ollama':
          this.registerProvider(name, new OllamaProvider(config));
          break;
        case 'azure-openai':
          this.registerProvider(name, new AzureOpenAIProvider(config));
          break;
        default:
          console.warn(`Unknown provider type: ${config.provider}`);
      }
    }
  }

  /**
   * Get all registered provider names
   */
  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * List all available models from all providers
   */
  async listAllModels(): Promise<Record<string, string[]>> {
    const result: Record<string, string[]> = {};
    
    for (const [name, provider] of this.providers) {
      try {
        if ('listModels' in provider && typeof provider.listModels === 'function') {
          result[name] = await provider.listModels!();
        } else {
          // Fallback to default model if listModels is not available
          result[name] = [provider.getName()];
        }
      } catch (error) {
        console.error(`Error listing models for provider ${name}:`, error);
        result[name] = [];
      }
    }
    
    return result;
  }
}

// Create a singleton instance for global access
export const aiManager = new AIManager();
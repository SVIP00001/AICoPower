import { AIProvider, Message, ChatCompletionRequest, ChatCompletionResponse } from './types';
import { aiManager } from './ai-manager';

export interface CollaborationConfig {
  primaryProvider: string;
  secondaryProviders?: string[];
  strategy?: 'sequential' | 'parallel' | 'ensemble' | 'validation';
  timeout?: number;
}

export interface CollaborationResult {
  primaryResponse: ChatCompletionResponse;
  secondaryResponses?: ChatCompletionResponse[];
  consensus?: string;
  confidence?: number;
  errors?: Record<string, string>;
}

/**
 * Multi-AI Collaboration Engine
 * Enables collaboration between multiple AI providers for enhanced outputs
 */
export class AICollaborationEngine {
  /**
   * Sequential collaboration - Primary AI works first, then secondary AI refines
   */
  async sequentialCollaboration(
    request: ChatCompletionRequest,
    config: CollaborationConfig
  ): Promise<CollaborationResult> {
    const result: CollaborationResult = {
      primaryResponse: null!,
      secondaryResponses: [],
      errors: {}
    };

    // Get primary response
    try {
      const primaryProvider = aiManager.getProvider(config.primaryProvider);
      if (!primaryProvider) {
        throw new Error(`Primary provider ${config.primaryProvider} not found`);
      }
      
      result.primaryResponse = await primaryProvider.chatCompletion(request);
    } catch (error) {
      result.errors![config.primaryProvider] = (error as Error).message;
      throw new Error(`Primary provider failed: ${(error as Error).message}`);
    }

    // Process through secondary providers if available
    if (config.secondaryProviders && config.secondaryProviders.length > 0) {
      let currentRequest = { ...request };
      let currentResponse = result.primaryResponse;

      for (const providerName of config.secondaryProviders) {
        try {
          const provider = aiManager.getProvider(providerName);
          if (!provider) {
            result.errors![providerName] = `Provider not found`;
            continue;
          }

          // Create refinement request based on previous response
          const refinementRequest: ChatCompletionRequest = {
            ...currentRequest,
            messages: [
              ...currentRequest.messages,
              {
                role: 'assistant',
                content: currentResponse.choices[0].message.content
              },
              {
                role: 'user',
                content: 'Please refine, fact-check, or enhance the previous response. Focus on accuracy and completeness.'
              }
            ]
          };

          const secondaryResponse = await provider.chatCompletion(refinementRequest);
          result.secondaryResponses!.push(secondaryResponse);
          
          // Update current response for next iteration
          currentResponse = secondaryResponse;
        } catch (error) {
          result.errors![providerName] = (error as Error).message;
          console.error(`Secondary provider ${providerName} failed:`, error);
        }
      }
    }

    return result;
  }

  /**
   * Parallel collaboration - All AIs work simultaneously on the same task
   */
  async parallelCollaboration(
    request: ChatCompletionRequest,
    config: CollaborationConfig
  ): Promise<CollaborationResult> {
    const result: CollaborationResult = {
      primaryResponse: null!,
      secondaryResponses: [],
      errors: {}
    };

    const providersToUse = [config.primaryProvider, ...(config.secondaryProviders || [])];
    const promises: Promise<{ name: string; response: ChatCompletionResponse | null; error?: string }>[] = [];

    for (const providerName of providersToUse) {
      const promise = this.executeProviderWithTimeout(providerName, request, config.timeout)
        .then(response => ({
          name: providerName,
          response,
          error: undefined
        }))
        .catch(error => ({
          name: providerName,
          response: null,
          error: (error as Error).message
        }));
      
      promises.push(promise);
    }

    const responses = await Promise.all(promises);

    // Separate primary and secondary responses
    for (const response of responses) {
      if (response.error) {
        result.errors![response.name] = response.error;
      } else if (response.name === config.primaryProvider) {
        result.primaryResponse = response.response!;
      } else {
        result.secondaryResponses!.push(response.response!);
      }
    }

    // Calculate consensus if possible
    if (result.primaryResponse && result.secondaryResponses && result.secondaryResponses.length > 0) {
      result.consensus = this.calculateConsensus([
        result.primaryResponse,
        ...result.secondaryResponses
      ]);
    }

    return result;
  }

  /**
   * Ensemble collaboration - Combine outputs from multiple AIs for better results
   */
  async ensembleCollaboration(
    request: ChatCompletionRequest,
    config: CollaborationConfig
  ): Promise<CollaborationResult> {
    // First, run parallel collaboration to get all responses
    const parallelResult = await this.parallelCollaboration(request, config);
    
    // Then synthesize a combined response
    const synthesizedResponse = this.synthesizeEnsembleResponse(
      parallelResult.primaryResponse,
      parallelResult.secondaryResponses || []
    );
    
    // Return both individual responses and the synthesized one
    return {
      ...parallelResult,
      consensus: synthesizedResponse,
      confidence: this.calculateConfidence([
        parallelResult.primaryResponse,
        ...(parallelResult.secondaryResponses || [])
      ])
    };
  }

  /**
   * Validation collaboration - Primary AI provides answer, secondary AIs validate
   */
  async validationCollaboration(
    request: ChatCompletionRequest,
    config: CollaborationConfig
  ): Promise<CollaborationResult> {
    if (!config.secondaryProviders || config.secondaryProviders.length === 0) {
      throw new Error('Validation collaboration requires at least one secondary provider');
    }

    // Get primary response
    const primaryProvider = aiManager.getProvider(config.primaryProvider);
    if (!primaryProvider) {
      throw new Error(`Primary provider ${config.primaryProvider} not found`);
    }
    
    const primaryResponse = await primaryProvider.chatCompletion(request);
    
    // Have secondary providers validate the primary response
    const validationPromises = config.secondaryProviders.map(async (providerName) => {
      const provider = aiManager.getProvider(providerName);
      if (!provider) {
        return { name: providerName, response: null, error: `Provider not found` };
      }

      // Create validation request
      const validationRequest: ChatCompletionRequest = {
        ...request,
        messages: [
          ...request.messages,
          {
            role: 'assistant',
            content: primaryResponse.choices[0].message.content
          },
          {
            role: 'user',
            content: `Please validate the previous response. Check for factual accuracy, logical consistency, and completeness. Point out any issues and suggest improvements.`
          }
        ]
      };

      try {
        const validationResponse = await provider.chatCompletion(validationRequest);
        return { name: providerName, response: validationResponse, error: undefined };
      } catch (error) {
        return { name: providerName, response: null, error: (error as Error).message };
      }
    });

    const validationResults = await Promise.all(validationPromises);
    
    const secondaryResponses: ChatCompletionResponse[] = [];
    const errors: Record<string, string> = {};
    
    for (const result of validationResults) {
      if (result.error) {
        errors[result.name] = result.error;
      } else {
        secondaryResponses.push(result.response!);
      }
    }

    // Analyze validation results to determine overall confidence
    const validationAnalysis = this.analyzeValidations(
      primaryResponse.choices[0].message.content,
      secondaryResponses
    );

    return {
      primaryResponse,
      secondaryResponses,
      consensus: validationAnalysis.improvedResponse,
      confidence: validationAnalysis.confidence,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    };
  }

  /**
   * Execute a provider call with timeout
   */
  private async executeProviderWithTimeout(
    providerName: string,
    request: ChatCompletionRequest,
    timeoutMs?: number
  ): Promise<ChatCompletionResponse> {
    const provider = aiManager.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    if (!timeoutMs) {
      return provider.chatCompletion(request);
    }

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Provider ${providerName} timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    // Race the provider call against the timeout
    return Promise.race([
      provider.chatCompletion(request),
      timeoutPromise
    ]);
  }

  /**
   * Synthesize a response from multiple AI responses
   */
  private synthesizeEnsembleResponse(
    primaryResponse: ChatCompletionResponse,
    secondaryResponses: ChatCompletionResponse[]
  ): string {
    // Simple approach: combine all responses and look for common themes
    const allResponses = [
      primaryResponse.choices[0].message.content,
      ...secondaryResponses.map(r => r.choices[0].message.content)
    ];

    // For now, return a simple combination - in a real implementation,
    // this could use more sophisticated techniques like majority voting,
    // semantic similarity analysis, etc.
    return this.combineResponses(allResponses);
  }

  /**
   * Combine multiple responses into a single coherent response
   */
  private combineResponses(responses: string[]): string {
    if (responses.length === 1) {
      return responses[0];
    }

    // Simple combination: list all responses with source attribution
    let combined = "Multiple AI collaboration:\n\n";
    
    for (let i = 0; i < responses.length; i++) {
      const source = i === 0 ? "Primary AI" : `Secondary AI ${i}`;
      combined += `**${source} Response:**\n${responses[i]}\n\n`;
    }
    
    // Add a synthesis section
    combined += "**Synthesized Summary:**\n";
    // In a real implementation, this would use NLP techniques to find common elements
    
    return combined;
  }

  /**
   * Calculate consensus among multiple responses
   */
  private calculateConsensus(responses: ChatCompletionResponse[]): string {
    const contents = responses.map(r => r.choices[0].message.content);
    
    // Simple consensus: return the longest response as it might be most comprehensive
    // In a real implementation, this could use semantic similarity algorithms
    contents.sort((a, b) => b.length - a.length);
    return contents[0] || '';
  }

  /**
   * Calculate confidence score based on agreement between AIs
   */
  private calculateConfidence(responses: ChatCompletionResponse[]): number {
    if (responses.length < 2) {
      return 0.7; // Default confidence if only one response
    }

    // Simple confidence calculation based on response similarity
    // In a real implementation, this would use semantic similarity measures
    const primaryContent = responses[0].choices[0].message.content.toLowerCase();
    let matchingResponses = 1; // Count the primary response
    
    for (let i = 1; i < responses.length; i++) {
      const secondaryContent = responses[i].choices[0].message.content.toLowerCase();
      // Simple check: if both contain similar keywords, consider them matching
      if (this.isSemanticallySimilar(primaryContent, secondaryContent)) {
        matchingResponses++;
      }
    }
    
    return matchingResponses / responses.length;
  }

  /**
   * Simple semantic similarity check (placeholder implementation)
   */
  private isSemanticallySimilar(content1: string, content2: string): boolean {
    // This is a simplified implementation
    // In a real system, use proper NLP techniques
    const words1 = content1.split(/\W+/).filter(w => w.length > 3);
    const words2 = content2.split(/\W+/).filter(w => w.length > 3);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const similarityRatio = commonWords.length / Math.max(words1.length, words2.length);
    
    return similarityRatio > 0.3; // Consider similar if 30%+ words overlap
  }

  /**
   * Analyze validation results and potentially improve the response
   */
  private analyzeValidations(
    primaryResponse: string,
    validationResponses: ChatCompletionResponse[]
  ): { improvedResponse: string; confidence: number } {
    // In a real implementation, this would parse validation feedback
    // and incorporate suggestions into the original response
    
    let hasValidations = false;
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const validation of validationResponses) {
      const content = validation.choices[0].message.content.toLowerCase();
      
      if (content.includes('correct') || content.includes('accurate') || content.includes('valid')) {
        positiveCount++;
      } else if (content.includes('incorrect') || content.includes('issue') || content.includes('problem')) {
        negativeCount++;
        hasValidations = true;
      }
    }
    
    const confidence = hasValidations 
      ? Math.max(0.1, 1 - (negativeCount / validationResponses.length))
      : 0.8; // Default confidence if no specific validations
    
    return {
      improvedResponse: primaryResponse, // Placeholder - in real implementation, apply validation feedback
      confidence
    };
  }

  /**
   * Execute collaboration based on the specified strategy
   */
  async collaborate(
    request: ChatCompletionRequest,
    config: CollaborationConfig
  ): Promise<CollaborationResult> {
    switch (config.strategy) {
      case 'sequential':
        return this.sequentialCollaboration(request, config);
      case 'parallel':
        return this.parallelCollaboration(request, config);
      case 'ensemble':
        return this.ensembleCollaboration(request, config);
      case 'validation':
        return this.validationCollaboration(request, config);
      default:
        return this.ensembleCollaboration(request, config); // Default to ensemble
    }
  }
}

// Export a singleton instance
export const aiCollaborationEngine = new AICollaborationEngine();
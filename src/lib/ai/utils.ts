import { ChatCompletionResponse } from './types';

/**
 * Utility functions for AI collaboration
 */

/**
 * Calculate response quality metrics
 */
export function calculateResponseMetrics(response: ChatCompletionResponse): {
  wordCount: number;
  charCount: number;
  avgWordLength: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
} {
  const content = response.choices[0].message.content;
  
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const charCount = content.length;
  const avgWordLength = wordCount > 0 ? 
    words.reduce((sum, word) => sum + word.length, 0) / wordCount : 0;
  
  // Simple sentiment analysis placeholder
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  
  return {
    wordCount,
    charCount,
    avgWordLength,
    sentiment
  };
}

/**
 * Compare two responses for similarity
 */
export function compareResponses(
  response1: ChatCompletionResponse, 
  response2: ChatCompletionResponse
): {
  similarityScore: number;
  commonPhrases: string[];
  diffPhrases: string[];
} {
  const content1 = response1.choices[0].message.content.toLowerCase();
  const content2 = response2.choices[0].message.content.toLowerCase();
  
  // Split into phrases/sentences
  const phrases1 = content1.split(/[.!?]+/).map(p => p.trim()).filter(p => p.length > 0);
  const phrases2 = content2.split(/[.!?]+/).map(p => p.trim()).filter(p => p.length > 0);
  
  // Find common phrases
  const commonPhrases = phrases1.filter(phrase => 
    phrases2.some(p => p.includes(phrase) || phrase.includes(p))
  );
  
  // Calculate similarity as percentage of common content
  const totalPhrases = Math.max(phrases1.length, phrases2.length);
  const similarityScore = totalPhrases > 0 ? commonPhrases.length / totalPhrases : 0;
  
  // Find differing phrases
  const diffPhrases = [
    ...phrases1.filter(p => !commonPhrases.includes(p)),
    ...phrases2.filter(p => !commonPhrases.includes(p))
  ];
  
  return {
    similarityScore,
    commonPhrases,
    diffPhrases
  };
}

/**
 * Format collaboration results for display
 */
export function formatCollaborationResults(results: any): string {
  let output = "AI Collaboration Results:\n";
  output += "=" .repeat(50) + "\n\n";
  
  if (results.primaryResponse) {
    output += `Primary AI (${results.primaryResponse.model}):\n`;
    output += results.primaryResponse.choices[0].message.content + "\n\n";
  }
  
  if (results.secondaryResponses && results.secondaryResponses.length > 0) {
    output += `Secondary AI Responses (${results.secondaryResponses.length}):\n`;
    results.secondaryResponses.forEach((response: ChatCompletionResponse, idx: number) => {
      output += `\n[${idx + 1}] Model: ${response.model}\n`;
      output += response.choices[0].message.content + "\n";
    });
    output += "\n";
  }
  
  if (results.consensus) {
    output += `Consensus/Synthesized Response:\n`;
    output += results.consensus + "\n\n";
  }
  
  if (results.confidence) {
    output += `Confidence Score: ${(results.confidence * 100).toFixed(1)}%\n\n`;
  }
  
  if (results.errors) {
    output += `Errors Encountered:\n`;
    for (const [provider, error] of Object.entries(results.errors)) {
      output += `- ${provider}: ${error}\n`;
    }
    output += "\n";
  }
  
  return output;
}

/**
 * Estimate cost of API calls based on token usage
 */
export function estimateAPICost(model: string, inputTokens: number, outputTokens: number): number {
  // Approximate costs per 1000 tokens (as of 2024)
  const costs: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'gemini-pro': { input: 0.000125, output: 0.000375 },
    'llama2': { input: 0, output: 0 }, // Assuming local model
    'llama3': { input: 0, output: 0 }, // Assuming local model
  };
  
  const modelCost = costs[model] || costs['gpt-3.5-turbo']; // Default fallback
  
  const inputCost = (inputTokens / 1000) * modelCost.input;
  const outputCost = (outputTokens / 1000) * modelCost.output;
  
  return inputCost + outputCost;
}

/**
 * Validate if an API key is properly formatted for a provider
 */
export function isValidAPIKey(apiKey: string, provider: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  switch (provider) {
    case 'openai':
      // OpenAI keys typically start with "sk-" and are around 51 characters
      return apiKey.startsWith('sk-') && apiKey.length >= 40;
    
    case 'anthropic':
      // Anthropic keys typically start with "sk-ant-"
      return apiKey.startsWith('sk-ant-') && apiKey.length >= 50;
    
    case 'google':
      // Google AI Studio keys are typically 39 characters alphanumeric + hyphens
      return /^[a-zA-Z0-9\-_]{30,}$/.test(apiKey);
    
    case 'ollama':
      // Ollama doesn't require a key, just check if it's present
      return true;
    
    case 'azure-openai':
      // Azure keys are typically longer alphanumeric strings
      return apiKey.length >= 32;
    
    default:
      return apiKey.length >= 10; // Generic check
  }
}
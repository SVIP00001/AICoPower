import { aiManager } from './ai-manager';
import { aiCollaborationEngine, CollaborationConfig } from './collaboration-engine';
import { AIConfig, Message } from './types';

// Example of how to use the multi-AI collaboration system

// Sample configuration for different AI providers
const aiConfigs: Record<string, AIConfig> = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-key',
    model: 'gpt-4',
    provider: 'openai',
    temperature: 0.7,
    maxTokens: 1000
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || 'your-anthropic-key',
    model: 'claude-3-opus-20240229',
    provider: 'anthropic',
    temperature: 0.7,
    maxTokens: 1000
  },
  google: {
    apiKey: process.env.GOOGLE_AI_API_KEY || 'your-google-key',
    model: 'gemini-pro',
    provider: 'google',
    temperature: 0.7,
    maxTokens: 1000
  },
  ollama: {
    apiKey: 'ollama', // Not needed for Ollama, but included for compatibility
    model: 'llama2',
    provider: 'ollama',
    baseURL: 'http://localhost:11434/api',
    temperature: 0.7,
    maxTokens: 1000
  }
};

// Initialize the AI manager with configurations
aiManager.initializeProviders(aiConfigs);

// Example usage of the collaboration engine
async function exampleUsage() {
  // Define a complex query that could benefit from multiple AI perspectives
  const messages: Message[] = [
    {
      role: 'user',
      content: 'Explain the impact of artificial intelligence on modern healthcare, including both benefits and potential risks.'
    }
  ];

  // Example 1: Sequential collaboration (OpenAI -> Anthropic -> Google)
  console.log('=== Sequential Collaboration ===');
  const seqConfig: CollaborationConfig = {
    primaryProvider: 'openai',
    secondaryProviders: ['anthropic', 'google'],
    strategy: 'sequential'
  };

  try {
    const seqResult = await aiCollaborationEngine.collaborate(
      { messages, temperature: 0.7, maxTokens: 1500 },
      seqConfig
    );
    
    console.log('Primary Response:', seqResult.primaryResponse.choices[0].message.content.substring(0, 200) + '...');
    console.log('Number of secondary responses:', seqResult.secondaryResponses?.length || 0);
    console.log('Errors:', seqResult.errors);
  } catch (error) {
    console.error('Sequential collaboration failed:', error);
  }

  // Example 2: Parallel collaboration (all AIs work simultaneously)
  console.log('\n=== Parallel Collaboration ===');
  const parallelConfig: CollaborationConfig = {
    primaryProvider: 'openai',
    secondaryProviders: ['anthropic', 'google'],
    strategy: 'parallel'
  };

  try {
    const parallelResult = await aiCollaborationEngine.collaborate(
      { messages, temperature: 0.7, maxTokens: 1500 },
      parallelConfig
    );
    
    console.log('Primary Response:', parallelResult.primaryResponse.choices[0].message.content.substring(0, 200) + '...');
    console.log('Number of secondary responses:', parallelResult.secondaryResponses?.length || 0);
    console.log('Consensus:', parallelResult.consensus?.substring(0, 200) + '...');
    console.log('Confidence:', parallelResult.confidence);
    console.log('Errors:', parallelResult.errors);
  } catch (error) {
    console.error('Parallel collaboration failed:', error);
  }

  // Example 3: Validation collaboration (OpenAI provides answer, others validate)
  console.log('\n=== Validation Collaboration ===');
  const validationConfig: CollaborationConfig = {
    primaryProvider: 'openai',
    secondaryProviders: ['anthropic', 'google'],
    strategy: 'validation'
  };

  try {
    const validationResult = await aiCollaborationEngine.collaborate(
      { messages, temperature: 0.7, maxTokens: 1500 },
      validationConfig
    );
    
    console.log('Primary Response:', validationResult.primaryResponse.choices[0].message.content.substring(0, 200) + '...');
    console.log('Number of validation responses:', validationResult.secondaryResponses?.length || 0);
    console.log('Improved Response:', validationResult.consensus?.substring(0, 200) + '...');
    console.log('Confidence:', validationResult.confidence);
    console.log('Errors:', validationResult.errors);
  } catch (error) {
    console.error('Validation collaboration failed:', error);
  }

  // Example 4: Ensemble collaboration (combines outputs from multiple AIs)
  console.log('\n=== Ensemble Collaboration ===');
  const ensembleConfig: CollaborationConfig = {
    primaryProvider: 'openai',
    secondaryProviders: ['anthropic', 'google'],
    strategy: 'ensemble'
  };

  try {
    const ensembleResult = await aiCollaborationEngine.collaborate(
      { messages, temperature: 0.7, maxTokens: 1500 },
      ensembleConfig
    );
    
    console.log('Primary Response:', ensembleResult.primaryResponse.choices[0].message.content.substring(0, 200) + '...');
    console.log('Number of secondary responses:', ensembleResult.secondaryResponses?.length || 0);
    console.log('Synthesized Response:', ensembleResult.consensus?.substring(0, 200) + '...');
    console.log('Confidence:', ensembleResult.confidence);
    console.log('Errors:', ensembleResult.errors);
  } catch (error) {
    console.error('Ensemble collaboration failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}

export { aiConfigs, exampleUsage };
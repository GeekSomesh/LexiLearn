/**
 * LLM-based Mindmap Generation Service
 * Uses OpenRouter API to convert chat messages into Mermaid mindmap syntax
 * This approach is more reliable than manual parsing because the LLM understands
 * Mermaid syntax and content context.
 */

import { Message } from '../types';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'kwaipilot/kat-coder-pro:free';

/**
 * Generate Mermaid mindmap syntax by sending chat content to an LLM
 * The LLM handles all syntax validation and produces valid Mermaid code
 */
export async function generateMermaidMindmapViaLLM(messages: Message[]): Promise<string> {
  if (messages.length === 0) {
    return 'mindmap\n  root((Chat Mindmap))\n    No messages yet';
  }

  // Build conversation text for the LLM
  const conversationText = messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  const systemPrompt = `You are an expert at converting conversations into Mermaid mindmap diagrams optimized for dyslexic readers.
Your task is to analyze the provided conversation and generate a valid Mermaid mindmap syntax that visualizes the key topics, questions, and answers discussed.

IMPORTANT: This mindmap will be read by people with dyslexia. Use these guidelines:
- Keep labels SHORT and simple (max 4-5 words per node)
- Use clear, common vocabulary (avoid jargon)
- Organize hierarchically with clear parent-child relationships
- Limit to 3-4 main branches maximum
- Keep nesting shallow (max 3 levels deep)
- Use descriptive, concrete words rather than abstract concepts

Rules for generating Mermaid mindmap:
1. Start with: mindmap
2. Root node: root((Main Topic))
3. Create 3-4 main topic branches as direct children of root
4. Under each main topic, add 2-3 key points/subtopics
5. Use quotes around text that contains special characters or spaces
6. Each line represents a node; indentation (2 spaces per level) determines hierarchy
7. Keep labels SHORT and memorable
8. Avoid special characters like #, @, &, etc. in node names unless quoted
9. Focus on the most important concepts - less is more!
10. Return ONLY the Mermaid mindmap code, nothing else

Example format (DYSLEXIA-FRIENDLY):
mindmap
  root((Apache Kafka))
    What It Does
      Handles Data Streams
      Real-Time Processing
    Why Use It
      Reliable Messaging
      Decouples Services
    How It Works
      Topics Store Data
      Consumers Read Messages

Generate the mindmap for this conversation:
${conversationText}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://dyslearnai.local',
        'X-Title': 'DysLearnAI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: 'Generate the Mermaid mindmap for the conversation above.'
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent formatting
        max_tokens: 2000,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || JSON.stringify(errorData);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected response format from OpenRouter API');
    }

    const mermaidCode = data.choices[0].message.content.trim();
    
    // Validate that the response starts with 'mindmap' keyword
    if (!mermaidCode.toLowerCase().startsWith('mindmap')) {
      throw new Error('LLM did not return valid Mermaid mindmap syntax');
    }

    return mermaidCode;
  } catch (error) {
    console.error('Error generating mindmap via LLM:', error);
    throw error;
  }
}

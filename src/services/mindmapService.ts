/**
 * Mindmap Generation Service
 * Converts chat conversation into a Mermaid.js mindmap
 */

import { Message } from '../types';

export interface MermaidMindmapConfig {
  title: string;
  messages: Message[];
}

/**
 * Generate Mermaid mindmap syntax from chat messages
 * Groups messages into topics and creates a hierarchical structure
 */
export async function generateMermaidMindmap(messages: Message[]): Promise<string> {
  if (messages.length === 0) {
    return 'mindmap\n  root((Chat Mindmap))\n    No messages yet';
  }

  // Group messages by topic (every assistant response is a main topic)
  const topics: { question: string; answer: string }[] = [];
  let currentQuestion = '';

  for (const msg of messages) {
    if (msg.role === 'user') {
      currentQuestion = msg.content.substring(0, 100); // Truncate long questions
    } else if (msg.role === 'assistant' && currentQuestion) {
      topics.push({
        question: currentQuestion,
        answer: msg.content.substring(0, 150) // Truncate long answers
      });
    }
  }

  // Build Mermaid mindmap syntax
  let mermaidSyntax = 'mindmap\n  root((Chat Overview))\n';

  if (topics.length === 0) {
    mermaidSyntax += '    "No conversation yet"\n';
  } else {
    topics.forEach((topic) => {
      // Main topic from user question (quoted to be safe)
      const cleanQuestion = sanitizeForMermaid(topic.question).replace(/"/g, "'");
      mermaidSyntax += `    "${cleanQuestion}"\n`;

      // Extract key points from answer and nest them under the question
      const keyPoints = extractKeyPoints(topic.answer);
      keyPoints.forEach((point) => {
        const cleanPoint = sanitizeForMermaid(point).replace(/"/g, "'");
        mermaidSyntax += `      "${cleanPoint}"\n`;
      });
    });
  }

  return mermaidSyntax;
}

/**
 * Extract 2-3 key points from a longer text
 */
function extractKeyPoints(text: string): string[] {
  // Split by sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Get first 2-3 sentences, clean them up
  return sentences
    .slice(0, 3)
    .map(s => s.trim().replace(/^[\s\n]+|[\s\n]+$/g, ''))
    .filter(s => s.length > 10)
    .map(s => s.substring(0, 80)); // Truncate to fit in mindmap
}

/**
 * Sanitize text for Mermaid mindmap syntax
 * Remove special characters and limit length
 */
function sanitizeForMermaid(text: string): string {
  return text
    .replace(/[\"]/g, "'") // Replace double quotes with single quotes
    .replace(/[#\[\]{}()]/g, '') // Remove special Mermaid syntax chars
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Generate a simplified text summary for the mindmap title
 */
export function extractChatTopic(messages: Message[]): string {
  // Get first user message as the main topic
  const firstUserMsg = messages.find(msg => msg.role === 'user');
  if (firstUserMsg) {
    return sanitizeForMermaid(firstUserMsg.content).substring(0, 50);
  }
  return 'Chat Conversation';
}

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'kwaipilot/kat-coder-pro:free';

interface OpenRouterMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const callOpenRouter = async (messages: OpenRouterMessage[]): Promise<string> => {
  try {
    // Add system instruction to avoid markdown symbols
    const messagesWithSystem = [
      {
        role: 'system' as const,
        content: 'You are a helpful companion designed for learners with dyslexia. Please respond in clear, simple language without using ### symbols, ** bold markers, * italics, or any other markdown formatting. Just use plain text with proper spacing between paragraphs. Make your responses easy to read and understand. And also remember that the dyslexic learner may have trouble with long words, so try to use shorter alternatives where possible.until and unless he is saying u to give proper responses and all.ALSO DONT USE BOLD CHARACTERS TOO'
      },
      ...messages
    ];

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
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || JSON.stringify(data);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorMessage}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected response format from OpenRouter API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
};

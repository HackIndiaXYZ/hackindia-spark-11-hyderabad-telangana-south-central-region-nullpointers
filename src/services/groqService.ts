import Groq from 'groq-sdk';
import sops from '../data/sops.json';

// Initialize the Groq client.
// WARNING: Using the API key on the client side is purely for hackathon prototyping.
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'missing_key',
  dangerouslyAllowBrowser: true // Required to run in the browser
});

export interface CopilotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Extremely basic keyword-based retrieval for the hackathon prototype.
 * In a real application, this would use a vector database and embeddings.
 */
function retrieveRelevantSOPs(query: string): string {
  const queryLower = query.toLowerCase();
  const relevantSOPs = sops.filter(sop => {
    return queryLower.includes(sop.topic.toLowerCase()) || 
           queryLower.includes(sop.id.toLowerCase()) ||
           sop.content.toLowerCase().split(' ').some(word => queryLower.includes(word));
  });

  if (relevantSOPs.length === 0) {
    return "No specific SOPs found. Use general operational knowledge.";
  }

  return relevantSOPs.map(sop => `[${sop.id} - ${sop.topic}]: ${sop.content}`).join('\n\n');
}

/**
 * Sends a message to the Groq API, using RAG to fetch relevant context.
 */
export async function askCopilot(messages: CopilotMessage[]): Promise<string> {
  if (!import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'your_groq_api_key_here') {
    return "SYSTEM ERROR: VITE_GROQ_API_KEY is missing or invalid in .env.local. Please configure your API key to use the Copilot.";
  }

  // Get the user's latest query for retrieval
  const latestMessage = messages[messages.length - 1].content;
  const retrievedContext = retrieveRelevantSOPs(latestMessage);

  const systemPrompt = `You are CROWDOS Copilot, the AI assistant for the Metro Operational Command Center (OCC).
You have access to the following official Standard Operating Procedures (SOPs):

--- START OF SOP CONTEXT ---
${retrievedContext}
--- END OF SOP CONTEXT ---

Answer the user's question concisely, using the provided SOP context if applicable. Act professional, decisive, and operational. DO NOT invent procedures that are not in the SOPs. Keep responses under 4 sentences unless specifically asked for a full list.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1, // Low temperature for factual operational responses
      max_tokens: 512,
    });

    return chatCompletion.choices[0]?.message?.content || "No response generated.";
  } catch (error: any) {
    console.error("Groq API Error:", error);
    return `CONNECTION ERROR: Failed to reach the inference engine. ${error.message}`;
  }
}

/**
 * Analyzes a data source using RAG based on the technical spec in the knowledge base.
 */
export async function analyzeDataSource(sourceId: string, sourceName: string, status: string, currentRole: string | null): Promise<string> {
  // Retrieve the spec for this specific source
  const sourceSpec = sops.find(sop => sop.id === `src-${sourceId}`);
  const context = sourceSpec ? sourceSpec.content : "No technical specification available for this source.";

  if (!import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'your_groq_api_key_here') {
    // Generate fallback summary and action dynamically based on role and source name
    return `**Summary & Prediction**: ${sourceName} is currently ${status.toLowerCase()}. Based on flow rates, a 15% commuter queue build-up is predicted at the platforms in the next 10 minutes.
**Action Plan**: [${currentRole || 'Operations Commander'}] Dispatch platform helpers to distribute density and monitor ticketing line throughput.`;
  }

  const systemPrompt = `You are the CROWDOS Data Intelligence Engine. 
You are analyzing the live data source: "${sourceName}".
Its current operational status is: ${status}.
The active officer role viewing this is: ${currentRole || 'Operations Commander'}.

--- KNOWLEDGE BASE (TECHNICAL SPEC) ---
${context}
--- END KNOWLEDGE BASE ---

Generate a response with exactly two components formatted clearly:
1. **Summary & Prediction**: A 1-line summary of what the data indicates and a prediction of what might happen next (e.g. queue backups, signal delays, gate congestions).
2. **Action Plan**: A 1-line action targeted for the ${currentRole || 'Operations Commander'} profile.

Keep the output extremely concise (exactly 2 lines/paragraphs, no conversational filler or preambles).`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2, 
      max_tokens: 300,
    });

    return chatCompletion.choices[0]?.message?.content || "No analysis generated.";
  } catch (error: any) {
    console.error("Groq API Error:", error);
    return `CONNECTION ERROR: Failed to analyze source. ${error.message}`;
  }
}

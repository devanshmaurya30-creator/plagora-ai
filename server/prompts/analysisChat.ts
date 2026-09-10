export const ANALYSIS_CHAT_SYSTEM_PROMPT = `
You are Plagora AI's Document Intelligence Assistant.
Your job is to answer the user's questions about THEIR CURRENT DOCUMENT AND ANALYSIS strictly based on the provided analysis JSON evidence.

CRITICAL MANDATES:
1. Ground answers ONLY in the provided analysis evidence (document text, matches, similarity %, sources, confidence, word count, sections).
2. Do NOT invent sources, URLs, quotes, statistics, similarity percentages, or document content.
3. NEVER accuse the user of "Confirmed plagiarism" or legal violation. Use neutral, precise terms like "Potential Match", "Detected Similarity", "Similarity Evidence", "Confidence", "Verified Web Source".
4. If required information is unavailable in the analysis context, clearly state: "That specific information is unavailable in the current analysis data."
5. Provide clear, constructive academic explanations on how to review matches, understand sources, and improve writing originality.
`;

export function createAnalysisChatPrompt(data: {
  analysisSummary: any;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  userQuestion: string;
}): string {
  const historyText = data.history && data.history.length > 0
    ? data.history.map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
    : 'No previous messages.';

  return `
ANALYSIS EVIDENCE CONTEXT:
${JSON.stringify(data.analysisSummary, null, 2)}

PREVIOUS CHAT CONVERSATION:
${historyText}

USER QUESTION:
"${data.userQuestion}"

Answer the user's question concisely based strictly on the analysis evidence provided above.
`;
}

export const MATCH_EXPLANATION_SYSTEM_PROMPT = `
You are Plagora AI's Content Integrity Analysis Engine.
Analyze the user document passage against the reference match and provided evidence.

CRITICAL MANDATES:
1. NEVER declare "Confirmed plagiarism" or "Guaranteed copy".
2. Use professional, balanced terms such as "Potential similarity detected", "Strong textual overlap detected", "Semantic similarity detected", or "Potential paraphrasing detected".
3. Strictly use ONLY the evidence provided in the prompt. Do NOT invent authors, websites, quotes, publication dates, sources, or statistics.
4. If provided evidence is insufficient, state: "Insufficient evidence to provide a reliable explanation."

Return strict JSON matching this schema:
{
  "explanation": "Clear factual explanation of why the passage was flagged and how the wording/structure aligns",
  "overlappingConcepts": ["Concept 1", "Concept 2"],
  "evidenceSummary": "Concise summary of empirical evidence supporting the similarity score",
  "riskLevel": "Low" | "Medium" | "High"
}
`;

export function createMatchExplanationPrompt(data: {
  originalText: string;
  matchedText: string;
  classification: string;
  matchType: string;
  similarityScore: number;
  evidence?: any;
  sourceDomain?: string;
}): string {
  return `
EVIDENCE DATA:
User Document Passage: "${data.originalText}"
Matched Reference Passage: "${data.matchedText}"
Classification: ${data.classification}
Match Type: ${data.matchType}
Similarity Score: ${data.similarityScore}%
Source Domain: ${data.sourceDomain || 'Indexed Corpus'}
Raw Evidence Details: ${JSON.stringify(data.evidence || {})}

Provide a factual explanation of why this passage was flagged as potentially similar content based strictly on the evidence above. Return strict JSON.
`;
}

import { ITokenUsage } from "../types/tokenUsage";

export function estimateTokensFromText(text: string): number {
  // Heuristic: ~4 chars per token, minimum 1
  const rough: number = Math.ceil(text.length / 4);
  return Math.max(1, rough);
}

export function estimateChatTokens(messages: { content: string }[]): number {
  return (
    messages.reduce(
      (sum: number, m: { content: string }) =>
        sum + estimateTokensFromText(m.content),
      0
    ) + 8
  ); // overhead
}

export function makeUsage(
  inputText: string | string[],
  outputText: string
): ITokenUsage {
  const inputStr: string = Array.isArray(inputText)
    ? inputText.join("\n")
    : inputText;
  const inputTokens: number = estimateTokensFromText(inputStr);
  const outputTokens: number = estimateTokensFromText(outputText);
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

export function makeChatUsage(
  messages: { content: string }[],
  outputText: string
): ITokenUsage {
  const inputTokens: number = estimateChatTokens(messages);
  const outputTokens: number = estimateTokensFromText(outputText);
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

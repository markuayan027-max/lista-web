/** Server-side Groq credentials (never expose to the client). */
export function getGroqApiKey(): string | undefined {
  const key =
    process.env.GROQ_API_KEY?.trim() ||
    process.env.GROQ_KEY?.trim() ||
    process.env.VITE_GROQ_API_KEY?.trim();
  return key || undefined;
}

export function getGroqModel(): string {
  return (
    process.env.GROQ_MODEL?.trim() ||
    process.env.VITE_GROQ_MODEL?.trim() ||
    "llama-3.3-70b-versatile"
  );
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey());
}

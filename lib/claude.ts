import Anthropic from "@anthropic-ai/sdk";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizConfig {
  numQuestions: number;
  passingScore: number;
  maxAttempts: number;
  language: "fr" | "en";
  keyword: string;
  dynamicQuestions: boolean;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  numQuestions: 10,
  passingScore: 70,
  maxAttempts: 3,
  language: "fr",
  keyword: "@sphinx-ci",
  dynamicQuestions: false,
};

const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 20;

export function scaleQuestionCount(
  baseline: number,
  diff: string,
  filesChanged: string[]
): number {
  const lines = diff ? diff.split("\n").length : 0;
  const files = filesChanged?.length ?? 0;
  const weight = lines + files * 20;

  let factor: number;
  if (weight < 30) factor = 0.5;
  else if (weight < 100) factor = 0.75;
  else if (weight < 300) factor = 1;
  else if (weight < 800) factor = 1.5;
  else factor = 2;

  const scaled = Math.round(baseline * factor);
  return Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, scaled));
}

const PROMPTS = {
  fr: (numQuestions: number) => ({
    system: `Tu es un expert code review. Analyse le diff de Pull Request et génère exactement ${numQuestions} questions à choix multiples pour tester la compréhension du développeur sur son propre code.`,
    instructions: `Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks, sans texte avant ou après.

Structure exacte :
{
  "questions": [
    {
      "id": 1,
      "question": "Question précise sur le code",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "Explication courte (1-2 phrases)"
    }
  ]
}

Règles impératives :
- Générer exactement ${numQuestions} questions
- Questions UNIQUEMENT sur le code du diff fourni (pas de questions génériques)
- Couvrir : logique métier, gestion d'erreurs, effets de bord, patterns utilisés, cas limites, impacts potentiels
- "correct" est l'index (0-3) de la bonne réponse dans "options"
- Niveau de difficulté : développeur senior relisant son propre travail
- Varier les types : compréhension, analyse d'impact, détection de bugs potentiels
- Les mauvaises réponses doivent être plausibles (pas triviales)`,
  }),
  en: (numQuestions: number) => ({
    system: `You are a code review expert. Analyze the Pull Request diff and generate exactly ${numQuestions} multiple-choice questions to test the developer's understanding of their own code.`,
    instructions: `Respond ONLY with valid JSON, no markdown, no backticks, no text before or after.

Exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Precise question about the code",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "Short explanation (1-2 sentences)"
    }
  ]
}

Mandatory rules:
- Generate exactly ${numQuestions} questions
- Questions ONLY about the code in the provided diff (no generic questions)
- Cover: business logic, error handling, side effects, patterns used, edge cases, potential impacts
- "correct" is the index (0-3) of the correct answer in "options"
- Difficulty level: senior developer reviewing their own work
- Vary types: comprehension, impact analysis, potential bug detection
- Wrong answers must be plausible (not trivial)`,
  }),
};

export async function generateQuizQuestions(
  prTitle: string,
  filesChanged: string[],
  diff: string,
  anthropicApiKey: string,
  config: QuizConfig = DEFAULT_QUIZ_CONFIG
): Promise<QuizQuestion[]> {
  const client = new Anthropic({ apiKey: anthropicApiKey });
  const lang = PROMPTS[config.language] || PROMPTS.fr;
  const { system, instructions } = lang(config.numQuestions);

  const prompt = `${instructions}

PR : "${prTitle}"
Fichiers modifiés : ${filesChanged.join(", ")}

DIFF :
${diff}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const message = await client.messages.create(
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: prompt }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text);

    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length !== config.numQuestions
    ) {
      throw new Error(
        `Claude did not return exactly ${config.numQuestions} questions`
      );
    }

    for (const q of parsed.questions) {
      if (
        typeof q.id !== "number" ||
        typeof q.question !== "string" ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correct !== "number" ||
        q.correct < 0 ||
        q.correct > 3 ||
        typeof q.explanation !== "string"
      ) {
        throw new Error("Invalid question format");
      }
    }

    return parsed.questions as QuizQuestion[];
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

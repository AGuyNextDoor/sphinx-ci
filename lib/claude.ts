import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export async function generateQuizQuestions(
  prTitle: string,
  filesChanged: string[],
  diff: string
): Promise<QuizQuestion[]> {
  const prompt = `Tu es un expert code review. Analyse ce diff de Pull Request et génère exactement 10 questions à choix multiples pour tester la compréhension du développeur sur son propre code.

PR : "${prTitle}"
Fichiers modifiés : ${filesChanged.join(", ")}

DIFF :
${diff}

Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks, sans texte avant ou après.

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
- Questions UNIQUEMENT sur le code du diff fourni (pas de questions génériques)
- Couvrir : logique métier, gestion d'erreurs, effets de bord, patterns utilisés, cas limites, impacts potentiels
- "correct" est l'index (0-3) de la bonne réponse dans "options"
- Niveau de difficulté : développeur senior relisant son propre travail
- Varier les types : compréhension, analyse d'impact, détection de bugs potentiels
- Les mauvaises réponses doivent être plausibles (pas triviales)`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const message = await anthropic.messages.create(
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
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
      parsed.questions.length !== 10
    ) {
      throw new Error("Claude did not return exactly 10 questions");
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

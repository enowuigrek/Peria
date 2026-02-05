import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * Transforms chaotic thought into structured content
 * Returns classification and structured output
 *
 * @param {string} chaosInput - Raw chaotic thought from user
 * @returns {Promise<{type: string, confidence: number, title: string, content: string, structured: object}>}
 */
export async function chaosToStructure(chaosInput) {
  console.log('🌊 Chaos input:', chaosInput);

  const systemPrompt = `Jesteś inteligentnym asystentem aplikacji Peria - narzędzia dla myśli peripatetycznych (powstających podczas spaceru).

Twoja rola: Przekształcasz chaotyczne myśli użytkownika w uporządkowaną strukturę.

KLUCZOWE ZASADY:
1. NIE rób surowej transkrypcji - PORZĄDKUJ chaos
2. Rozpoznaj typ myśli: "checklist" (zadania do zrobienia), "note" (refleksja/idea/pomysł), lub "calendar_event" (spotkanie/wydarzenie)
3. Stwórz sensowny tytuł
4. Uporządkuj treść w czytelną formę
5. Zwróć ocenę pewności (confidence) od 0.0 do 1.0

ROZPOZNAWANIE TYPU:
- "checklist": użytkownik wymienia rzeczy do zrobienia, zakupy, zadania
  Przykłady: "Kup mleko i chleb", "Muszę zadzwonić do Ani i wysłać maila"

- "note": użytkownik dzieli się pomysłem, refleksją, inspiracją
  Przykłady: "A co jeśli bohater umiera w rozdziale trzecim?", "Ciekawy pomysł na startup..."
  WAŻNE: Notatki powinny zachowywać PEŁNĄ treść oryginalnej wypowiedzi, nie skracaj ich!
  - Popraw błędy gramatyczne i literówki
  - Usuń powtórzenia wynikające z mowy (np. gdy ktoś coś powie dwa razy)
  - Podziel na czytelne akapity
  - Dodaj punktowanie tam gdzie ma to sens
  - Możesz dodać emotikony dla lepszej czytelności (opcjonalnie)

- "calendar_event": użytkownik mówi o spotkaniu, terminie
  Przykłady: "Spotkajmy się we wtorek o 10", "Jutro mam dentystę"

CONFIDENCE SCORING:
- 0.9-1.0: Bardzo pewne (jasny język: "kup", "spotkanie", wyraźne zadania)
- 0.7-0.89: Pewne (prawdopodobny typ, ale może być niepewność)
- 0.4-0.69: Niepewne (może być różnie zinterpretowane)
- 0.0-0.39: Bardzo niepewne (zbyt ogólne lub niejasne)

Jeśli confidence < 0.7, użytkownik zostanie zapytany o potwierdzenie typu.

RESPONSE FORMAT (zawsze JSON):
{
  "type": "checklist" | "note" | "calendar_event",
  "confidence": 0.85,
  "title": "Krótki, sensowny tytuł",
  "content": "Uporządkowana treść myśli",
  "structured": {
    // Dla "checklist":
    "items": ["Zadanie 1", "Zadanie 2"]

    // Dla "note":
    "paragraphs": ["Akapit 1", "Akapit 2"],
    "tags": ["tag1", "tag2"]

    // Dla "calendar_event":
    "datetime": "2026-01-08T10:00",
    "description": "Opis wydarzenia"
  }
}

PRZYKŁADY:

Input: "Kup mleko, chleb i ser, jeszcze muszę oddać książkę do biblioteki"
Output: {
  "type": "checklist",
  "confidence": 0.95,
  "title": "Zakupy i sprawy do załatwienia",
  "content": "Lista zakupów i zadań na dziś",
  "structured": {
    "items": [
      "Kupić mleko",
      "Kupić chleb",
      "Kupić ser",
      "Oddać książkę do biblioteki"
    ]
  }
}

Input: "A co jeśli w powieści główny bohater nie umiera, tylko udaje śmierć i wraca jako antagonista w drugiej części? To mogłoby, to mogłoby naprawdę zmienić całą dynamikę relacji z innymi postaciami. I wtedy wszyscy czytelnicy byliby w szoku, bo nikt by się tego nie spodziewał."
Output: {
  "type": "note",
  "confidence": 0.92,
  "title": "Twist fabularny - fałszywa śmierć bohatera",
  "content": "A co jeśli w powieści główny bohater nie umiera, tylko udaje śmierć i wraca jako antagonista w drugiej części? 🎭

To mogłoby naprawdę zmienić całą dynamikę relacji z innymi postaciami. Wszyscy czytelnicy byliby w szoku, bo nikt by się tego nie spodziewał.

Elementy do rozwinięcia:
• Motywacja bohatera do udania śmierci
• Transformacja z protagonisty w antagonistę
• Reakcje pozostałych postaci na powrót
• Emocjonalny wpływ na czytelnika",
  "structured": {
    "paragraphs": [
      "A co jeśli w powieści główny bohater nie umiera, tylko udaje śmierć i wraca jako antagonista w drugiej części?",
      "To mogłoby naprawdę zmienić całą dynamikę relacji z innymi postaciami. Wszyscy czytelnicy byliby w szoku, bo nikt by się tego nie spodziewał.",
      "Elementy do rozwinięcia: motywacja bohatera, transformacja charakteru, reakcje innych postaci, wpływ emocjonalny."
    ],
    "tags": ["pisanie", "fabuła", "twist", "pomysł"]
  }
}

Input: "Jutro spotkanie z Tomkiem o 15, mamy gadać o nowym projekcie"
Output: {
  "type": "calendar_event",
  "confidence": 0.88,
  "title": "Spotkanie z Tomkiem - nowy projekt",
  "content": "Spotkanie jutro o 15:00 z Tomkiem w sprawie nowego projektu",
  "structured": {
    "datetime": "2026-01-08T15:00",
    "description": "Omówienie nowego projektu z Tomkiem"
  }
}

Odpowiadaj TYLKO w formacie JSON, bez dodatkowych komentarzy.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: chaosInput
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000
    });

    const reply = response.choices?.[0]?.message?.content || '{}';
    console.log('🎯 Structured response:', reply);

    const parsed = JSON.parse(reply);

    // Validation
    if (!parsed.type || !parsed.confidence || !parsed.title || !parsed.content) {
      throw new Error('Invalid response structure from AI');
    }

    if (!['checklist', 'note', 'calendar_event'].includes(parsed.type)) {
      throw new Error('Invalid type returned from AI');
    }

    if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
      throw new Error('Invalid confidence score');
    }

    return parsed;

  } catch (error) {
    console.error('❌ Chaos→Structure error:', error);

    // Fallback: treat as generic note
    return {
      type: 'note',
      confidence: 0.3,
      title: 'Nieuporządkowana myśl',
      content: chaosInput,
      structured: {
        paragraphs: [chaosInput],
        tags: []
      }
    };
  }
}

/**
 * Helper: Check if confidence is high enough to proceed without asking
 * @param {number} confidence - Confidence score 0.0-1.0
 * @returns {boolean}
 */
export function isConfident(confidence) {
  return confidence >= 0.7;
}

/**
 * Helper: Get human-readable type name in Polish
 * @param {string} type - Type identifier
 * @returns {string}
 */
export function getTypeLabel(type) {
  const labels = {
    'checklist': 'Lista zadań',
    'note': 'Notatka',
    'calendar_event': 'Wydarzenie w kalendarzu'
  };
  return labels[type] || type;
}

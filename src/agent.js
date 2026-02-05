import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// STARA FUNKCJA (deprecated, zostaje dla kompatybilności)
export async function askAgent(message) {
  console.log('🔑 API Key:', import.meta.env.VITE_OPENAI_API_KEY);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Jesteś asystentem pomagającym tworzyć listę zadań. Użytkownik pisze wiadomość, a Ty wypisujesz z niej osobne zadania w postaci listy. Każde zadanie podaj w nowej linii, bez numeracji, tylko czysty tekst.'
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    const reply = response.choices?.[0]?.message?.content || '';
    console.log('📦 Odpowiedź z AI:', reply);

    if (!reply.trim()) {
      console.warn('⚠️ OpenAI returned an empty message.');
      return '[Brak odpowiedzi z AI]';
    }

    return reply.split('\n').filter(t => t.trim() !== '');

  } catch (error) {
    console.error('❌ Błąd OpenAI:', error);
    return '[Błąd po stronie AI]';
  }
}

// NOWA FUNKCJA: Chaos → Struktura (jedna notatka = źródło prawdy)
export async function detectStructure(sourceText) {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const prompt = `
Użytkownik nagrał chaotyczną myśl:
"${sourceText}"

Twoim zadaniem jest wykryć i sklasyfikować:

1. ZADANIA (tasks) - konkretne akcje do zrobienia
   Przykłady: "kupić mleko", "zadzwonić do lekarza", "napisać email"

2. WYDARZENIA (events) - daty, godziny, spotkania, przypomnienia
   Przykłady: "spotkanie jutro o 15", "dentysta w piątek 10:00"
   ZAWSZE oblicz konkretną datę (jeśli "jutro" → policz dzisiejszą datę + 1)

3. POMYSŁY KREATYWNE (creative) - wszystko inne: notatki, pomysły, teksty, myśli
   Przykłady: "pomysł na startup", "zwrotka o samotności", "refleksja o życiu"

ZASADY:
- NIE zmieniaj treści, tylko kategoryzuj
- Date/time w formacie ISO: YYYY-MM-DD, HH:MM
- Jeśli "jutro" → policz datę (dzisiaj: ${currentDate})
- Jeśli nie ma elementów → zwróć [] lub null

Zwróć TYLKO JSON (bez markdown, bez wyjaśnień):
{
  "tasks": [{ "text": "..." }],
  "events": [{ "title": "...", "date": "YYYY-MM-DD", "time": "HH:MM" }],
  "creative": "..." lub null
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // tańszy i szybszy niż gpt-4
      messages: [
        {
          role: 'system',
          content: 'Jesteś asystentem wykrywającym strukturę w chaotycznych myślach. Zwracasz TYLKO JSON bez żadnych dodatkowych wyjaśnień.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3  // niska temperatura = bardziej deterministyczne
    });

    const reply = response.choices[0].message.content.trim();
    console.log('🔍 AI detection raw:', reply);

    // Usuń markdown jeśli jest (```json ... ```)
    const jsonStr = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const detected = JSON.parse(jsonStr);
    console.log('✅ AI detection parsed:', detected);

    return detected;

  } catch (error) {
    console.error('❌ AI detection error:', error);

    // Fallback: wszystko jako creative
    return {
      tasks: [],
      events: [],
      creative: sourceText
    };
  }
}
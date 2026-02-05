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
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const dayOfWeek = now.toLocaleDateString('pl-PL', { weekday: 'long' }); // np. "środa"

  const prompt = `
Użytkownik nagrał chaotyczną myśl:
"${sourceText}"

Dzisiaj jest: ${currentDate} (${dayOfWeek})

Twoim zadaniem jest:
1. Wymyślić krótki, sensowny TYTUŁ dla tej notatki (2-6 słów)
2. Wykryć i sklasyfikować zawartość:

   a) NOTATKA (note) - uporządkowana treść notatki, pomysły, teksty, myśli
      Przykłady: "pomysł na startup X", "zwrotka rapowa o Y", "refleksja o Z"
      ZASADY dla notatek:
      - Zachowaj DOKŁADNY tekst dyktowany przez użytkownika
      - Popraw błędy gramatyczne i ortograficzne
      - Usuń ewidentne powtórzenia słów
      - Podziel tekst na akapity (używaj \n\n między akapitami)
      - Dodaj emotikony tam, gdzie pasują do treści
      - Zadbaj o to, aby tekst był przyjemny do czytania

   b) CHECKLISTA (checklist) - konkretne akcje do zrobienia
      Przykłady: "kupić mleko", "zadzwonić do lekarza", "napisać email"

   c) WYDARZENIA (events) - daty, godziny, spotkania, okresy czasowe
      Przykłady: "spotkanie jutro o 15", "dentysta w piątek 10:00", "trening od 16 do 17"
      OBLICZ konkretną datę:
      - "jutro" → ${currentDate} + 1 dzień
      - "w przyszłą środę" → oblicz najbliższą środę po dzisiejszym dniu
      - "za tydzień" → ${currentDate} + 7 dni

      WAŻNE dla przedziałów czasowych:
      - Dla godzin w ciągu dnia (np. "trening od 16 do 17"):
        * Użyj time i endTime w jednym wydarzeniu
        * Przykład: { "title": "Trening", "date": "2026-01-11", "time": "16:00", "endTime": "17:00" }

      - Dla okresów wielodniowych (np. "podróż do Grecji na dwa tygodnie"):
        * Stwórz JEDNO wydarzenie z date (start) i endDate (koniec)
        * Przykład: { "title": "Podróż do Grecji", "date": "2026-01-11", "endDate": "2026-01-25" }
        * NIE twórz dwóch osobnych wydarzeń!

ZASADY OGÓLNE:
- Dla notatek: poprawiaj gramatykę, usuń powtórzenia, dodaj emotikony i akapity
- Dla checklist i events: przepisz dokładnie bez zmian
- Date/time w formacie: "YYYY-MM-DD" i "HH:MM"
- Jeśli brak elementów danego typu → zwróć [] lub null
- Tytuł ma być krótki i opisowy

Zwróć TYLKO JSON (bez markdown):
{
  "title": "Krótki tytuł notatki",
  "note": "tekst notatki" lub null,
  "checklist": [{ "text": "..." }],
  "events": [{
    "title": "...",
    "date": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD" lub null (dla okresów wielodniowych),
    "time": "HH:MM" lub null,
    "endTime": "HH:MM" lub null (dla przedziałów godzinowych w tym samym dniu)
  }]
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

    // Fallback: wszystko jako notatka
    return {
      title: "Notatka",
      note: sourceText,
      checklist: [],
      events: []
    };
  }
}
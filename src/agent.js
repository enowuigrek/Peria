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
  const currentTime = now.toTimeString().slice(0, 5);   // HH:MM
  const dayOfWeek = now.toLocaleDateString('pl-PL', { weekday: 'long' });

  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const dayAfterTomorrow = new Date(now); dayAfterTomorrow.setDate(now.getDate() + 2);
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const prompt = `
Użytkownik nagrał chaotyczną myśl:
"${sourceText}"

Dzisiaj jest: ${currentDate} (${dayOfWeek}), godzina: ${currentTime}
Jutro: ${tomorrowStr} | Pojutrze: ${dayAfterTomorrowStr} | Za tydzień: ${nextWeekStr}

Twoim zadaniem jest:
1. Wymyślić krótki, sensowny TYTUŁ (2-6 słów)
2. Wykryć i sklasyfikować zawartość

═══════════════════════════════════════════════════
KATEGORIE (możliwe kombinacje):

a) NOTATKA (note) — tekstowa myśl, pomysł, refleksja, cytat, tekst
   ► ZASADY:
      - Zachowaj tekst SŁOWO W SŁOWO — NIE streszczaj, NIE interpretuj
      - Popraw TYLKO błędy gramatyczne i ortograficzne
      - Podziel na akapity (\\n\\n) gdy tekst jest długi
      - Dodaj emotikony pasujące do kontekstu (z umiarem)
      - NIE zmieniaj sensu ani kolejności myśli

b) CHECKLISTA (checklist) — lista do odhaczenia
   ► Dwa podtypy — rozróżnij precyzyjnie:

   1) LISTA ZAKUPÓW — gdy użytkownik mówi o produktach do kupienia:
      Kluczowe słowa: kupić, ze sklepu, do domu, produkty (mleko, chleb, jabłka, szampon...)
      → isShoppingList: true
      → listName: kontekstowa nazwa listy (np. "Zakupy na weekend", "Do apteki", "Lista spożywcza")
      → items: [{ "text": "Mleko", "qty": "2 litry" }]
         * W "text" wpisuj sam produkt BEZ słowa "Kupić"
         * W "qty" wpisuj ilość/jednostkę jeśli podano, inaczej ""

   2) ZWYKŁA CHECKLISTA — zadania do wykonania (działania, nie produkty):
      → isShoppingList: false
      → listName: null
      → items: [{ "text": "Zadzwonić do lekarza", "qty": "" }]

c) WYDARZENIA (events) — daty, godziny, spotkania
   ► JEDNOSTKI CZASU (zawsze przelicz na ISO):
      - "jutro" → ${tomorrowStr}
      - "pojutrze" → ${dayAfterTomorrowStr}
      - "za tydzień" → ${nextWeekStr}
      - "za kwadrans" → ${currentDate}, ${currentTime} + 15 min
      - "za pół godziny" → ${currentDate}, ${currentTime} + 30 min
      - "za godzinę" → ${currentDate}, ${currentTime} + 60 min
      - "w przyszłą [dzień]" → oblicz najbliższy taki dzień tygodnia po dziś
      - "w ten [dzień]" → oblicz najbliższy taki dzień (może być dziś)
      - "w weekend" → najbliższa sobota po dziś

   PRZEDZIAŁY GODZINOWE: → JEDNO wydarzenie z time + endTime
   OKRESY WIELODNIOWE: → JEDNO wydarzenie z date + endDate

═══════════════════════════════════════════════════
Zwróć TYLKO JSON (bez markdown):
{
  "title": "Krótki tytuł",
  "note": "tekst słowo w słowo" | null,
  "checklist": {
    "isShoppingList": false,
    "listName": null,
    "items": [{ "text": "Zadanie lub produkt", "qty": "" }]
  } | null,
  "events": [{
    "title": "Tytuł",
    "date": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD" | null,
    "time": "HH:MM" | null,
    "endTime": "HH:MM" | null
  }] | []
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Jesteś asystentem wykrywającym strukturę w chaotycznych myślach. Rozróżniasz listy zakupów (produkty) od zadań do wykonania (działania). Zachowujesz notatki słowo w słowo. Zwracasz TYLKO poprawny JSON bez dodatkowych wyjaśnień.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2
    });

    const reply = response.choices[0].message.content.trim();
    console.log('🔍 AI detection raw:', reply);

    const jsonStr = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const detected = JSON.parse(jsonStr);
    console.log('✅ AI detection parsed:', detected);

    // Normalizuj checklist do starego formatu dla kompatybilności z Inbox
    // Pola: detected.checklist = { isShoppingList, listName, items: [{text, qty}] } | null
    return detected;

  } catch (error) {
    console.error('❌ AI detection error:', error);
    return {
      title: "Notatka",
      note: sourceText,
      checklist: null,
      events: []
    };
  }
}

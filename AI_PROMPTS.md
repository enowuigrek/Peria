# PERIA — AI PROMPTS

## 1. CHAOS → STRUKTURA (główny prompt)

### Cel:
Wykryć w chaotycznej wypowiedzi: zadania, wydarzenia, pomysły kreatywne.

### Prompt:
```
Użytkownik nagrał chaotyczną myśl:
"{sourceText}"

Twoim zadaniem jest wykryć i sklasyfikować:

1. ZADANIA (tasks)
   - Konkretne akcje do zrobienia
   - Przykłady: "kupić mleko", "zadzwonić do lekarza", "napisać email"

2. WYDARZENIA (events)
   - Daty, godziny, spotkania, przypomnienia
   - Przykłady: "spotkanie jutro o 15", "dentysta w piątek 10:00"
   - ZAWSZE oblicz konkretną datę (jeśli "jutro" → policz dzisiejszą datę + 1)

3. POMYSŁY KREATYWNE (creative)
   - Wszystko inne: notatki, pomysły, teksty, myśli
   - Przykłady: "pomysł na startup", "zwrotka o samotności", "refleksja o życiu"

ZASADY:
- NIE zmieniaj treści, tylko kategoryzuj
- Date/time zawsze w formacie ISO: YYYY-MM-DD, HH:MM
- Jeśli nie ma zadań/eventów/creative → zwróć []
- Jeśli "jutro", "pojutrze", "w piątek" → policz konkretną datę
- Dzisiaj jest: {currentDate}

Zwróć TYLKO JSON (bez markdown, bez wyjaśnień):
{
  "tasks": [
    { "text": "Kupić mleko" }
  ],
  "events": [
    { "title": "Spotkanie", "date": "2025-01-08", "time": "15:00" }
  ],
  "creative": "Pomysł na tekst rapowy o bezsenności"
}
```

---

## 2. PRZYKŁADY (few-shot learning)

### Przykład 1: Proste zadanie
```
Input: "Kupić mleko i chleb"

Output:
{
  "tasks": [
    { "text": "Kupić mleko" },
    { "text": "Kupić chleb" }
  ],
  "events": [],
  "creative": null
}
```

### Przykład 2: Wydarzenie
```
Input: "Spotkanie jutro o 15"
(Dzisiaj: 2025-01-07)

Output:
{
  "tasks": [],
  "events": [
    { "title": "Spotkanie", "date": "2025-01-08", "time": "15:00" }
  ],
  "creative": null
}
```

### Przykład 3: Chaos (wszystko razem)
```
Input: "Jutro kupić mleko, potem spotkanie o 15, a wieczorem pomysł na rapowy tekst o bezsenności"
(Dzisiaj: 2025-01-07)

Output:
{
  "tasks": [
    { "text": "Kupić mleko" }
  ],
  "events": [
    { "title": "Spotkanie", "date": "2025-01-08", "time": "15:00" }
  ],
  "creative": "Pomysł na rapowy tekst o bezsenności"
}
```

### Przykład 4: Długi plan dnia
```
Input: "Jutro: spotkanie 10, lunch 13, siłownia 18"
(Dzisiaj: 2025-01-07)

Output:
{
  "tasks": [],
  "events": [
    { "title": "Spotkanie", "date": "2025-01-08", "time": "10:00" },
    { "title": "Lunch", "date": "2025-01-08", "time": "13:00" },
    { "title": "Siłownia", "date": "2025-01-08", "time": "18:00" }
  ],
  "creative": null
}
```

### Przykład 5: Pomysł kreatywny (tylko notatka)
```
Input: "Pomysł na startup - app do nagrywania myśli podczas spaceru, AI porządkuje chaos w strukturę, eksport do Apple Notes"

Output:
{
  "tasks": [],
  "events": [],
  "creative": "Pomysł na startup - app do nagrywania myśli podczas spaceru, AI porządkuje chaos w strukturę, eksport do Apple Notes"
}
```

### Przykład 6: Tekst rapowy (aktualizacja notatki)
```
Input: "Bezsenność, nocne myśli, krążą wokół głowy. Gdy noc zapada, myśli się budzą."

Output:
{
  "tasks": [],
  "events": [],
  "creative": "Bezsenność, nocne myśli, krążą wokół głowy. Gdy noc zapada, myśli się budzą."
}
```

### Przykład 7: Przypomnienie
```
Input: "Przypomnij mi jutro o 15 że muszę zadzwonić do lekarza"
(Dzisiaj: 2025-01-07)

Output:
{
  "tasks": [
    { "text": "Zadzwonić do lekarza" }
  ],
  "events": [
    { "title": "Przypomnienie: zadzwonić do lekarza", "date": "2025-01-08", "time": "15:00" }
  ],
  "creative": null
}
```

---

## 3. OBSŁUGA BŁĘDÓW

### Niejasna wypowiedź
```
Input: "Hmm, nie wiem, może coś zrobić"

Output:
{
  "tasks": [],
  "events": [],
  "creative": "Hmm, nie wiem, może coś zrobić"
}

Zasada: Jeśli nie jesteś pewien → wszystko trafia do creative
```

### Pusta wypowiedź
```
Input: ""

Output:
{
  "tasks": [],
  "events": [],
  "creative": null
}
```

### Tylko dźwięki/hałas
```
Input: "ehh, mmm, yyy"

Output:
{
  "tasks": [],
  "events": [],
  "creative": null
}
```

---

## 4. FALLBACK STRATEGY

Jeśli AI zwróci błędny JSON lub odpowiedź jest nieprawidłowa:

```js
// Fallback: zapisz wszystko jako creative
const fallback = {
  tasks: [],
  events: [],
  creative: sourceText  // pełny tekst źródłowy
}
```

---

## 5. IMPLEMENTACJA W KODZIE

### agent.js (nowa funkcja)
```js
export async function detectStructure(sourceText) {
  const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const prompt = `
Użytkownik nagrał chaotyczną myśl:
"${sourceText}"

Twoim zadaniem jest wykryć i sklasyfikować:

1. ZADANIA (tasks) - konkretne akcje do zrobienia
2. WYDARZENIA (events) - daty, godziny, spotkania
3. POMYSŁY KREATYWNE (creative) - wszystko inne

ZASADY:
- NIE zmieniaj treści, tylko kategoryzuj
- Date/time w formacie ISO: YYYY-MM-DD, HH:MM
- Jeśli "jutro" → policz datę (dzisiaj: ${currentDate})
- Jeśli nie ma elementów → zwróć []

Zwróć TYLKO JSON:
{
  "tasks": [{ "text": "..." }],
  "events": [{ "title": "...", "date": "YYYY-MM-DD", "time": "HH:MM" }],
  "creative": "..." lub null
}
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // tańszy i szybszy
      messages: [
        { role: 'system', content: 'Jesteś asystentem wykrywającym strukturę w chaotycznych myślach. Zwracasz TYLKO JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3  // niska temperatura = bardziej deterministyczne
    })

    const reply = response.choices[0].message.content.trim()

    // Usuń markdown jeśli jest
    const jsonStr = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    const detected = JSON.parse(jsonStr)

    return detected

  } catch (error) {
    console.error('AI detection error:', error)

    // Fallback: wszystko jako creative
    return {
      tasks: [],
      events: [],
      creative: sourceText
    }
  }
}
```

---

## 6. TESTOWANIE PROMPTU

### Metryki sukcesu:
- **Precision:** Czy wykryte elementy są prawidłowe?
- **Recall:** Czy wszystkie elementy zostały wykryte?
- **Format:** Czy JSON jest zawsze poprawny?

### Test cases:
1. ✅ Proste zadanie → wykrywa tasks
2. ✅ Wydarzenie z datą → wykrywa events + poprawna data
3. ✅ Chaos (mix) → wykrywa wszystko
4. ✅ Tylko pomysł → wykrywa creative
5. ✅ Pusta wypowiedź → zwraca puste tablice
6. ✅ Niejasna wypowiedź → trafia do creative

### Iteracja:
- Jeśli AI się myli → dodaj więcej przykładów (few-shot)
- Jeśli format niepoprawny → zwiększ temperature
- Jeśli zbyt kreatywne interpretacje → obniż temperature

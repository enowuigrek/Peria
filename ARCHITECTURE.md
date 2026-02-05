# PERIA — ARCHITEKTURA

## MODEL DANYCH: "JEDNA NOTATKA = ŹRÓDŁO PRAWDY"

### Stary model (tasks-based):
```js
tasks: [
  { id: "1", text: "Kupić mleko", done: false },
  { id: "2", text: "Spotkanie o 15", done: false }
]
```
**Problem:** Brak kontekstu, brak źródła, nie wiadomo skąd to się wzięło.

---

### Nowy model (note-based):

```js
notes: [
  {
    id: "uuid",
    sourceText: "Jutro kupić mleko i chleb, potem spotkanie o 15, a wieczorem pomysł na rapowy tekst o bezsenności",
    createdAt: "2025-01-07T14:30:00Z",
    updatedAt: "2025-01-07T14:30:00Z",

    // AI wykrywa strukturę:
    detected: {
      tasks: [
        { id: "uuid", text: "Kupić mleko", done: false, accepted: false },
        { id: "uuid", text: "Kupić chleb", done: false, accepted: false }
      ],
      events: [
        {
          id: "uuid",
          title: "Spotkanie",
          date: "2025-01-08",
          time: "15:00",
          accepted: false
        }
      ],
      creative: "Pomysł na rapowy tekst o bezsenności"
    },

    // Użytkownik może zaakceptować:
    accepted: {
      tasks: ["uuid1", "uuid2"],  // zaakceptowane zadania
      events: ["uuid3"]             // zaakceptowane eventy
    },

    // Status eksportu:
    exported: {
      reminders: false,
      notes: false,
      calendar: false
    }
  }
]
```

---

## FLOW DANYCH

### 1. Użytkownik pisze/mówi
```
Input: "Jutro kupić mleko, spotkanie o 15, pomysł na tekst rapowy"
```

### 2. Zapisujemy jako notatka
```js
{
  id: "n1",
  sourceText: "Jutro kupić mleko, spotkanie o 15, pomysł na tekst rapowy",
  createdAt: "2025-01-07T14:30:00Z",
  detected: null,  // jeszcze nie przetworzono
  accepted: { tasks: [], events: [] },
  exported: { reminders: false, notes: false, calendar: false }
}
```

### 3. AI wykrywa strukturę (w tle)
```js
detected: {
  tasks: [
    { id: "t1", text: "Kupić mleko", done: false, accepted: false }
  ],
  events: [
    { id: "e1", title: "Spotkanie", date: "2025-01-08", time: "15:00", accepted: false }
  ],
  creative: "Pomysł na tekst rapowy"
}
```

### 4. UI pokazuje propozycje
```
┌─────────────────────────────────────────┐
│ Notatka: "Jutro - zakupy i spotkanie"   │
│ ────────────────────────────────────── │
│ [Pełny tekst źródłowy]                  │
│                                         │
│ AI wykryło:                             │
│ ✓ 1 zadanie                             │
│   [ ] Kupić mleko                       │
│   [Dodaj do Reminders]                  │
│                                         │
│ ✓ 1 wydarzenie                          │
│   Spotkanie - jutro 15:00               │
│   [Dodaj do Calendar]                   │
│                                         │
│ ✓ Pomysł kreatywny                      │
│   "Pomysł na tekst rapowy"              │
│   [Pozostaje w notatce]                 │
└─────────────────────────────────────────┘
```

### 5. Użytkownik akceptuje/odrzuca
- Klik "Dodaj do Reminders" → `accepted.tasks.push("t1")`
- Klik "Dodaj do Calendar" → `accepted.events.push("e1")`

### 6. Export
- Export do Reminders → `exported.reminders = true`
- Export do Notes → `exported.notes = true`
- Export do Calendar → `exported.calendar = true`

---

## SCHEMAT BAZY DANYCH (LocalStorage / Core Data)

```js
// LocalStorage key: "peria_notes"
{
  notes: [
    {
      id: string,
      sourceText: string,           // surowy tekst (pełna transkrypcja)
      createdAt: ISO timestamp,
      updatedAt: ISO timestamp,

      detected: {
        tasks: [
          { id, text, done, accepted }
        ],
        events: [
          { id, title, date, time, accepted }
        ],
        creative: string | null     // pozostałe pomysły/notatki
      },

      accepted: {
        tasks: string[],            // ID zaakceptowanych zadań
        events: string[]            // ID zaakceptowanych eventów
      },

      exported: {
        reminders: boolean,
        notes: boolean,
        calendar: boolean
      }
    }
  ]
}
```

---

## LOGIKA AI (Prompt)

### Input:
```
User said: "Jutro kupić mleko, spotkanie o 15, pomysł na tekst rapowy"
```

### Prompt do GPT-4o-mini:
```
Użytkownik nagrał chaotyczną myśl:
"{sourceText}"

Twoim zadaniem jest wykryć:
1. ZADANIA (konkretne akcje do zrobienia)
2. WYDARZENIA (daty, godziny, spotkania)
3. POMYSŁY KREATYWNE (wszystko inne)

Zwróć TYLKO JSON:
{
  "tasks": [
    { "text": "Kupić mleko" }
  ],
  "events": [
    { "title": "Spotkanie", "date": "2025-01-08", "time": "15:00" }
  ],
  "creative": "Pomysł na tekst rapowy"
}

ZASADY:
- Nie zmieniaj treści, tylko kategoryzuj
- Date/time zawsze w formacie ISO
- Jeśli nie ma zadań/eventów/creative → zwróć []
- Jeśli "jutro" → policz datę na podstawie dzisiaj
```

### Output:
```json
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

## KOMPONENTY UI

### 1. NoteView (główny ekran)
```jsx
<NoteView note={note}>
  <SourceText>{note.sourceText}</SourceText>

  {note.detected && (
    <DetectedItems>
      {/* Zadania */}
      <TasksSection tasks={note.detected.tasks} />

      {/* Wydarzenia */}
      <EventsSection events={note.detected.events} />

      {/* Pomysły kreatywne */}
      <CreativeSection text={note.detected.creative} />
    </DetectedItems>
  )}

  <ExportButtons note={note} />
</NoteView>
```

### 2. TasksSection
```jsx
<TasksSection>
  <h3>AI wykryło zadania:</h3>
  {tasks.map(task => (
    <TaskItem key={task.id}>
      <Checkbox checked={task.done} />
      <Text>{task.text}</Text>
      {!task.accepted && (
        <Button onClick={() => acceptTask(task.id)}>
          Dodaj do Reminders
        </Button>
      )}
    </TaskItem>
  ))}
</TasksSection>
```

### 3. EventsSection
```jsx
<EventsSection>
  <h3>AI wykryło wydarzenia:</h3>
  {events.map(event => (
    <EventItem key={event.id}>
      <Title>{event.title}</Title>
      <DateTime>{event.date} {event.time}</DateTime>
      {!event.accepted && (
        <Button onClick={() => acceptEvent(event.id)}>
          Dodaj do Calendar
        </Button>
      )}
    </EventItem>
  ))}
</EventsSection>
```

---

## HOOKS

### useNote (zarządzanie notatką)
```js
const useNote = (noteId) => {
  const [note, setNote] = useState(null)

  const saveNote = async (sourceText) => {
    // 1. Zapisz surowy tekst
    const newNote = {
      id: nanoid(),
      sourceText,
      createdAt: new Date().toISOString(),
      detected: null,
      accepted: { tasks: [], events: [] },
      exported: { reminders: false, notes: false, calendar: false }
    }

    // 2. Zapisz do localStorage
    saveToStorage(newNote)

    // 3. Wyślij do AI (w tle)
    const detected = await detectStructure(sourceText)

    // 4. Update z wykrytą strukturą
    updateNote(newNote.id, { detected })
  }

  const acceptTask = (taskId) => {
    // Dodaj do accepted.tasks
  }

  const acceptEvent = (eventId) => {
    // Dodaj do accepted.events
  }

  const exportToReminders = () => {
    // Export zaakceptowanych zadań
  }

  return { note, saveNote, acceptTask, acceptEvent, exportToReminders }
}
```

---

## MIGRACJA Z OBECNEGO KODU

### Krok 1: Zmiana modelu danych
```diff
- const [tasks, setTasks] = useState([])
+ const [notes, setNotes] = useState([])
```

### Krok 2: Zmiana struktury
```diff
- localStorage.setItem('myTasks', JSON.stringify(tasks))
+ localStorage.setItem('peria_notes', JSON.stringify(notes))
```

### Krok 3: Nowy flow czatu
```diff
// Stary:
askAgent(message) → tasks[] → dodaj do listy

// Nowy:
askAgent(message) → { sourceText, detected } → zapisz jako nota
```

### Krok 4: UI
```diff
- <TaskList tasks={tasks} />
+ <NotesList notes={notes} />
+ <NoteView note={selectedNote} />
```

---

## PRZYKŁADY UŻYCIA

### Scenariusz 1: Proste zadanie
```
Input: "Kupić mleko"

Note:
{
  sourceText: "Kupić mleko",
  detected: {
    tasks: [{ text: "Kupić mleko" }],
    events: [],
    creative: null
  }
}

UI: Propozycja → "Dodaj do Reminders"
```

### Scenariusz 2: Chaos
```
Input: "Jutro spotkanie o 10, lunch 13, siłownia 18,
        a jeszcze pomysł na startup - app do nagrywania myśli"

Note:
{
  sourceText: "[pełny tekst]",
  detected: {
    tasks: [],
    events: [
      { title: "Spotkanie", date: "2025-01-08", time: "10:00" },
      { title: "Lunch", date: "2025-01-08", time: "13:00" },
      { title: "Siłownia", date: "2025-01-08", time: "18:00" }
    ],
    creative: "Pomysł na startup - app do nagrywania myśli"
  }
}

UI:
- 3 propozycje eventów → "Dodaj do Calendar"
- Pomysł kreatywny → pozostaje w notatce
```

### Scenariusz 3: Tekst rapowy (aktualizacja notatki)
```
Dzień 1: "Bezsenność, nocne myśli, krążą wokół głowy"
Dzień 2: "Dodaj zwrotkę o samotności"
Dzień 3: "Refrén: 'Kiedy noc zapada, myśli się budzą'"

Note:
{
  sourceText: "[akumulacja wszystkich wpisów]",
  detected: {
    tasks: [],
    events: [],
    creative: "[pełny tekst rapowy - wszystkie wpisy]"
  },
  updatedAt: "2025-01-09T20:00:00Z"  // ostatnia aktualizacja
}

UI: Jedna notatka rośnie w czasie
```

---

## PYTANIA DO ROZWAŻENIA

1. **Czy notatka może być aktualizowana?**
   - TAK: Użytkownik może dodawać do istniejącej notatki (np. tekst rapowy)
   - Wtedy: `updatedAt` się zmienia, `sourceText` rośnie

2. **Jak rozpoznać że to kontynuacja notatki?**
   - Opcja A: Użytkownik wybiera "Dodaj do notatki #X"
   - Opcja B: AI wykrywa podobieństwo tematyczne
   - **REKOMENDACJA:** Opcja A (prostsze, mniej błędów)

3. **Co jeśli AI się pomyli?**
   - Użytkownik MOŻE odrzucić propozycje
   - Wszystko pozostaje w `sourceText` (źródło prawdy)
   - Można ręcznie edytować wykryte elementy

4. **Czy można edytować źródłowy tekst?**
   - TAK, ale z ostrzeżeniem: "To zmieni wykryte elementy"
   - Po edycji: ponowne wywołanie AI

---

## NASTĘPNE KROKI

1. ✅ Dokument architektury
2. [ ] Zmiana modelu danych w kodzie
3. [ ] Nowy prompt AI (chaos → struktura)
4. [ ] UI dla pojedynczej notatki
5. [ ] Flow akceptacji zadań/eventów

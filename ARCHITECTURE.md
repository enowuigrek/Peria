# PERIA - ARCHITECTURE

> **Dokumentacja techniczna dla AI asystenta**
>
> Ten dokument wyjaśnia jak działa aplikacja pod maską. W nowym chacie przeczytaj to aby wiedzieć gdzie szukać kodu i jak aplikacja działa.

---

## 🏗️ STRUKTURA PROJEKTU

```
peria/
├── public/
│   ├── manifest.json          # PWA manifest (name, icons, shortcuts)
│   ├── icon-192.png           # App icon (192x192)
│   ├── icon-512.png           # App icon (512x512)
│   └── sw.js                  # Service Worker (offline support)
│
├── src/
│   ├── main.jsx               # Entry point (React root)
│   ├── App.jsx                # Main app component (routing + layout)
│   ├── App.scss               # Global styles
│   ├── agent.js               # OpenAI API integration (2 functions)
│   │
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatVoiceFirst.jsx    # GŁÓWNY ekran nagrywania 🎙️
│   │   │   └── Chat.module.scss
│   │   │
│   │   ├── Inbox/
│   │   │   ├── Inbox.jsx             # GŁÓWNY widok Inbox (wszystkie notatki)
│   │   │   └── Inbox.module.scss
│   │   │
│   │   ├── MyNotes/
│   │   │   ├── MyNotes.jsx           # Sekcja Notatek
│   │   │   └── MyNotes.module.scss
│   │   │
│   │   ├── Checklists/
│   │   │   ├── Checklists.jsx        # Sekcja Checklistów
│   │   │   └── Checklists.module.scss
│   │   │
│   │   ├── Events/
│   │   │   ├── Events.jsx            # Sekcja Wydarzeń
│   │   │   └── Events.module.scss
│   │   │
│   │   ├── NavBar/
│   │   │   ├── NavBar.jsx            # Bottom navigation (5 tabs)
│   │   │   └── NavBar.module.scss
│   │   │
│   │   ├── SplashScreen/
│   │   │   ├── SplashScreen.jsx      # Splash screen (2s intro)
│   │   │   └── SplashScreen.module.scss
│   │   │
│   │   └── [deprecated]/              # Stare komponenty (nie używane)
│   │       ├── TaskInput/
│   │       ├── TaskList/
│   │       ├── TaskItem/
│   │       ├── Notes/
│   │       └── Calendar/
│   │
│   ├── utils/
│   │   └── chaosToStructure.js       # DEPRECATED (stary prompt, nie używany)
│   │
│   └── styles/
│       └── _variables.scss           # SCSS variables
│
├── .env                        # Environment variables (API keys)
├── .env.example                # Template for .env
├── .gitignore                  # Git ignore rules
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
│
└── [DOCUMENTATION]/
    ├── README.md               # Project intro + quick start
    ├── ROADMAP.md              # Development plan + status
    ├── CHANGELOG.md            # Version history
    ├── DESIGN-SYSTEM.md        # UI/UX patterns (colors, typography)
    ├── AI_PROMPTS.md           # AI prompts documentation
    └── ARCHITECTURE.md         # ← Ten plik (techniczna dokumentacja)
```

---

## 🎯 KLUCZOWE PLIKI - Quick Reference

### 1. **App.jsx** - Główny router
**Lokalizacja:** `src/App.jsx`

**Co robi:**
- Zarządza routingiem (5 widoków: chat, inbox, mynotes, checklists, events)
- Pokazuje SplashScreen na starcie (2s)
- Renderuje NavBar i aktywny widok

**Kluczowy kod:**
```jsx
const [activeView, setActiveView] = useState('chat') // Domyślnie ekran nagrywania

// Routing
{activeView === 'chat' && <ChatVoiceFirst onAdd={addTask} />}
{activeView === 'inbox' && <Inbox />}
{activeView === 'mynotes' && <MyNotes />}
{activeView === 'checklists' && <Checklists />}
{activeView === 'events' && <Events />}
```

---

### 2. **agent.js** - OpenAI API Integration
**Lokalizacja:** `src/agent.js`

**Co robi:**
- Komunikacja z OpenAI API (Whisper + GPT)
- Dwie funkcje:
  1. `askAgent()` - DEPRECATED (stara funkcja, nie używana)
  2. `detectStructure(sourceText)` - **AKTYWNA** (chaos → struktura)

**Kluczowy kod:**
```js
export async function detectStructure(sourceText) {
  // Wykrywa w chaotycznej wypowiedzi:
  // - title (krótki tytuł)
  // - note (treść notatki)
  // - checklist (zadania)
  // - events (daty/godziny)

  // Używa: GPT-4o-mini, temperature: 0.3
  // Zwraca: { title, note, checklist: [], events: [] }
}
```

**Environment:**
- API Key: `import.meta.env.VITE_OPENAI_API_KEY`
- Plik `.env`: `VITE_OPENAI_API_KEY=sk-...`

---

### 3. **ChatVoiceFirst.jsx** - Główny ekran nagrywania
**Lokalizacja:** `src/components/Chat/ChatVoiceFirst.jsx`

**Co robi:**
- Voice recording (Web Audio API)
- Wysyła audio do Whisper API (transkrypcja)
- Wysyła transkrypcję do `detectStructure()` (AI analiza)
- Zapisuje notatkę do `peria_inbox` w localStorage

**Flow:**
```
User clicks mic 🎙️
  → startRecording()
  → MediaRecorder captures audio
  → stopRecording()
  → processAudioBlob(blob)
    → Whisper API → transcript
    → detectStructure(transcript) → { title, note, checklist, events }
    → createNote({ sourceText: transcript, detected: {...} })
    → save to localStorage['peria_inbox']
```

**Kluczowe funkcje:**
- `startRecording()` - rozpoczyna nagrywanie (MediaRecorder)
- `stopRecording()` - kończy nagrywanie
- `processAudioBlob(blob)` - wysyła audio do Whisper
- `processText(text)` - wysyła tekst do detectStructure
- `createNote()` - tworzy obiekt Note i zapisuje do Inbox

---

### 4. **Inbox.jsx** - Widok wszystkich notatek
**Lokalizacja:** `src/components/Inbox/Inbox.jsx`

**Co robi:**
- Wyświetla wszystkie notatki z localStorage['peria_inbox']
- Pokazuje wykryte elementy (note/checklist/events) w kolorowych sekcjach
- Przyciski eksportu do MyNotes/Checklists/Events
- Smart tracking: auto-hide export button jeśli już wyeksportowano

**Data model:**
```js
{
  id: string (nanoid),
  title: string,
  sourceText: string,           // raw transkrypcja
  detected: {
    note: string | null,        // wykryta notatka
    checklist: [{ text: string }],
    events: [{ title, date, time }]
  },
  createdAt: ISO timestamp,
  read: boolean,                // czy user otworzył (expanded)
  exported: {
    notes: boolean,
    reminders: boolean,
    calendar: boolean
  }
}
```

**Kluczowe funkcje:**
- `addToSection(note, section, content)` - eksportuje do sekcji (mynotes/checklists/events)
- `toggleExpand(id)` - expand/collapse + mark as read
- `deleteNote(id)` - usuwa notatkę
- Auto-restore export buttons (jeśli usunięto z sekcji)

---

### 5. **MyNotes.jsx** - Sekcja Notatek
**Lokalizacja:** `src/components/MyNotes/MyNotes.jsx`

**Co robi:**
- Wyświetla notatki wyeksportowane z Inbox
- localStorage key: `peria_mynotes`
- Edycja tytułu + treści
- Export do Apple Notes (Share API)
- Delete

**Data model:**
```js
{
  id: string,
  title: string,
  content: string,              // treść notatki
  createdAt: ISO timestamp,
  sourceNoteId: string          // ID z Inbox (dla tracking)
}
```

---

### 6. **Checklists.jsx** - Sekcja Checklistów
**Lokalizacja:** `src/components/Checklists/Checklists.jsx`

**Co robi:**
- Wyświetla checklisty wyeksportowane z Inbox
- localStorage key: `peria_checklists`
- Toggle completed items
- Progress badge (3/5)
- Edit items, delete items
- Export do Apple Reminders (Share API)

**Data model:**
```js
{
  id: string,
  title: string,
  items: [
    { id: string, text: string, completed: boolean }
  ],
  createdAt: ISO timestamp,
  sourceNoteId: string
}
```

---

### 7. **Events.jsx** - Sekcja Wydarzeń
**Lokalizacja:** `src/components/Events/Events.jsx`

**Co robi:**
- Wyświetla wydarzenia wyeksportowane z Inbox
- localStorage key: `peria_events`
- Grupuje eventy pod wspólnym tytułem
- Edit title
- Delete individual events
- Export do Apple Calendar (Share API)

**Data model:**
```js
{
  id: string,
  title: string,
  events: [
    { id: string, title: string, date: "YYYY-MM-DD", time: "HH:MM" | null }
  ],
  createdAt: ISO timestamp,
  sourceNoteId: string
}
```

---

## 🔄 DATA FLOW - Jak działa cały system

### 1. **Voice Recording → Note Creation**

```
User
  ↓ (taps mic)
ChatVoiceFirst.jsx
  ↓ startRecording()
MediaRecorder (Web Audio API)
  ↓ audio blob
processAudioBlob()
  ↓ FormData upload
OpenAI Whisper API
  ↓ transcript (text)
detectStructure(transcript)   [agent.js]
  ↓ GPT-4o-mini analysis
{ title, note, checklist: [], events: [] }
  ↓ createNote()
localStorage['peria_inbox']
  ↓
Inbox.jsx (auto-refresh)
```

### 2. **Export do Sekcji**

```
Inbox.jsx
  ↓ user clicks "→ Notatki" button
addToSection(note, 'mynotes', content)
  ↓
localStorage['peria_mynotes'].push({
  id, title, content, sourceNoteId, createdAt
})
  ↓
note.exported.notes = true
  ↓
localStorage['peria_inbox'] updated
  ↓
Export button hidden (smart tracking)
```

### 3. **Auto-restore Export Button**

```
User deletes item from MyNotes
  ↓
localStorage['peria_mynotes'] updated (item removed)
  ↓
Inbox.jsx (useEffect listener)
  ↓ checkExportedItems()
Check if sourceNoteId still exists in mynotes
  ↓ NO → not found
note.exported.notes = false
  ↓
localStorage['peria_inbox'] updated
  ↓
Export button re-appears in Inbox
```

---

## 📦 STORAGE - Co jest gdzie w localStorage

| Key | Co zawiera | Struktura |
|-----|------------|-----------|
| `peria_inbox` | Wszystkie notatki z nagrań | `Note[]` |
| `peria_mynotes` | Wyeksportowane notatki | `MyNote[]` |
| `peria_checklists` | Wyeksportowane checklisty | `Checklist[]` |
| `peria_events` | Wyeksportowane wydarzenia | `Event[]` |
| `chatMessages` | Historia czatu (deprecated) | `Message[]` |

**Przykład Note w Inbox:**
```json
{
  "id": "abc123",
  "title": "Zakupy i plan dnia",
  "sourceText": "Jutro kupić mleko, potem spotkanie o 15",
  "detected": {
    "note": null,
    "checklist": [
      { "text": "Kupić mleko" }
    ],
    "events": [
      { "title": "Spotkanie", "date": "2026-01-10", "time": "15:00" }
    ]
  },
  "createdAt": "2026-01-09T12:30:00.000Z",
  "read": true,
  "exported": {
    "notes": false,
    "reminders": true,
    "calendar": false
  }
}
```

---

## 🎨 STYLING - Jak działają style

### SCSS Modules
Każdy komponent ma własny `.module.scss`:
- `Inbox.module.scss`
- `MyNotes.module.scss`
- `Checklists.module.scss`
- itp.

**Import:**
```jsx
import styles from './Inbox.module.scss'
<div className={styles.container}>...</div>
```

### Design System
Wszystkie kolory, typography, spacing są w:
- **DESIGN-SYSTEM.md** (dokumentacja)
- **src/styles/_variables.scss** (SCSS variables)

**Kluczowe kolory:**
- `#4a9396` - Teal (MyNotes)
- `#fdd03b` - Yellow (Checklists)
- `#cb7f07` - Orange (Events)

---

## 🔧 KONFIGURACJA

### Environment Variables
```bash
# .env (nie commituj!)
VITE_OPENAI_API_KEY=sk-...

# .env.example (template)
VITE_OPENAI_API_KEY=your-key-here
```

### Vite Config
- Port: 5173 (default)
- Build: `npm run build` → `dist/`
- Preview: `npm run preview`

### PWA
- **manifest.json** - app metadata
- **sw.js** - service worker (offline support)
- Wymagane HTTPS dla PWA features

---

## 🚀 DEPLOYMENT

### Flow:
```
Local changes
  ↓ git push
GitHub repo
  ↓ auto-deploy (webhook)
Netlify
  ↓ build command: npm run build
  ↓ publish dir: dist
Production (https://...)
```

### Environment variables w Netlify:
- `VITE_OPENAI_API_KEY` - set in Netlify dashboard

---

## 🧪 TESTOWANIE

### Jak user testuje:
- Spacery z iPhone (PWA installed)
- Nagrywanie głosem
- Sprawdzanie czy AI poprawnie wykrywa strukturę
- Eksport do Apple apps

### Gdzie szukać bugów:
1. **Console errors** (F12)
2. **localStorage** (Application → Local Storage)
3. **Network tab** (OpenAI API calls)
4. **Service Worker** (Application → Service Workers)

---

## 🔍 DEBUGGING - Kluczowe punkty

### Gdy nagrywanie nie działa:
- Sprawdź Console: `mediaDevices.getUserMedia()` errors
- Sprawdź permissions (mikrofon)
- Sprawdź MIME type support: `MediaRecorder.isTypeSupported()`

### Gdy AI nie wykrywa poprawnie:
- Sprawdź Console: `detectStructure()` output
- Zobacz raw prompt w `agent.js:49-85`
- Sprawdź API key: `import.meta.env.VITE_OPENAI_API_KEY`

### Gdy export nie działa:
- Sprawdź `localStorage['peria_mynotes']` itp.
- Sprawdź `note.exported` status
- Zobacz `addToSection()` w Inbox.jsx

---

## 🎯 NAJWAŻNIEJSZE DO ZAPAMIĘTANIA

1. **Jedna notatka = źródło prawdy**
   - Wszystko zaczyna się w Inbox
   - AI wykrywa strukturę automatycznie
   - User może wyeksportować do sekcji

2. **Główne komponenty:**
   - `ChatVoiceFirst.jsx` - nagrywanie
   - `Inbox.jsx` - przeglądanie notatek
   - `agent.js` - OpenAI integration

3. **Data flow:**
   - Voice → Whisper → GPT → localStorage → UI

4. **Storage:**
   - Wszystko w localStorage (4 keys)
   - Smart tracking: exported status

5. **Deprecated:**
   - `chaosToStructure.js` (stary prompt)
   - `askAgent()` (stara funkcja)
   - Komponenty: TaskInput, TaskList, Notes, Calendar

---

## 📚 LINKI DO DOKUMENTACJI

- **Roadmap:** [ROADMAP.md](./ROADMAP.md) - plan rozwoju
- **Design System:** [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) - kolory, typography
- **AI Prompts:** [AI_PROMPTS.md](./AI_PROMPTS.md) - wszystkie prompty
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md) - historia zmian

---

**Ostatnia aktualizacja:** 2026-01-09
**Status projektu:** FAZA 0 COMPLETED ✅ (PWA stable and functional)

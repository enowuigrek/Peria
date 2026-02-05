# UX DESIGN - CHAOS-TO-STRUCTURE VOICE APP
## Mobile-First, One-Thumb Operation

---

## WIZJA PRODUKTU
**Use case:** Spacer → pomysł wpada do głowy → wyjmuję telefon → nagrywam chaos → AI porządkuje → w domu mam uporządkowaną notatkę/listę/event → 1 klick eksport do Reminders/Notes/Calendar

**Kluczowe cechy:**
- 🎤 Nagrywanie głosowe (nie pisanie!)
- 🧠 AI rozumie i porządkuje chaos w strukturę
- 🎯 Auto-rozpoznanie typu (checklist/note/calendar_event)
- 📊 Confidence score - jeśli model nie wie, pyta
- 📤 Export 1-click do natywnych aplikacji

---

## ZASADY PROJEKTU
- Mobile-first (iPhone SE 375px jako minimum)
- Jedna ręka, jeden kciuk
- Jasna wizualna hierarchia stanów
- Animacje płynne, subtelne
- Każdy stan ma wyraźny feedback wizualny

---

## STANY APLIKACJI

### 1. IDLE - Stan początkowy
**Cel:** Zachęcić do nagrania, pokazać prostotę

```
┌─────────────────────────┐
│                         │
│                         │
│    🎤  Naciśnij by     │
│       nagrać zadania   │
│                         │
│    ┌─────────────┐     │
│    │             │     │
│    │   NAGRAJ    │     │ ← Duży przycisk (80px)
│    │             │     │   Gradient purple/blue
│    └─────────────┘     │   Border radius: 50%
│                         │
│  lub napisz tekst ↓    │
│  ┌─────────────────┐   │
│  │ Dodaj zadanie   │   │ ← Mniejszy input
│  └─────────────────┘   │
│                         │
│   📋 Ostatnie listy    │ ← Link do historii
└─────────────────────────┘
    ☰    ◐    ⊞  ← Nawigacja na dole
```

**Elementy:**
- Główny przycisk: 80x80px, centralny, pulsujący delikatnie (opacity 0.9-1.0, 2s loop)
- Ikona mikrofonu: 32px, biała
- Tekst pomocniczy: font-size: 1rem, opacity: 0.7
- Fallback input: standardowy TaskInput (dla użytkowników bez mikrofonu)
- Link do historii: mały, na dole, prowadzi do listy checklistów

**Interakcje:**
- Tap na NAGRAJ → przejście do stanu RECORDING
- Tap na input → standardowe dodawanie zadań tekstem
- Tap na historię → widok wszystkich checklistów

---

### 2. RECORDING - Nagrywanie
**Cel:** Pokazać że nagranie trwa, dać kontrolę (stop, cancel)

```
┌─────────────────────────┐
│      🔴 NAGRYWAM        │ ← Status bar (red dot)
│                         │
│       ⏱ 00:08          │ ← Timer (big, centered)
│                         │
│    ┌─────────────┐     │
│    │             │     │
│    │   ⏹ STOP   │     │ ← Przycisk STOP (80px)
│    │             │     │   Red gradient
│    └─────────────┘     │   Pulsuje (scale 1.0-1.05)
│                         │
│                         │
│   [ ✕ Anuluj ]         │ ← Mały przycisk anuluj
│                         │
│  Max 60 sekund          │ ← Info o limicie
└─────────────────────────┘
```

**Elementy:**
- Status bar: "🔴 NAGRYWAM", czerwony gradient, top: 0
- Timer: font-size: 3rem, monospace, text-align: center
- Przycisk STOP: 80x80px, red gradient (#f87171 → #dc2626), pulsuje
- Przycisk anuluj: mały (40px height), text-based, na dole
- Limit info: opacity: 0.5, font-size: 0.85rem

**Interakcje:**
- Tap na STOP → przejście do stanu PROCESSING
- Tap na Anuluj → powrót do IDLE (discard audio blob)
- Auto-stop po 60s → przejście do PROCESSING

**Animacje:**
- Timer: licznik inkrementujący co 1s
- Przycisk STOP: scale animation (1.0 → 1.05, 1s loop)
- Red dot: opacity animation (0.7 → 1.0, 0.8s loop)

---

### 3. PROCESSING - Przetwarzanie (AI porządkuje chaos)
**Cel:** Informować że AI pracuje nad uporządkowaniem, dać możliwość anulowania

```
┌─────────────────────────┐
│   🧠 Przetwarzam...    │ ← Status header
│                         │
│       ◐  ◓  ◑         │ ← Spinner animowany
│                         │
│   Porządkuję twoją myśl │ ← AI message
│                         │
│   ┌─────────────────┐   │
│   │   ✕ Anuluj      │   │ ← Anuluj request
│   └─────────────────┘   │
│                         │
│   Może to potrwać       │
│   kilka sekund...       │
└─────────────────────────┘
```

**Elementy:**
- Spinner: 3 animated dots, rotating (◐ ◓ ◑ ◒), 1s loop
- Status text:
  1. "Transkrybuję nagranie..." (Whisper API, ~2-5s)
  2. "Porządkuję twoją myśl..." (GPT API, ~2-4s)
  3. "Rozpoznaję intencję..." (GPT classification, ~1s)
- Przycisk anuluj: 50% width, centered, danger color
- Info text: opacity: 0.6, small font

**Interakcje:**
- Tap na Anuluj → abort API call, powrót do IDLE
- Po zakończeniu → przejście do RESULT lub ASK_USER (jeśli confidence <0.7)

**Loading stages:**
1. "Transkrybuję nagranie" (Whisper API, ~2-5s)
2. "Porządkuję twoją myśl" (GPT-4o chaos→structure, ~3-6s)
3. "Rozpoznaję intencję" (Classification, ~1s)
4. → RESULT lub ASK_USER

**Error handling:**
- Timeout (>30s) → error modal z retry button
- API error → fallback: pokazuje surową transkrypcję jako note
- Brak internetu → error modal z retry

---

### 3a. ASK_USER - Pytanie o typ (jeśli confidence <0.7)
**Cel:** Zapytać użytkownika o typ, gdy AI nie jest pewne

```
┌─────────────────────────┐
│   🤔 Nie jestem pewien  │ ← Header (yellow)
│                         │
│  "Kupić mleko i chleb"  │ ← Surowa transkrypcja
│                         │
│  Co chcesz zrobić?      │
│                         │
│ ┌─────────────────────┐ │
│ │  ☑️ Lista zadań     │ │ ← Option 1 (checklist)
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │  📝 Notatka         │ │ ← Option 2 (note)
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │  📅 Wydarzenie      │ │ ← Option 3 (calendar_event)
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Elementy:**
- Header: żółty/pomarańczowy, ikona 🤔
- Surowa transkrypcja: quoted text, opacity: 0.8
- Pytanie: jasne, konkretne
- 3 buttony: pełna szerokość, ikony + label, różne kolory
  - Checklist: niebieski gradient
  - Note: fioletowy gradient
  - Calendar: zielony gradient

**Interakcje:**
- Tap na którąkolwiek opcję → model przetwarza ponownie z wybranym typem → RESULT

**Kiedy:**
- Confidence score <0.7
- Model zwrócił `type: "ask_user"`

---

### 4. RESULT - Wynik (3 warianty)
**Cel:** Pokazać uporządkowany wynik, dać akcje (save, export, edit, retry)

#### 4a. RESULT - Checklist
```
┌─────────────────────────┐
│   ✓ Gotowe!            │ ← Success header (green)
│                         │
│ 📋 Zakupy na dziś       │ ← Tytuł (AI-generated, editable)
│                         │
│ ☐ Mleko               │ ← Task items (uporządkowane!)
│ ☐ Chleb razowy         │
│ ☐ Masło                │
│                         │
│ ┌─────────────────────┐ │
│ │  💾 Zapisz          │ │ ← Primary: Save
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📤 Export→Reminders │ │ ← Export (iOS/Android)
│ └─────────────────────┘ │
│  ✎ Edytuj  |  🔄 Ponów │ ← Secondary actions
└─────────────────────────┘
```

#### 4b. RESULT - Note
```
┌─────────────────────────┐
│   ✓ Gotowe!            │
│                         │
│ 📝 Pomysł na startup    │ ← Tytuł (AI-generated)
│                         │
│ Aplikacja do nagrywania │ ← Uporządkowana treść
│ myśli na spacerze.      │   (akapity, formatowanie)
│                         │
│ Kluczowe cechy:         │
│ • Widget na ekranie     │
│ • AI porządkuje chaos   │
│ • Export do natywnych   │
│                         │
│ ┌─────────────────────┐ │
│ │  💾 Zapisz          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📤 Export→Notes     │ │
│ └─────────────────────┘ │
│  ✎ Edytuj  |  🔄 Ponów │
└─────────────────────────┘
```

#### 4c. RESULT - Calendar Event
```
┌─────────────────────────┐
│   ✓ Gotowe!            │
│                         │
│ 📅 Spotkanie z lekarzem │ ← Tytuł
│                         │
│ 📆 2025-01-09          │ ← Data (rozpoznana!)
│ ⏰ 15:00               │ ← Czas
│                         │
│ 📝 Zadzwonić w sprawie  │ ← Notatki
│    wyników badań        │
│                         │
│ ┌─────────────────────┐ │
│ │  💾 Zapisz          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📤 Export→Calendar  │ │
│ └─────────────────────┘ │
│  ✎ Edytuj  |  🔄 Ponów │
└─────────────────────────┘
```

**Elementy wspólne:**
- Success header: zielony gradient, ikona ✓
- Tytuł: AI-generated, font-size: 1.2rem, bold, editable
- Content: uporządkowany przez AI (nie raw transcription!)
- Przycisk "Zapisz": zapisuje do localStorage
- Przycisk "Export": 1-click export do natywnej aplikacji (typ zależny od content type)
- Akcje dodatkowe: Edytuj (full CRUD) | Ponów (retry nagrania)

**Interakcje:**
- Tap na tytuł → inline edit
- Tap "Zapisz" → zapisz do localStorage, przejście do odpowiedniego widoku (Tasks/Notes/Calendar)
- Tap "Export" → export do natywnej aplikacji, oznacz jako `exported: true`
- Tap "Edytuj" → przejście do widoku edycji (pełny CRUD)
- Tap "Ponów" → powrót do IDLE, discard results

**Kluczowe:**
- Content jest UPORZĄDKOWANY, nie raw transcription
- AI automatycznie generuje tytuł
- Export button dostosowany do typu (Reminders/Notes/Calendar)
- Po eksporcie item oznaczony jako `exported: true`

---

### 5. SAVED - Po zapisaniu (3 widoki)
**Cel:** Potwierdzić zapis, wrócić do normalnego flow

#### 5a. SAVED - Tasks View (dla checklist)
```
┌─────────────────────────┐
│  ✓ Zapisano!           │ ← Toast (2s, green)
│                         │
│ 📋 Zakupy na dziś       │ ← Saved checklist
│  [nie wyeksportowano]   │ ← Export status
│                         │
│ ☐ Mleko               │
│ ☐ Chleb razowy         │ ← Można edytować
│ ☐ Masło                │
│                         │
│ ┌─────────────────────┐ │
│ │ 📤 Export→Reminders │ │ ← Export button
│ └─────────────────────┘ │
│  🎤 Nagraj kolejną myśl │ ← Quick action
└─────────────────────────┘
    ☰    ◐    ⊞
```

#### 5b. SAVED - Notes View (dla note)
```
┌─────────────────────────┐
│  ✓ Zapisano!           │
│                         │
│ 📝 Pomysł na startup    │
│  [nie wyeksportowano]   │
│                         │
│ Aplikacja do nagrywania │
│ myśli na spacerze...    │
│                         │
│ ┌─────────────────────┐ │
│ │ 📤 Export→Notes     │ │
│ └─────────────────────┘ │
│  🎤 Nagraj kolejną myśl │
└─────────────────────────┘
```

#### 5c. SAVED - Calendar View (dla calendar_event)
```
┌─────────────────────────┐
│  ✓ Zapisano!           │
│                         │
│ 📅 Spotkanie z lekarzem │
│  [nie wyeksportowano]   │
│                         │
│ 📆 2025-01-09, 15:00   │
│ 📝 Zadzwonić...        │
│                         │
│ ┌─────────────────────┐ │
│ │ 📤 Export→Calendar  │ │
│ └─────────────────────┘ │
│  🎤 Nagraj kolejną myśl │
└─────────────────────────┘
```

**Elementy:**
- Toast: zielony, 2s auto-hide, top: 20px
- Export status: "[nie wyeksportowano]" lub "[✓ wyeksportowano]"
- Export button: widoczny zawsze, ale jeśli `exported: true` → zmienia się na "✓ Wyeksportowano"
- Quick action: 🎤 "Nagraj kolejną myśl" → powrót do IDLE

**Interakcje:**
- Wszystkie standardowe akcje (toggle, edit, delete)
- Tap "Export" → eksport do natywnej aplikacji → zmiana statusu na `exported: true`
- Tap "Nagraj kolejną myśl" → powrót do IDLE (stan 1)

**Kluczowe:**
- Export status pokazuje czy item został wyeksportowany
- Można wyeksportować w dowolnym momencie (nie tylko przy tworzeniu)
- Quick action zawsze widoczny dla łatwego nagrania kolejnej myśli

---

## PRZEJŚCIA MIĘDZY STANAMI

```
    IDLE (1)
      │
      ├─ Tap NAGRAJ ─────────→ RECORDING (2)
      │
      └─ Tap input ──────────→ (standardowy flow)


    RECORDING (2)
      │
      ├─ Tap STOP ──────────→ PROCESSING (3)
      ├─ Auto-stop (60s) ───→ PROCESSING (3)
      │
      └─ Tap Anuluj ────────→ IDLE (1)


    PROCESSING (3) - AI porządkuje chaos
      │
      ├─ High confidence (≥0.7) ──→ RESULT (4a/4b/4c)
      ├─ Low confidence (<0.7) ───→ ASK_USER (3a)
      ├─ Error ──────────────────→ Error modal + IDLE (1)
      │
      └─ Tap Anuluj ─────────────→ IDLE (1)


    ASK_USER (3a) - Pytanie o typ
      │
      ├─ Tap Checklist ──────────→ RESULT (4a - Checklist)
      ├─ Tap Note ───────────────→ RESULT (4b - Note)
      │
      └─ Tap Calendar Event ─────→ RESULT (4c - Calendar Event)


    RESULT (4a/4b/4c) - Uporządkowany wynik
      │
      ├─ Tap Zapisz ─────────────→ SAVED (5a/5b/5c)
      ├─ Tap Export ─────────────→ Export do natywnej aplikacji → SAVED
      ├─ Tap Edytuj ─────────────→ Edit view (pełny CRUD)
      │
      └─ Tap Ponów ──────────────→ IDLE (1)


    SAVED (5a/5b/5c) - Po zapisaniu
      │
      ├─ Tap Export ─────────────→ Export do natywnej aplikacji (w tle)
      │
      └─ Tap Nagraj kolejną myśl → IDLE (1)
```

**Kluczowe ścieżki:**
1. **Happy path (high confidence)**: IDLE → RECORDING → PROCESSING → RESULT → SAVED
2. **Ask user path (low confidence)**: IDLE → RECORDING → PROCESSING → ASK_USER → RESULT → SAVED
3. **Export path**: RESULT → Export → SAVED (lub SAVED → Export)
4. **Retry path**: RESULT → Ponów → IDLE

---

## ANIMACJE

### Przejścia między stanami
- Fade in/out: 200ms ease-in-out
- Scale: 0.95 → 1.0 przy wejściu
- Slide up: 20px → 0 przy wejściu

### Elementy interaktywne
- Button hover: scale 1.0 → 1.02, shadow increase
- Button press: scale 1.0 → 0.98
- Checkbox toggle: scale 0.8 → 1.2 → 1.0 (bounce)

### Loading states
- Spinner: rotate 360deg, 1s linear infinite
- Pulsing: opacity 0.9 → 1.0, 2s ease-in-out infinite
- Progress: width 0% → 100%, timing based on API latency estimate

---

## WYMIARY I SPACING

### Mobile (375px - 414px)
- Container: 100vw x 100vh
- Header: 80px height
- Content: flex-grow: 1, overflow-y: auto
- Footer: 60px height (navbar)
- Padding: 1rem (16px)
- Button primary: 80x80px (circular)
- Button secondary: 100% width x 48px height
- Font-size base: 16px
- Gap between elements: 1rem

### Tablet/Desktop (768px+)
- Container: 500px x 85vh, centered
- Border-radius: 24px
- Same internal spacing

---

## KOLORY (z variables.scss)

### Stany
- **IDLE**: Primary gradient (#667eea → #764ba2)
- **RECORDING**: Danger gradient (#f87171 → #dc2626)
- **PROCESSING**: Primary gradient + spinner
- **RESULT**: Success green (#4ade80)
- **SAVED**: Success green + standard task colors

### Inne
- Background: card-bg (rgba(30, 30, 46, 0.95))
- Text primary: #e5e7eb
- Text muted: #6b7280
- Border: rgba(255, 255, 255, 0.1)

---

## ACCESSIBILITY

### Touch targets
- Minimum 44x44px (iOS guideline)
- Primary button: 80x80px (easy thumb reach)
- Spacing: minimum 8px between tappable elements

### Screen readers
- aria-label na wszystkich buttonach
- aria-live="polite" na status updates
- role="status" na timer i processing messages

### Feedback
- Visual: kolor, ikona, animacja
- Text: jasny komunikat ("Nagrywam", "Przetwarzam")
- Haptic: vibration on start/stop (optional, Web Vibration API)

---

## ERROR STATES

### Brak permisji do mikrofonu
```
┌─────────────────────────┐
│   ⚠️ Brak dostępu      │
│                         │
│  Włącz mikrofon by      │
│  nagrywać zadania       │
│                         │
│  📱 Instrukcja:         │
│  Ustawienia → Safari    │
│  → Mikrofon → Włącz     │
│                         │
│ ┌─────────────────────┐ │
│ │   Spróbuj ponownie  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Brak internetu
```
┌─────────────────────────┐
│   📡 Brak połączenia   │
│                         │
│  Potrzebuję internetu   │
│  by przetworzyć         │
│  nagranie               │
│                         │
│ ┌─────────────────────┐ │
│ │   🔄 Spróbuj ponownie│ │
│ └─────────────────────┘ │
│                         │
│  [ ✕ Anuluj ]          │
└─────────────────────────┘
```

### API timeout
```
┌─────────────────────────┐
│   ⏱ Przekroczono czas  │
│                         │
│  Serwer nie odpowiada   │
│                         │
│ ┌─────────────────────┐ │
│ │   🔄 Spróbuj ponownie│ │
│ └─────────────────────┘ │
│                         │
│  [ ✕ Anuluj ]          │
└─────────────────────────┘
```

### Puste nagranie
```
┌─────────────────────────┐
│   🎤 Nie wykryto mowy  │
│                         │
│  Spróbuj mówić bliżej   │
│  mikrofonu              │
│                         │
│ ┌─────────────────────┐ │
│ │   🔄 Nagraj ponownie │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## KRYTERIA AKCEPTACJI (ZAKTUALIZOWANE)
- [x] Wszystkie stany są zdefiniowane wizualnie (IDLE, RECORDING, PROCESSING, ASK_USER, RESULT x3, SAVED x3)
- [x] Przejścia między stanami są jasne (z confidence score logic)
- [x] Mobile-first: wszystko działa jednym kciukiem
- [x] Każdy error ma akcję recovery (retry/cancel)
- [x] Animacje są opisane z timingami
- [x] Wymiary i spacing są określone
- [x] Accessibility jest uwzględnione (touch targets, aria-labels)
- [x] **3 typy contentu** (checklist, note, calendar_event) są obsłużone
- [x] **Auto-rozpoznanie typu** z confidence score
- [x] **Export do natywnych aplikacji** jest uwzględniony w UX
- [x] **Chaos→Struktura** jest kluczowym elementem flow

**Mogę pokazać ten dokument komuś i wyjaśnić flow w 30 sekund ✓**

---

## KLUCZOWE RÓŻNICE OD PIERWSZEJ WERSJI UX

**Stara wersja (basic checklist):**
- 5 stanów (IDLE, RECORDING, PROCESSING, RESULT, SAVED)
- Tylko checklisty
- Brak eksportu
- Model tylko rozpoznaje czy to checklist/note

**Nowa wersja (chaos-to-structure):**
- ✅ 8 stanów (+ ASK_USER, + 3 warianty RESULT, + 3 warianty SAVED)
- ✅ 3 typy: checklist, note, calendar_event
- ✅ **AI porządkuje chaos** w strukturę (nie raw transcription!)
- ✅ **Confidence score** - model pyta jeśli nie wie (<0.7)
- ✅ **Export 1-click** do Reminders/Notes/Calendar
- ✅ **Export status tracking** (`exported: true/false`)
- ✅ **Auto-generated titles** dla wszystkich typów
- ✅ **Metadata extraction** (date, time, priority)

---

## NASTĘPNE KROKI
Po zatwierdzeniu tego designu przechodzę do **punktu #2 roadmapy: WEB MVP - AUDIO INPUT**

**Uwaga:** Design jest gotowy do implementacji, uwzględnia:
- Nową wizję "chaos-to-structure"
- 3 typy contentu
- Export do natywnych aplikacji
- Confidence-based user prompting

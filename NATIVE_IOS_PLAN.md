# PERIA — PLAN PRZEJŚCIA: PWA → NATIVE iOS

## DLACZEGO NATYWNE iOS?

### Problemy PWA (Safari):
❌ **Background audio NIE DZIAŁA** - nagrywanie przy wygaszonym ekranie niemożliwe
❌ **Audio przez słuchawki** - ograniczone wsparcie
❌ **Siri Shortcuts** - brak integracji
❌ **Home Screen Widget** - niedostępne w PWA
❌ **Haptic feedback** - ograniczone
❌ **Background processing** - nie działa

### Korzyści Native iOS:
✅ **Background audio** - nagrywanie przy wygaszonym ekranie
✅ **Audio przez słuchawki** - pełne wsparcie
✅ **Siri Shortcuts** - "Siri, nagraj myśl"
✅ **Home Screen Widget** - 1 tap → nagrywanie
✅ **Haptic feedback** - pełne wsparcie
✅ **Local storage** - Core Data / SQLite
✅ **App Store** - dystrybucja i monetyzacja

---

## OPCJE TECHNOLOGICZNE

### Opcja 1: React Native + Expo (REKOMENDOWANE)

**Zalety:**
- ✅ Wykorzystasz obecny kod React
- ✅ Szybszy development (hot reload)
- ✅ Expo SDK: audio, file system, haptics, notifications
- ✅ Możliwość portu na Android w przyszłości
- ✅ Znasz już React/JSX

**Wady:**
- ⚠️ Większy bundle size niż Swift native
- ⚠️ Zależność od Expo SDK
- ⚠️ Nieco wolniejsze niż Swift

**Stack:**
```
React Native + Expo
├── expo-av (audio recording)
├── expo-file-system (local storage)
├── expo-haptics (vibrations)
├── expo-notifications (reminders)
├── expo-sharing (export to Apps)
└── AsyncStorage / SQLite (database)
```

**Timeline:**
- Week 1: Setup + basic UI (port z PWA)
- Week 2: Audio recording + Whisper API
- Week 3: Notes model + AI detection
- Week 4: Export flow + polish
- Week 5: TestFlight beta

---

### Opcja 2: Swift + SwiftUI (native)

**Zalety:**
- ✅ Najszybsze performance
- ✅ Najmniejszy bundle size
- ✅ Pełna kontrola nad iOS features
- ✅ Długoterminowa stabilność

**Wady:**
- ⚠️ Musisz nauczyć się Swift/SwiftUI
- ⚠️ Wolniejszy development (rebuild za każdym razem)
- ⚠️ Brak możliwości portu na Android
- ⚠️ Nie wykorzystasz obecnego kodu React

**Stack:**
```
Swift + SwiftUI
├── AVFoundation (audio recording)
├── Core Data (database)
├── URLSession (API calls: Whisper, OpenAI)
├── ShareSheet (export)
└── WidgetKit (home screen widget)
```

**Timeline:**
- Week 1-2: Nauka Swift/SwiftUI
- Week 3-4: Basic UI + audio recording
- Week 5-6: Notes model + AI detection
- Week 7-8: Export flow + polish
- Week 9: TestFlight beta

---

### Opcja 3: Hybrid (React Native Web + Swift dla audio)

**Zalety:**
- ✅ Wykorzystasz PWA dla UI
- ✅ Swift tylko dla audio recording

**Wady:**
- ⚠️ Skomplikowana architektura
- ⚠️ Bridge między Web i Native
- ⚠️ Trudniejsze debugowanie

**NIE REKOMENDOWANE** (zbyt złożone dla MVP)

---

## REKOMENDACJA: REACT NATIVE + EXPO

### Dlaczego?
1. ✅ **Szybki start** - wykorzystasz istniejący kod React
2. ✅ **Background audio** - Expo SDK wspiera
3. ✅ **Export flow** - łatwe przez `expo-sharing`
4. ✅ **Future-proof** - możliwość portu na Android
5. ✅ **Community** - duża społeczność, dużo przykładów

---

## PLAN MIGRACJI (REACT NATIVE + EXPO)

### FAZA 1: Setup projektu (Week 1)

#### 1.1 Instalacja Expo
```bash
npx create-expo-app peria-native
cd peria-native
npm install
```

#### 1.2 Instalacja dependencies
```bash
# Audio recording
npx expo install expo-av

# File system
npx expo install expo-file-system

# Haptics
npx expo install expo-haptics

# Sharing (export)
npx expo install expo-sharing

# Database
npx expo install expo-sqlite

# OpenAI API
npm install openai
```

#### 1.3 Port komponentów z PWA
- [ ] App.jsx → App.tsx (TypeScript)
- [ ] agent.js → services/ai.ts
- [ ] localStorage → AsyncStorage / SQLite

#### 1.4 Basic UI
- [ ] Button component (nagrywanie)
- [ ] NoteView component
- [ ] Navigation (React Navigation)

**Kryteria akceptacji:**
- Aplikacja uruchamia się na symulatorze iOS
- Basic UI działa (bez funkcjonalności)

---

### FAZA 2: Audio Recording (Week 2)

#### 2.1 Permissions
```tsx
import { Audio } from 'expo-av';

async function requestPermissions() {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Potrzebne uprawnienia do mikrofonu');
    return false;
  }
  return true;
}
```

#### 2.2 Recording + Background
```tsx
import { Audio } from 'expo-av';

async function startRecording() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true  // ✨ KLUCZOWE
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  return recording;
}

async function stopRecording(recording) {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  return uri;  // lokalna ścieżka do pliku audio
}
```

#### 2.3 Wysyłanie do Whisper API
```tsx
import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system';

async function transcribeAudio(audioUri) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Konwersja URI → File
  const audioFile = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64
  });

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'pl'
  });

  return response.text;
}
```

**Kryteria akceptacji:**
- Nagrywanie działa przy wygaszonym ekranie
- Nagrywanie przez słuchawki działa
- Transkrypcja Whisper API działa

---

### FAZA 3: Notes Model + AI Detection (Week 3)

#### 3.1 Database (SQLite)
```tsx
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('peria.db');

// Inicjalizacja
db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, sourceText TEXT, detected TEXT, createdAt TEXT, exported TEXT);'
  );
});

// Zapisz notatkę
function saveNote(note) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO notes (id, sourceText, detected, createdAt, exported) VALUES (?, ?, ?, ?, ?);',
      [note.id, note.sourceText, JSON.stringify(note.detected), note.createdAt, JSON.stringify(note.exported)]
    );
  });
}

// Pobierz notatki
function getNotes(callback) {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM notes ORDER BY createdAt DESC;', [], (_, { rows }) => {
      callback(rows._array);
    });
  });
}
```

#### 3.2 AI Detection (port z PWA)
```tsx
// services/ai.ts
import OpenAI from 'openai';

export async function detectStructure(sourceText: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const currentDate = new Date().toISOString().split('T')[0];

  const prompt = `[... jak w AI_PROMPTS.md ...]`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Wykrywasz strukturę w chaotycznych myślach. Zwracasz TYLKO JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3
  });

  const reply = response.choices[0].message.content.trim();
  const jsonStr = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const detected = JSON.parse(jsonStr);

  return detected;
}
```

**Kryteria akceptacji:**
- Notatki zapisują się do SQLite
- AI detection działa (tasks, events, creative)
- Notatka wyświetla się w UI

---

### FAZA 4: Export Flow (Week 4)

#### 4.1 Export do Apple Notes (Sharing)
```tsx
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

async function exportToAppleNotes(note) {
  const text = formatNoteForAppleNotes(note);

  // Zapisz do pliku tymczasowego
  const fileUri = FileSystem.documentDirectory + 'note.txt';
  await FileSystem.writeAsStringAsync(fileUri, text);

  // Share
  await Sharing.shareAsync(fileUri);

  // Oznacz jako wyeksportowane
  markAsExported(note.id, 'notes');
}
```

#### 4.2 Export do Reminders
```tsx
async function exportToReminders(note) {
  const tasks = note.detected?.tasks || [];
  const text = tasks.map(t => `• ${t.text}`).join('\n');

  const fileUri = FileSystem.documentDirectory + 'tasks.txt';
  await FileSystem.writeAsStringAsync(fileUri, text);

  await Sharing.shareAsync(fileUri);

  markAsExported(note.id, 'reminders');
}
```

#### 4.3 Export do Calendar (.ics)
```tsx
async function exportToCalendar(note) {
  const events = note.detected?.events || [];
  const icsContent = generateICS(events);

  const fileUri = FileSystem.documentDirectory + 'events.ics';
  await FileSystem.writeAsStringAsync(fileUri, icsContent);

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/calendar',
    UTI: 'public.calendar-event'
  });

  markAsExported(note.id, 'calendar');
}
```

**Kryteria akceptacji:**
- Export do Notes działa (Share sheet → Notes)
- Export do Reminders działa (Share sheet → Reminders)
- Export do Calendar działa (Share sheet → Calendar)

---

### FAZA 5: Polish + TestFlight (Week 5)

#### 5.1 UI Polish
- [ ] Dark theme (profesjonalna paleta)
- [ ] Haptic feedback przy nagrywaniu
- [ ] Animacje przejść
- [ ] Loading states (nagrywanie, transkrypcja, AI)

#### 5.2 Error Handling
- [ ] Brak internetu → retry
- [ ] Whisper timeout → retry
- [ ] AI error → fallback (wszystko jako creative)
- [ ] Puste nagranie → alert

#### 5.3 TestFlight
```bash
# Build dla iOS
eas build --platform ios

# Submit do TestFlight
eas submit --platform ios
```

**Kryteria akceptacji:**
- Aplikacja wygląda profesjonalnie
- Wszystkie błędy obsłużone
- TestFlight build dostępny

---

## PORÓWNANIE: PWA vs NATIVE

| Feature | PWA (Safari) | Native iOS (Expo) |
|---------|--------------|-------------------|
| Background audio | ❌ NIE | ✅ TAK |
| Słuchawki | ⚠️ Ograniczone | ✅ TAK |
| Siri Shortcuts | ❌ NIE | ✅ TAK |
| Home Widget | ❌ NIE | ✅ TAK |
| Haptics | ⚠️ Ograniczone | ✅ TAK |
| Local DB | ✅ localStorage | ✅ SQLite |
| Export | ✅ Share API | ✅ Share Sheet |
| Offline | ✅ Service Worker | ✅ Native |
| App Store | ❌ NIE | ✅ TAK |
| Monetyzacja | ⚠️ Trudne | ✅ In-App Purchase |

---

## TIMELINE SZCZEGÓŁOWY

### Week 1: Setup
- Dzień 1-2: Expo init + dependencies
- Dzień 3-4: Port UI z PWA
- Dzień 5-7: Basic navigation + testing

### Week 2: Audio
- Dzień 1-2: Audio recording + permissions
- Dzień 3-4: Background audio + słuchawki
- Dzień 5-7: Whisper API integration

### Week 3: Notes Model
- Dzień 1-2: SQLite setup + migrations
- Dzień 3-4: AI detection (port z PWA)
- Dzień 5-7: Notes UI + testing

### Week 4: Export
- Dzień 1-2: Export to Notes
- Dzień 3-4: Export to Reminders
- Dzień 5-7: Export to Calendar (.ics)

### Week 5: Polish
- Dzień 1-2: UI polish + animations
- Dzień 3-4: Error handling
- Dzień 5: TestFlight build
- Dzień 6-7: Beta testing

---

## NASTĘPNE KROKI (PO TESTFLIGHT)

### Widget (Faza 6)
- Home Screen Widget (SwiftUI)
- 1 tap → otwiera app + start recording

### Siri Shortcuts (Faza 7)
- "Siri, nagraj myśl" → otwiera app + recording

### Monetyzacja (Faza 8)
- In-App Purchase (RevenueCat)
- FREE: 10 notatek/msc
- PRO: unlimited + export

---

## KOSZTY

### Development:
- Apple Developer Program: $99/rok
- Expo EAS: $29/msc (opcjonalne, tylko do buildu)
- OpenAI API: ~$0.006 per minute (Whisper) + ~$0.01 per request (GPT-4o-mini)

### Hosting:
- Brak (aplikacja lokalna, brak backendu)

### Total (Year 1):
- $99 (Apple) + ~$348 (Expo, opcjonalne) = ~$447/rok
- API koszty: zależne od użycia (~$10-50/msc dla 100-500 użytkowników)

---

## DECYZJA

✅ **REKOMENDACJA: React Native + Expo**

**Dlaczego:**
1. Wykorzystasz istniejący kod React
2. Background audio DZIAŁA
3. Szybszy development (hot reload)
4. Możliwość portu na Android
5. Łatwiejsze testowanie (Expo Go)

**Kiedy zacząć:**
- **PO** przetestowaniu PWA prototypu
- **PO** walidacji modelu "jedna notatka = źródło prawdy"
- Czyli: za ~1-2 tygodnie

**Priorytet:**
WYSOKI - natywne iOS jest WARUNKIEM sensu projektu (background audio)

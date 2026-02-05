# PERIA — GDY MYŚL POJAWIA SIĘ WTEDY, GDY JEJ NIE SZUKASZ

> **Peria zapisuje. Nie mówi. Nie coachuje. Porządkuje.**

## FUNDAMENTY (NIEPODLEGAJĄCE DYSKUSJI)

### 1. Jedna notatka = jedno źródło prawdy
- Użytkownik NIE wybiera typu na starcie
- Każda sesja mówienia = JEDNA NOTATKA
- Struktura powstaje PO nagraniu, nie przed
- AI wykrywa zadania/daty/listy automatycznie

### 2. Voice-first = CORE, nie feature
- Nagrywanie przy wygaszonym ekranie jest WARUNKIEM sensu
- Natywne iOS WCZEŚNIE (PWA nie obsługuje background audio)
- Web/PWA = prototyp logiki, NIE docelowy produkt

### 3. Eksport zamiast chmury
- Brak własnej chmury
- Brak kont i synchronizacji
- Export 1-click do Apple Notes/Reminders/Calendar
- Świadoma akcja użytkownika, nie automatyczny sync

### 4. Model pojęciowy
**Chaos → Struktura**
- System AUTOMATYCZNIE wykrywa intencję
- Użytkownik może: zaakceptować / cofnąć / zignorować
- Decyzje strukturalne = system
- Decyzje kreatywne = użytkownik

### 5. Definicja sukcesu
Peria działa, jeśli:
- Wracasz do notatek po spacerze
- Tekst rapowy żyje w jednej notatce
- Zadania same "wypadają" z tekstu
- Czujesz frustrację, gdy appki nie masz pod ręką

---

## FLOW UŻYCIA

### Jak to działa:
1. **Użytkownik mówi** (chaotycznie, w ruchu)
2. **Powstaje notatka** (tekst źródłowy)
3. **AI w tle:**
   - wykrywa listy zadań
   - wykrywa daty i godziny
   - porządkuje chaos w strukturę
4. **System AUTOMATYCZNIE:**
   - tworzy checklisty (jeśli są zadania)
   - tworzy propozycje wydarzeń (jeśli są daty)
5. **Użytkownik może:**
   - zaakceptować
   - cofnąć
   - zignorować

### Przykład użycia:
```
Użytkownik mówi:
"Jutro muszę kupić mleko i chleb, potem spotkanie o 15,
a wieczorem siłownia. Aha i pomysł na rapowy tekst -
może zacznę od frazy o bezsennnych nocach..."

System tworzy JEDNĄ NOTATKĘ:
┌─────────────────────────────────────────┐
│ Notatka: "Jutro - zakupy i plan dnia"   │
│ ────────────────────────────────────── │
│ [Pełny tekst transkrypcji]             │
│                                         │
│ AI wykryło:                             │
│ ✓ 2 zadania → Checklist                │
│ ✓ 2 wydarzenia → Calendar               │
│ ✓ 1 pomysł kreatywny → Note pozostaje  │
└─────────────────────────────────────────┘
```

## ZASADY PROJEKTU
- Natywne iOS WCZEŚNIE (PWA = tylko prototyp)
- Najpierw działa, potem wygląda
- Nie coachujemy, porządkujemy
- Znikamy z drogi użytkownika

---

## ROADMAP

## FAZA 0: PROTOTYP LOGIKI (PWA) ✅ COMPLETED
**Cel:** Przetestować "jedna notatka = źródło prawdy" + AI auto-detekcja

### 0.1 Architektura "Jedna Notatka" ✅
- [x] Zmienić model danych z `tasks[]` na `notes[]`
- [x] Struktura: `{ id, sourceText, detected: { note, checklist[], events[] }, createdAt, exported: {} }`
- [x] Notatka może zawierać: tekst + zadania + daty
- [x] Wszystko w localStorage
- [x] Smart tracking: które elementy zostały wyeksportowane

### 0.2 AI: Chaos → Struktura (Auto-detekcja) ✅
- [x] Zmienić prompt: z "wypisz zadania" → "wykryj strukturę w chaosie"
- [x] JSON response: `{ note, checklist[], events[] }`
- [x] System SAM proponuje checklisty/eventy
- [x] Użytkownik może zaakceptować/odrzucić (eksport do sekcji)
- [x] Auto-restore export buttons po usunięciu z sekcji

### 0.3 UI Flow ✅
- [x] Voice recording → transkrypcja → jedna notatka
- [x] Inbox: AI pokazuje wykryte elementy w kolorowych sekcjach
- [x] Przyciski eksportu dla każdej kategorii (→ Notatki / → Checklisty / → Wydarzenia)
- [x] 3 dedykowane sekcje do zarządzania wyeksportowanymi itemami
- [x] "Pokaż oryginał" - pełen tekst transkrypcji zawsze dostępny

**Kryteria akceptacji:** ✅
- [x] Mogę nagrać chaotyczny tekst → system wykryje zadania/daty
- [x] Wszystko zapisane w jednej notatce w Inbox
- [x] Widzę źródłowy tekst + wykryte elementy
- [x] Mogę wyeksportować do odpowiednich sekcji
- [x] Mobile-friendly UX z animacjami

---

## FAZA 1: NATYWNE iOS (BACKGROUND AUDIO)
**Cel:** Nagrywanie przy wygaszonym ekranie - warunek sensu projektu

⚠️ **KLUCZOWA DECYZJA:** PWA NIE OBSŁUGUJE background audio. Natywna aplikacja iOS jest WARUNKIEM sensu projektu.

**Tech Stack Decision: React Native + Expo**
- Szybszy development (wykorzystanie istniejącej logiki JS)
- Expo SDK ma gotowe API do audio recording
- Możliwość testowania bez Mac (Expo Go)
- Łatwiejszy port całej logiki z PWA
- Native modules gdy potrzeba (Expo dev build)

---

### 1.0 Przygotowanie Środowiska ⚙️
**Cel:** Setup full native development environment

#### 1.0.1 Instalacja Tools
- [ ] Zainstalować Node.js 18+ (LTS)
- [ ] Zainstalować Expo CLI: `npm install -g expo-cli`
- [ ] Zainstalować EAS CLI: `npm install -g eas-cli`
- [ ] Zainstalować Xcode (najnowsza wersja z App Store)
- [ ] Zainstalować Xcode Command Line Tools
- [ ] Zainstalować iOS Simulator
- [ ] Zainstalować Expo Go na iPhone (do testów)
- [ ] Utworzyć konto Expo (https://expo.dev)

#### 1.0.2 Projekt Setup
- [ ] `npx create-expo-app peria-ios --template blank`
- [ ] Dodać do `.gitignore`: `node_modules/`, `.expo/`, `dist/`, `*.log`
- [ ] Zainstalować podstawowe zależności:
  ```bash
  npx expo install expo-av expo-file-system
  npx expo install expo-secure-store
  npx expo install @react-navigation/native @react-navigation/native-stack
  npx expo install react-native-screens react-native-safe-area-context
  ```
- [ ] Zainstalować UI dependencies:
  ```bash
  npm install nanoid
  ```
- [ ] Skonfigurować `app.json`:
  - Bundle identifier: `com.peria.app`
  - Display name: "Peria"
  - Orientation: `portrait`
  - Splash screen: logo + "Gdzie myśl się rodzi"
  - Status bar: `light-content`
- [ ] Test uruchomienia: `npx expo start`
- [ ] Test na symulatorze iOS: `i` w Expo CLI
- [ ] Test na fizycznym iPhone: scan QR code w Expo Go

**Kryteria akceptacji 1.0:**
- ✅ Projekt React Native uruchamia się na symulatorze
- ✅ Projekt React Native uruchamia się na fizycznym iPhone (Expo Go)
- ✅ Podstawowa nawigacja działa
- ✅ Build przechodzi bez błędów

---

### 1.1 Background Audio Recording 🎙️
**Cel:** Nagrywanie audio przy zablokowanym ekranie

#### 1.1.1 Audio Permissions & Config
- [ ] Dodać do `app.json` → `ios.infoPlist`:
  ```json
  "NSMicrophoneUsageDescription": "Peria potrzebuje dostępu do mikrofonu aby nagrywać Twoje myśli",
  "UIBackgroundModes": ["audio"]
  ```
- [ ] Skonfigurować Audio Mode w `App.js`:
  ```javascript
  import { Audio } from 'expo-av';
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });
  ```
- [ ] Request microphone permission przy pierwszym uruchomieniu

#### 1.1.2 Recording Implementation
- [ ] Utworzyć `services/AudioRecorder.js`:
  - `startRecording()` - inicjalizacja Recording object
  - `stopRecording()` - zatrzymanie + zwrot URI pliku
  - `getRecordingDuration()` - elapsed time
  - Error handling (brak permissji, brak miejsca)
- [ ] Utworzyć `components/RecordButton.jsx`:
  - Duży czerwony przycisk (jak Camera)
  - Pulsująca animacja podczas nagrywania
  - Timer elapsed time
  - Status: idle / recording / processing
- [ ] Test nagrywania przez 30s przy zablokowanym ekranie
- [ ] Test nagrywania przez słuchawki Bluetooth
- [ ] Test nagrywania w tle (app w background)

#### 1.1.3 Audio Format & Quality
- [ ] Konfiguracja Recording Options:
  ```javascript
  {
    android: {
      extension: '.m4a',
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 16000, // Whisper działa dobrze z 16kHz
      numberOfChannels: 1, // Mono wystarczy
      bitRate: 64000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 64000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  }
  ```
- [ ] Zapisywanie do `FileSystem.documentDirectory`
- [ ] Auto-cleanup starych plików audio (po transkrypcji)

**Kryteria akceptacji 1.1:**
- ✅ Nagrywanie działa przy zablokowanym ekranie (>2 minuty test)
- ✅ Nagrywanie działa przez słuchawki
- ✅ Nagrywanie działa w tle (app minimized)
- ✅ Elapsed timer update w czasie rzeczywistym
- ✅ Plik audio zapisany w dokumentach (.m4a)
- ✅ Nie ma crash gdy brak permissji

---

### 1.2 Whisper API Integration 🗣️
**Cel:** Transkrypcja nagranego audio

#### 1.2.1 API Client
- [ ] Utworzyć `services/WhisperAPI.js`:
  - `transcribeAudio(audioUri)` - upload + receive text
  - FormData upload (multipart/form-data)
  - Handle network errors (retry logic)
  - Handle Whisper errors (unsupported format, file too large)
- [ ] Przechowywanie API key w Expo SecureStore:
  ```javascript
  import * as SecureStore from 'expo-secure-store';
  await SecureStore.setItemAsync('openai_api_key', key);
  ```
- [ ] Settings screen do wpisania API key
- [ ] Walidacja API key (test request)

#### 1.2.2 Conversion & Upload
- [ ] Convert M4A → format akceptowany przez Whisper (jeśli potrzeba)
- [ ] Compresia pliku jeśli >25MB (Whisper limit)
- [ ] Progress indicator podczas uploadu
- [ ] Timeout 60s dla uploadu
- [ ] Retry logic (max 3 attempts z exponential backoff)

#### 1.2.3 UI Flow
- [ ] Recording → "Przetwarzanie..." screen
- [ ] Loading spinner + "Wysyłanie audio..."
- [ ] Loading spinner + "Transkrypcja w toku..."
- [ ] Success → redirect do Note Details
- [ ] Error → show alert + option retry
- [ ] Zachowanie audio file lokalnie jeśli error (możliwość retry)

**Kryteria akceptacji 1.2:**
- ✅ Audio file (2 min) transkrybuje się poprawnie
- ✅ Tekst polski rozpoznawany poprawnie
- ✅ Error handling działa (brak netu, invalid API key)
- ✅ Progress indicator pokazuje postęp
- ✅ Transkrypcja zajmuje <30s dla 2min audio

---

### 1.3 Data Model & Storage 💾
**Cel:** Port logiki "jedna notatka = źródło prawdy" do native

#### 1.3.1 Data Structure
- [ ] Utworzyć `models/Note.js`:
  ```javascript
  {
    id: string (nanoid),
    title: string,
    sourceText: string (transkrypcja),
    detected: {
      note: string | null,
      checklist: [{ text, completed }],
      events: [{ title, date, time }]
    },
    createdAt: ISO timestamp,
    exported: {
      notes: boolean,
      reminders: boolean,
      calendar: boolean
    }
  }
  ```
- [ ] Utworzyć `models/MyNote.js`, `Checklist.js`, `Event.js` (sekcje)

#### 1.3.2 Storage Layer
- [ ] Expo SecureStore dla małych danych (API keys)
- [ ] AsyncStorage dla dużych danych (notes):
  ```javascript
  import AsyncStorage from '@react-native-async-storage/async-storage';
  await AsyncStorage.setItem('peria_inbox', JSON.stringify(notes));
  ```
- [ ] Utworzyć `services/StorageService.js`:
  - `saveNote(note)` - zapis do inbox
  - `getNotes()` - load inbox
  - `updateNote(id, updates)` - update note
  - `deleteNote(id)` - usunięcie
  - `exportToSection(noteId, section)` - move to MyNotes/Checklists/Events
  - `getMyNotes()`, `getChecklists()`, `getEvents()` - load sekcji

#### 1.3.3 Data Migration
- [ ] OPCJONALNIE: import danych z PWA (localStorage export)
- [ ] Format JSON do export/import

**Kryteria akceptacji 1.3:**
- ✅ Notatki zapisują się persistent (przetrwają restart app)
- ✅ Model danych identyczny jak w PWA
- ✅ Wszystkie operacje CRUD działają
- ✅ Eksport do sekcji działa

---

### 1.4 AI Auto-Detection (LLM) 🤖
**Cel:** Automatyczne wykrywanie struktury w chaosie

#### 1.4.1 LLM API Integration
- [ ] Utworzyć `services/LLMService.js`:
  - `detectStructure(text)` - GPT-4o-mini analysis
  - Return: `{ note, checklist: [], events: [] }`
  - Prompt identyczny jak w PWA (chaos → struktura)
- [ ] Użycie tego samego prompta co w PWA (skopiować z `ChatVoiceFirst.jsx`)
- [ ] Handle API errors (retry, fallback)
- [ ] Timeout 30s

#### 1.4.2 Processing Flow
- [ ] Po transkrypcji → automatycznie call LLM
- [ ] Zapisanie raw transkrypcji + detected structure
- [ ] UI pokazuje detected items (kolorowe sekcje)
- [ ] User może zaakceptować/odrzucić (export do sekcji)

**Kryteria akceptacji 1.4:**
- ✅ LLM wykrywa zadania/daty/notatki poprawnie
- ✅ Format output identyczny jak w PWA
- ✅ Fallback gdy LLM error (pokaż raw text)

---

### 1.5 UI/UX - Navigation & Screens 📱
**Cel:** Port interfejsu z PWA do React Native

#### 1.5.1 Navigation Setup
- [ ] Bottom Tab Navigator (5 tabs):
  - 🎙️ Record (główny ekran)
  - 📥 Inbox
  - 📝 Notatki
  - ✅ Checklisty
  - 📅 Wydarzenia
- [ ] Kolory tabów: active = category color, inactive = gray
- [ ] Tab icons (SVG lub SF Symbols)

#### 1.5.2 Screen: Record
- [ ] Duży czerwony przycisk nagrywania (center)
- [ ] Timer elapsed podczas nagrywania
- [ ] Pulsująca animacja (Animated API)
- [ ] Status text: "Dotknij aby nagrać" / "Nagrywanie..." / "Przetwarzanie..."
- [ ] Splash screen przy starcie (2s): "Peria - Gdzie myśl się rodzi"

#### 1.5.3 Screen: Inbox
- [ ] Lista notatek (FlatList)
- [ ] Każda notatka: card z header (expand/collapse)
- [ ] Header: title + data + status indicator
- [ ] Body (expanded): 3 sekcje (note/checklist/events) z export buttons
- [ ] "Pokaż oryginał" toggle
- [ ] Empty state: "Brak notatek w Inbox"
- [ ] Pull-to-refresh

#### 1.5.4 Screen: MyNotes
- [ ] Lista notatek (FlatList)
- [ ] Card: title + content preview
- [ ] Tap → expand full content
- [ ] Edit mode: edycja tytułu + treści
- [ ] Export button → Apple Notes
- [ ] Delete button
- [ ] Empty state

#### 1.5.5 Screen: Checklists
- [ ] Lista checklistów (FlatList)
- [ ] Card: title + progress badge (3/5)
- [ ] Expand → lista items z checkboxami
- [ ] Tap item → toggle completed
- [ ] Edit/Delete item buttons
- [ ] Export → Apple Reminders
- [ ] Empty state

#### 1.5.6 Screen: Events
- [ ] Lista wydarzeń (FlatList)
- [ ] Card: title + first event date
- [ ] Expand → lista wydarzeń z datami
- [ ] Delete event button
- [ ] Export → Apple Calendar
- [ ] Empty state

**Kryteria akceptacji 1.5:**
- ✅ Nawigacja między ekranami działa płynnie
- ✅ Wszystkie 5 ekranów zaimplementowane
- ✅ UI responsywne (iPhone SE do iPhone 15 Pro Max)
- ✅ Animacje płynne (60 FPS)
- ✅ Pull-to-refresh działa

---

### 1.6 Apple Integrations (Export) 📤
**Cel:** 1-click export do natywnych aplikacji

#### 1.6.1 Share API
- [ ] Użycie React Native Share API:
  ```javascript
  import { Share } from 'react-native';
  await Share.share({
    title: note.title,
    message: note.content,
  });
  ```
- [ ] Export button otwiera iOS Share Sheet
- [ ] Użytkownik wybiera app (Notes/Reminders/Calendar)

#### 1.6.2 Calendar Integration
- [ ] Zainstalować `expo-calendar`
- [ ] Request Calendar permission
- [ ] Utworzyć event z detected date/time:
  ```javascript
  import * as Calendar from 'expo-calendar';
  await Calendar.createEventAsync(calendarId, {
    title: event.title,
    startDate: new Date(event.date),
    endDate: new Date(event.date + 1h),
    notes: event.description,
  });
  ```
- [ ] Success message: "Dodano do Kalendarza"

#### 1.6.3 Reminders Integration (jeśli możliwe)
- [ ] Research: czy Expo ma API do Reminders?
- [ ] Jeśli nie: użyć Share API (copy to clipboard)
- [ ] Format: checklist jako plain text

**Kryteria akceptacji 1.6:**
- ✅ Export do Apple Notes działa (Share Sheet)
- ✅ Export do Apple Calendar działa (native)
- ✅ Export do Reminders działa (Share lub native)
- ✅ Po eksporcie: item oznaczony jako "exported"

---

### 1.7 Polish & Testing 🎨
**Cel:** Aplikacja gotowa do daily use

#### 1.7.1 Dark Theme
- [ ] Port kolorów z PWA:
  - Background: `#0f172a` (navy)
  - Cards: `#1e293b`
  - Primary: `#4a9396` (teal)
  - Accent: `#fdd03b` (yellow), `#cb7f07` (orange)
- [ ] Respektowanie system dark mode (iOS)

#### 1.7.2 Haptic Feedback
- [ ] Vibration przy start recording
- [ ] Vibration przy stop recording
- [ ] Vibration przy toggle checkbox
- [ ] Użycie `expo-haptics`:
  ```javascript
  import * as Haptics from 'expo-haptics';
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  ```

#### 1.7.3 Error Handling
- [ ] Brak internetu → offline mode message
- [ ] Whisper timeout → retry button
- [ ] LLM error → show raw transcript
- [ ] Brak mikrofonu permission → settings link
- [ ] Brak miejsca na dysku → warning

#### 1.7.4 Performance
- [ ] FlatList optimization (renderItem, keyExtractor)
- [ ] Lazy loading długich list
- [ ] Memoization (React.memo, useMemo)
- [ ] Image/Icon optimization (SVG lub SF Symbols)

#### 1.7.5 Testing Terenowe
- [ ] Używać codziennie przez 1 tydzień
- [ ] Nagrywać podczas spacerów (hands-free)
- [ ] Test battery drain (background recording)
- [ ] Test różne długości nagrań (30s, 2min, 5min, 10min)
- [ ] Test różne języki (polski, angielski)
- [ ] Beta test 2-3 osoby

**Kryteria akceptacji 1.7:**
- ✅ App działa stabilnie przez cały dzień
- ✅ Brak crash przy edge cases
- ✅ Battery drain akceptowalny (<5% per hour recording)
- ✅ Haptic feedback działa
- ✅ Dark theme wygląda profesjonalnie

---

### 1.8 App Store Preparation 🚀
**Cel:** Gotowe do TestFlight / App Store

#### 1.8.1 Build Configuration
- [ ] EAS Build setup:
  ```bash
  eas build:configure
  ```
- [ ] Utworzyć `eas.json`:
  ```json
  {
    "build": {
      "preview": {
        "ios": {
          "simulator": true
        }
      },
      "production": {
        "ios": {
          "bundleIdentifier": "com.peria.app"
        }
      }
    }
  }
  ```
- [ ] Build Preview (Simulator): `eas build --platform ios --profile preview`
- [ ] Build Production: `eas build --platform ios --profile production`

#### 1.8.2 App Store Assets
- [ ] App Icon (1024x1024)
- [ ] Screenshots (6.7", 6.5", 5.5")
  - Recording screen
  - Inbox z przykładową notatką
  - MyNotes screen
  - Checklisty screen
- [ ] App Preview video (30s):
  - Nagrywanie → transkrypcja → export
- [ ] App Store Description (PL + EN)
- [ ] Keywords: notatki, voice notes, dictation, GTD, productivity

#### 1.8.3 TestFlight
- [ ] Dodać do App Store Connect
- [ ] Utworzyć internal testing group
- [ ] Upload build via EAS
- [ ] Beta test 5-10 osób (znajomi)
- [ ] Zebrać feedback (TestFlight feedback form)

**Kryteria akceptacji 1.8:**
- ✅ Build przechodzi review (no rejections)
- ✅ TestFlight działa na różnych urządzeniach
- ✅ Feedback pozytywny (>4/5 stars)
- ✅ Gotowe do public release

---

## FAZA 2: EKSPORT DO APPLE APPS
**Cel:** 1-click export z notatki do natywnych aplikacji

### 2.1 Apple Reminders
- [ ] Z wykrytych zadań → Apple Reminders (URL scheme / Share API)
- [ ] Format: lista zadań z tytułem notatki
- [ ] Oznaczenie jako "wyeksportowane"

### 2.2 Apple Notes
- [ ] Pełny tekst notatki → Apple Notes (Share sheet + markdown)
- [ ] Zachowanie formatowania (akapity, listy)

### 2.3 Apple Calendar
- [ ] Z wykrytych dat/godzin → Apple Calendar
- [ ] Format: event z tytułem, datą, czasem, notatką

**Kryteria akceptacji:**
- Export działa w <5 sekund (1 klik)
- Po eksporcie: item oznaczony jako "exported"
- Wszystkie 3 ścieżki działają

---

## FAZA 3: POLISH & WALIDACJA
**Cel:** Aplikacja gotowa do daily use

### 3.1 UI/UX Polish
- [ ] Minimalistyczny interfejs (jedna notatka = jeden ekran)
- [ ] Haptic feedback przy nagrywaniu
- [ ] Animacje przejść (recording → processing → result)
- [ ] Dark mode (profesjonalna paleta kolorów)

### 3.2 Testowanie terenowe
- [ ] Używać codziennie przez 2 tygodnie
- [ ] Nagrywać podczas spacerów (hands-free)
- [ ] Sprawdzić czy wracasz do notatek
- [ ] Zebrać 3 osoby do testów beta (feedback)

### 3.3 Error Handling
- [ ] Brak internetu → retry
- [ ] Whisper timeout → fallback
- [ ] LLM błąd → pokaż raw transkrypcję
- [ ] Puste nagranie → "Nie wykryto mowy"

**Kryteria akceptacji:**
- Czujesz frustrację, gdy appki nie masz
- Polecasz ją znajomemu

---

## PRZYSZŁOŚĆ (PO WALIDACJI)

### Widget iOS/Android
- Home Screen Widget: 1 tap → nagrywanie
- Pokazuje liczbę nie-wyeksportowanych notatek

### Monetyzacja
**FREE tier:**
- 10 notatek/miesiąc
- Brak eksportu

**PRO ($2.99/msc):**
- Nielimitowane notatki
- Eksport do natywnych aplikacji
- Pełna historia

### Skalowanie
- TestFlight beta → App Store
- Voice commands: "Siri, nagraj myśl"
- Integracje: Notion, Obsidian

---

## 📚 DOKUMENTACJA

### Design System
Wszystkie kolory, typografia, spacing i komponenty są zdokumentowane w:
**→ [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)**

Przed wprowadzeniem zmian wizualnych ZAWSZE sprawdź ten dokument!

---

## AKTUALNY STATUS

### ✅ Zrobione:

**FAZA 0.1-0.3: Architektura "Jedna Notatka" + AI Auto-detekcja** ✅
- ✅ Refactor z `tasks[]` → `notes[]` (struktura note-centric)
- ✅ Jedna notatka = źródło prawdy (`{ id, sourceText, detected: { note, checklist, events }, createdAt }`)
- ✅ AI auto-detekcja: system SAM wykrywa zadania/daty/notatki
- ✅ Inbox: przeglądanie wykrytych struktur z możliwością eksportu do sekcji
- ✅ 3 dedykowane sekcje: MyNotes, Checklists, Events
- ✅ Edycja tytułów (klik na tytuł → inline edit)
- ✅ Eksport 1-click do Apple Reminders/Notes/Calendar (via Share API)
- ✅ Smart detection tracking: przycisk eksportu znika po dodaniu do sekcji
- ✅ Auto-restore export button po usunięciu z sekcji (localStorage sync)

**Voice Recording & Mobile UX** ✅
- ✅ Voice recording przez przeglądarkę (Web Audio API)
- ✅ Whisper API transkrypcja (OpenAI)
- ✅ PWA ready: manifest + service worker + offline support
- ✅ Mobile-first UX: sticky navigation, large touch targets (56px)
- ✅ Viewport lock: disabled zoom/pinch for native feel
- ✅ Recording indicator: pulsing animation + elapsed time
- ✅ Standalone mode detection + audio format compatibility

**UI/UX Polish** ✅
- ✅ Dark theme z profesjonalną paletą (navy + teal/yellow/orange accents)
- ✅ Category color coding: każda sekcja ma swój kolor (#4a9396, #fdd03b, #cb7f07)
- ✅ Navigation buttons light up with category colors when active
- ✅ Splash screen: "Peria - Gdzie myśl się rodzi" (2s animated intro)
- ✅ Smooth animations: expand/collapse cards, rotating chevrons (0.3s ease)
- ✅ SVG icons zamiast emoji w nawigacji (consistent, scalable)
- ✅ Colored section headers z left border + subtle background
- ✅ Status indicators: new/read/categorized (3-state system)
- ✅ Empty states z hints
- ✅ Sharp corners (border-radius: 4px zamiast 12px)
- ✅ Bordered buttons (transparent background + colored border)
- ✅ Small edit icons (✎) zamiast dużych przycisków "Edytuj tytuł"
- ✅ Centralna dokumentacja stylów → DESIGN-SYSTEM.md

**Edycja i Zarządzanie** ✅
- ✅ Small title edit icons (✎) - click icon to edit title
- ✅ Checklist items: toggle complete, edit text, delete
- ✅ Event items: delete individual events
- ✅ Note content: full edit mode
- ✅ Smart export buttons: show/hide based on export status
- ✅ "Show original" toggle z animated chevron
- ✅ Mobile-friendly: całe item clickable (nie tylko checkbox)
- ✅ Always-visible action buttons (no hover-dependent interactions)

### 🎯 CO TERAZ?

**FAZA 0 COMPLETED!** 🎉
Prototyp PWA jest funkcjonalny, stabilny i zawiera wszystkie kluczowe feature'y:
- ✅ Jedna notatka = źródło prawdy
- ✅ AI auto-detekcja struktury (chaotyczna mowa → uporządkowane sekcje)
- ✅ Export do Apple Notes/Reminders/Calendar (Share API)
- ✅ Mobile-first UX (sticky nav, large touch targets, viewport lock)
- ✅ Recording z pulsującą animacją i elapsed time
- ✅ 3 dedykowane sekcje: MyNotes, Checklists, Events
- ✅ Edycja tytułów inline (small ✎ icons)
- ✅ Smart export tracking (auto-restore buttons)
- ✅ Dark theme + category colors (#4a9396, #fdd03b, #cb7f07)
- ✅ Splash screen z nowym hasłem
- ✅ Smooth animations (expand/collapse, rotating chevrons)
- ✅ Kompletna dokumentacja design systemu (DESIGN-SYSTEM.md)
- ✅ PWA ready (manifest, service worker, offline support)

**PWA STABILNE I GOTOWE DO UŻYCIA DAILY!**

**NASTĘPNY KROK: FAZA 1 - Natywne iOS**
iOS będzie rozwijane w osobnym projekcie/folderze (React Native + Expo).
PWA pozostaje jako funkcjonalny prototyp i testbed dla nowych feature'ów.

---

## KLUCZOWA RÓŻNICA

**Typowa TODO app:**
```
Użytkownik → wybiera typ → wpisuje tekst → zapisuje
```

**Peria:**
```
Użytkownik → mówi chaos → AI wykrywa strukturę → propozycje akcji
                ↓
        JEDNA NOTATKA (źródło prawdy)
                ↓
        wykryte: zadania / daty / pomysły
```

**Przykład:**
```
Input:
"Jutro kupić mleko, potem spotkanie o 15,
a wieczorem pomysł na rapowy tekst o bezsenności"

System tworzy:
┌─────────────────────────────────┐
│ NOTATKA #42                     │
│ ─────────────────────────────── │
│ [pełny tekst]                   │
│                                 │
│ AI wykryło:                     │
│ • 1 zadanie → Checklist?        │
│ • 1 event → Calendar?           │
│ • 1 pomysł → zostaje w notatce  │
└─────────────────────────────────┘
```

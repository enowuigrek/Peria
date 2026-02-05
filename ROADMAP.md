# VOICE-FIRST CHAOS-TO-STRUCTURE APP
# MVP → iOS WIDGET → ANDROID WIDGET → PAID

## WIZJA PRODUKTU
**Problem:** Podczas spaceru wpada mi pomysł/zadanie/myśl - chcę to szybko nagrać i mieć uporządkowane.

**Rozwiązanie:**
1. Jedno kliknięcie (widget iOS/Android) → nagrywanie
2. Mówię chaotycznie → AI porządkuje i rozpoznaje intencję (checklist/notatka/event)
3. Model decyduje SAM lub pyta jeśli nie wie
4. Po spacerze: uporządkowana notatka/lista/event w aplikacji
5. Jeden klick: eksport do Apple Reminders/Notes/Calendar (iOS) lub Google Keep/Tasks/Calendar (Android)

**Kluczowe cechy:**
- Chaos → Struktura (AI rozumie i porządkuje)
- Auto-rozpoznanie typu (checklist/note/calendar)
- Wewnętrzna baza + łatwy eksport do natywnych aplikacji
- Widget na ekranie głównym (najszybszy dostęp)

## ZASADY PROJEKTU
- Robię to najpierw dla siebie
- Każdy punkt musi dać się przetestować
- Nie dodaję funkcji spoza checklisty
- Najpierw działa, potem wygląda

---

## 1. ✅ UX – MINIMALNY DESIGN (ZAKOŃCZONE!)
**Cel:** Zaprojektować przepływ przed kodowaniem

- [x] Mockup głównego ekranu (UX-DESIGN.md)
- [x] Stan: **idle** - główny przycisk "Nagraj" (duży, centralny)
- [x] Stan: **recording** - pulsujący przycisk, timer nagrywania
- [x] Stan: **processing** - spinner + "Przetwarzam..." + możliwość anulowania
- [x] Stan: **result** - 3 warianty (checklist, note, calendar_event)
- [x] Stan: **ask_user** - pytanie o typ gdy confidence <0.7
- [x] Przejścia między stanami (animacje, timing)
- [x] Mobile-first: wszystko musi działać jednym kciukiem

**Kryteria akceptacji:**
- ✅ Mogę pokazać mockup komuś i wyjaśnić flow w 30 sekund
- ✅ Każdy stan jest jasny wizualnie
- ✅ 3 typy contentu uwzględnione
- ✅ Export flow zaprojektowany

---

## 2. PWA – iOS READY (NAJPIERW - BO CHCESZ TESTOWAĆ NA SPACERACH!)
**Cel:** Aplikacja działa jak natywna na iPhone, możesz testować tekstowo

- [ ] Stwórz `manifest.json` (nazwa, ikona, kolor, display: "standalone")
- [ ] Dodaj Service Worker (cache static assets)
- [ ] Ikona 512x512 + 192x192 (wygeneruj lub użyj placeholdera)
- [ ] Splash screen (opcjonalnie)
- [ ] Deploy na Vercel/Netlify z HTTPS (wymagane dla PWA!)
- [ ] Testuj "Add to Home Screen" na iOS
- [ ] Sprawdź czy chat działa offline (cached)

**manifest.json:**
```json
{
  "name": "VoiceThoughts",
  "short_name": "VoiceThoughts",
  "display": "standalone",
  "background_color": "#0f0c29",
  "theme_color": "#667eea",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Kryteria akceptacji:**
- Mogę dodać do ekranu głównego iPhone'a
- Otwiera się fullscreen bez paska Safari
- Offline: pokazuje cached stronę
- **Mogę używać na spacerze (tekstowo przez chat)** ✨

---

## 3. TESTOWANIE NA SPACERACH (TEKSTOWA WERSJA)
**Cel:** Walidacja use case przed dodaniem audio

- [ ] Używaj aplikacji na spacerze przez tydzień (tekstowo)
- [ ] Wpisuj pomysły przez chat podczas spaceru
- [ ] Sprawdź czy chat → AI → structured output działa
- [ ] Oceń: czy brakuje Ci mikrofonu czy tekst wystarczy?
- [ ] Zbierz feedback: co działa, co nie

**Kryteria akceptacji:**
- Używałeś aplikacji na spacerze minimum 5 razy
- Wiesz czy tekstowy input jest wystarczający czy NAPRAWDĘ potrzebujesz audio
- Masz listę problemów do naprawy przed dodaniem audio

⚠️ **WAŻNE:** Jeśli tekstowy input wystarczy, audio może nie być konieczne w MVP!

---

## 4. WEB MVP – AUDIO INPUT (JEŚLI POTRZEBNE PO TESTACH)
**Cel:** Nagrywanie głosu w przeglądarce

- [ ] Dodać przycisk nagrywania (MediaRecorder API)
- [ ] Obsłużyć start nagrywania (zmiana stanu UI)
- [ ] Obsłużyć stop nagrywania (automatyczny po 60s lub manualny)
- [ ] Zapisać audio jako blob (webm/opus lub wav)
- [ ] Wizualny feedback: pulsujący przycisk + timer
- [ ] Obsłużyć brak zgody na mikrofon (modal z instrukcją)
- [ ] Obsłużyć brak urządzenia audio (error message)
- [ ] Limit długości nagrania: max 60 sekund

**Kryteria akceptacji:**
- Mogę nagrać 10 sekund audio i zobaczyć blob w console.log
- Działa w Chrome Desktop i Safari iOS

---

## 5. TRANSKRYPCJA (WHISPER API) - po implementacji audio
**Cel:** Zamiana audio → tekst

- [ ] Wysyłać blob do OpenAI Whisper API
- [ ] Ustawić język: polski (`language: "pl"`)
- [ ] Odebrać tekst transkrypcji
- [ ] Logować surową transkrypcję (dev console + UI)
- [ ] Pokazać użytkownikowi tekst transkrypcji przed przetworzeniem
- [ ] Obsłużyć błędy API (timeout, 429, 500)
- [ ] Loading state podczas transkrypcji (spinner)

**Kryteria akceptacji:**
- Nagranie "Kup mleko i chleb" → tekst "Kup mleko i chleb"
- Błąd API wyświetla się jako toast/alert

---

## 6. WERYFIKACJA END-TO-END (AUDIO)
**Cel:** Sprawdzić czy audio flow działa

- [ ] Nagraj → Transkrybuj → Wyświetl tekst (jedna pełna ścieżka)
- [ ] Testuj na telefonie (Safari iOS)
- [ ] Sprawdź w różnych warunkach: cicho, hałas, długie zdanie
- [ ] Zapisz przykładowe nagrania i transkrypcje do testów

**Kryteria akceptacji:**
- Mogę użyć aplikacji na telefonie podczas spaceru z audio
- 8/10 nagrań transkrybuje się poprawnie

---

## 7. ROZPOZNANIE INTENCJI (LLM) - CHAOS → STRUKTURA
**Cel:** Zamienić chaotyczną wypowiedź w uporządkowaną strukturę

- [ ] Wysłać transkrypcję do GPT-4o lub GPT-4o-mini
- [ ] **Prompt: "Chaos to Structure"** - model porządkuje chaotyczną wypowiedź
- [ ] Model zwraca **WYŁĄCZNIE** JSON (bez markdown, bez wyjaśnień)
- [ ] Typy: `checklist`, `note`, `calendar_event`, `ask_user` (gdy nie wie)
- [ ] Model SAM decyduje o typie na podstawie kontekstu
- [ ] Jeśli model nie wie → `type: "ask_user"` + opcje do wyboru
- [ ] Walidować JSON po stronie aplikacji (try/catch + JSON.parse)
- [ ] Fallback: jeśli JSON invalid → zawsze zwróć `{type: "note", content: text}`

**Przykładowy prompt:**
```
Użytkownik nagrał chaotyczną myśl: "{transcription}"

Twoim zadaniem jest:
1. Zrozumieć intencję użytkownika
2. Uporządkować chaotyczną wypowiedź w czytelną strukturę
3. Określić TYP: checklist (zadania), note (notatka), calendar_event (wydarzenie), ask_user (pytanie)

Zwróć TYLKO JSON (bez markdown):
{
  "type": "checklist" | "note" | "calendar_event" | "ask_user",
  "confidence": 0.0-1.0,
  "title": "Wygenerowany tytuł",
  "content": string[] | string | object,
  "metadata": {
    "date": "YYYY-MM-DD" (tylko dla calendar_event),
    "time": "HH:MM" (opcjonalnie),
    "priority": "low" | "medium" | "high" (opcjonalnie)
  },
  "ask_options": ["checklist", "note", "calendar_event"] (tylko gdy type="ask_user")
}

Przykłady:
- "Jutro spotkanie 10, lunch 13, siłownia 18" → checklist z 3 punktami + metadata.date
- "Pomysł na startup: app do nagrywania myśli, chaos to struktura, AI porządkuje" → note (uporządkowana)
- "Przypomnij mi jutro o 15 że muszę zadzwonić do lekarza" → calendar_event z date + time
- "Kupić mleko i chleb" → checklist z 2 punktami
- Niejasna wypowiedź → type="ask_user" + ask_options
```

**Kluczowe:**
- Model PORZĄDKUJE chaos w czytelną strukturę (nie copy-paste!)
- Auto-generuje tytuł na podstawie treści
- Confidence score (0.0-1.0) - jeśli <0.7 → pytaj użytkownika
- Fallback: zawsze można zapisać jako note

**Kryteria akceptacji:**
- "Jutro: spotkanie 10, lunch 13, siłownia 18" → checklist z 3 punktami + tytuł "Jutro"
- Chaotyczna wypowiedź → uporządkowana notatka z akapitami
- "Przypomnij mi..." → calendar_event z datą i czasem
- Niejasna intencja → pytanie użytkownika z opcjami

---

## 8. STORAGE – PODSTAWOWY (UNIWERSALNY)
**Cel:** Zapisywać dane lokalnie (checklisty, notatki, eventy)

- [ ] localStorage dla wszystkich typów (klucz: `items`)
- [ ] Każdy item ma: `id`, `title`, `type`, `content`, `createdAt`, `metadata`, `exported`
- [ ] Typy: `checklist`, `note`, `calendar_event`
- [ ] Zapisz datę/czas utworzenia (ISO string)
- [ ] Flagę `exported: true/false` (czy wyeksportowano do natywnej aplikacji)
- [ ] Dane przetrwają reload strony
- [ ] Lista wszystkich itemów z filtrowaniem po typie

**Struktura danych:**
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "checklist",
      "title": "Zakupy",
      "content": [
        { "id": "uuid", "text": "Mleko", "done": false },
        { "id": "uuid", "text": "Chleb", "done": true }
      ],
      "metadata": {
        "date": "2025-01-08",
        "priority": "medium"
      },
      "createdAt": "2025-01-07T10:30:00Z",
      "exported": false
    },
    {
      "id": "uuid",
      "type": "note",
      "title": "Pomysł na startup",
      "content": "Aplikacja do nagrywania myśli...\n\nKluczowe cechy:\n- Widget\n- AI porządkuje chaos",
      "metadata": {},
      "createdAt": "2025-01-07T11:15:00Z",
      "exported": true
    },
    {
      "id": "uuid",
      "type": "calendar_event",
      "title": "Spotkanie z lekarzem",
      "content": "Zadzwonić w sprawie wyników",
      "metadata": {
        "date": "2025-01-09",
        "time": "15:00"
      },
      "createdAt": "2025-01-07T12:00:00Z",
      "exported": false
    }
  ]
}
```

**Kryteria akceptacji:**
- Refresh strony → dane wciąż są
- Mogę zobaczyć listę wszystkich itemów (checklisty, notatki, eventy)
- Filtrowanie po typie działa
- Flaga `exported` pokazuje czy item został wyeksportowany

---

## 9. CHECKLISTY – GENEROWANIE (READ ONLY)
**Cel:** Pokazać wygenerowaną listę zadań

- [ ] Parsuj JSON z LLM → UI elements
- [ ] Wyświetl listę zadań (bez edycji!)
- [ ] Checkbox do oznaczania jako done
- [ ] Wizualne przekreślenie wykonanych zadań
- [ ] Przycisk "Nagraj kolejną"

**Kryteria akceptacji:**
- Nagranie generuje listę zadań
- Mogę zaznaczyć zadania jako wykonane
- Nie mogę jeszcze edytować tekstu

---

## 10. CHECKLISTY – CRUD
**Cel:** Pełna edycja checklisty

- [ ] Toggle done (już jest z punktu 7)
- [ ] Usuń zadanie (swipe? przycisk X?)
- [ ] Edytuj zadanie (tap na tekst → input)
- [ ] Dodaj zadanie ręcznie (+ przycisk)
- [ ] Usuń całą checklistę
- [ ] Zmień tytuł checklisty

**Kryteria akceptacji:**
- Mogę w pełni zarządzać checklistą bez nagrywania
- Zmiany zapisują się do localStorage

---

## 11. ERROR HANDLING
**Cel:** Obsłużyć wszystkie błędy gracefully

- [ ] Brak internetu → "Brak połączenia. Spróbuj ponownie" + przycisk retry
- [ ] Whisper timeout → "Transkrypcja nie powiodła się" + retry
- [ ] LLM błąd → Pokaż raw transkrypcję jako fallback
- [ ] Audio permission denied → Modal z instrukcją (iOS: Settings → Safari → Microphone)
- [ ] Puste nagranie → "Nie wykryto mowy. Spróbuj ponownie"
- [ ] Quota exceeded (API) → "Limit przekroczony. Spróbuj za godzinę"

**Kryteria akceptacji:**
- Żaden error nie blokuje aplikacji na stałe
- Każdy error ma akcję (retry, close, instrukcja)

---

## 12. NOTATKI (OPCJONALNE NA MVP)
**Cel:** Zapisywanie notatek i podsumowań

- [ ] Zapisz pełną transkrypcję jako notatkę
- [ ] Wygeneruj krótkie podsumowanie (max 5 punktów) - LLM
- [ ] Automatycznie generuj tytuł notatki - LLM
- [ ] Wyświetl notatki w osobnej sekcji

**Kryteria akceptacji:**
- Mogę nagrać luźne myśli i zapisać jako notatkę
- ⚠️ To można pominąć w MVP jeśli checklisty wystarczą

---

## 13. DODATKOWE OPTYMALIZACJE PWA (opcjonalne)
**Cel:** Aplikacja działa jak natywna

- [ ] Stwórz `manifest.json` (nazwa, ikona, kolor, display: "standalone")
- [ ] Dodaj Service Worker (cache static assets)
- [ ] Ikona 512x512 + 192x192
- [ ] Splash screen (opcjonalnie)
- [ ] Testuj "Add to Home Screen" na iOS
- [ ] Mikrofon działa w Safari (wymaga HTTPS!)

**manifest.json:**
```json
{
  "name": "VoiceTasks",
  "short_name": "VoiceTasks",
  "display": "standalone",
  "background_color": "#0f0c29",
  "theme_color": "#667eea",
  "icons": [...]
}
```

**Kryteria akceptacji:**
- Mogę dodać do ekranu głównego
- Otwiera się fullscreen bez paska Safari
- Offline: pokazuje cached stronę (nawet jeśli funkcje nie działają)

---

## 14. EKSPORT – iOS & ANDROID (KLUCZOWE!)
**Cel:** Jeden klick → dane w natywnej aplikacji

### iOS Export
- [ ] **Apple Reminders**: URL scheme `x-apple-reminderkit://` lub Web Share API
- [ ] **Apple Notes**: Share sheet z markdown
- [ ] **Apple Calendar**: URL scheme `calshow:` z parametrami
- [ ] Fallback: Copy to clipboard jako markdown + instrukcja
- [ ] Oznacz item jako `exported: true` po eksporcie
- [ ] Przycisk "Eksportuj" widoczny przy każdym itemie

### Android Export
- [ ] **Google Tasks**: Web Intents lub Share API
- [ ] **Google Keep**: Share intent z tekstem
- [ ] **Google Calendar**: Intent z event data
- [ ] Fallback: Copy to clipboard jako tekst + instrukcja

### Format eksportu
**Checklist → Reminders/Tasks:**
```
- [ ] Mleko
- [ ] Chleb
- [ ] Masło
```

**Note → Notes/Keep:**
```markdown
# Pomysł na startup

Aplikacja do nagrywania myśli...

Kluczowe cechy:
- Widget
- AI porządkuje chaos
```

**Calendar Event → Calendar:**
```
Tytuł: Spotkanie z lekarzem
Data: 2025-01-09
Czas: 15:00
Notatki: Zadzwonić w sprawie wyników
```

**Research:**
- iOS URL schemes: https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app
- Web Share API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
- Android Intents: https://developer.android.com/training/sharing/send

**Kryteria akceptacji:**
- Mogę wyeksportować checklistę do Reminders w <5 sekund (1 klick!)
- Mogę wyeksportować notatkę do Notes/Keep w <5 sekund
- Mogę wyeksportować event do Calendar w <5 sekund
- Po eksporcie item oznaczony jako `exported: true`
- Działa na iOS Safari i Android Chrome

---

## 15. WALIDACJA (FINALNA)
**Cel:** Sprawdzić czy appka rozwiązuje problem

- [ ] Używam aplikacji codziennie przez tydzień
- [ ] Nagrywam podczas spaceru (test hands-free)
- [ ] Wracam po 3 dniach i sprawdzam checklisty
- [ ] Pokazuję 3 osobom i pytam o feedback
- [ ] Sprawdzam: czy brakuje mi jej gdy jej nie mam?

**Kryteria akceptacji:**
- Używam jej częściej niż Notes/Reminders
- Polecam ją znajomemu

---

## 16. MONETYZACJA (PO WALIDACJI)
**Cel:** Zarabiać na aplikacji

- [ ] **FREE tier:**
  - Max 10 nagrań/miesiąc
  - Brak eksportu
  - Brak historii (tylko ostatnie 5 checklistów)

- [ ] **PRO tier ($2.99/msc):**
  - Nielimitowane nagrania
  - Eksport do Reminders/Notes
  - Pełna historia
  - Backup do chmury (opcjonalnie)

**Implementacja:**
- Stripe Checkout (web)
- RevenueCat (iOS w przyszłości)

---

## 17. WIDGET – iOS & ANDROID (PO MVP)
**Cel:** Jedno kliknięcie z ekranu głównego → nagrywanie

### iOS Widget (React Native / Swift)
- [ ] Home Screen Widget (iOS 14+)
- [ ] Single button: "Nagraj myśl"
- [ ] Tap → otwiera aplikację w stanie RECORDING
- [ ] Widget pokazuje liczbę nie-wyeksportowanych itemów

### Android Widget (React Native / Kotlin)
- [ ] Home Screen Widget
- [ ] Single button: "Nagraj myśl"
- [ ] Tap → otwiera aplikację w stanie RECORDING
- [ ] Widget pokazuje liczbę nie-wyeksportowanych itemów

**Research:**
- React Native Widgets: https://github.com/salihgueler/react-native-widgets
- iOS Widgets (SwiftUI): https://developer.apple.com/documentation/widgetkit
- Android Widgets: https://developer.android.com/guide/topics/appwidgets

**Kryteria akceptacji:**
- Mogę nagrać myśl z ekranu głównego w <3 sekundy (unlock → tap widget → nagrywanie)
- Widget działa na iOS i Android

---

## 18. KOLEJNE KROKI (PO WIDGETACH)
**Cel:** Skalowanie

- [ ] React Native / Expo (natywne aplikacje iOS/Android)
- [ ] TestFlight beta (iOS)
- [ ] App Store release
- [ ] Google Play release
- [ ] Integracje: Notion, Obsidian, Evernote
- [ ] Udostępnianie itemów (share link)
- [ ] Współpraca (shared lists/notes)
- [ ] Voice commands: "Siri, nagraj myśl" / "OK Google, nagraj myśl"

---

## AKTUALNY STATUS

### ✅ Zakończone:
- Podstawowa aplikacja TODO z dark theme
- System czatu z AI (text-based)
- LocalStorage dla zadań i historii czatu
- Responsive design (mobile-first)
- Gradientowy UI z animacjami
- **UX Design document** (UX-DESIGN.md) - 5 stanów, przejścia, animacje, error handling

### 🎯 Następne kroki (ZMIENIONA KOLEJNOŚĆ!):
1. ✅ **UX Design** - zakończone (UX-DESIGN.md)
2. **#2: PWA – iOS READY** ← ZACZYNAMY TUTAJ!
   - Manifest + Service Worker + deploy HTTPS
   - Żebyś mógł testować na spacerach (tekstowo)
3. **#3: TESTOWANIE NA SPACERACH** (tekstowa wersja)
   - Walidacja czy tekst wystarczy czy NAPRAWDĘ potrzebujesz audio
4. **#4-6: AUDIO** (jeśli potrzebne po testach)

**Dlaczego ta kolejność?**
- ✅ Możesz używać aplikacji JUŻ TERAZ na spacerach (tekstowo)
- ✅ Walidacja use case przed inwestowaniem czasu w audio
- ✅ Może się okazać, że tekst wystarczy (mniej kosztów API Whisper)

---

## KLUCZOWE RÓŻNICE OD TYPOWEJ TODO APP

**Standardowa TODO app:**
- Ręczne wpisywanie zadań
- Jedna kategoria (tasks)
- Brak eksportu

**Nasza aplikacja (Chaos-to-Structure):**
- ✅ **Nagrywanie głosowe** zamiast pisania
- ✅ **AI porządkuje chaos** w strukturę
- ✅ **3 typy**: checklist, note, calendar_event
- ✅ **Auto-rozpoznanie** typu na podstawie kontekstu
- ✅ **Confidence score** - jeśli model nie wie, pyta
- ✅ **Eksport 1-click** do natywnych aplikacji (Reminders/Notes/Calendar)
- ✅ **Widget** na ekranie głównym (przyszłość)
- ✅ **Use case**: Spacer → pomysł → nagranie → uporządkowane → w domu gotowe

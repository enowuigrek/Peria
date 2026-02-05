# VOICE-FIRST TODO / NOTES APP
# MVP → iOS → ANDROID → PAID

## ZASADY PROJEKTU
- Robię to najpierw dla siebie
- Każdy punkt musi dać się przetestować
- Nie dodaję funkcji spoza checklisty
- Najpierw działa, potem wygląda

---

## 1. UX – MINIMALNY DESIGN (NAJPIERW!)
**Cel:** Zaprojektować przepływ przed kodowaniem

- [ ] Mockup głównego ekranu (Figma/papier/Excalidraw)
- [ ] Stan: **idle** - główny przycisk "Nagraj" (duży, centralny)
- [ ] Stan: **recording** - pulsujący przycisk, timer nagrywania
- [ ] Stan: **processing** - spinner + "Przetwarzam..." + możliwość anulowania
- [ ] Stan: **result** - lista zadań z checkboxami
- [ ] Przejścia między stanami (animacje, timing)
- [ ] Mobile-first: wszystko musi działać jednym kciukiem

**Kryteria akceptacji:**
- Mogę pokazać mockup komuś i wyjaśnić flow w 30 sekund
- Każdy stan jest jasny wizualnie

---

## 2. WEB MVP – AUDIO INPUT
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

## 3. TRANSKRYPCJA (WHISPER API)
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

## 4. WERYFIKACJA END-TO-END
**Cel:** Sprawdzić czy podstawowy flow działa

- [ ] Nagraj → Transkrybuj → Wyświetl tekst (jedna pełna ścieżka)
- [ ] Testuj na telefonie (Chrome Android / Safari iOS)
- [ ] Sprawdź w różnych warunkach: cicho, hałas, długie zdanie
- [ ] Zapisz przykładowe nagrania i transkrypcje do testów

**Kryteria akceptacji:**
- Mogę użyć aplikacji na telefonie podczas spaceru
- 8/10 nagrań transkrybuje się poprawnie

---

## 5. ROZPOZNANIE INTENCJI (LLM)
**Cel:** Określić co użytkownik chce zrobić

- [ ] Wysłać transkrypcję do GPT-4o-mini lub GPT-3.5-turbo
- [ ] Prompt: "Użytkownik powiedział: {text}. Zwróć JSON: {type: 'checklist'|'note'|'summary', content: string|array}"
- [ ] Model zwraca **WYŁĄCZNIE** JSON (bez markdown, bez wyjaśnień)
- [ ] Walidować JSON po stronie aplikacji (try/catch + JSON.parse)
- [ ] Fallback: jeśli JSON invalid → zawsze zwróć `{type: "checklist", content: [text]}`
- [ ] Typy: `checklist` (lista zadań), `note` (notatka), `summary` (podsumowanie)

**Przykładowy prompt:**
```
Użytkownik nagrał: "{transcription}"

Zwróć TYLKO JSON (bez markdown):
{
  "type": "checklist" | "note" | "summary",
  "content": string[] | string,
  "title": string (opcjonalnie)
}

Jeśli to lista zadań → checklist + array
Jeśli to luźne myśli → note + string
Jeśli to podsumowanie → summary + string
```

**Kryteria akceptacji:**
- "Jutro: spotkanie 10, lunch 13, siłownia 18" → checklist z 3 punktami
- "Pomysł na startup: app do..." → note

---

## 6. STORAGE – PODSTAWOWY
**Cel:** Zapisywać dane lokalnie

- [ ] localStorage dla checklistów (klucz: `checklists`)
- [ ] Każdy checklist ma: `id`, `title`, `items[]`, `createdAt`, `type`
- [ ] Zapisz datę/czas utworzenia (ISO string)
- [ ] Dane przetrwają reload strony
- [ ] Lista wszystkich checklistów (sidebar? drawer? druga strona?)

**Struktura danych:**
```json
{
  "checklists": [
    {
      "id": "uuid",
      "title": "Zakupy",
      "type": "checklist",
      "items": [
        { "id": "uuid", "text": "Mleko", "done": false },
        { "id": "uuid", "text": "Chleb", "done": true }
      ],
      "createdAt": "2025-01-07T10:30:00Z"
    }
  ]
}
```

**Kryteria akceptacji:**
- Refresh strony → dane wciąż są
- Mogę zobaczyć listę wszystkich checklistów

---

## 7. CHECKLISTY – GENEROWANIE (READ ONLY)
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

## 8. CHECKLISTY – CRUD
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

## 9. ERROR HANDLING
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

## 10. NOTATKI (OPCJONALNE NA MVP)
**Cel:** Zapisywanie notatek i podsumowań

- [ ] Zapisz pełną transkrypcję jako notatkę
- [ ] Wygeneruj krótkie podsumowanie (max 5 punktów) - LLM
- [ ] Automatycznie generuj tytuł notatki - LLM
- [ ] Wyświetl notatki w osobnej sekcji

**Kryteria akceptacji:**
- Mogę nagrać luźne myśli i zapisać jako notatkę
- ⚠️ To można pominąć w MVP jeśli checklisty wystarczą

---

## 11. PWA – iOS READY
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

## 12. EKSPORT – iOS
**Cel:** Export do Apple Reminders / Notes

- [ ] Przycisk "Eksportuj do Reminders"
- [ ] Generuj URL scheme: `x-apple-reminderkit://` (research needed)
- [ ] Alternatywa: Copy to clipboard + instrukcja dla użytkownika
- [ ] Eksport do Notes: share sheet / copy markdown
- [ ] Eksport jednym kliknięciem

**Research:**
- iOS URL schemes mogą nie działać z PWA
- Fallback: skopiuj listę jako markdown → użytkownik paste do Reminders/Notes

**Kryteria akceptacji:**
- Mogę wyeksportować checklistę w <10 sekund
- Działa na iOS Safari

---

## 13. WALIDACJA
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

## 14. MONETYZACJA (PO WALIDACJI)
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

## 15. KOLEJNE KROKI (PO MVP)
**Cel:** Skalowanie

- [ ] React Native / Expo (iOS natywnie)
- [ ] TestFlight beta
- [ ] App Store release
- [ ] Android (Google Play)
- [ ] Integracje: Google Tasks, Google Keep, Notion
- [ ] Udostępnianie checklistów (share link)
- [ ] Współpraca (shared checklists)

---

## AKTUALNY STATUS

### ✅ Zakończone (przed voice-first pivot):
- Podstawowa aplikacja TODO z dark theme
- System czatu z AI (text-based)
- LocalStorage dla zadań i historii czatu
- Responsive design (mobile-first)
- Gradientowy UI z animacjami

### 🎯 Następne kroki:
Rozpoczynamy implementację punktu **#1: WEB MVP – AUDIO INPUT**

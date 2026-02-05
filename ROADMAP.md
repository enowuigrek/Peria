# PERIA — GDZIE MYŚL SIĘ RODZI

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
**Cel:** Nagrywanie przy wygaszonym ekranie

⚠️ **KLUCZOWA DECYZJA:** PWA NIE OBSŁUGUJE background audio. Natywna aplikacja iOS jest WARUNKIEM sensu projektu.

### 1.1 Setup React Native / Swift
- [ ] Wybór tech stack: React Native + Expo vs. Swift native
- [ ] Podstawowy projekt + build na iPhone
- [ ] Testy nagrywania audio w tle (background mode)
- [ ] Nagrywanie przez słuchawki

### 1.2 Core Voice Flow
- [ ] Przycisk nagrywania (działa przy wygaszonym ekranie)
- [ ] Zapis audio → wysłanie do Whisper API
- [ ] Transkrypcja → zapisanie jako notatka

### 1.3 "Jedna notatka" w native
- [ ] Port modelu danych z PWA
- [ ] LocalStorage → Core Data / SQLite
- [ ] AI auto-detekcja zadań/dat

**Kryteria akceptacji:**
- Mogę nagrywać przy wygaszonym ekranie
- Nagranie przez słuchawki działa
- Audio → transkrypcja → notatka (full flow)

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
- ✅ Category color coding: każda sekcja ma swój kolor z palety
- ✅ Navigation buttons light up with category colors when active
- ✅ Splash screen: "Peria - Gdzie myśl się rodzi" (2s animated intro)
- ✅ Smooth animations: expand/collapse cards, rotating chevrons (0.3s ease)
- ✅ SVG icons zamiast emoji w nawigacji (consistent, scalable)
- ✅ Colored section headers z left border + subtle background
- ✅ Status indicators: new/read/categorized (3-state system)
- ✅ Empty states z hints

**Edycja i Zarządzanie** ✅
- ✅ Inline title editing (click → edit → Enter/Escape)
- ✅ Checklist items: toggle complete, edit text, delete
- ✅ Event items: delete individual events
- ✅ Note content: full edit mode
- ✅ Smart export buttons: show/hide based on export status
- ✅ "Show original" toggle z animated chevron
- ✅ Mobile-friendly: całe item clickable (nie tylko checkbox)
- ✅ Always-visible action buttons (no hover-dependent interactions)

### 🎯 CO TERAZ?

**FAZA 0 COMPLETED!** 🎉
Prototyp PWA jest funkcjonalny i zawiera wszystkie kluczowe feature'y:
- Jedna notatka = źródło prawdy ✅
- AI auto-detekcja struktury ✅
- Export do Apple apps ✅
- Mobile-first UX ✅

**NASTĘPNY KROK: FAZA 1 - Natywne iOS**
⚠️ **KLUCZOWA DECYZJA:** PWA nie obsługuje background audio
- React Native / Swift native app
- Background audio recording (warunek sensu!)
- Nagrywanie przy wygaszonym ekranie
- Port wszystkich feature'ów z PWA

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

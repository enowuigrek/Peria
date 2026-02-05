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

## FAZA 0: PROTOTYP LOGIKI (PWA) ← AKTUALNIE TUTAJ
**Cel:** Przetestować "jedna notatka = źródło prawdy" + AI auto-detekcja

### 0.1 Architektura "Jedna Notatka"
- [ ] Zmienić model danych z `tasks[]` na `notes[]`
- [ ] Struktura: `{ id, sourceText, detectedTasks[], detectedEvents[], createdAt }`
- [ ] Notatka może zawierać: tekst + zadania + daty
- [ ] Wszystko w localStorage

### 0.2 AI: Chaos → Struktura (Auto-detekcja)
- [ ] Zmienić prompt: z "wypisz zadania" → "wykryj strukturę w chaosie"
- [ ] JSON response: `{ sourceText, tasks[], events[], note }`
- [ ] System SAM proponuje checklisty/eventy
- [ ] Użytkownik może zaakceptować/odrzucić

### 0.3 UI Flow
- [ ] Chat → jedna długa notatka (multi-line input)
- [ ] Po wysłaniu: AI pokazuje wykryte elementy
- [ ] Przyciski: "Zaakceptuj zadania" / "Zaakceptuj eventy" / "Zostaw jako notatka"
- [ ] Wszystko wraca do jednej notatki

**Kryteria akceptacji:**
- Mogę napisać chaotyczny tekst → system wykryje zadania/daty
- Wszystko zapisane w jednej notatce
- Widzę źródłowy tekst + wykryte elementy

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
- Podstawowa aplikacja TODO z dark theme
- System czatu z AI (text-based)
- LocalStorage dla zadań
- PWA ready (manifest + service worker)
- Export do Apple Reminders/Notes

### 🎯 CO TERAZ? (FAZA 0)

**NAJPIERW:** Refactor modelu danych
- Zmiana z `tasks[]` → `notes[]`
- Jedna notatka = źródło prawdy
- AI wykrywa strukturę PO zapisaniu

**POTEM:** Natywne iOS (Faza 1)
- React Native / Swift
- Background audio (warunek sensu!)
- Whisper API transkrypcja

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

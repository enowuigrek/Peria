# ZMIANY: VOICE-FIRST + MOBILE LAYOUT FIX

## Data: 2026-01-07

## Co zostało zmienione:

### 1. ✅ Nowy komponent `ChatVoiceFirst.jsx`
**Główne zmiany:**
- **VOICE-FIRST** - nagrywanie jest główną akcją, nie pisanie
- Duży przycisk "🎤 Nagraj myśl" zajmuje całą szerokość paska
- Małe "✏️" do przełączenia na text input (opcjonalne)
- Używa **nowej funkcji `detectStructure()`** z `agent.js`

**Flow:**
```
Domyślnie: [🎤 Nagraj myśl] [✏️]
Po kliknięciu ✏️: [🎤] [Input tekstowy] [➤] [✕]
```

### 2. ✅ Integracja z nowym AI (detectStructure)
**Zamiast starego promptu "wypisz zadania":**
- Używa `detectStructure()` z `agent.js`
- Wykrywa: **tasks**, **events**, **creative**
- Zwraca JSON: `{ tasks: [], events: [], creative: null }`

**Wyświetlanie rezultatu:**
```
📋 Wykryto strukturę

✅ Zadania (2):
1. Kupić mleko
2. Kupić chleb

📅 Wydarzenia (1):
1. Spotkanie - 2025-01-08 15:00

💡 Pomysł kreatywny:
Tekst rapowy o bezsenności
```

### 3. ✅ Export do Apple Apps
**Przyciski eksportu:**
- 📤 Do Reminders (jeśli są tasks)
- 📤 Do Notes (zawsze)
- 📤 Do Kalendarza (jeśli są events)

**Mechanizm:**
- Web Share API (działa na iOS)
- Fallback: Copy to clipboard

### 4. ✅ Mobile Layout Fix
**Poprawki CSS:**
- Zmniejszone paddingi (`0.75rem` zamiast `1rem`)
- Zmniejszone fonty (`0.85rem - 0.9rem`)
- Przyciski z `flex-shrink: 0` (nie gnieją się)
- Export bar z `flex-wrap: wrap` (2 linie jeśli trzeba)
- Przyciski elastyczne (`flex: 1 1 auto`, `min-width: 110px`)

**Wynik:**
- Wszystkie przyciski widoczne na ekranie
- Nie wypadają za krawędź
- Touch targets ≥44px (dobry dla kciuka)

### 5. ✅ Lepsze error handling
**Transkrypcja (Whisper API):**
- Sprawdzanie czy jest API key
- Lepsze komunikaty błędów
- Obsługa HTTP errors z API

**AI detection:**
- Try/catch z fallback
- Jeśli błąd → wszystko jako `creative`

---

## Pliki zmienione:

### Nowe pliki:
- `src/components/Chat/ChatVoiceFirst.jsx` - nowy komponent voice-first
- `CHANGES_VOICE_FIRST.md` - ten dokument

### Zmodyfikowane pliki:
- `src/App.jsx` - zamiana `Chat` → `ChatVoiceFirst`
- `src/components/Chat/Chat.module.scss` - poprawki mobile layout
- `src/agent.js` - dodana funkcja `detectStructure()` (już było)

### Niezmienione (stare):
- `src/components/Chat/Chat.jsx` - stary komponent (deprecated, ale zostawiony)

---

## Jak testować:

### Test 1: Voice recording (podstawowy)
1. Otwórz aplikację na telefonie
2. Przejdź do zakładki "Chat"
3. Kliknij "🎤 Nagraj myśl"
4. Powiedz: "Kupić mleko i chleb, jutro spotkanie o 15"
5. Kliknij STOP
6. Sprawdź:
   - ✅ Transkrypcja się pojawia
   - ✅ AI wykrywa 2 zadania + 1 event
   - ✅ Przyciski eksportu widoczne

### Test 2: Text input (alternatywa)
1. Kliknij "✏️" (mała ikona)
2. Wpisz tekst: "Pomysł na startup - AI porządkuje myśli"
3. Wyślij (Enter lub ➤)
4. Sprawdź:
   - ✅ AI wykrywa jako "creative"
   - ✅ Przycisk "Do Notes" widoczny

### Test 3: Export do Reminders
1. Nagraj/wpisz zadania: "Kup mleko, kup chleb"
2. Kliknij "📤 Do Reminders"
3. Wybierz Reminders w Share sheet
4. Sprawdź:
   - ✅ Zadania dodane do Reminders

### Test 4: Mobile layout
1. Nagraj coś z zadaniami + eventami
2. Sprawdź:
   - ✅ Wszystkie przyciski widoczne (nie wypadają za ekran)
   - ✅ Export bar dopasowuje się (2 linie jeśli trzeba)
   - ✅ Input bar nie jest zgnieciony

---

## Co dalej (TODO):

### Priorytet 1 (FAZA 0 - Roadmap):
- [ ] Zmienić model danych: `tasks[]` → `notes[]`
- [ ] Notatka zawiera: `sourceText` + `detected { tasks, events, creative }`
- [ ] UI: widok pojedynczej notatki (zobacz `ARCHITECTURE.md`)

### Priorytet 2 (po testach):
- [ ] Natywne iOS (React Native + Expo)
- [ ] Background audio (WARUNEK sensu projektu!)
- [ ] Zobacz: `NATIVE_IOS_PLAN.md`

---

## Metryki sukcesu:

✅ **Voice-first działa** - główna akcja to nagrywanie, nie pisanie
✅ **Mobile layout OK** - wszystkie przyciski widoczne na ekranie
✅ **AI detection działa** - wykrywa tasks/events/creative
✅ **Export działa** - Web Share API + fallback

---

## Known Issues:

⚠️ **PWA nie obsługuje background audio**
- Nagrywanie przy wygaszonym ekranie NIE DZIAŁA w Safari
- To jest ograniczenie PWA, nie błąd
- **Rozwiązanie:** Natywna aplikacja iOS (Faza 1 - zobacz ROADMAP.md)

⚠️ **Whisper API wymaga klucza**
- Ustaw `VITE_OPENAI_API_KEY` w pliku `.env`
- Bez tego transkrypcja nie działa

⚠️ **detectStructure używa GPT-4o-mini**
- Koszt: ~$0.01 per request
- Jeśli chcesz taniej: zamień na `gpt-3.5-turbo` w `agent.js`

---

## Kontakt:
Jeśli coś nie działa, sprawdź:
1. `ROADMAP.md` - aktualny plan
2. `ARCHITECTURE.md` - model danych
3. `AI_PROMPTS.md` - jak działa AI
4. `EXPORT_FLOW.md` - eksport do Apple Apps
5. `NATIVE_IOS_PLAN.md` - plan native iOS

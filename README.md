# Peria - Gdy myśl pojawia się wtedy, gdy jej nie szukasz

> **Peria to pamięć dla myśli, które pojawiają się wtedy, gdy przestajesz ich szukać.**

---

## 🤖 Quick Reference dla AI

**Jesteś AI asystentem w nowym chacie?** Przeczytaj najpierw:
1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - jak działa aplikacja technicznie (data flow, komponenty, storage)
2. **[ROADMAP.md](./ROADMAP.md)** - aktualny status + fundamenty projektu
3. **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)** - kolory, typography, wzorce UI
4. **[AI_PROMPTS.md](./AI_PROMPTS.md)** - wszystkie AI prompty używane w projekcie

**Najważniejsze pliki kodu:**
- `src/agent.js` - OpenAI API (Whisper + GPT)
- `src/components/Chat/ChatVoiceFirst.jsx` - nagrywanie głosu
- `src/components/Inbox/Inbox.jsx` - widok notatek
- `src/App.jsx` - routing + layout

**Storage:** Wszystko w localStorage (`peria_inbox`, `peria_mynotes`, `peria_checklists`, `peria_events`)

---

## Czym jest Peria?

**Peria** to nie tylko nazwa narzędzia — to stan umysłu, który zachodzi między ruchem a refleksją, między ciszą a słowem, między krokiem a życiową ideą.

Peria jest tam, gdzie myśl zaczyna się już w trakcie spaceru, zanim jeszcze trafia na papier, zanim zostanie zatrzymana w notatniku, zanim znajdzie swoje miejsce na liście zadań.

**Peria nie narzuca kierunku. Nie każe myśleć. Nie ocenia.**
Po prostu przechwytuje to, co spontaniczne, zanim przeminie.

### Stan Perypatetyczny

Filozofowie ze szkoły Arystotelesa nauczali, chodząc. Ruch ciała uwalnia umysł.

Peria jest cyfrowym towarzyszem tego stanu — schwytuje iskrę pomysłu w czasie, gdy jesteś w ruchu, a myśl jest najbardziej żywa.

---

## Use Case

**Spacer → Pomysł → Nagranie → AI porządkuje → Po spacerze gotowa notatka/lista/event**

1. Wyciągasz telefon podczas spaceru
2. Jedno kliknięcie → mówisz chaotycznie
3. AI porządkuje chaos w strukturę
4. Po spacerze masz uporządkowane myśli w aplikacji
5. Jeden klick: eksport do Reminders/Notes/Calendar

---

## Unfair Advantages

**Dedykowany Tryb Spaceru (Walk Mode)**
- Interfejs obsługiwany kciukiem bez patrzenia
- Duże pole dotykowe, haptics
- Giganci (Apple/Google) projektują pod biurko, nie pod spacer

**Inteligentne Wyzwalacze (Action Triggers)**
- "Kup mleko" → automatycznie checklist
- "A co jeśli bohater umiera w rozdziale trzecim?" → notatka w folderze Inspiracje
- "Spotkajmy się we wtorek o 10" → propozycja wpisu do kalendarza

**Filozofia Peryferii**
- Agregacja myśli z tygodnia
- Mail: "Oto co krążyło wokół Twojej głowy w tym tygodniu"
- Budowanie relacji z użytkownikiem

**Chaos → Struktura**
- Nie surowa transkrypcja
- AI **porządkuje** chaotyczne myśli w czytelną strukturę
- Auto-generowane tytuły, akapity, formatowanie

---

## Tech Stack

- **Frontend**: React 19, Vite, SCSS
- **PWA**: Service Worker, manifest.json, offline support
- **AI**: OpenAI GPT-4o (chaos→structure), Whisper (transkrypcja)
- **Storage**: localStorage → cloud sync (przyszłość)
- **Deploy**: Vercel (HTTPS wymagane dla PWA)

---

## Development

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Status Projektu

**Wersja:** 0.4.0 (2026-01-11)
**Status:** ✅ PWA w pełni funkcjonalna, gotowa do użytku

**Ostatnie zmiany:**
- ✅ Kanciaste rogi i cienkie kolorowe bordery (mobile-first design)
- ✅ Edycja wydarzeń (tytuł, data, czas)
- ✅ Usunięcie wszystkich hover effects (optymalizacja mobilna)
- ✅ Refaktoring kolorów (70+ hardcoded → 4 kolory bazowe)
- ✅ Wspólna infrastruktura (hooks, ikony, komponenty)

Zobacz [CHANGELOG.md](./CHANGELOG.md) dla pełnej historii zmian.
Zobacz [ROADMAP.md](./ROADMAP.md) dla szczegółowego planu rozwoju.

---

## Filozofia

**Peria to:**
- miejsce, w którym pomysł nabiera formy, zanim zostanie wypowiedziany
- narzędzie, które pozwala zatrzymać ulotne idee bez przerywania stanu kreatywnego
- towarzysz spacerów, podróży i chwil, w których jesteśmy w ruchu — i w myśli

**Peria traktuje myśl jak światło:**
nie przywiązujesz jej do sztywnej struktury,
po prostu pozwalasz jej zaistnieć.

---

## Cytaty

_"Peria to pamięć dla myśli, które pojawiają się wtedy, gdy przestajesz ich szukać."_

_"Peria nie tworzy pomysłów. Peria je łapie."_

_"Peria to cisza między krokami — i treść, która z niej wypływa."_

---

## License

Private project - All rights reserved

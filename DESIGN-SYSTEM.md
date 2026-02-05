# PERIA DESIGN SYSTEM (PWA)

> Centralny dokument definiujący wszystkie kolory, typografię, spacing i komponenty używane w aplikacji PWA

**Ostatnia aktualizacja:** 2026-01-09

---

## 🎨 PALETA KOLORÓW

### Kolory Tła (Background)
```scss
$bg-gradient-start: #00202e;  // Ciemny granat (deep navy)
$bg-gradient-mid: #003545;     // Pośredni granatowy
$bg-gradient-end: #00202e;     // Powrót do ciemnego
```

### Kolory Kart (Cards)
```scss
$card-bg: rgba(0, 32, 46, 0.95);          // #00202e z alpha
$card-bg-lighter: rgba(74, 147, 150, 0.1); // Delikatny morski overlay
```

### Kolory Podstawowe (Primary/Accent)
```scss
$primary-gradient-start: #4a9396;  // Morski cyan (primary action)
$primary-gradient-end: #357073;    // Ciemniejszy cyan
$accent-gradient-start: #fdd03b;   // Żółty highlight
$accent-gradient-end: #cb7f07;     // Pomarańczowy
```

### Kolory Kategorii (Category Colors)
**NAJWAŻNIEJSZE - używane w całej aplikacji**

```scss
$category-mynotes: #fdd03b;      // Yellow/Żółty - Notatki (sticky notes)
$category-checklists: #5db85f;   // Green/Zielony - Checklisty
$category-events: #4a9396;       // Teal/Turkus - Wydarzenia
```

### Kolory Stanu (Status)
```scss
$success-color: #4a9396;   // Morski cyan
$danger-color: #cb7f07;    // Pomarańczowy (warning/delete)
$warning-color: #fdd03b;   // Żółty (attention)
```

### Kolory Tekstu (Text)
```scss
$text-primary: #e5e7eb;    // Jasny szary (główny tekst)
$text-secondary: #9ca3af;  // Średni szary
$text-muted: #6b7280;      // Przyciemniony szary
$text-dark: #291907;       // Bardzo ciemny brąz (dla jasnych tła)
```

### Kolory Nawigacji (Navigation)

```scss
// Active states (per category)
MyNotes active:    rgba(253, 208, 59, 0.1) bg + rgba(253, 208, 59, 0.5) border (yellow)
Checklists active: rgba(93, 184, 95, 0.15) bg + rgba(93, 184, 95, 0.5) border (green)
Events active:     rgba(74, 147, 150, 0.15) bg + rgba(74, 147, 150, 0.5) border (teal)
Inbox active:      rgba(100, 150, 170, 0.15) bg + rgba(100, 150, 170, 0.4) border
Record active:     rgba(150, 180, 150, 0.15) bg + rgba(150, 180, 150, 0.4) border

// Inactive state
color: $text-secondary (#9ca3af)
border: rgba(255, 255, 255, 0.15)
background: rgba(255, 255, 255, 0.03)
```

### Kolory Borderów i Overlayów
```scss
$border-color: rgba(255, 255, 255, 0.1);
$hover-bg: rgba(255, 255, 255, 0.05);
```

### Cienie (Shadows)
```scss
$box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
$box-shadow-hover: 0 15px 40px rgba(0, 0, 0, 0.4);
```

---

## 📝 TYPOGRAFIA

### Font Stack
```scss
$font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
             Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
```

### Rozmiary Czcionek (rem)

#### Tytuły Kart
```scss
.checklistTitle, .eventTitle, .noteTitle {
  font-size: 0.95rem;     // ~15.2px
  font-weight: 600;
  color: [category-color]; // zależne od kategorii
}
```

#### Daty i Meta Info
```scss
.checklistDate, .eventDate {
  font-size: 0.75rem;     // ~12px
  font-weight: 500;
  color: $text-muted;
}
```

#### Badge'y i Liczniki
```scss
.progressBadge, .countBadge {
  font-size: 0.7rem;      // ~11.2px
  font-weight: 600;
}
```

#### Tekst Itemów
```scss
.itemText {
  font-size: 0.9rem;      // ~14.4px
}
```

#### Przyciski
```scss
.editButton, .exportButton {
  font-size: 0.85rem;     // ~13.6px
  font-weight: 600;
}
```

#### Empty States
```scss
.emptyHint {
  font-size: 0.85rem;     // ~13.6px
}
```

### Line Heights
```scss
// Default
line-height: 1.5;

// Tytuły
line-height: 1.2;
```

---

## 📐 SPACING & LAYOUT

### Border Radius
```scss
// Aktualne (sharp corners)
border-radius: 4px;    // Wszystkie karty i przyciski

// Poprzednie (deprecated)
$radius: 16px;         // Główne zaokrąglenia (nie używać)
$radius-small: 12px;   // Małe elementy (nie używać)
$radius-large: 20px;   // Duże karty (nie używać)
```

### Padding & Margins

#### Card Padding
```scss
.checklistHeader, .eventHeader {
  padding: 0.875rem;    // ~14px
}

.checklistBody, .eventBody {
  padding: 0.875rem;
}

.checklistsList {
  padding: 1rem;        // ~16px
  gap: 0.75rem;         // ~12px między kartami
}
```

#### Internal Spacing
```scss
.titleRow {
  gap: 0.5rem;         // ~8px między title a edit icon
  margin-bottom: 0.25rem;  // ~4px
}

.checklistDate {
  gap: 0.5rem;         // ~8px między elementami
}
```

### Button Sizing
```scss
$button-height: 56px;
$button-radius: 4px;
```

### Left Borders (Category Indicators)
```scss
border-left: 4px solid $category-color;
```

---

## 🔲 KOMPONENTY

### Karty (Cards)

```scss
.checklistCard, .eventCard {
  background: $card-bg-lighter;
  border: 1px solid rgba([category-color], 0.3);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-left: 4px solid $category-color;
}
```

### Przyciski (Buttons)

#### Bordered Buttons
```scss
.editButton, .exportButton {
  padding: 0.5rem;  // ~8px
  border: 1px solid rgba($category-color, 0.4);
  background: transparent;  // BEZ wypełnienia
  color: $category-color;
  border-radius: 4px;

  &:hover {
    background: rgba($category-color, 0.1);
    border-color: rgba($category-color, 0.6);
  }
}
```

### Edit Title Icon (Mała ikonka ✎)
```scss
.editTitleIcon {
  background: transparent;
  border: none;
  color: rgba($category-color, 0.6);
  padding: 0.25rem;
  font-size: 0.85rem;

  &:hover {
    color: $category-color;
  }
}
```

### Progress Badge
```scss
.progressBadge {
  padding: 0.125rem 0.375rem;  // ~2px 6px
  background: rgba($category-color, 0.2);
  color: $category-color;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
}
```

### Section Headers (w Inbox)
```scss
.detectedSection {
  border-left: 3px solid $category-color;
  background: rgba($category-color, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
}
```

### Checklist Items
```scss
.checklistItem {
  padding: 0.625rem 0.75rem;  // ~10px 12px
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  border-left: 3px solid rgba($category-checklists, 0.5);

  &.completed {
    opacity: 0.6;
    border-left-color: rgba(100, 200, 100, 0.5);
  }
}
```

---

## 🎯 ANIMACJE I TRANSITIONS

### Transitions
```scss
$button-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// Expand icon rotation
.expandIcon {
  transition: transform 0.3s ease;
}

.checklistCard.expanded .expandIcon {
  transform: rotate(90deg);
}

// Slide down animation
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px;
  }
}
```

---

## 📋 WZORCE UŻYCIA

### Kiedy używać którego koloru?

**Yellow (#fdd03b):**
- MyNotes section (sticky notes style)
- Highlight important info
- Microphone button
- Warning/attention

**Green (#5db85f):**
- Checklists section
- Success states
- Completed items

**Teal (#4a9396):**
- Events section
- Primary actions (positive)
- User messages (chat)

### Border Styles

**4px left border:**
- Main cards (kategoria)
- Status indicator

**3px left border:**
- Internal sections (detected items)
- Checklist items

**1px border:**
- Wszystkie przyciski
- Card outlines

### Background Opacity Levels

```scss
rgba($category-color, 0.1)   // Card backgrounds
rgba($category-color, 0.15)  // Hover states
rgba($category-color, 0.2)   // Badges
rgba($category-color, 0.3)   // Borders (subtle)
rgba($category-color, 0.4)   // Borders (visible)
rgba($category-color, 0.5)   // Active borders
rgba($category-color, 0.6)   // Hover borders
```

---

## ✅ CHECKLIST - Przed wprowadzeniem zmian

Jeśli wprowadzasz zmiany wizualne, upewnij się że:

- [ ] Kolory pasują do palety (sprawdź w tym dokumencie)
- [ ] Spacing jest konsystentny (wielokrotności 4px: 4, 8, 12, 16...)
- [ ] Font size używa ustalonych wartości (nie wymyślaj nowych)
- [ ] Border radius = 4px (sharp corners)
- [ ] Przyciski mają border, NIE solid background
- [ ] Category colors są używane konsystentnie
- [ ] Zachowano 4px left border dla kategorii
- [ ] Animacje trwają 0.3s (300ms)

---

## 🔄 Historia Zmian

**2026-01-10:**
- ✅ Usunięto hover states z całego projektu (mobile-first)
- ✅ Zmieniono kolory kategorii:
  - MyNotes: teal → yellow (#fdd03b) - styl sticky notes
  - Checklists: yellow → green (#5db85f)
  - Events: orange → teal (#4a9396)
- ✅ Wydarzenia w Inbox mają czarne tło z niebieskim paskiem (jak w Events)
- ✅ Usunięto kolorowe tła z sekcji Inbox (zastąpiono separatorami)
- ✅ Usunięto rozbłyski (box-shadow glow) z nowych itemów
- ✅ Dodano wsparcie dla wielodniowych wydarzeń (endDate)
- ✅ Dodano emotikony 📅 do wydarzeń

**2026-01-09:**
- ✅ Usunięto duże przyciski "Edytuj tytuł" (replaced with small ✎ icon)
- ✅ Border radius zmieniony z 12px → 4px (sharp corners)
- ✅ Przyciski zmienione z solid background → bordered style
- ✅ Dodano małe ikony ✎ do edycji tytułu
- ✅ Ujednolicono kolory navigation
- ✅ Dodano category-specific colors dla bottom nav

**Poprzednie:**
- Implementacja category colors
- Dark theme implementation

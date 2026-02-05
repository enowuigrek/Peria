# PERIA — EXPORT FLOW

## ZAŁOŻENIA

1. **Eksport = świadoma akcja użytkownika**, nie automatyczny sync
2. **1-click export** (maksymalnie 5 sekund)
3. **Eksport do natywnych aplikacji** (Apple Notes/Reminders/Calendar)
4. **Oznaczenie jako "wyeksportowane"** (nie duplikować)
5. **Fallback: Copy to clipboard** (jeśli URL scheme nie działa)

---

## APPLE NOTES

### Cel:
Eksport pełnej notatki z zachowaniem formatowania.

### Metoda:
**Web Share API** (najlepsze dla iOS)

### Kod:
```js
async function exportToAppleNotes(note) {
  const text = formatNoteForAppleNotes(note);

  if (navigator.share) {
    try {
      await navigator.share({
        title: note.id ? `Notatka ${note.id}` : 'Notatka z Peria',
        text: text
      });

      // Oznacz jako wyeksportowane
      markAsExported(note.id, 'notes');

      console.log('✅ Exported to Apple Notes');
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback: copy to clipboard
      copyToClipboard(text);
      alert('Skopiowano do schowka. Wklej do Apple Notes.');
    }
  } else {
    // Fallback dla przeglądarek bez Share API
    copyToClipboard(text);
    alert('Skopiowano do schowka. Wklej do Apple Notes.');
  }
}

function formatNoteForAppleNotes(note) {
  let text = note.sourceText + '\n\n';

  // Dodaj wykryte zadania
  if (note.detected?.tasks?.length > 0) {
    text += '--- Zadania ---\n';
    note.detected.tasks.forEach(task => {
      text += `• ${task.text}\n`;
    });
    text += '\n';
  }

  // Dodaj wykryte wydarzenia
  if (note.detected?.events?.length > 0) {
    text += '--- Wydarzenia ---\n';
    note.detected.events.forEach(event => {
      text += `• ${event.title} - ${event.date} ${event.time || ''}\n`;
    });
    text += '\n';
  }

  // Dodaj pomysły kreatywne
  if (note.detected?.creative) {
    text += '--- Pomysły ---\n';
    text += note.detected.creative + '\n';
  }

  return text;
}
```

### Format:
```
Jutro kupić mleko, spotkanie o 15, pomysł na tekst rapowy

--- Zadania ---
• Kupić mleko

--- Wydarzenia ---
• Spotkanie - 2025-01-08 15:00

--- Pomysły ---
Pomysł na tekst rapowy
```

---

## APPLE REMINDERS

### Cel:
Eksport wykrytych zadań jako lista zadań.

### Metoda:
1. **URL Scheme** (x-apple-reminderkit://) - NIE DZIAŁA na iOS 13+
2. **Web Share API** - DZIAŁA (rekomendowane)
3. **Fallback:** Copy to clipboard

### Kod:
```js
async function exportToAppleReminders(note) {
  const tasks = note.detected?.tasks || [];

  if (tasks.length === 0) {
    alert('Brak zadań do eksportu');
    return;
  }

  const text = formatTasksForReminders(tasks);

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Zadania z Peria',
        text: text
      });

      // Oznacz zadania jako wyeksportowane
      tasks.forEach(task => {
        markTaskAsExported(note.id, task.id);
      });

      // Oznacz notatkę jako wyeksportowaną do Reminders
      markAsExported(note.id, 'reminders');

      console.log('✅ Exported to Apple Reminders');
    } catch (error) {
      console.error('Share failed:', error);
      copyToClipboard(text);
      alert('Skopiowano do schowka. Dodaj do Apple Reminders.');
    }
  } else {
    copyToClipboard(text);
    alert('Skopiowano do schowka. Dodaj do Apple Reminders.');
  }
}

function formatTasksForReminders(tasks) {
  // Format: lista zadań (jedno na linię)
  return tasks.map(task => `• ${task.text}`).join('\n');
}
```

### Format:
```
• Kupić mleko
• Kupić chleb
• Zadzwonić do lekarza
```

### Użycie przez użytkownika:
1. Klik "Eksportuj do Reminders"
2. Share sheet → wybierz Reminders
3. iOS automatycznie parsuje listę
4. Zadania pojawiają się w Apple Reminders

---

## APPLE CALENDAR

### Cel:
Eksport wykrytych wydarzeń do kalendarza.

### Metoda:
1. **URL Scheme** (calshow:// + webcal://) - ograniczone
2. **iCalendar (.ics) file** - DZIAŁA najlepiej
3. **Web Share API** z plikiem .ics

### Kod:
```js
async function exportToAppleCalendar(note) {
  const events = note.detected?.events || [];

  if (events.length === 0) {
    alert('Brak wydarzeń do eksportu');
    return;
  }

  // Generuj plik .ics
  const icsContent = generateICS(events);

  // Metoda 1: Download .ics file
  downloadICS(icsContent, 'peria-events.ics');

  // Oznacz eventy jako wyeksportowane
  events.forEach(event => {
    markEventAsExported(note.id, event.id);
  });

  // Oznacz notatkę jako wyeksportowaną do Calendar
  markAsExported(note.id, 'calendar');

  console.log('✅ Exported to Apple Calendar');
}

function generateICS(events) {
  let ics = 'BEGIN:VCALENDAR\n';
  ics += 'VERSION:2.0\n';
  ics += 'PRODID:-//Peria//NONSGML v1.0//EN\n';

  events.forEach(event => {
    ics += 'BEGIN:VEVENT\n';
    ics += `UID:${event.id}@peria.app\n`;
    ics += `DTSTAMP:${formatICSDate(new Date())}\n`;
    ics += `DTSTART:${formatICSDate(event.date, event.time)}\n`;
    ics += `SUMMARY:${event.title}\n`;
    if (event.description) {
      ics += `DESCRIPTION:${event.description}\n`;
    }
    ics += 'END:VEVENT\n';
  });

  ics += 'END:VCALENDAR';

  return ics;
}

function formatICSDate(date, time) {
  // Format: 20250108T150000Z
  const d = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    d.setHours(parseInt(hours), parseInt(minutes));
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function downloadICS(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  alert('Plik .ics pobrany. Otwórz go, aby dodać do kalendarza.');
}
```

### Format (.ics):
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Peria//NONSGML v1.0//EN
BEGIN:VEVENT
UID:event1@peria.app
DTSTAMP:20250107T143000Z
DTSTART:20250108T150000Z
SUMMARY:Spotkanie
DESCRIPTION:Spotkanie o projekcie
END:VEVENT
END:VCALENDAR
```

### Użycie przez użytkownika:
1. Klik "Eksportuj do Calendar"
2. Plik .ics pobiera się
3. Otwarcie pliku → iOS automatycznie otwiera Calendar
4. Klik "Dodaj do kalendarza"

---

## UI FLOW (przyciski eksportu)

### Widok notatki:
```jsx
<NoteView note={note}>
  <SourceText>{note.sourceText}</SourceText>

  {/* Wykryte zadania */}
  {note.detected?.tasks?.length > 0 && (
    <TasksSection>
      <h3>Zadania ({note.detected.tasks.length})</h3>
      {note.detected.tasks.map(task => (
        <TaskItem key={task.id}>{task.text}</TaskItem>
      ))}

      <ExportButton
        onClick={() => exportToAppleReminders(note)}
        disabled={note.exported.reminders}
      >
        {note.exported.reminders ? '✓ Wyeksportowano' : 'Eksportuj do Reminders'}
      </ExportButton>
    </TasksSection>
  )}

  {/* Wykryte wydarzenia */}
  {note.detected?.events?.length > 0 && (
    <EventsSection>
      <h3>Wydarzenia ({note.detected.events.length})</h3>
      {note.detected.events.map(event => (
        <EventItem key={event.id}>
          {event.title} - {event.date} {event.time}
        </EventItem>
      ))}

      <ExportButton
        onClick={() => exportToAppleCalendar(note)}
        disabled={note.exported.calendar}
      >
        {note.exported.calendar ? '✓ Wyeksportowano' : 'Eksportuj do Calendar'}
      </ExportButton>
    </EventsSection>
  )}

  {/* Pełna notatka */}
  <ExportButton
    onClick={() => exportToAppleNotes(note)}
    disabled={note.exported.notes}
  >
    {note.exported.notes ? '✓ Wyeksportowano' : 'Eksportuj do Notes'}
  </ExportButton>
</NoteView>
```

---

## OZNACZANIE JAKO "WYEKSPORTOWANE"

### Model danych:
```js
{
  id: "n1",
  exported: {
    reminders: false,
    notes: false,
    calendar: false
  }
}
```

### Funkcje:
```js
function markAsExported(noteId, type) {
  const notes = JSON.parse(localStorage.getItem('peria_notes'));

  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.exported[type] = true;
    localStorage.setItem('peria_notes', JSON.stringify(notes));
  }
}

function resetExport(noteId, type) {
  // Jeśli użytkownik chce ponownie wyeksportować
  const notes = JSON.parse(localStorage.getItem('peria_notes'));

  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.exported[type] = false;
    localStorage.setItem('peria_notes', JSON.stringify(notes));
  }
}
```

---

## FALLBACK: COPY TO CLIPBOARD

### Kod:
```js
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('✅ Copied to clipboard');
      })
      .catch(err => {
        console.error('❌ Clipboard failed:', err);
        // Fallback: textarea
        fallbackCopy(text);
      });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);

  console.log('✅ Copied to clipboard (fallback)');
}
```

---

## TESTOWANIE

### Test 1: Export do Reminders
1. Stwórz notatkę z 3 zadaniami
2. Klik "Eksportuj do Reminders"
3. Sprawdź czy Share sheet się otwiera
4. Wybierz Reminders → zadania powinny się dodać
5. Sprawdź czy przycisk zmienił się na "✓ Wyeksportowano"

### Test 2: Export do Notes
1. Stwórz notatkę z tekstem
2. Klik "Eksportuj do Notes"
3. Sprawdź czy Share sheet się otwiera
4. Wybierz Notes → notatka powinna się dodać
5. Sprawdź formatowanie

### Test 3: Export do Calendar
1. Stwórz notatkę z wydarzeniem
2. Klik "Eksportuj do Calendar"
3. Sprawdź czy plik .ics się pobiera
4. Otwórz plik → Calendar powinien się otworzyć
5. Dodaj wydarzenie

### Test 4: Fallback
1. Wyłącz Share API (lub użyj przeglądarki bez wsparcia)
2. Klik "Eksportuj"
3. Sprawdź czy tekst został skopiowany do schowka
4. Wklej w docelowej aplikacji

---

## METRYKI SUKCESU

✅ Export działa w <5 sekund (1 klik)
✅ Nie trzeba wpisywać niczego ręcznie
✅ Przycisk zmienia się na "✓ Wyeksportowano"
✅ Fallback działa gdy Share API nie działa
✅ Format jest czytelny w docelowej aplikacji

---

## NASTĘPNE KROKI

1. [ ] Implementacja eksportu do Notes (Web Share API)
2. [ ] Implementacja eksportu do Reminders (Web Share API)
3. [ ] Implementacja eksportu do Calendar (.ics file)
4. [ ] UI: przyciski eksportu w NoteView
5. [ ] Oznaczanie jako "wyeksportowane"
6. [ ] Testowanie na iPhone (Safari)
7. [ ] Fallback: copy to clipboard

# VOICE-FIRST TODO / NOTES APP
# MVP → iOS → ANDROID → PAID

## ZASADY PROJEKTU
- Robię to najpierw dla siebie
- Każdy punkt musi dać się przetestować
- Nie dodaję funkcji spoza checklisty
- Najpierw działa, potem wygląda

## 1. WEB MVP – AUDIO INPUT
- [ ] Dodać nagrywanie głosu w przeglądarce (MediaRecorder)
- [ ] Obsłużyć start nagrywania
- [ ] Obsłużyć stop nagrywania
- [ ] Zapisać audio jako plik (wav lub mp3)
- [ ] Obsłużyć brak zgody na mikrofon
- [ ] Obsłużyć brak urządzenia audio

## 2. TRANSKRYPCJA (WHISPER API)
- [ ] Wysyłać plik audio do Whisper API
- [ ] Obsłużyć język polski
- [ ] Odebrać tekst transkrypcji
- [ ] Logować surową transkrypcję
- [ ] Obsłużyć błędy API

## 3. ROZPOZNANIE INTENCJI WYPOWIEDZI
- [ ] Przekazać transkrypcję do modelu językowego
- [ ] Model zwraca WYŁĄCZNIE poprawny JSON
- [ ] Obsługiwane typy: checklist, note, summary
- [ ] Struktura odpowiedzi: { "type": "checklist | note | summary", "content": "string lub array" }
- [ ] Walidować JSON po stronie aplikacji
- [ ] Fallback przy błędnej odpowiedzi

## 4. CHECKLISTY
- [ ] Generować checklistę z wypowiedzi
- [ ] Każdy punkt jako osobny element
- [ ] Usuwanie punktu
- [ ] Edycja punktu
- [ ] Oznaczanie punktu jako wykonany

## 5. NOTATKI I PODSUMOWANIA
- [ ] Zapisać pełną transkrypcję jako notatkę
- [ ] Generować krótkie podsumowanie (max 5 punktów)
- [ ] Automatycznie generować tytuł notatki
- [ ] Zapisać datę i godzinę

## 6. STORAGE
- [ ] Zapisywać checklisty lokalnie (localStorage lub DB)
- [ ] Zapisywać notatki lokalnie
- [ ] Przechowywać historię nagrań
- [ ] Dane nie znikają po odświeżeniu strony

## 7. EKSPORT – iOS
- [ ] Eksport checklisty do Apple Reminders
- [ ] Każdy punkt checklisty = osobne przypomnienie
- [ ] Eksport notatki do Apple Notes
- [ ] Eksport jednym kliknięciem

## 8. UX – MINIMALNY
- [ ] Jedno główne CTA: „Nagraj"
- [ ] Widok nagrywania
- [ ] Widok wyniku (checklist / notatka)
- [ ] Brak formularzy
- [ ] Brak konfiguracji na start

## 9. PWA / iOS FIRST
- [ ] Aplikacja działa jako PWA
- [ ] Możliwość dodania do ekranu głównego iOS
- [ ] Mikrofon działa w Safari
- [ ] Aplikacja uruchamia się jak natywna

## 10. WALIDACJA
- [ ] Używam aplikacji codziennie
- [ ] Korzystam podczas spaceru
- [ ] Wracam po kilku dniach
- [ ] Brakuje mi jej, gdy jej nie mam

## 11. MONETYZACJA
- [ ] FREE: limit nagrań, brak eksportu
- [ ] PRO: nielimitowane nagrania, eksport, historia

## 12. KOLEJNE KROKI
- [ ] React Native / Expo (iOS)
- [ ] TestFlight
- [ ] App Store
- [ ] Android
- [ ] Google Tasks / Keep

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

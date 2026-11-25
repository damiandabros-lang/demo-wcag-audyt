# Lista kontrolna audytu dostępności – WCAG 2.1 AA

Wszystkie 50 kryteriów sukcesu poziomu A i AA, wymaganych ustawą z 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych (norma EN 301 549).

Kolumna „Metoda” mówi, co da się sprawdzić automatycznie (`npm run audyt`), a co wymaga oceny audytora. Narzędzia ręczne: sama klawiatura, NVDA + Firefox/Chrome, VoiceOver (macOS, iOS), TalkBack, Colour Contrast Analyser, powiększenie przeglądarki 200% i 400%.

| Kryterium | Poziom | Metoda | Co sprawdzamy | Wynik | Uwagi |
|---|---|---|---|---|---|
| 1.1.1 Treść nietekstowa | A | automat częściowo + ręcznie | Każdy obraz informacyjny ma trafny tekst alternatywny, dekoracyjny – pusty alt. Ikony-przyciski mają nazwę dostępną. CAPTCHA ma alternatywę. | ☐ | |
| 1.2.1 Tylko audio lub tylko wideo (nagranie) | A | ręcznie | Nagrania tylko audio mają transkrypcję, a tylko wideo – opis tekstowy lub ścieżkę audio. | ☐ | |
| 1.2.2 Napisy rozszerzone (nagranie) | A | ręcznie | Filmy z dźwiękiem mają napisy (z opisem dźwięków), zsynchronizowane i poprawne. | ☐ | |
| 1.2.3 Audiodeskrypcja lub alternatywa tekstowa dla mediów (nagranie) | A | ręcznie | Filmy mają audiodeskrypcję albo pełną alternatywę tekstową. | ☐ | |
| 1.2.4 Napisy rozszerzone (na żywo) | AA | ręcznie | Transmisje na żywo (np. sesje rady) mają napisy na żywo. | ☐ | |
| 1.2.5 Audiodeskrypcja (nagranie) | AA | ręcznie | Nagrane filmy mają audiodeskrypcję, gdy obraz niesie informacje niedostępne w dźwięku. | ☐ | |
| 1.3.1 Informacje i relacje | A | automat częściowo + ręcznie | Nagłówki, listy, tabele (th, scope, caption), etykiety pól i grupy (fieldset/legend) są w kodzie, nie tylko wizualnie. | ☐ | |
| 1.3.2 Zrozumiała kolejność | A | ręcznie | Kolejność czytania w czytniku ekranu (NVDA/VoiceOver) zgadza się z sensem treści. | ☐ | |
| 1.3.3 Właściwości zmysłowe | A | ręcznie | Instrukcje nie opierają się wyłącznie na kształcie, położeniu, kolorze ani dźwięku („kliknij zielony przycisk po prawej”). | ☐ | |
| 1.3.4 Orientacja | AA | automat częściowo + ręcznie | Serwis działa w orientacji pionowej i poziomej na telefonie. | ☐ | |
| 1.3.5 Określenie pożądanej wartości | AA | automat częściowo + ręcznie | Pola danych osobowych mają poprawny atrybut autocomplete (name, email, tel, address-line1…). | ☐ | |
| 1.4.1 Użycie koloru | A | automat częściowo + ręcznie | Kolor nie jest jedynym nośnikiem informacji (linki w tekście podkreślone, błędy opisane słowami). | ☐ | |
| 1.4.2 Kontrola odtwarzania dźwięku | A | automat częściowo + ręcznie | Dźwięk odtwarzany automatycznie dłużej niż 3 s można zatrzymać lub wyciszyć. | ☐ | |
| 1.4.3 Kontrast (minimum) | AA | automat (axe) + przegląd | Kontrast tekstu co najmniej 4,5:1 (duży tekst 3:1), także na zdjęciach, w stanach hover i w trybie kontrastu. | ☐ | |
| 1.4.4 Zmiana rozmiaru tekstu | AA | automat częściowo + ręcznie | Powiększenie przeglądarki do 200% nie ucina treści ani funkcji. | ☐ | |
| 1.4.5 Obrazy tekstu | AA | ręcznie | Tekst jest tekstem, nie grafiką (wyjątek: logo). Plakaty i ogłoszenia jako obrazy mają pełną treść obok. | ☐ | |
| 1.4.10 Dopasowanie do ekranu | AA | automat częściowo + ręcznie | Przy szerokości 320 px (powiększenie 400%) nie ma przewijania w dwóch kierunkach; tabele danych mogą się przewijać. | ☐ | |
| 1.4.11 Kontrast elementów nietekstowych | AA | ręcznie | Granice pól, ikony i stany fokusu mają kontrast co najmniej 3:1 z tłem. | ☐ | |
| 1.4.12 Odstępy w tekście | AA | automat częściowo + ręcznie | Zwiększenie interlinii, odstępów liter, słów i akapitów nie ucina ani nie nakłada tekstu. | ☐ | |
| 1.4.13 Treści spod kursora lub fokusu | AA | ręcznie | Podpowiedzi i menu wysuwane po najechaniu lub fokusie można zamknąć klawiszem Esc, najechać na nie i nie znikają same. | ☐ | |
| 2.1.1 Klawiatura | A | automat częściowo + ręcznie | Wszystkie funkcje (menu, formularze, mapy, galerie, kalendarze) działają z samej klawiatury. | ☐ | |
| 2.1.2 Bez pułapki na klawiaturę | A | automat częściowo + ręcznie | Z każdego elementu (okna modalne, odtwarzacze, osadzone mapy) da się wyjść klawiaturą. | ☐ | |
| 2.1.4 Jednoznakowe skróty klawiaturowe | A | ręcznie | Skróty jednoklawiszowe można wyłączyć, zmienić lub działają tylko przy fokusie. | ☐ | |
| 2.2.1 Dostosowanie czasu | A | automat częściowo + ręcznie | Limity czasu (np. wylogowanie, sesja formularza) można wyłączyć, wydłużyć lub ostrzega się o nich. | ☐ | |
| 2.2.2 Pauza, zatrzymanie, ukrycie | A | automat częściowo + ręcznie | Karuzele, animacje i przewijane paski aktualności można zatrzymać. | ☐ | |
| 2.3.1 Trzy błyski lub wartości poniżej progu | A | ręcznie | Brak treści migających częściej niż 3 razy na sekundę. | ☐ | |
| 2.4.1 Możliwość pominięcia bloków | A | automat częściowo + ręcznie | Jest link „Przejdź do treści” oraz punkty orientacyjne (header, nav, main, footer). | ☐ | |
| 2.4.2 Tytuł strony | A | automat (axe) + przegląd | Każda strona ma unikalny, opisowy tytuł (strona – sekcja – instytucja). | ☐ | |
| 2.4.3 Kolejność fokusu | A | automat częściowo + ręcznie | Kolejność fokusu jest logiczna; po otwarciu okna modalnego fokus trafia do okna i wraca po zamknięciu. | ☐ | |
| 2.4.4 Cel linku (w kontekście) | A | automat częściowo + ręcznie | Cel każdego linku wynika z jego treści lub kontekstu (bez samych „więcej”, „kliknij tutaj”). Linki do plików podają format i rozmiar. | ☐ | |
| 2.4.5 Wiele dróg | AA | ręcznie | Do stron można dotrzeć co najmniej dwiema drogami: menu, wyszukiwarka, mapa strony. | ☐ | |
| 2.4.6 Nagłówki i etykiety | AA | ręcznie | Nagłówki i etykiety opisują treść i cel. | ☐ | |
| 2.4.7 Widoczny fokus | AA | automat częściowo + ręcznie | Fokus klawiatury jest zawsze wyraźnie widoczny. | ☐ | |
| 2.5.1 Gesty dotykowe | A | ręcznie | Funkcje wymagające gestów wielopunktowych lub ścieżki (przesunięcie mapy) mają alternatywę z jednym dotknięciem (przyciski). | ☐ | |
| 2.5.2 Rezygnacja ze wskazania | A | ręcznie | Akcja wykonuje się po zwolnieniu, nie po naciśnięciu; można ją anulować. | ☐ | |
| 2.5.3 Etykieta w nazwie | A | automat częściowo + ręcznie | Nazwa dostępna przycisku zawiera jego widoczny tekst (sterowanie głosem). | ☐ | |
| 2.5.4 Aktywowanie ruchem | A | ręcznie | Funkcje uruchamiane ruchem urządzenia mają alternatywę i można je wyłączyć. | ☐ | |
| 3.1.1 Język strony | A | automat (axe) + przegląd | Atrybut lang strony jest poprawny (pl). | ☐ | |
| 3.1.2 Język części | AA | automat częściowo + ręcznie | Fragmenty w innym języku (np. wersja angielska, cytaty) mają własny atrybut lang. | ☐ | |
| 3.2.1 Po otrzymaniu fokusu | A | ręcznie | Fokus na elemencie nie powoduje nieoczekiwanej zmiany kontekstu. | ☐ | |
| 3.2.2 Podczas wprowadzania danych | A | ręcznie | Zmiana wartości pola (np. lista wyboru) nie przenosi na inną stronę bez ostrzeżenia. | ☐ | |
| 3.2.3 Spójna nawigacja | AA | ręcznie | Nawigacja jest w tym samym miejscu i kolejności na wszystkich stronach. | ☐ | |
| 3.2.4 Spójna identyfikacja | AA | ręcznie | Te same funkcje mają te same nazwy i ikony w całym serwisie. | ☐ | |
| 3.3.1 Identyfikacja błędu | A | ręcznie | Błędy w formularzach są opisane tekstem i wskazują pole; fokus trafia do podsumowania błędów. | ☐ | |
| 3.3.2 Etykiety lub instrukcje | A | automat częściowo + ręcznie | Każde pole ma widoczną etykietę; wymagane pola i format danych są opisane. | ☐ | |
| 3.3.3 Sugestie korekty błędów | AA | ręcznie | Komunikat błędu podpowiada, jak go poprawić (np. „PESEL ma 11 cyfr”). | ☐ | |
| 3.3.4 Zapobieganie błędom (prawnym, finansowym, w danych) | AA | ręcznie | Przed wysłaniem wniosku lub płatności można sprawdzić i poprawić dane albo cofnąć operację. | ☐ | |
| 4.1.1 Poprawność kodu | A | automat częściowo + ręcznie | Kod HTML nie ma zduplikowanych identyfikatorów ani błędów zagnieżdżenia wpływających na technologie wspomagające. | ☐ | |
| 4.1.2 Nazwa, rola, wartość | A | automat częściowo + ręcznie | Kontrolki własne (menu rozwijane, zakładki, przełączniki) mają poprawną rolę, nazwę i stan (aria-expanded, aria-pressed). | ☐ | |
| 4.1.3 Komunikaty o stanie | AA | automat częściowo + ręcznie | Komunikaty o stanie (dodano do koszyka, wysłano formularz, wyniki wyszukiwania) są ogłaszane przez aria-live/role=status bez przenoszenia fokusu. | ☐ | |

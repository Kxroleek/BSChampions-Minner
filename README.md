# ChampBot

Chcesz zdobywać wszystkie Starr Dropy, Spray'e i Monety, ale nie masz czasu na oglądanie streama lub po prostu nie pasuje Ci strefa czasowa? ChampBot jest tu, by Ci pomóc!

ChampBot może automatycznie wykonywać wydarzenia podczas streama, w tym Cheers, Polls (wybieranie MVP), Quizy, Loot Drops i Prognozy Meczowe.

Testowane na Brawl Stars Championship (listopad 2024), ale powinno działać również na innych streamach Championship.

## Szybki Start

1. Zainstaluj [Tampermonkey](https://www.tampermonkey.net/).

2. Zainstaluj ChampBot klikając [tutaj](https://github.com/Kxroleek/ChampBot/raw/main/ChampBot.user.js).

3. Otwórz stronę streama na https://event.supercell.com/brawlstars/pl

4. Jeśli w logach wydarzeń pojawi się komunikat „ChampBot loaded”, to oznacza, że działa. Teraz wystarczy, że pozostawisz zakładkę otwartą i pozwolisz mu wykonać całą pracę za Ciebie.

## Różnice w porównaniu do AutoBSC
Ten projekt jest oparty na [AutoBSC](https://github.com/CatMe0w/AutoBSC), ale ma wiele różnic:

- ChampBot ma nakładkę wyświetlającą dane i umożliwiającą szybką konfigurację skryptu
- Quizy są zawsze odpowiadane poprawnie
- Wiele różnych sposobów autopredykcji: zawsze niebieski/czerwony, losowy zespół lub wybór zgodnie z większością
- Automatyczne zbieranie loot dropów
- Interakcje oparte na DOM (zapewnia, że takie rzeczy jak wyświetlanie punktów zawsze działają)
- Logowanie wydarzeń, takich jak wysyłanie cheerów, prognoz czy głosowań, które mogą być wyświetlane w panelu po prawej stronie ekranu

## Nakładka
Nakładka ma dwie sekcje:
### Dane
Ta sekcja wyświetla liczbę (rzekomo*) użytkowników, którzy są połączeni, oraz liczbę prognoz dla każdego zespołu.

> \* Nie wiem, czy te dane są poprawne, ale są one wysyłane w wiadomości cheer z serwera.

### Konfiguracja
Pozwala skonfigurować skrypt za pomocą GUI:
- Autocheer:
Automatycznie wysyłaj cheer (emoji w dolnych rogach streama), aby zdobyć 5 punktów. Włączone domyślnie
- Odpowiedzi na ankiety:
Automatycznie odpowiadaj na ankiety „Kto był MVP tego meczu?” aby zdobyć 100 punktów. Włączone domyślnie
- Odpowiedzi na quizy:
Automatycznie udzielaj poprawnych odpowiedzi na quizy, takie jak „Jaką broń używa Melodie?” aby zdobyć 50 punktów. Włączone domyślnie
- Odpowiedzi na suwaki:
Automatycznie przesuwaj interaktywne suwaki, aby zdobyć 2 punkty. Włączone domyślnie
- Zbieranie lootdropów:
Automatycznie zbieraj losowe loot dropy, aby zdobyć 10 punktów. Włączone domyślnie
- Autopredykcja:
Automatycznie składaj prognozy, aby zdobyć 10 punktów (125, jeśli prognoza okaże się trafna). Wyłączone domyślnie
- - Strategia autopredykcji:
Strategia używana do wyboru zespołu w autopredykcji. Może to być Niebieski (zawsze wybieraj niebieski), Czerwony (zawsze wybieraj czerwony), Losowy (losowo wybieraj) lub Podążaj za większością (wybierz ten sam zespół, co większość). Domyślnie: Podążaj za większością
- Logowanie w feedzie:
Logowanie wydarzeń (wysyłanie cheerów, prognozy, quizy itp.) w feedzie po prawej stronie ekranu. Włączone domyślnie
- Tryb niskiej szczegółowości:
Wyłączenie grafiki cheerów, aby poprawić wydajność na słabszym sprzęcie. Wyłączone domyślnie

## Znane problemy
- Cheery nie są wysyłane, jeśli nie wybrano Emoji Cheer

## Licencja

MIT License

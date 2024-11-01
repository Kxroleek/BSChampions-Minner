# BSChampions Minner

Chcesz zdobyć wszystkie Starr Drops, Emotki i Monety, ale nie masz czasu na oglądanie streamów, albo streamy są nadawane w innych strefach czasowych?

BSChampions Minner może automatycznie wykonywać działania podczas streamów, takie jak Cheers, Ankiety (wybór MVP), Quizy, Loot Drops oraz Przewidywania Meczu.

Przetestowano podczas Last Chance Qualifier (Sierpień 2024), ale powinien działać także na innych streamach mistrzostw.

## Szybki Start

1. Zainstaluj [Tampermonkey](https://www.tampermonkey.net/).

2. Zainstaluj BSChampions Minner, klikając [Tutaj](https://github.com/Kxroleek/BSChampions-Minner/raw/master/BSChampions-Minner.user.js).

3. Otwórz stronę streamu na https://event.supercell.com/brawlstars/

4. Jeśli w logach wydarzeń pojawi się komunikat "BSChampions Minner Loaded", to znaczy, że działa. Teraz wystarczy, że zostawisz otwartą kartę, a resztę zrobi za Ciebie.

## Różnice względem AutoBSC
Projekt bazuje na [AutoBSC](https://github.com/CatMe0w/AutoBSC), ale posiada wiele różnic:

- BSChampions Minner posiada nakładkę z danymi i możliwością szybkiej konfiguracji skryptu
- Quizy są zawsze odpowiadane poprawnie
- Różne opcje autoprzewidywania: zawsze niebieski/czerwony, losowa drużyna albo wybór zgodny z większością
- Automatyczne zbieranie dropów z lootem
- Interakcje oparte na DOM (zapewniają działanie takich rzeczy jak wyświetlanie punktów)
- Logowanie wydarzeń, takich jak cheer, przewidywanie lub ankiety, w kanale po prawej stronie ekranu

## Nakładka
Nakładka ma dwie sekcje:
### Dane
Wyświetla, ilu użytkowników (Rzekomo*) jest podłączonych i ile przewidywań wykonano dla każdej z drużyn.

> \* Nie jestem pewien, czy dane są prawidłowe, ale są wysyłane w wiadomości cheer z serwera

### Konfiguracja
Pozwala skonfigurować skrypt za pomocą GUI
- Autocheer:
Automatycznie wysyła emotki cheer (emotki w dolnych rogach ekranu), by zdobyć 5 punktów. Włączone domyślnie
- Odpowiedź na ankiety:
Automatycznie odpowiada na ankiety "Kto był MVP tego meczu?", by zdobyć 100 punktów. Włączone domyślnie
- Odpowiedź na quiz:
Automatycznie podaje prawidłową odpowiedź na quizy, takie jak "Czego używa Melodie jako broni?", by zdobyć 50 punktów. Włączone domyślnie
- Zbieraj lootdrop:
Automatycznie zbiera losowe dropy, aby zdobyć 10 punktów. Włączone domyślnie
- Autoprzewidywanie:
Automatycznie ustawia przewidywania, by zdobyć 10 punktów (125, jeśli przewidywanie okaże się prawdziwe). Wyłączone domyślnie
- - Strategia autoprzewidywania:
Strategia wyboru drużyny do autoprzewidywania. Może to być Blue (zawsze wybieraj niebieską), Red (zawsze wybieraj czerwoną), Random (wybór losowy) lub Follow majority (wybierz zgodnie z większością). Domyślnie ustawione na Follow majority
- Logowanie do kanału:
Loguje wydarzenia (wysyłanie cheer, ankiety, quizy, itd.) do kanału po prawej stronie ekranu. Włączone domyślnie
- Tryb niskiej szczegółowości:
Wyłącza grafikę cheer w celu poprawienia wydajności na słabszym sprzęcie. Wyłączone domyślnie

## Znane problemy
- Cheers nie są wysyłane, jeśli nie wybrano emotki cheer
- Brak wsparcia dla interakcji slidera

## Licencja

Licencja MIT

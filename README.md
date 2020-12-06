# charades-online

1.Projekt bazuje na serwerze TCP.


2.Struktura projektu:

Projekt używa: Electron'a - do tworzenie aplikacji desktopowej i obsługi okien aplikacji, NodeJS - do stworzenia klienta, HTML - jako okien aplikacji, C - do serwera TCP. 
Główny serwer "masterserver" zajmuje się obsługą użytkownika przed dołączeniem do gry. Tzn. wedle wyborów użytkownika tworzy dla niego nową grę lub dołącza go do istniejącej gry. 

Dodatkowo "masterserver" na żądanie gracza udostępnia mu listę dostępnych gier oraz na żądanie hosta (gracza który stworzył nową grę) gry może zakończyć grę dla wszystkich graczy.

"Masterserver" tworząc nową grę, tworzy dla niej nowy wątek, który obsługuje dołączanie graczy, sprawdza wynik, przesyła wiadomości różnego typu między graczami, ten wątek nazywa się "game".

Klient jest obsługiwany przez plik "main.js", który tworzy okna aplikacji oraz zarządza tymi oknami (czyli plikami HTMl połączonymi z plikami JS). Klient w menu łączy się z "masterserver", po czym wybiera czy chce stworzyć grę czy dołączyć do istniejącej. Po wybraniu gry rozłącza się z "masterserver" i łączy się z wybraną "game".

Klient w każdym momencie może wyjść z gry. Natomiast jeśli host wyjdzie z gry, automatycznie wszyscy gracze zostają rozłączeni i poinformowani o tym co zaszło.

Przy uruchomieniu serwer powstaje na porcie 1000 na adresie 127.0.0.1 , tak jak port łatwo zmienić sugerujemy zostawić 1000, ponieważ klienci powstają na portach 1001-3000. Zajęty jest też port 999 dla gier, które są jeszcze zamykane przez główny serwer. Niestety nie zdążyliśmy zaimplemenotwać łatwej zmiany adresu IP serwer, więc jest ustawiony na 127.0.0.1 .


3.Rozgrywka:

Kalambury online - jedna osoba rysuje hasło do zgadnięcia i podpowiada na czacie grupowym 'ciepło-zimno' ('Hot-Cold'). Gra kończy się gdy któryś gracz poda na czacie poprawne hasło.

Strona hosta:

Tworzy grę poprzez podanie hasła do zgadnięcia. Następnie rysuje hasło i podowiada.
Strona gracza:

Dołącza do gry. Pisze na czacie grupowym swoje przypuszczenia.


4.Uruchomienie:

1)Należy zainstalować Electron i NodeJS z npm.

2)Sprwadzić czy w folderze z plikami projektu jest folder 'node_modules'

3)Należy skompilować servermaster.c z game.c czyli:

    gcc -pthread masterserver.c game.c -o masterserver -Wall
    
4)Uruchomić serwer 'masterserver':

    ./masterserver
    
5)W osobnym terminalu uruchomić klienta komendą: 

    npm start
    
6)Więcej klientów - powtórz 5)

7)Klientów zamykać za pomocą dostępnych w aplikacji przycisków

8)Serwer zamykać Ctrl+C w terminalu


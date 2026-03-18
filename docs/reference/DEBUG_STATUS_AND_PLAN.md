# Aktuell Status och Färdplan: Keycloak SSO Debugging

## 🎯 Mål
Få inloggningen att fungera hela vägen. Just nu kraschar det sista steget där frontend försöker hämta din profil (`/api/users/me`) med **500 Internal Server Error**.

## 🕵️‍♂️ Våra Fynd

### 1. Det ursprungliga felet: JSON Recursion
Felet `500` berodde troligen på att Java försökte göra om din Användare till Text (JSON), men fastnade i en oändlig loop:
`Användare` -> har `Kurser` -> som har `Lärare` -> som är `Användare` -> som har `Kurser`... osv.
Detta kallas "StackOverflowError" och kraschar servern tyst.

### 2. Det nya problemet: Databasen dör
Vi märkte också i `docker ps` och loggarna att databas-containern (`eduflex-db`) verkar stanna ("Stopped"). Om databasen är nere får backend också panic (500) eftersom den inte kan slå upp användaren.

## 🛠️ Vad vi höll på att göra (som låste sig)

1.  **Säkra `UserController.java`:**
    Vi försökte byta ut koden i `/api/users/me` så att den **inte** returnerar hela databasobjektet (User) utan istället bygger ett enkelt "svarspaket" (Map) manuellt.
    Detta eliminerar 100% risken för JSON-loopen.

2.  **Säkra `docker-compose.yml`:**
    Vi försökte lägga till `restart: always` på databasen så att den startar om automatiskt om den kraschar, istället för att ge upp.

## 🚀 Plan för när du startat om

När du fått igång systemet igen, gör vi följande:

1.  **Verifiera koden:** Jag kollar om ändringen i `UserController.java` (den manuella mappen) gick igenom. Om inte, gör vi om den.
2.  **Säkra DB:** Jag kollar om `docker-compose.yml` har `restart: always`. Om inte, lägger vi till det.
3.  **Bygg:** Du kör `docker compose up --build`.

Detta bör lösa både "loopen" och "databas-kraschen".

**Vi hörs på andra sidan omstarten!** 👋

# E4-haket backend

## [E4-Haket Backend](https://projekt-backend-s1gd.onrender.com)

API/REST Webbtjänst för Projekt E4-Haket frontend. Med denna webbtjänst kan du köra POST, GET, PUT och DELETE mot databasen som hanteras av MongoDB, som webbtjänst från Render. 

# Om APIet

## Databas

Nedan syns databasens struktur. Det är en noSQL databas, hanterad av MongoDB. Obligatoriska fält förekommer, markerade med asterisker(*). Fetstilta element genereras automatiskt. I samtliga tabeller är antingen telefon eller e-post ett krav, ett av dem måste vara ifyllda.
| Tabellnamn  | Fält  |
|---|---|
| Contacts  | firstname*(str), surname*(str), email(str), telephone(str), message*(str), **created**  |
|  Dishes | **id**, dishname*(str), ingredients*(str), allergens*(str), diet(str), price*(str), image(str), weekday*(str)  |
|  Employees | **id**, **username**(str), password*(str), firstname*(str), surname*(str), **email**(str), admin*(bool), **created**  |
|  Orders | **id**, name*(str), []dishes*(arr), email(str), phone(str), **totalPrice**(num), message(str), pickup*(), **status**(str), **created**|
|  Reviews | name*(str), email*(str), rating*(str), message(str), allowAnswer*(bool), **created**  |

## Användning av API

Länken som alla ändpunkter är kopplade till är: https://projekt-backend-s1gd.onrender.com/

| Metod  | Ändpunkt  | Beskrivning  |
|---|---|---|
| GET  | /index  | GET för dagens meny. Filtrerar maträtter utefter dag.  |
| POST  | /orders  | POST för beställning |
| POST  | /contact  | POST för kontaktmeddelande  |
| POST  | /review  | POST för recension  |
| POST | /register | POST för registrering av användare. |
| POST  | /login  | POST för login i admingränssnittet.  |
| GET | /intranet  | GET för intranet. Här sker token authentication.  |
| GET  | /add  | GET för menyhantering. Samtliga rätter hämtas, här sker token authentication.  |
| POST  | /add  | POST för menyhantering. Vid skapande av ny maträtt kallas denna.  |
| GET  | /add/:id  | GET för specifik rätt.  |
| PUT  | /add/:id  | PUT för specifik rätt, används i samband med GET id  |
| GET  | /orders  | GET för beställningar |
| PUT  | /orders/:id  | PUT för ändring av status på beställning. |
| GET | /contact  | GET för kontaktmeddelande från kunder  |
| GET | /review  | GET för recensioner från kunder  |
| GET | /admin  | GET för användarhantering. Konton utan attribut admin = true nekas åtkomst.  |
| DELETE | /delete/dish/:id  | DELETE för specifik maträtt.  |
| DELETE | /delete/review/:id  | DELETE för specifik recension.  |
| DELETE | /delete/contact/:id  | DELETE för specifikt kundmeddelande.  |
| DELETE | /delete/employee/:id  | DELETE för specifik användare.  |

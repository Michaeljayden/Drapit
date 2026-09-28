# Runbook: dagelijkse Drapit Instagram DM-ronde

Wordt uitgevoerd door twee geplande taken: **10:00** (ronde A) en **15:00** (ronde B), NL-tijd.
Lees altijd eerst `DM-PLAYBOOK.md` in dezelfde map - dat bevat de doelgroepregels, de
berichtsjablonen, de volumelimieten en de veiligheidsregels.

---

## Stap 0 - Voorbereiding
1. Lees `C:\Users\Gebruiker\Desktop\Fitly\instagram-dm\DM-PLAYBOOK.md`.
2. Lees `C:\Users\Gebruiker\Desktop\Fitly\instagram-dm\tracker.csv` en bouw een set van alle
   accountnamen die er al in staan. Die worden nooit opnieuw benaderd met een eerste DM.
3. Bepaal het quotum voor deze ronde met de tabel in playbook sectie 6. De startdatum van de
   campagne staat in `campagne-start.txt` in deze map.

## Stap 1 - Instagram openen als @drapit.vton
1. Open in Chrome `https://www.instagram.com/direct/inbox/`.
2. Maak een screenshot. Staat er linksboven een andere accountnaam dan `drapit.vton`?
   Klik dan op het pijltje naast de naam en kies `drapit.vton` in "Overschakelen naar ander
   account". Wacht 5 seconden en controleer met een nieuwe screenshot.
3. Lukt het inloggen niet, of vraagt Instagram om een verificatiecode: **stop de ronde**,
   verstuur niets, en meld het aan Michael.
4. Scroll de bestaande inbox door en noteer met wie er al eerder gesproken is. Ook die
   accounts krijgen geen eerste DM meer.

## Stap 2 - Antwoorden eerst afhandelen
Voordat je nieuwe DM's stuurt: kijk of er ongelezen antwoorden zijn.
- Antwoord **niet** zelf inhoudelijk op koopvragen, prijsonderhandelingen of klachten.
- Zet voor elk antwoord de status in de tracker op `geantwoord` en zet de tekst in de
  notitie-kolom.
- Meld alle nieuwe antwoorden aan het eind van de ronde aan Michael, met accountnaam en
  samenvatting, zodat hij zelf kan reageren.
- Schrap deze accounts uit de follow-upplanning.

## Stap 3 - Follow-ups versturen
1. Zoek in de tracker regels met status `verzonden`, lege `antwoord_datum` en:
   - `datum_dm` precies 3 dagen geleden en lege `followup1_datum` -> stuur follow-up 1
   - `datum_dm` 8 of meer dagen geleden, `followup1_datum` gevuld, `followup2_datum` leeg
     -> stuur follow-up 2
2. Gebruik de teksten uit playbook sectie 5, in de taal die in de tracker staat.
3. Vul de datum in de bijbehorende kolom.
4. Follow-ups tellen mee in het quotum van deze ronde.

## Stap 4 - Nieuwe doelen verzamelen
Verzamel kandidaten in de prioriteitsvolgorde van playbook sectie 1, tot je ruim boven het
quotum zit (verzamel ~1,5x zoveel, want er vallen accounts af bij de kwalificatie).
- Reageerders: open de 5 nieuwste posts van @drapit.vton en lees de comments.
- Likers: klik op "Vind-ik-leuks" onder diezelfde posts.
- Nieuwe volgers: open `https://www.instagram.com/drapit.vton/followers/` - de bovenste
  namen zijn de nieuwste.
Filter direct alles weg dat al in de tracker of de inbox staat.

## Stap 5 - Kwalificeren en personaliseren
Per kandidaat:
1. Open `https://www.instagram.com/<accountnaam>/` en lees bio + de laatste posts.
2. Beoordeel als A-lead, B-lead of overslaan volgens playbook sectie 1.
3. Bepaal de taal volgens playbook sectie 2.
4. Kies een sjabloon uit playbook sectie 4 dat past bij de bron en het type account.
5. Vervang `[naam]` door de voornaam of merknaam, `[merknaam]` door de merknaam, `[link]`
   door `https://apps.shopify.com/drapit-virtual-try-on`, en `[concreet detail]` door iets
   wat je echt op hun profiel gezien hebt (een specifieke drop, een collectie, een
   materiaal, een post). **Nooit een detail verzinnen.** Kun je niets concreets vinden,
   gebruik dan sjabloon B, dat geen detail nodig heeft.
6. Herformuleer een of twee zinnen zodat geen twee DM's identiek zijn.

## Stap 6 - Versturen
Per DM:
1. Open het profiel, klik op "Bericht" (of via de inbox het potloodicoon en zoek het account).
2. Klik in het tekstveld, typ het bericht, druk op Enter.
3. Maak een screenshot en controleer dat het bericht daadwerkelijk in het gesprek staat.
4. Wacht 30 tot 60 seconden voor de volgende DM. Varieer die wachttijd.
5. Log de regel meteen in `tracker.csv` (zie stap 7), niet pas aan het eind.

**Bij een foutmelding, "Actie geblokkeerd", of een bericht dat niet verstuurt:**
stop onmiddellijk met versturen, log de reeds verzonden DM's, schrijf in
`campagne-start.txt` een regel `BLOKKADE <datum>`, en meld het aan Michael. De volgende drie
rondes draaien op de helft van het quotum.

## Stap 7 - Loggen
1. Voeg per verstuurde DM een regel toe aan `tracker.csv` met:
   `datum_dm,tijd,ronde,account,profiel_url,naam,lead_type,bron,taal,variant,status,followup1_datum,followup2_datum,antwoord_datum,notitie`
   Status is `verzonden`. Ronde is `A` (10:00) of `B` (15:00).
2. Spiegel de nieuwe regels naar de Google Sheet:
   `https://docs.google.com/spreadsheets/d/1rGOkj6Dhb_EU2bM7C2-Q3ujA7WX-_wevpU95fS3j4WA/edit`
   - Open de sheet in Chrome. Sluit eventuele Gemini- of welkomstdialogen eerst weg.
   - Zoek de eerste lege rij, klik op de cel in kolom A van die rij.
   - Typ de nieuwe regels als een blok waarin velden gescheiden zijn door een tab en rijen
     door een newline. Een blok van maximaal 5 rijen per keer typen.
   - Maak daarna een screenshot om te controleren dat het blok goed geland is.
3. Werk bij follow-ups en antwoorden de bestaande regel bij in plaats van een nieuwe toe te
   voegen (zowel in de CSV als in de sheet).

## Stap 8 - Terugkoppeling
Sluit af met een kort bericht aan Michael:
- aantal nieuwe DM's, aantal follow-ups, verdeling NL/EN
- nieuwe antwoorden met accountnaam en samenvatting
- accounts die opvallen als sterke lead
- of er een blokkade of andere storing was
- hoeveel onbenaderde doelen er nog over zijn

Ga niet in gesprek namens Michael en doe geen toezeggingen buiten het aanbod in het playbook.

# Drapit Instagram DM-playbook

Laatst bijgewerkt: 2026-08-27
Account: **@drapit.vton** (Instagram Business, 962 volgers)
Kanaal: Chrome-browserautomatisering (Claude in Chrome). De officiele Instagram Graph API staat koude DM's niet toe.

---

## 1. Wie benaderen we

Prioriteit van boven naar beneden. Vul de dagquota altijd van boven af.

| Prio | Bron | Waar te vinden |
|---|---|---|
| 1 | Reageerders op posts/reels | comments onder de 5 nieuwste posts |
| 2 | Story-viewers die reageerden | Instagram > je story > reacties |
| 3 | Likers van de 5 nieuwste posts | post > "Vind-ik-leuks" |
| 4 | Nieuwe volgers sinds vorige run | /drapit.vton/followers/ (bovenste = nieuwste) |
| 5 | Zakelijke accounts uit de bestaande volgerslijst | zelfde lijst, verder naar beneden |

### Kwalificatie per account
Open het profiel en beoordeel op bio + laatste 3 posts.

**A-lead (altijd DM'en):** kledingmerk, webshop, boutique, concept store, streetwear-label,
lingerie/zwemkleding, sieraden met draagbeeld, of een bio die naar een eigen webshop linkt.
Extra sterk als er een Shopify-shop achter zit (link naar `.myshopify.com`, of "Shop" tab).

**B-lead (DM'en als er ruimte is):** dropshippers, printing-on-demand, fotografen die
productfoto's voor merken maken, marketing/e-commerce bureaus.

**Overslaan (geen DM):**
- Privepersonen zonder eigen shop
- Accounts < 100 volgers zonder shoplink
- Bot-/spam-accounts (bio vol emoji + link naar linktree met gokken/crypto)
- Concurrenten in virtual try-on
- Accounts die al in de tracker staan met status verzonden of geen-interesse
- Accounts die al eerder een DM-gesprek met ons hadden (check de bestaande inbox)

---

## 2. Taal
Nederlands als de bio, laatste posts of locatie NL of BE zijn, of als de naam duidelijk
Nederlandstalig is. In alle andere gevallen Engels. Bij twijfel: Engels.

---

## 3. Aanbod
Eerste maand gratis + 50% korting op de eerste 3 maanden.

> **LET OP (open punt voor Michael):** de Shopify-listing geeft nu automatisch **3 dagen** proef
> (`trial_days = 3` in `shopify.app.toml`). De gratis maand + 50% wordt dus **niet** automatisch
> toegekend bij installatie. Daarom eindigt elke DM met een terugkoppel-code (`DRAPIT30`) zodat
> Michael de korting handmatig kan activeren. Wil je het automatisch? Dan moet `trial_days`
> naar 30 en moet de app opnieuw gedeployed worden - dat raakt het beschermde Shopify-pad en
> gebeurt alleen op expliciete opdracht.

Link: `https://apps.shopify.com/drapit-virtual-try-on`

---

## 4. Berichtsjablonen

Regels: 4-6 zinnen. Altijd 1 concreet detail uit hun profiel in de eerste zin. Nooit twee keer
dezelfde variant achter elkaar. Geen overdreven claims, geen verzonnen cijfers, geen
"honderden winkels gebruiken". Geen emoji-spam (maximaal 1).

### NL-A (liker/reageerder, kledingmerk)
> Hoi [naam], leuk dat je bij ons langskwam - ik zag dat je [concreet detail] doet.
> Wij bouwen Drapit: jouw klant uploadt een foto en ziet jouw kledingstuk direct aan zichzelf,
> gewoon op je productpagina. De AI houdt de pasvorm, stof en kleur van het echte item aan,
> dus het blijft jouw product en geen gegenereerd plaatje. De meeste winkels zetten het in om
> twijfel over de maat weg te nemen, want daar komt het grootste deel van de retouren vandaan.
> Ik geef je de eerste maand gratis + 50% op de eerste drie maanden: [link] - stuur me hier
> even "DRAPIT30" na het installeren, dan zet ik het op je account.

### NL-B (nieuwe volger, boutique/concept store)
> Hey [naam], bedankt voor de volg. Even kort wie we zijn: Drapit laat bezoekers van je webshop
> met een foto zien hoe een item hen staat, nog voordat ze bestellen. Het draait als
> Shopify-app op je productpagina, installatie is een kwestie van minuten en je hoeft geen
> nieuwe fotoshoot te doen - hij werkt op je bestaande productfoto's. Voor [merknaam] zet ik de
> eerste maand gratis + 50% op de eerste drie maanden klaar: [link]. Reageer met "DRAPIT30"
> zodra je hem hebt, dan activeer ik de korting.

### NL-C (webshop met veel maten/pasvormvragen)
> Hoi [naam], ik zag [concreet detail] voorbijkomen. Herkenbaar punt bij [type product]: mensen
> twijfelen over de maat en bestellen er dan twee. Drapit lost dat aan de voorkant op - klant
> uploadt een foto, ziet het item aan zichzelf en kiest bewuster. Het is een Shopify-app,
> werkt met je huidige productfoto's en je hoeft niets aan je thema te bouwen.
> Eerste maand gratis + 50% op de eerste drie maanden: [link], stuur me daarna "DRAPIT30".

### EN-A (liker/commenter, apparel brand)
> Hi [name], thanks for stopping by - saw you [concrete detail]. We build Drapit: your customer
> uploads one photo and sees your item on themselves, right on the product page. The AI keeps
> the actual fit, fabric and colour of the real garment, so it stays your product rather than a
> generated look-alike. Most shops use it to take the guesswork out of sizing, which is where
> most returns start. Happy to give you the first month free + 50% off the first three months:
> [link] - drop me "DRAPIT30" here once you install and I'll apply it.

### EN-B (new follower, boutique)
> Hey [name], thanks for the follow. Quick intro: Drapit lets shoppers see how a piece looks on
> them before they buy, running as a Shopify app on your product page. It works on the product
> photos you already have, so no new shoot and nothing to build into your theme. For [brand] I
> can set up the first month free + 50% off the first three months: [link]. Reply "DRAPIT30"
> after installing and I'll switch it on.

### EN-C (sizing/returns angle)
> Hi [name], noticed [concrete detail]. Sizing doubt is usually where returns start with
> [product type] - people order two sizes and send one back. Drapit fixes that earlier: the
> shopper uploads a photo, sees the item on themselves and picks with more confidence. Shopify
> app, works with your existing imagery, minutes to install. First month free + 50% off the
> first three months: [link], then send me "DRAPIT30".

---

## 5. Follow-ups

**Follow-up 1 - dag 3 na de eerste DM (alleen als er geen enkel antwoord kwam)**
> NL: Hoi [naam], korte reminder - het aanbod (eerste maand gratis + 50% op drie maanden) staat
> nog. Als je wil zie ik het je liever gewoon een keer doen dan uitleggen: stuur me een
> productfoto, dan maak ik er gratis een try-on van zodat je ziet hoe het eruitziet.
>
> EN: Hi [name], quick nudge - the offer (first month free + 50% off three months) still stands.
> If it helps, send me one product photo and I'll run a free try-on on it so you can see the
> result before deciding.

**Follow-up 2 - dag 8 na de eerste DM (alleen als er nog steeds niets kwam)**
> NL: Laatste bericht van mijn kant, [naam] - ik laat je verder met rust. Mocht virtueel passen
> later toch relevant worden: we staan in de Shopify App Store onder Drapit. Succes met [merk].
>
> EN: Last one from me, [name] - I'll leave it there. If virtual try-on becomes relevant later
> we're in the Shopify App Store as Drapit. Good luck with [brand].

**Stop direct met follow-ups** zodra iemand antwoordt, ongeacht wat het antwoord is.

---

## 6. Volume en veiligheid

Instagram beperkt accounts die te snel DM's sturen. Ritme:

| Periode | Per ronde (10:00 / 15:00) | Per dag |
|---|---|---|
| Dag 1-3 (opstartfase) | 8 | 16 |
| Dag 4-7 | 13 | 26 |
| Dag 8 en verder | 20-22 | 40-44 |

**Harde regels tijdens een ronde**
- Minimaal 30-60 seconden tussen twee DM's. Nooit twee berichten in dezelfde seconde.
- Nooit exact dezelfde tekst twee keer. Wissel variant en formulering.
- Maximaal 3 nieuwe gesprekken per aaneengesloten minuut.
- Verstuur nooit naar een account dat al in de tracker staat.

**Bij een blokkade** ("Actie geblokkeerd", "Probeer het later opnieuw", of een DM die niet
verstuurt): stop de ronde onmiddellijk, log het in de tracker, **halveer het quotum voor de
volgende drie rondes** en meld het aan Michael. Ga niet door met proberen.

**Doelgroep raakt op:** met 962 volgers is de volgerslijst na circa 3 weken op 40/dag
uitgeput. Daarna vult de ronde zich alleen nog met nieuwe volgers, likers en reageerders -
realistisch 5-15 per dag. Dat is normaal, geen fout. Verzin dan geen nieuwe doelgroep buiten
de lijst in sectie 1 zonder overleg.

---

## 7. Loggen
Elke verstuurde DM gaat direct in `instagram-dm/tracker.csv` (op deze machine) en wordt aan
het eind van de ronde naar de Google Sheet gespiegeld. Zie `TAAK.md` voor de exacte stappen.

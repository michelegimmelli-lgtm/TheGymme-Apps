# Flusso di distribuzione

**Aggiornamento:** 11 novembre 2026

## Ruolo della repository

`TheGymme-Apps` è la superficie pubblica delle applicazioni TheGymme. Ospita:

- homepage pubblica di download;
- GitHub Pages e pagine-ponte dei deep link;
- GitHub Releases con APK già firmate e verificate;
- eventuali checksum e rapporti tecnici allegati alle Release.

Il codice sorgente, le pipeline di build e le chiavi di firma rimangono nella repository privata `TheGymmeSoftware`.

## Architettura attuale

Il flusso è diviso in due repository:

1. **`TheGymmeSoftware` privata**: sviluppo, tag, build, firma, controlli e prima Release dell'APK.
2. **`TheGymme-Apps` pubblica**: pubblicazione degli APK destinati agli utenti e pagina di download.

Il trasferimento della Release verificata usa il workflow privato **Promote verified APK to public**, avviato con un clic indicando il tag esatto. L'aggiornamento dei pulsanti della homepage resta **automatico**.

> Creare soltanto un tag in `TheGymme-Apps` non compila alcuna APK: la build deve essere generata prima dalla pipeline privata.

## GitHub Pages

Il workflow `.github/workflows/pages.yml` viene eseguito a ogni push su `main`, quando riceve `repository_dispatch: apk-promoted` oppure tramite avvio manuale. Gli eventi intermedi di pubblicazione o modifica delle Release non avviano più Pages.

URL operativi:

- homepage: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/>;
- pagina-ponte Interval: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/interval-share/>.

Le modifiche a HTML, CSS o JavaScript richiedono un nuovo deploy Pages. Dopo la promozione di una nuova Release APK compatibile, il workflow privato richiede automaticamente un unico deploy della homepage, soltanto dopo aver verificato tutti gli asset pubblici.

### Struttura della homepage pubblica

Dal redesign del 21 ottobre 2026 la homepage non è soltanto un elenco di download, ma presenta l'ecosistema TheGymme attraverso:

- hero con schermate reali delle app;
- sezioni dedicate a Calculator, Ramping e Interval;
- spiegazione del flusso in tre passaggi;
- anticipazione del percorso REBUILD 8;
- richiamo discreto al coaching su Instagram;
- pulsanti APK ancora collegati dinamicamente alle Release pubbliche.

Gli screenshot usati dalla homepage sono conservati in `site/assets/`. Devono essere sostituiti quando l'interfaccia di un'app cambia in modo sostanziale, privilegiando sempre schermate reali della versione corrente. La modifica delle immagini non altera il meccanismo di selezione automatica delle APK.


La pagina pubblica presenta esplicitamente le build promosse come trial di 30 giorni e rimanda al contatto Instagram per il seguito. Le schede prodotto devono mantenere allineate le funzionalità mostrate: Calculator evidenzia le indicazioni per perdere grasso, Ramping mostra progressi, progressioni, massimali/Test 1RM e calcolo dischi, mentre Interval indica la condivisione delle routine.

La hero esprime il posizionamento del progetto con la frase **“Strumenti creati da chi si allena, per chi si allena.”**, traduzione operativa del payoff TheGymme “One of You, For You”.

## Come la homepage seleziona gli APK

Durante il deploy Pages, `.github/workflows/pages.yml` interroga le Release pubbliche tramite l'API GitHub. Per ciascuna app seleziona la Release più recente che:

- non sia una bozza;
- non sia una prerelease;
- abbia un tag che inizi con `calculator-`, `ramping-` oppure `interval-`;
- contenga un asset `.apk` con il nome dell'app nel filename.

Il workflow copia le tre APK in `site/downloads/` con nomi stabili e genera `site/downloads/releases.json`. La homepage legge questo manifest con cache disattivata e scarica il file diretto mostrando l'avanzamento. Se non esiste una Release compatibile, la card mostra **Non ancora disponibile**.

Poiché il prefisso è volutamente ampio, nella repository pubblica deve essere pubblicata soltanto la variante scelta per la distribuzione generale. In caso contrario, la homepage potrebbe agganciare la variante pubblicata più di recente anche se non è quella desiderata.

## Evidenze dei download

Le evidenze sono separate in due livelli.

### Contatore tecnico aggregato — predisposto, non attivo

**Stato al 11 novembre 2026: predisposto nel codice, ma non configurato né avviato.** La variabile GitHub `DOWNLOAD_COUNTER_ENDPOINT` è vuota: `site/assets/download-counter.js` resta intenzionalmente in modalità no-op e la pagina non invia richieste o dati a Cloudflare. Attualmente le sole evidenze disponibili sono quindi quelle GA4 degli utenti che accettano le statistiche.

Se verrà attivato, ogni download ricevuto interamente dal browser invierà al Worker Cloudflare un incremento contenente soltanto app, tag della Release, filename e byte ricevuti. Il database D1 conserverà totali aggregati per giorno, app e versione; il codice applicativo non vi scriverà cookie, IP, user-agent, identificatori del dispositivo o profili individuali. Un eventuale errore del Worker non bloccherà il download. L'osservabilità del Worker è predisposta come disattivata; resterà il trattamento tecnico di rete effettuato da Cloudflare per erogare e proteggere il servizio.

Il codice è in `counter-worker/`. L'endpoint amministrativo `GET /v1/totals` è protetto dal secret `ADMIN_TOKEN` e restituisce al massimo 1.000 righe aggregate.

Configurazione necessaria per l'eventuale attivazione:

1. creare in Cloudflare D1 il database `thegymme-download-counter`;
2. configurare i secret GitHub `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID` e `DOWNLOAD_COUNTER_ADMIN_TOKEN`;
3. eseguire **Deploy privacy-safe download counter**;
4. salvare l'URL del Worker nella variabile GitHub Actions `DOWNLOAD_COUNTER_ENDPOINT`;
5. rieseguire **Deploy TheGymme Apps Pages** e verificare `POST /v1/download-completed`.

### Google Analytics facoltativo

La homepage usa la proprietà GA4 **TheGymme Apps Public Hub**, stream web omonimo e Measurement ID `G-ZNZ9KWS69F`.

Il tag Google non viene caricato per impostazione predefinita. Alla prima visita la pagina chiede un consenso facoltativo; se viene negato, il download continua senza limitazioni e nessun evento Analytics viene inviato. La scelta resta nel browser e può essere modificata dal footer tramite **Gestisci statistiche**.

Con consenso attivo vengono registrati:

- la visualizzazione della pagina;
- l'evento personalizzato `apk_download_completed`, inviato soltanto dopo che lo stream HTTP dell'APK è stato letto interamente e il browser ha avviato il salvataggio locale;
- i parametri `app_name`, `release_tag`, `file_name` e `download_size_bytes`.

Non vengono inviati dati di allenamento, misurazioni corporee, e-mail, license key o altri dati interni alle app. La misurazione avanzata, Google Signals e la personalizzazione pubblicitaria sono disattivati. L'informativa è pubblicata in `site/privacy.html`.

### Lettura delle evidenze

In Google Analytics:

1. aprire la proprietà **TheGymme Apps Public Hub**;
2. usare **Reports → Realtime** per il controllo immediato;
3. verificare l'evento `apk_download_completed`;
4. usare i report Eventi per il totale nel periodo selezionato;
5. per analisi stabili per prodotto o versione, usare le dimensioni personalizzate con ambito evento già registrate: **App** (`app_name`) e **Release tag** (`release_tag`).

Nello stato attuale GA4 rappresenta un **download completato nel browser**, non l'installazione o il primo avvio su Android, e copre soltanto gli utenti consenzienti. Consenso negato, ad blocker, browser restrittivi o errori di rete possono causare sottostima. Se il contatore Cloudflare verrà attivato, aggiungerà la copertura aggregata generale senza sostituire GA4. In entrambi i casi si tratta di evidenze operative, non di dati contabili.

## Procedura con promozione controllata

Prerequisito una tantum: nella repository privata deve essere configurato il secret `THEGYMME_APPS_RELEASE_TOKEN`, contenente un fine-grained personal access token limitato a `TheGymme-Apps` con permesso **Contents: Read and write**.

Per pubblicare una Release:

1. Nella repository privata creare il tag corretto sul commit da distribuire.
2. Attendere il completamento del workflow di build, firma e verifica.
3. Verificare che la Release tecnica privata sia stata creata correttamente.
4. Aprire **Actions → Promote verified APK to public** nella repository privata.
5. Selezionare **Run workflow** e inserire il tag privato esatto.
6. Confermare l'avvio.
7. Il workflow rifiuta bozze, prerelease, tag non riconosciuti, Release senza i rapporti richiesti o con più di una APK.
8. Il workflow verifica `SHA256SUMS.txt` e crea o aggiorna la Release omonima in questa repository pubblica.
9. Il workflow verifica che la Release pubblica sia normale e contenga una sola APK.
10. Solo dopo la verifica invia `repository_dispatch: apk-promoted` alla repository pubblica.
11. Il workflow Pages viene eseguito su `main`, genera il manifest e pubblica le APK dirette.
12. Aprire la homepage pubblica e controllare versione e download.

La promozione della Release pubblica rende disponibile l'APK agli utenti. La semplice build privata o il solo tag pubblico non bastano. La scelta della variante resta intenzionale: nessuna build viene resa pubblica senza l'avvio del workflow di promozione.

Le ripromozioni di tag storici possono mostrare run `release` falliti o annullati perché quei tag conservano una versione precedente del workflow Pages. Sono eventi legacy non bloccanti: il run valido è quello `repository_dispatch` eseguito su `main`. I nuovi tag creati dopo l'aggiornamento non ereditano il vecchio trigger.

## Convenzioni dei tag

Sostituire `<app>` con `calculator`, `interval` o `ramping`.

| Edizione | Formato del tag | Accesso |
| --- | --- | --- |
| Controlled legacy | `<app>-apk-v<VERSIONE>-<versionCode>` | accesso Google/Supabase dove configurato |
| Standalone-LK | `<app>-standalone-lk-apk-v<VERSIONE>-<versionCode>` | e-mail e license key per dispositivo |
| Standalone No-LK temporanea | `<app>-standalone-no-lk-apk-v<VERSIONE>-<versionCode>-<giorni>d` | nessuna chiave, scadenza locale offline |
| Standalone No-LK lifetime | `<app>-standalone-no-lk-apk-v<VERSIONE>-<versionCode>-lt` | nessuna chiave, nessuna scadenza |

Il vecchio formato `<app>-standalone-apk-...` resta valido per le Release storiche già prodotte e conta nella progressione del `versionCode`, ma non deve essere usato per nuove build.

### Prossime Standalone-LK previste

```text
calculator-standalone-lk-apk-v2.3.1-1005
interval-standalone-lk-apk-v4.1.2-1010
ramping-standalone-lk-apk-v1.9.1-1003
```

Le No-LK temporanee e lifetime condividono package e firma per ciascuna app: passando da `-30d` o `-60d` a `-lt`, il `versionCode` deve continuare a crescere.

## Regole importanti

- Il tag nella repository privata determina l'edizione durante la build.
- Rinominare successivamente l'APK non cambia license key, durata o modalità lifetime.
- Non pubblicare come Release generale un'APK di test o una variante diversa da quella destinata agli utenti.
- Conservare il nome prodotto dalla pipeline: deve contenere `Calculator`, `Interval` o `Ramping` e terminare in `.apk`.
- Prima della pubblicazione verificare firma, package, versione e `versionCode`.
- Per sostituire la versione mostrata dalla homepage basta pubblicare una nuova Release compatibile più recente.

## Pagina-ponte Interval

`site/interval-share/index.html`:

1. legge il token dal frammento `#share`;
2. apre `com.thegymme.interval://load#share=...`;
3. mantiene il payload nel browser senza inviarlo a un server applicativo;
4. interroga le Release pubbliche;
5. propone il download della più recente APK Interval compatibile quando l'app non è installata.

La pagina-ponte e la homepage devono puntare alla stessa variante pubblica scelta per Interval. Dopo ogni nuova Release verificare anche l'apertura di un link condiviso su un dispositivo senza app installata.

## Checklist di verifica

Dopo ogni pubblicazione pubblica:

- [ ] la Release non è bozza o prerelease;
- [ ] il tag rispetta una convenzione corrente;
- [ ] l'APK appartiene all'edizione desiderata;
- [ ] il filename contiene il nome dell'app e termina in `.apk`;
- [ ] firma, package, versione e `versionCode` coincidono con la Release privata;
- [ ] la homepage mostra la nuova versione;
- [ ] il download restituisce l'APK corretta;
- [ ] con consenso attivo, Realtime riceve `apk_download_completed` con app e tag corretti;
- [ ] con consenso negato, il download funziona e Google Analytics non viene caricato;
- [ ] se il contatore Cloudflare viene attivato, con o senza consenso il totale aggregato D1 aumenta dopo un download completo;
- [ ] l'installazione o l'aggiornamento conserva i dati previsti;
- [ ] per Interval, il deep link e la pagina-ponte funzionano.

## Stato

Operativo:

- deploy GitHub Pages;
- homepage generale Calculator, Ramping e Interval;
- pagina-ponte e deep link Interval;
- rilevamento dinamico delle Release pubbliche;
- consenso analytics e conteggio GA4 dei download APK completati dagli utenti consenzienti;
- pipeline privata per Controlled legacy, Standalone-LK, No-LK temporanea e No-LK lifetime.

Operativo con intervento esplicito:

- scelta della variante pubblica predefinita per ogni app;
- avvio con un clic del workflow di promozione dalla repository privata;
- trasferimento verificato di APK, checksum e rapporti tecnici;
- verifica della pagina-ponte Interval con la variante pubblicata.

Predisposto ma non attivo:

- Worker Cloudflare e database D1 per il conteggio tecnico aggregato dei download;
- workflow di deploy del Worker e runtime config della homepage;
- attivazione rinviata fino alla valutazione dei dati GA4 e dell'effettivo tasso di consenso.

Possibile sviluppo futuro:

- manifest pubblico per notificare gli aggiornamenti dalle app installate.

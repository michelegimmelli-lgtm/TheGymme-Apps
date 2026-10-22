# Flusso di distribuzione

**Aggiornamento:** 22 ottobre 2026

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

Il workflow `.github/workflows/pages.yml` viene eseguito a ogni push su `main` e pubblica la cartella `site`.

URL operativi:

- homepage: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/>;
- pagina-ponte Interval: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/interval-share/>.

Le modifiche a HTML, CSS o JavaScript richiedono un nuovo deploy Pages. La pubblicazione di una nuova Release APK compatibile non richiede modifiche né un nuovo deploy della homepage.

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

`site/index.html` interroga le Release pubbliche tramite l'API GitHub. Per ciascuna app seleziona la Release più recente che:

- non sia una bozza;
- non sia una prerelease;
- abbia un tag che inizi con `calculator-`, `ramping-` oppure `interval-`;
- contenga un asset `.apk` con il nome dell'app nel filename.

Il pulsante viene collegato direttamente al `browser_download_url` dell'asset. Se non esiste una Release compatibile, la card mostra **Non ancora disponibile**.

Poiché il prefisso è volutamente ampio, nella repository pubblica deve essere pubblicata soltanto la variante scelta per la distribuzione generale. In caso contrario, la homepage potrebbe agganciare la variante pubblicata più di recente anche se non è quella desiderata.

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
10. Aprire la homepage pubblica e controllare versione e download.

La promozione della Release pubblica rende disponibile l'APK agli utenti. La semplice build privata o il solo tag pubblico non bastano. La scelta della variante resta intenzionale: nessuna build viene resa pubblica senza l'avvio del workflow di promozione.

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
calculator-standalone-lk-apk-v2.3.1-1004
interval-standalone-lk-apk-v4.1.2-1009
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
- [ ] l'installazione o l'aggiornamento conserva i dati previsti;
- [ ] per Interval, il deep link e la pagina-ponte funzionano.

## Stato

Operativo:

- deploy GitHub Pages;
- homepage generale Calculator, Ramping e Interval;
- pagina-ponte e deep link Interval;
- rilevamento dinamico delle Release pubbliche;
- pipeline privata per Controlled legacy, Standalone-LK, No-LK temporanea e No-LK lifetime.

Operativo con intervento esplicito:

- scelta della variante pubblica predefinita per ogni app;
- avvio con un clic del workflow di promozione dalla repository privata;
- trasferimento verificato di APK, checksum e rapporti tecnici;
- verifica della pagina-ponte Interval con la variante pubblicata.

Possibile sviluppo futuro:

- manifest pubblico per notificare gli aggiornamenti dalle app installate.

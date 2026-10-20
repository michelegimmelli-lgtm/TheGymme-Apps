# Flusso di distribuzione

**Aggiornamento:** 20 ottobre 2026

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

Il trasferimento dell'APK verificata dalla repository privata a quella pubblica è attualmente **manuale**. L'aggiornamento dei pulsanti della homepage è invece **automatico**.

> Creare soltanto un tag in `TheGymme-Apps` non compila alcuna APK: la build deve essere generata prima dalla pipeline privata.

## GitHub Pages

Il workflow `.github/workflows/pages.yml` viene eseguito a ogni push su `main` e pubblica la cartella `site`.

URL operativi:

- homepage: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/>;
- pagina-ponte Interval: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/interval-share/>.

Le modifiche a HTML, CSS o JavaScript richiedono un nuovo deploy Pages. La pubblicazione di una nuova Release APK compatibile non richiede modifiche né un nuovo deploy della homepage.

## Come la homepage seleziona gli APK

`site/index.html` interroga le Release pubbliche tramite l'API GitHub. Per ciascuna app seleziona la Release più recente che:

- non sia una bozza;
- non sia una prerelease;
- abbia un tag che inizi con `calculator-`, `ramping-` oppure `interval-`;
- contenga un asset `.apk` con il nome dell'app nel filename.

Il pulsante viene collegato direttamente al `browser_download_url` dell'asset. Se non esiste una Release compatibile, la card mostra **Non ancora disponibile**.

Poiché il prefisso è volutamente ampio, nella repository pubblica deve essere pubblicata soltanto la variante scelta per la distribuzione generale. In caso contrario, la homepage potrebbe agganciare la variante pubblicata più di recente anche se non è quella desiderata.

## Procedura manuale per pubblicare un APK

1. Nella repository privata creare il tag corretto sul commit da distribuire.
2. Attendere il completamento del workflow di build, firma e verifica.
3. Aprire la Release privata prodotta dal workflow.
4. Scaricare l'APK firmata e, se utili, checksum e metadati tecnici.
5. Nella repository pubblica aprire **Releases → Draft a new release**.
6. Creare il tag pubblico. È possibile riutilizzare lo stesso tag perché appartiene a una repository differente.
7. Usare un titolo leggibile, per esempio `TheGymme Interval 4.1.2 – build 1009 – Standalone-LK`.
8. Allegare l'APK senza rinominarla in modo ambiguo.
9. Pubblicare come Release normale: non bozza e non prerelease.
10. Aprire la homepage pubblica e verificare versione e download.

La pubblicazione della Release pubblica è il passaggio che rende disponibile l'APK agli utenti. Il solo tag pubblico non basta.

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

Da completare o mantenere manualmente:

- trasferimento delle APK verificate dalla repository privata alle Release pubbliche;
- scelta esplicita della variante pubblica predefinita per ogni app;
- verifica della pagina-ponte Interval con la variante pubblicata;
- eventuale automazione futura del trasferimento cross-repository;
- eventuale manifest pubblico per notificare gli aggiornamenti dalle app installate.

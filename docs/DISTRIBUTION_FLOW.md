# Flusso di distribuzione

## Ruolo della repository

`TheGymme-Apps` è la superficie pubblica delle applicazioni TheGymme. Non contiene il codice sorgente applicativo né le chiavi di firma. Ospita:

- la homepage pubblica di download;
- GitHub Pages e le pagine-ponte dei deep link;
- GitHub Releases pubbliche con APK già firmate e verificate;
- eventuali checksum e rapporti tecnici allegati alle Release.

Il codice, le pipeline di build e le chiavi di firma rimangono nella repository privata `TheGymmeSoftware`.

## Architettura attuale

Il flusso è diviso in due repository:

1. **`TheGymmeSoftware` privata**: sviluppo, tag, build, firma, controlli e prima Release dell'APK.
2. **`TheGymme-Apps` pubblica**: pubblicazione degli APK destinati agli utenti e pagina di download.

Il trasferimento dell'APK verificato dalla repository privata a quella pubblica è attualmente **manuale**. L'aggiornamento dei pulsanti della homepage è invece **automatico**.

## GitHub Pages

Il workflow `.github/workflows/pages.yml` viene eseguito a ogni push su `main` e pubblica la cartella `site`.

URL operativi:

- homepage: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/>;
- pagina-ponte Interval: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/interval-share/>.

Le modifiche a HTML, CSS o JavaScript richiedono un nuovo deploy Pages. La pubblicazione di una nuova Release APK compatibile, invece, non richiede modifiche né un nuovo deploy della homepage.

## Come la homepage seleziona gli APK

`site/index.html` interroga le Release pubbliche tramite l'API GitHub. Per ciascuna app seleziona la Release più recente che:

- non sia una bozza;
- non sia una prerelease;
- abbia un tag che inizi con `calculator-`, `ramping-` oppure `interval-`;
- contenga un asset `.apk` con il nome dell'app nel filename.

Il pulsante viene collegato direttamente a `browser_download_url` dell'asset. Se non esiste una Release compatibile, la card mostra **Non ancora disponibile**.

Poiché il prefisso è volutamente ampio, nella repository pubblica deve essere pubblicata soltanto la variante scelta per la distribuzione generale. In caso contrario, la homepage potrebbe agganciare la variante pubblicata più di recente anche se non è quella desiderata.

## Procedura manuale per pubblicare un APK

1. Nella repository privata creare il tag corretto.
2. Attendere il completamento del workflow di build, firma e verifica.
3. Aprire la Release privata prodotta dal workflow.
4. Scaricare l'APK firmata e, se utili alla distribuzione, checksum e metadati tecnici.
5. Nella repository pubblica aprire **Releases → Draft a new release**.
6. Creare il tag pubblico. È possibile riutilizzare lo stesso tag perché appartiene a una repository differente.
7. Usare un titolo leggibile, per esempio `TheGymme Interval 4.1.2 – build 1008`.
8. Allegare l'APK senza rinominarla in modo ambiguo.
9. Pubblicare come Release normale: non bozza e non prerelease.
10. Aprire la homepage pubblica e verificare versione e download.

### Esempio: Interval standalone con license key

Release privata attuale:

`interval-standalone-apk-v4.1.2-1008`

Asset:

`TheGymme-Interval-Standalone-4.1.2-1008-release.apk`

Pubblicando nella repository pubblica una Release normale con lo stesso tag e lo stesso APK, la card Interval viene aggiornata automaticamente.

## Convenzioni dei tag

Sostituire `<app>` con `calculator`, `interval` o `ramping`.

| Edizione | Formato del tag | Accesso |
| --- | --- | --- |
| Free | `<app>-apk-v<VERSIONE>-<versionCode>` | libero, senza scadenza |
| Standalone | `<app>-standalone-apk-v<VERSIONE>-<versionCode>` | license key per dispositivo |
| Standalone No-LK temporanea | `<app>-standalone-no-lk-apk-v<VERSIONE>-<versionCode>-<giorni>d` | nessuna chiave, scadenza offline |
| Standalone No-LK lifetime | `<app>-standalone-no-lk-apk-v<VERSIONE>-<versionCode>-lt` | nessuna chiave, nessuna scadenza |

Esempi Interval:

- `interval-apk-v4.1.2-1008`;
- `interval-standalone-apk-v4.1.2-1008`;
- `interval-standalone-no-lk-apk-v4.1.2-<versionCode>-30d`;
- `interval-standalone-no-lk-apk-v4.1.2-<versionCode>-lt`.

Il `versionCode` deve rispettare la progressione prevista per il package generato. Le edizioni No-LK temporanea e lifetime condividono package e firma: passando da `Nd` a `lt` il `versionCode` deve continuare a crescere.

## Regole importanti

- Il tag determina l'edizione durante la build: rinominare successivamente l'APK **non** cambia license key, durata o modalità lifetime.
- Non pubblicare come Release generale un'APK di test o una variante diversa da quella destinata agli utenti.
- Conservare il nome prodotto dalla pipeline: deve contenere `Calculator`, `Interval` o `Ramping` e terminare in `.apk`.
- Prima della pubblicazione verificare che firma, package, versione e `versionCode` siano quelli attesi.
- Per sostituire la versione mostrata dalla homepage basta pubblicare una nuova Release compatibile più recente.

## Pagina-ponte Interval

`site/interval-share/index.html`:

1. legge il token dal frammento `#share`;
2. apre `com.thegymme.interval://load#share=...`;
3. mantiene il payload nel browser senza inviarlo a un server applicativo;
4. interroga le Release pubbliche;
5. collega direttamente il download quando trova un tag `interval-apk-v*` con un asset `TheGymme-Interval-*-release.apk`.

La pagina-ponte conserva quindi, al momento, un filtro più stretto della homepage. Se la distribuzione pubblica scelta diventa Standalone o No-LK, questo filtro dovrà essere armonizzato.

## Checklist di verifica

Dopo ogni pubblicazione pubblica:

- [ ] la Release non è bozza o prerelease;
- [ ] il tag rispetta una convenzione supportata;
- [ ] l'APK appartiene all'edizione desiderata;
- [ ] il filename contiene il nome dell'app e termina in `.apk`;
- [ ] la homepage mostra la nuova versione;
- [ ] il download restituisce l'APK corretta;
- [ ] l'installazione o l'aggiornamento conserva i dati previsti.

## Stato

Operativo:

- deploy GitHub Pages;
- homepage generale Calculator, Ramping e Interval;
- pagina-ponte e deep link Interval;
- rilevamento dinamico delle Release pubbliche;
- tag Free, Standalone, No-LK temporanei e No-LK lifetime nella pipeline privata.

Da completare:

- pubblicazione iniziale delle tre APK nelle Release pubbliche;
- scelta esplicita della variante pubblica predefinita per ogni app;
- armonizzazione del filtro APK nella pagina-ponte Interval;
- eventuale trasferimento automatico delle Release verificate dalla repository privata;
- eventuale manifest per notificare gli aggiornamenti dalle app installate.

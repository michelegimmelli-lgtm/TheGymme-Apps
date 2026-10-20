# TheGymme-Apps

Repository pubblica ufficiale per la distribuzione delle applicazioni TheGymme.

Contiene GitHub Pages, pagina generale di download, pagine-ponte per i deep link e Release pubbliche delle APK già firmate e verificate. Il codice sorgente, le pipeline di build e le chiavi di firma restano nella repository privata `TheGymmeSoftware`.

## Pagine disponibili

- [Download TheGymme Apps](https://michelegimmelli-lgtm.github.io/TheGymme-Apps/)
- [Pagina-ponte TG Interval](https://michelegimmelli-lgtm.github.io/TheGymme-Apps/interval-share/)
- [GitHub Releases pubbliche](https://github.com/michelegimmelli-lgtm/TheGymme-Apps/releases)

La pagina principale rileva automaticamente gli APK più recenti pubblicati nelle Release compatibili. La pagina-ponte Interval richiede normalmente un parametro `#share` generato dall'app; se viene aperta direttamente, segnala che il collegamento della routine è incompleto.

## Flusso rapido di pubblicazione

1. Il tag viene creato nella repository privata `TheGymmeSoftware`.
2. La pipeline privata compila, firma e verifica l'APK.
3. L'APK risultante viene trasferita manualmente in una Release di questa repository pubblica.
4. La homepage rileva la nuova Release e aggiorna automaticamente il link di download.

Non serve modificare o ridistribuire la homepage per ogni nuova APK. La Release pubblica deve essere normale, non bozza o prerelease, e rispettare le convenzioni documentate.

Formati principali:

- `<app>-apk-v<VERSIONE>-<versionCode>`: controlled/legacy;
- `<app>-standalone-lk-apk-v<VERSIONE>-<versionCode>`: Standalone-LK con license key;
- `<app>-standalone-no-lk-apk-v<VERSIONE>-<versionCode>-<giorni>d`: No-LK temporanea;
- `<app>-standalone-no-lk-apk-v<VERSIONE>-<versionCode>-lt`: No-LK lifetime.

Il vecchio formato `<app>-standalone-apk-...` resta valido soltanto per le Release storiche già prodotte. Le nuove build con chiave richiedono `standalone-lk`. Rinominare un APK non ne modifica l'edizione: modalità di accesso e scadenza vengono determinate dal tag nella repository privata durante la build.

## Deploy del sito

Ogni push su `main` esegue `.github/workflows/pages.yml` e pubblica la cartella `site` su GitHub Pages.

Per architettura, procedura completa, regole sui tag, nomi degli APK e checklist di verifica consultare [docs/DISTRIBUTION_FLOW.md](docs/DISTRIBUTION_FLOW.md).

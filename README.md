# TheGymme-Apps

Repository pubblica ufficiale per la distribuzione delle applicazioni TheGymme.

Contiene GitHub Pages, pagina generale di download, pagine-ponte per i deep link e Release pubbliche delle APK già firmate e verificate. Il codice sorgente, le pipeline di build e le chiavi di firma restano nella repository privata `TheGymmeSoftware`.

## Pagine disponibili

- [Download TheGymme Apps](https://michelegimmelli-lgtm.github.io/TheGymme-Apps/)
- [Pagina-ponte TG Interval](https://michelegimmelli-lgtm.github.io/TheGymme-Apps/interval-share/)
- [GitHub Releases pubbliche](https://github.com/michelegimmelli-lgtm/TheGymme-Apps/releases)

La pagina principale e la pagina-ponte Interval scaricano gli APK direttamente dallo stesso dominio GitHub Pages. La pagina-ponte richiede normalmente un parametro `#share` generato dall'app; se viene aperta direttamente, segnala che il collegamento della routine è incompleto ma mantiene disponibile l'ultima APK Interval.

## Flusso rapido di pubblicazione

1. Il tag viene creato nella repository privata `TheGymmeSoftware`.
2. La pipeline privata compila, firma e verifica l'APK e crea la Release tecnica.
3. Dalla repository privata si avvia **Actions → Promote verified APK to public**, indicando il tag esatto.
4. Il workflow verifica APK, checksum e rapporti, quindi crea o aggiorna la Release pubblica.
5. La pubblicazione o modifica della Release avvia automaticamente il workflow Pages.
6. Il deploy seleziona le tre Release correnti, copia le APK nell'artefatto del sito e genera `site/downloads/releases.json`.
7. Homepage e pagina-ponte Interval usano il nuovo manifest e i download diretti dallo stesso dominio.

Non serve modificare manualmente la homepage per ogni nuova APK: il nuovo deploy Pages viene eseguito automaticamente. La Release pubblica deve essere normale, non bozza o prerelease, e rispettare le convenzioni documentate. La scelta della variante da promuovere resta esplicita: una build privata non viene resa pubblica automaticamente.

Durante il download la pagina mostra l'avanzamento. Il badge **NEW** è memorizzato per app e tag nel browser e scompare soltanto dopo che l'APK è stata ricevuta completamente; un errore o un'interruzione non la marca come scaricata. Il completamento del trasferimento non equivale all'installazione Android.

Formati principali:

- `<app>-apk-v<VERSIONE>-<versionCode>`: controlled/legacy;
- `<app>-standalone-lk-apk-v<VERSIONE>-<versionCode>`: Standalone-LK con license key;
- `<app>-standalone-no-lk-apk-v<VERSIONE>-<versionCode>-<giorni>d`: No-LK temporanea;
- `<app>-standalone-no-lk-apk-v<VERSIONE>-<versionCode>-lt`: No-LK lifetime.

Il vecchio formato `<app>-standalone-apk-...` resta valido soltanto per le Release storiche già prodotte. Le nuove build con chiave richiedono `standalone-lk`. Rinominare un APK non ne modifica l'edizione: modalità di accesso e scadenza vengono determinate dal tag nella repository privata durante la build.

## Deploy del sito

Ogni push su `main`, pubblicazione o modifica di una Release esegue `.github/workflows/pages.yml`. Il workflow prepara le APK dirette e il manifest, quindi pubblica l'intero artefatto su GitHub Pages.

Per architettura, procedura completa, regole sui tag, nomi degli APK e checklist di verifica consultare [docs/DISTRIBUTION_FLOW.md](docs/DISTRIBUTION_FLOW.md).

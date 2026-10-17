# TheGymme-Apps

Repository pubblica ufficiale per le applicazioni TheGymme.

Contiene GitHub Pages, pagine-ponte per i deep link e le future release pubbliche delle APK già firmate e verificate. Il codice sorgente e le chiavi di firma restano nella repository privata `TheGymmeSoftware`.

## Pagine disponibili

- [Pagina-ponte TG Interval](https://michelegimmelli-lgtm.github.io/TheGymme-Apps/interval-share/)
- [GitHub Releases pubbliche](https://github.com/michelegimmelli-lgtm/TheGymme-Apps/releases)

La pagina-ponte richiede normalmente un parametro `#share` generato dall'app. Se viene aperta direttamente, segnala che il collegamento della routine è incompleto.

## Deploy

Ogni push su `main` esegue `.github/workflows/pages.yml` e pubblica la cartella `site` su GitHub Pages. Le pagine possono rilevare dinamicamente nuove APK dalle Releases pubbliche, quindi una nuova release compatibile non richiede necessariamente una modifica dell'HTML.

Per architettura, stato e flusso operativo consultare [docs/DISTRIBUTION_FLOW.md](docs/DISTRIBUTION_FLOW.md).

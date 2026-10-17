# Flusso di distribuzione

## Ruolo della repository

`TheGymme-Apps` è la superficie pubblica delle applicazioni TheGymme. Non contiene il sorgente applicativo né chiavi di firma. Ospita:

- GitHub Pages;
- pagine-ponte per i deep link;
- futura homepage di download;
- GitHub Releases pubbliche con APK già firmate e verificate;
- checksum e rapporti tecnici allegati alle release.

Il codice e la firma delle APK rimangono nella repository privata `TheGymmeSoftware`.

## Deploy di GitHub Pages

Il workflow `.github/workflows/pages.yml` viene eseguito a ogni push su `main` e pubblica l'intera cartella `site`.

URL:

- radice futura: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/>;
- pagina-ponte Interval: <https://michelegimmelli-lgtm.github.io/TheGymme-Apps/interval-share/>.

Per aggiornare HTML, CSS o JavaScript si modifica il file corrispondente sotto `site/` e si esegue il push su `main`. L'URL pubblico resta invariato.

## Pagina-ponte Interval

`site/interval-share/index.html`:

1. legge il token dal frammento `#share`;
2. apre `com.thegymme.interval://load#share=...`;
3. lascia il payload nel browser, senza inviarlo a un server applicativo;
4. interroga le Releases di questa repository;
5. se trova una release `interval-apk-v*` con un asset `TheGymme-Interval-*-release.apk`, collega direttamente il pulsante di download all'APK.

Una nuova release compatibile viene rilevata senza modificare la pagina HTML.

## Stato

Operativo:

- deploy GitHub Pages;
- pagina-ponte Interval;
- deep link verso l'APK;
- rilevamento dinamico delle release pubbliche.

Da completare:

- homepage generale con Ramping, Interval e Calculator;
- pubblicazione delle APK nelle Releases pubbliche;
- trasferimento automatico delle release verificate dalla repository privata;
- eventuale manifest per notificare gli aggiornamenti dalle app installate.

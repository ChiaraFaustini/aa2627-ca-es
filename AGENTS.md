# Istruzioni per l'agente

Questo repository raccoglie le esercitazioni di uno studente del corso di **Computer Art** (Accademia di Belle Arti di Frosinone, AA 2026/27). Il progetto del secondo trimestre non sta qui: va in un repository che lo studente crea da sé, con il nome che preferisce.

## Lingua

Rispondere e scrivere in italiano, commenti nel codice compresi.

## Struttura e nomi delle cartelle

Nella radice stanno l'elenco dei lavori (`index.html`) e i file di servizio. Ogni attività ha la sua cartella, creata quando serve, con `index.html`, `sketch.js` e un `style.css` proprio: niente file condivisi fra le cartelle, perché ogni esercitazione ha bisogno di pochissimo stile e le conviene tenerlo per sé.

Nella cartella va anche `preview.png`, l'immagine del lavoro finito, che lo studente crea quando il lavoro è pronto: è l'anteprima nell'elenco dei lavori, cioè l'`index.html` della radice, che la cerca da solo in ogni cartella, e nella pagina delle revisioni del corso, ed è richiesta dalle specifiche di ogni attività. Finché manca, l'elenco mostra al suo posto un riquadro che lo dice. Il nome va scritto tutto in minuscolo: GitHub Pages distingue le maiuscole, e `Preview.png` nel lavoro pubblicato non si vedrebbe.

I nomi ammessi sono **`es1`, `es2`, …**, in minuscolo e senza spazi: sono gli stessi delle consegne sul sito, e su di essi si costruiscono sia l'indirizzo del lavoro pubblicato sia il collegamento con la consegna. Un nome diverso rompe tutte e due le cose.

Se lo studente chiede una cartella per il **progetto**, non crearla: spiegare in due righe che il progetto va in un repository suo, creato da lui con il nome che preferisce, e rimandarlo alla consegna del progetto sul sito del corso, `https://codestesie.it/aa2627/ca/attivita/progetto/`.

Lo studente però nominerà le cose a modo suo, e questo non deve bloccare il lavoro. Quando indica un'attività in un altro modo — «esercizio 2», «e2», «la seconda» — usare la forma standard e dirlo in una riga: «la cartella si chiama `es2`». Quando il nome non è riconoscibile o sembra provvisorio («es1 prova», «variante esercizio 1»), avvisare che l'indirizzo pubblico e il collegamento con la consegna non funzioneranno, e chiedere come procedere: la cartella si crea comunque, se lo studente conferma.

Lavorare solo nella cartella dell'attività in corso. Dell'`index.html` della radice si modifica soltanto l'elenco, per aggiungere una voce.

## Specifiche delle esercitazioni

Obiettivi, vincoli e modalità di ogni attività stanno sul sito del corso, a un indirizzo che segue sempre lo stesso schema:

```
https://codestesie.it/aa2627/ca/attivita/<cartella>/
```

dove `<cartella>` è il nome della cartella su cui si sta lavorando: `es1`, `es2`, …

- Prima di iniziare a lavorare in una cartella, leggere quella pagina: è la fonte delle specifiche, e va riletta se il lavoro va avanti in sessioni diverse.
- Se una richiesta dello studente contrasta con un vincolo della consegna, dirlo chiaramente, indicare quale vincolo è e proporre un'alternativa che lo rispetti. Non aggirarlo in silenzio.
- Se l'indirizzo non risponde, l'esercitazione non è ancora stata pubblicata: fermarsi e chiederlo allo studente invece di procedere a intuito.
- Se in cima alla pagina c'è l'avviso «Specifiche da definire», quelle pubblicate sono ancora le specifiche provvisorie: dirlo allo studente e consigliargli di aspettare la versione definitiva. Se vuole procedere lo stesso, ricordargli che il lavoro potrebbe non rispettare le specifiche definitive.
- Non riassumere le specifiche al posto dello studente: vanno lette da lui sul sito, per intero. Citarne un punto quando serve a spiegare una scelta o a segnalare un vincolo violato.
- Le specifiche valgono più delle istruzioni generali di questo file.

## Codice

- p5.js nella versione 2, caricata dal CDN nell'`index.html`.
- **Librerie.** Se le specifiche dell'attività richiedono delle librerie, vanno caricate nell'`index.html` subito dopo p5.js, con l'indirizzo e la versione indicati. Se le specifiche indicano una guida, leggerla prima di scrivere il codice che usa la libreria: vale più degli esempi trovati online, spesso scritti per versioni precedenti. Quando le specifiche non ne parlano, si può usare p5.sound.js, la libreria per l'audio che spesso si carica insieme a p5.js, se il lavoro lo richiede; lo stesso vale per le librerie elencate sul sito di p5.js (`https://p5js.org/libraries/`), purché funzionino con la versione 2, che l'elenco non indica. In questi casi basta dire in una riga quale libreria si aggiunge e perché. Le librerie che non sono in quell'elenco si aggiungono solo se lo studente è d'accordo.
- **p5.sound.js con p5.js 2** si usa nella versione 0.4.1, quella documentata sul sito di p5.js (`https://cdn.jsdelivr.net/npm/p5.sound@0.4.1/dist/p5.sound.min.js`): la precedente non si carica. È molto diversa, e quasi tutti gli esempi che si trovano online sono scritti per la precedente, quindi prima di scriverne il codice leggere la guida `https://codestesie.it/guide/p5sound-p5js2/`, che spiega anche come sostituire le funzioni che non ci sono più.
- Se lo studente scrive o incolla codice di p5.js 1 (per esempio con `preload()`, oppure copiato dalle slide del corso, che usano ancora la versione 1), adattarlo alla versione 2 e dire in una riga che cosa è cambiato.
- **`point()` non è affidabile nella versione 2.3.3** caricata dagli sketch: in Chrome perde buona parte dei punti con la coordinata x oltre 256, e nelle animazioni i punti sfarfallano. È un difetto noto di p5.js, corretto per una versione successiva. Se il codice usa `point()`, o lo si sta per usare, segnalarlo in una riga e proporre al suo posto `circle( x, y, 1 )`, o un cerchio un po' più grande.
- Codice semplice e leggibile, anche a costo di essere più lungo: lo studente deve poterlo capire e modificare da sé.
- I parametri numerici vanno in variabili dichiarate all'inizio del file, con un nome che dica che cosa fanno, non sparsi dentro le funzioni.
- Commenti brevi sulle scelte, non sulla sintassi: `// il rumore di Perlin dà uno spostamento continuo`, non `// ciclo for`.

## Modo di lavorare

- Prima di riscrivere molto codice, proporre la modifica e attendere conferma.
- L'iniziativa sulle scelte espressive è dello studente: non proporre elenchi di direzioni fra cui scegliere. Le domande riguardano **come deve funzionare** il programma (quale regola segue, che cosa cambia a ogni passo, quali numeri decidono il risultato), non che aspetto deve avere il risultato: la differenza è fra costruire un procedimento e ordinare un'immagine.
- Le modifiche semplici (numeri, colori, proporzioni) vanno lasciate a lui: indicare il punto del codice e invitarlo a metterci mano, tenendo l'assistenza per le parti complesse.
- Dopo ogni modifica, dire in una o due righe che cosa è cambiato e perché, così lo studente può seguire il lavoro.
- Se una richiesta è ambigua, chiedere invece di inventare: le esercitazioni hanno consegne precise.
- Non inserire dati personali nelle conversazioni con il modello.
- **Rispondere in modo asciutto.** Alla fine di un'operazione bastano il risultato e la prossima mossa: niente riepiloghi di quello che si è appena fatto, niente avvertenze ovvie o ripetute. Chi legge deve trovare il messaggio principale senza cercarlo.
- **Per leggere, cercare, elencare e modificare i file usare gli strumenti dell'agente**, non i comandi di shell come `ls`, `grep`, `cat`, `find`, `cp` o `rm`: gli strumenti non chiedono conferme, mentre ogni comando in più può diventare una domanda allo studente.
- **Il lavoro resta dentro questo repository.** OpenCode rifiuta i comandi che nominano percorsi esterni (`..`, percorsi assoluti, `~`, variabili come `$HOME`) o i file di configurazione: un rifiuto non va aggirato con altre forme dello stesso comando. Se serve un file che sta altrove, per esempio una fotografia nella cartella dei download, chiedere allo studente di trascinarlo nella cartella dell'esercitazione, nel pannello dei file di Visual Studio Code.
- **Non far usare il terminale allo studente.** Quello che l'agente non può fare si indica come operazione nell'interfaccia di Visual Studio Code: una cartella intera si cancella con `git rm -r` se è già nel repository, altrimenti dal pannello dei file, con il tasto destro. Un comando da incollare nel terminale si propone solo se non c'è altro modo, dicendo in una riga che cosa fa.
- **Un comando di shell per volta**, senza concatenarli con `&&` e senza cicli: ogni comando della catena viene controllato per conto suo, e basta che uno solo non sia fra quelli liberi perché la catena intera venga rifiutata o sottoposta allo studente, che fatica a leggerla e a valutarla.

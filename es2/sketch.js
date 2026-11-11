// E2. Forme autosimili
//
// Obiettivo: far generare una configurazione composta di elementi ripetuti
// (virtualmente) all'infinito e autosomiglianti a diversi rapporti di scala,
// usando una funzione ricorsiva.
//
// Vincoli, dalle specifiche:
// - canvas di almeno 1920x1080 pixel, oppure adattato alla finestra con
//   windowWidth, windowHeight, windowResized() e resizeCanvas();
// - codice organizzato come nello schema: parametri globali, funzione
//   ricorsiva, setupParametri(), setup(), draw() e mouseClicked();
// - funzione ricorsiva con il parametro livello, che cresce di 1 prima delle
//   autochiamate, e la variabile livelloMax, da almeno 2 in su, che ferma
//   comunque la ricorsione, anche quando la condizione ne contiene altre;
// - parametri impostati in setupParametri(), chiamata da setup() e a ogni
//   clic da mouseClicked(), con redraw() alla fine;
// - disegno eseguito una volta per ogni configurazione, con noLoop();
// - preview.png con una configurazione rappresentativa del risultato.

// PARAMETRI GLOBALI
let livelloMax;  // numero massimo di ricorsioni

// FUNZIONE RICORSIVA
// oltre a livello servono anche i parametri che descrivono l'elemento:
// posizione, dimensione, angolo...
function disegnaElemento( livello ) {
    // disegna qui l'elemento che si ripete

    livello++;
    // autochiamate: quante, e con quali parametri cambiati
    if (livello < livelloMax) {
        // disegnaElemento( ..., livello );
    }
}

// IMPOSTAZIONE PARAMETRI
function setupParametri() {
    // i valori della configurazione si scelgono qui, uno nuovo a ogni clic
    livelloMax = 2;  // da almeno 2 in su, ma non troppo: le esecuzioni raddoppiano a ogni livello
    redraw();
}

function setup() {
    createCanvas( 1920, 1080 );
    noLoop();
    cursor( HAND );
    setupParametri();
}

function draw() {
    background( 255 );
    // AVVIO RICORSIONE
    // disegnaElemento( ..., 0 );
}

function mouseClicked() {
    setupParametri();
}

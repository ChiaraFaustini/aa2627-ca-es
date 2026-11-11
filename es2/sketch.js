// E2. Forme autosimili — rete microvascolare
//
// Obiettivo dell'esercitazione: far generare una configurazione composta
// di elementi ripetuti (virtualmente) all'infinito e autosomiglianti a
// diversi rapporti di scala, usando una funzione ricorsiva.
//
// Direzione scelta: una sezione di tessuto attraversata da vasi sanguigni.
// Vasi principali si diramano in tratti sempre più corti e sottili; i punti
// campionati sui tratti vengono poi collegati dai capillari, che chiudono la
// rete. I percorsi serpeggiano — il rumore di Perlin li torce, nei vasi
// come nei capillari — e le biforcazioni non sono simmetriche: un ramo
// continua quasi dritto, gli altri piegano. Il sangue assorbe la luce:
// ogni vaso è una colonna scura dentro un tessuto più chiaro, con l'orlo
// della parete sottile che lascia passare un filo di luce e un riflesso
// bagnato che compare solo a tratti. Ogni vaso principale è più arteria o
// più vena, e sta a una profondità nel tessuto: i profondi si disegnano
// per primi e finiscono sotto un velo, così agli incroci chi sta in
// superficie passa sopra. Il tessuto ha una trama di rumore a due scale,
// che sta anche sopra la rete: i vasi ci sono dentro, non appoggiati
// sopra. La fotografia coglie un istante del battito: un'onda di pressione
// scende lungo i rami e li dilata, e ogni livello è un poco in ritardo sul
// padre — il movimento c'è, ma congelato nell'immagine. In chiusura gli
// artefatti della fotografia: sfocatura leggera, piano focale,
// vignettatura, grana. I toni carne e sangue sono una
// scelta scostata dalla traccia.
//
// Vincoli, dalle specifiche:
// - canvas di almeno 1920x1080 pixel, oppure adattato alla finestra;
// - codice organizzato come nello schema: parametri globali, funzione
//   ricorsiva, setupParametri(), setup(), draw() e mouseClicked();
// - funzione ricorsiva con il parametro livello, che cresce di 1 prima
//   delle autochiamate, e la variabile livelloMax, da almeno 2 in su,
//   che ferma comunque la ricorsione;
// - parametri impostati in setupParametri(), chiamata da setup() e a ogni
//   clic da mouseClicked(), con redraw() alla fine;
// - disegno eseguito una volta per ogni configurazione, con noLoop();
// - preview.png con una configurazione rappresentativa del risultato.

// PARAMETRI GLOBALI
// I nomi stanno qui; i valori si scelgono in setupParametri(), che li
// rigenera a ogni clic. Per provarne uno diverso si cambia là.

let livelloMax;             // numero massimo di ricorsioni: ferma comunque la ricorsione
let numeroVasiPrincipali;   // vasi da cui parte la crescita
let ramiMinimo;             // ramificazioni per tratto: minimo
let ramiMassimo;            // ramificazioni per tratto: massimo
let lunghezzaIniziale;      // lunghezza del primo tratto di vaso, in pixel
let spessoreIniziale;       // spessore del vaso principale, in pixel
let riduzioneLunghezza;     // lunghezza del ramo rispetto a quella del padre
let riduzioneSpessore;      // spessore del ramo rispetto a quello del padre
let angoloRamificazione;    // apertura media dei rami, in radianti
let irregolaritaCurva;      // piega massima di un tratto, in radianti
let campioniPerTratto;      // punti campionati su ogni tratto, per i capillari
let distanzaCollegamento;   // distanza massima fra punti da collegare, in pixel
let densitaCollegamenti;    // probabilità di ogni collegamento, da 0 a 1
let intensitaSfocatura;     // diffusione del colore intorno ai tratti, da 0 a 1
let sfocaturaObiettivo;     // sfocatura finale di tutta l'immagine, in pixel
let raggioFuoco;            // profondità di campo: dal centro, raggio nitido in pixel
let raggioFuoriFuoco;       // profondità di campo: da qui in poi, tutto sfocato
let sfocaturaFuoriFuoco;    // sfocatura applicata fuori dal piano focale, in pixel
let telaSfocata = null;     // copia della tela su cui costruire la sfocatura
let angoloLuce;             // direzione da cui arriva la luce, in gradi
let intensitaRilievo;       // quanto i vasi appaiono tubolari: ombre e riflessi
let luceX;                  // verso della luce, ricavato da angoloLuce
let luceY;
let intensitaTexture;       // grana della fotografia: variazione per pixel
let numeroMacchieSfondo;    // variazioni di colore sotto la rete
let numeroVelature;         // velature di tessuto sopra la rete
let intensitaVignettatura;  // ombra fotografica ai bordi del quadro, da 0 a 1
let ampiezzaSerpeggio;      // quanto i vasi serpeggiano: frazione della lunghezza
let frequenzaSerpeggio;     // quante oscillazioni lungo un tratto
let ampiezzaTramaGrossa;    // trama del tessuto: le macchie grandi, su 255
let scalaTramaGrossa;       // trama del tessuto: grandezza delle macchie grandi
let ampiezzaTramaFine;      // trama del tessuto: le macchioline fitte, su 255
let scalaTramaFine;         // trama del tessuto: grandezza delle macchioline
let veloTessuto;            // quanta trama sta sopra la rete: i vasi dentro il tessuto
let tramaGrossa = null;     // trame calcolate una volta: sopra e sotto la rete, la stessa
let tramaFine = null;
let ossigenazioneVaso;      // -1 vena cupa, +1 arteria viva: per vaso principale
let veloMembrana;            // velo fra i piani: alpha del tessuto sopra i vasi profondi
let riduzioneProfondita;     // quanto i vasi profondi nascono più piccoli e corti
let faseBattito = 0;         // l'istante del battito che la fotografia congela
let ampiezzaBattito;          // quanto il battito dilata i vasi: frazione del raggio
let ritardoBattito;           // il ritardo di ogni livello sul padre: l'onda scende

// Fermate del colore del sangue, dall'alto al basso: il vaso è una colonna
// scura dentro il tessuto chiaro, e scurisce scendendo in profondità
let fermateVasi = [
    [ 0.00, [206, 118, 102] ],   // sangue ossigenato, in superficie
    [ 0.50, [164,  66,  60] ],   // rosso pieno
    [ 1.00, [ 88,  24,  38] ],   // sangue venoso, profondo
];

// Fermate del gradiente dello sfondo, dall'alto al basso: toni di carne che
// affondano verso il sangue venoso scuro
let fermateSfondo = [
    [ 0.00, [255, 241, 232] ],   // avorio rosato
    [ 0.14, [250, 226, 212] ],   // carne chiara
    [ 0.28, [244, 205, 188] ],   // rosa carne
    [ 0.42, [236, 178, 158] ],   // salmone
    [ 0.55, [219, 145, 128] ],   // rosato carico
    [ 0.68, [192, 108, 100] ],   // sangue chiaro
    [ 0.80, [156,  72,  72] ],   // rosso mattone
    [ 0.90, [120,  45,  52] ],   // cremisi scuro
    [ 1.00, [ 96,  32,  42] ],   // bordeaux profondo
];

// punti campionati sui vasi: da questi nascono i capillari
let puntiRete = [];
let trattoCorrente = 0;   // numero che distingue i tratti l'uno dall'altro

// FUNZIONE RICORSIVA
// Un tratto di vaso: parte da (x, y) nella direzione angolo, serpeggia e si
// divide in rami più corti e più sottili, in modo asimmetrico.
function disegnaVaso( x, y, lunghezza, spessore, angolo, livello ) {
    // la direzione cambia in modo graduale lungo il tratto
    let angoloArrivo = angolo + random( -irregolaritaCurva, irregolaritaCurva );

    // il tratto è una curva Bézier: i punti di controllo stanno sulle
    // direzioni di partenza e di arrivo, a un terzo della lunghezza
    let xArrivo = x + cos( angoloArrivo ) * lunghezza;
    let yArrivo = y + sin( angoloArrivo ) * lunghezza;
    let controllo1x = x + cos( angolo ) * lunghezza / 3;
    let controllo1y = y + sin( angolo ) * lunghezza / 3;
    let controllo2x = xArrivo - cos( angoloArrivo ) * lunghezza / 3;
    let controllo2y = yArrivo - sin( angoloArrivo ) * lunghezza / 3;

    // il percorso vero: punti lungo la Bézier, spostati di lato dal rumore
    let punti = percorso( x, y, controllo1x, controllo1y,
                          controllo2x, controllo2y, xArrivo, yArrivo, lunghezza );
    let fine = punti[ punti.length - 1 ];

    // il colore scorre lungo il tratto: parte dal colore del punto di
    // partenza e arriva a quello del punto di arrivo
    trattoVaso( punti, spessore, coloreVaso( y ), coloreVaso( fine.y ), livello );

    // campiono alcuni punti del tratto: servono ai capillari
    trattoCorrente++;
    for (let c = 1; c <= campioniPerTratto; c++) {
        let p = punti[ round( c / (campioniPerTratto + 1) * (punti.length - 1) ) ];
        puntiRete.push( {
            x: p.x,
            y: p.y,
            spessore: spessore,
            tratto: trattoCorrente,
            indice: puntiRete.length,
            collegamenti: 0,
        } );
    }

    // autochiamate: ogni ramo è più corto, più sottile e orientato diverso
    livello++;
    if (livello < livelloMax) {
        let numeroRami = floor( random( ramiMinimo, ramiMassimo + 1 ) );
        // la direzione vera alla fine del percorso: da lì partono i rami
        let penultimo = punti[ punti.length - 2 ];
        let direzione = atan2( fine.y - penultimo.y, fine.x - penultimo.x );
        for (let i = 0; i < numeroRami; i++) {
            // il primo ramo continua quasi dritto, gli altri piegano forte,
            // a lati alterni: le biforcazioni vere non sono simmetriche
            let deviazione = i == 0
                ? random( -0.12, 0.12 )
                : ( i % 2 == 1 ? 1 : -1 ) * random( angoloRamificazione, angoloRamificazione * 1.8 );
            disegnaVaso( fine.x, fine.y,
                         lunghezza * riduzioneLunghezza * random( 0.85, 1.15 ),
                         spessore * riduzioneSpessore * random( 0.9, 1.05 ),
                         direzione + deviazione, livello );
        }
    }
}

// Il percorso di un tratto: punti lungo la Bézier di base, spostati di
// lato dal rumore di Perlin — i vasi veri serpeggiano, non corrono lisci.
// Lo spostamento è nullo alle estremità, perché ogni tratto deve cominciare
// esattamente dove il padre è finito.
function percorso( x1, y1, c1x, c1y, c2x, c2y, x2, y2, lunghezza ) {
    let punti = [];
    let numero = max( 6, round( lunghezza / 16 ) );   // un punto ogni ~16 pixel
    let seme = random( 1000 );                        // ogni tratto serpeggia a modo suo
    for (let i = 0; i <= numero; i++) {
        let t = i / numero;
        let px = bezierPoint( x1, c1x, c2x, x2, t );
        let py = bezierPoint( y1, c1y, c2y, y2, t );
        // tangente in quel punto: la perpendicolare è di lato
        let tx = bezierTangent( x1, c1x, c2x, x2, t );
        let ty = bezierTangent( y1, c1y, c2y, y2, t );
        let l = sqrt( tx * tx + ty * ty );
        let nx = -ty / l, ny = tx / l;
        // il rumore scorre lungo il tratto: lo spostamento è continuo
        let onda = ( noise( seme + t * frequenzaSerpeggio ) - 0.5 ) * 2;
        let spostamento = onda * ampiezzaSerpeggio * lunghezza * sin( PI * t );
        punti.push( { x: px + nx * spostamento, y: py + ny * spostamento } );
    }
    return punti;
}

// IMPOSTAZIONE PARAMETRI
function setupParametri() {
    livelloMax = 6;              // sei generazioni: i tratti crescono come 2,5 elevato al livello
    numeroVasiPrincipali = 7;
    ramiMinimo = 2;              // ogni tratto si divide in due o tre rami
    ramiMassimo = 3;
    lunghezzaIniziale = 380;     // pixel
    spessoreIniziale = 15;       // pixel
    riduzioneLunghezza = 0.74;   // ogni ramo è circa tre quarti del padre
    riduzioneSpessore = 0.70;    // il caso lo sposta un poco: non troppo uniforme
    angoloRamificazione = 0.55;  // radianti: piega minima dei rami laterali
    irregolaritaCurva = 0.45;    // radianti di piega massima per tratto
    ampiezzaSerpeggio = 0.15;    // frazione della lunghezza: il vaso oscilla
    frequenzaSerpeggio = 3;      // quante oscillazioni lungo un tratto
    campioniPerTratto = 3;
    distanzaCollegamento = 60;   // pixel
    densitaCollegamenti = 0.4;
    intensitaSfocatura = 0.8;
    sfocaturaObiettivo = 0.8;   // pixel: come un obiettivo non perfetto
    raggioFuoco = 430;          // pixel: dal centro resta a fuoco fino a qui
    raggioFuoriFuoco = 1000;    // pixel: da qui in poi è tutta sfocata
    sfocaturaFuoriFuoco = 3;    // pixel di sfocatura fuori dal piano focale
    angoloLuce = 205;            // gradi: la luce arriva dall'alto a sinistra
    intensitaRilievo = 1;        // 0 vasi piatti, 1 tubi in rilievo
    luceX = cos( radians( angoloLuce ) );
    luceY = sin( radians( angoloLuce ) );
    intensitaTexture = 4;        // su 255: grana molto delicata
    ampiezzaTramaGrossa = 90;    // su 255: le macchie grandi del tessuto
    scalaTramaGrossa = 26;       // in pixel della trama: quattro reali per uno
    ampiezzaTramaFine = 55;      // su 255: le macchioline fitte
    scalaTramaFine = 7;         // in pixel della trama
    veloTessuto = 0.5;           // quanta trama sta sopra la rete
    veloMembrana = 26;           // su 255: il velo che copre i vasi profondi
    riduzioneProfondita = 0.25;  // i vasi più profondi sono un quarto più piccoli
    ampiezzaBattito = 0.14;      // frazione del raggio: la dilatazione del battito
    ritardoBattito = 0.9;        // radianti di ritardo per livello: l'onda scende
    numeroMacchieSfondo = 14;    // poche: la trama fa il resto
    numeroVelature = 6;
    intensitaVignettatura = 0.8;
    redraw();
}

function setup() {
    createCanvas( 1920, 1080 );
    pixelDensity( 1 );   // la tela resta esattamente 1920x1080 anche sugli schermi raddoppiati
    noLoop();
    cursor( HAND );
    setupParametri();
}

function draw() {
    generaTrama();  // il tessuto ha una trama, prima ancora dello sfondo

    sfondo();   // il gradiente copre tutta la tela: è lo sfondo

    // AVVIO RICORSIONE
    puntiRete = [];
    trattoCorrente = 0;
    faseBattito = random( TWO_PI );   // l'istante del battito che questa fotografia coglie
    // ogni vaso principale nasce con un sangue proprio e una profondità
    // nel tessuto; i profondi si disegnano per primi e restano sotto il
    // velo: agli incroci, chi sta in superficie passa sopra
    let vasi = [];
    for (let v = 0; v < numeroVasiPrincipali; v++) {
        vasi.push( {
            x: random( 120, width - 120 ),
            y: random( 100, height - 100 ),
            angolo: random( TWO_PI ),
            ossigenazione: random( -1, 1 ),
            profondita: random( 1 ),   // 1 = molto profondo, 0 = in superficie
        } );
    }
    vasi.sort( ( a, b ) => b.profondita - a.profondita );
    for (let v = 0; v < vasi.length; v++) {
        ossigenazioneVaso = vasi[v].ossigenazione;
        // a metà fila passa il velo: separa il piano profondo dalla superficie
        if ( v == ceil( vasi.length / 2 ) ) membrana();
        // i vasi profondi nascono più piccoli: stanno più lontani
        let scala = 1 - riduzioneProfondita * vasi[v].profondita;
        disegnaVaso( vasi[v].x, vasi[v].y,
                     lunghezzaIniziale * scala, spessoreIniziale * scala,
                     vasi[v].angolo, 0 );
    }

    capillari();    // collegamenti laterali fra i rami vicini
    velature();     // un velo di tessuto sopra la rete
    // la stessa trama del tessuto, sopra la rete: i vasi ci stanno dentro
    tint( 255, veloTessuto * 255 );
    image( tramaFine, 0, 0, width, height );
    noTint();
    filter( BLUR, sfocaturaObiettivo ); // l'obiettivo non è perfetto: nessun bordo resta netto
    profonditaDiCampo(); // il piano focale: nitido al centro, perso ai bordi
    vignettatura(); // l'ombra della fotografia chiude i bordi
    grana();        // grana della fotografia
}

function mouseClicked() {
    setupParametri();
}

// Con "s" si esporta la tela così com'è, a 1920x1080: serve per preview.png
function keyPressed() {
    if ( key == 's' || key == 'S' ) saveCanvas( 'preview', 'png' );
}

// FUNZIONI DI SUPPORTO

// Un tratto di vaso reso come una colonna di sangue. Il sangue assorbe la
// luce: il vaso si vede perché è più scuro del tessuto, e il cuore della
// colonna è la parte più scura di tutte. L'orlo della parete sottile lascia
// passare un filo di luce, e un riflesso bagnato, stretto, compare solo a
// tratti. Il colore scorre da coloreInizio a coloreFine lungo il percorso.
// I tratti sottili restano fili appena accennati, persi nel tessuto.
// Il battito dilata il tratto secondo l'istante catturato: il ritardo per
// livello fa scendere l'onda di pressione lungo l'albero, e dove il vaso è
// pieno il sangue è un filo più chiaro e vivo.
function trattoVaso( punti, spessore, coloreInizio, coloreFine, livello ) {
    let ultimo = punti.length - 1;

    // l'onda di pressione: dove è arrivata, il vaso è dilatato e pieno
    let riempimento = ampiezzaBattito * sin( faseBattito - livello * ritardoBattito );
    // dove il battito ha riempito il vaso, il sangue schiarisce appena:
    // mescola con negativo scurisce, con positivo va verso il rosa vivo
    coloreInizio = mescola( coloreInizio, [255, 205, 195], riempimento );
    coloreFine = mescola( coloreFine, [255, 205, 195], riempimento );

    if ( spessore <= 2.2 ) {
        // tratto sottile: un alone tenue e un filo scuro, niente rilievo
        let colore = mescola( coloreInizio, coloreFine, 0.5 );
        noFill();
        strokeJoin( ROUND );
        strokeCap( ROUND );
        stroke( colore[0], colore[1], colore[2], 80 );
        strokeWeight( spessore * 2 * ( 1 + riempimento ) );
        beginShape();
        for (let i = 0; i <= ultimo; i++) vertex( punti[i].x, punti[i].y );
        endShape();
        stroke( colore[0], colore[1], colore[2], 160 );
        strokeWeight( spessore * ( 1 + riempimento ) );
        beginShape();
        for (let i = 0; i <= ultimo; i++) vertex( punti[i].x, punti[i].y );
        endShape();
        return;
    }

    noStroke();
    let raggioBase = spessore * 0.5 * ( 1 + riempimento );
    let raggioFine = raggioBase * riduzioneSpessore;   // il tubo finisce come il ramo che nasce
    // quanto il riflesso è presente alle estremità del tratto
    let respiroInizio = random( 0.1, 1 ), respiroFine = random( 0.1, 1 );

    for (let s = 0; s < ultimo; s++) {
        let a = punti[s], b = punti[s + 1];
        let dx = b.x - a.x, dy = b.y - a.y;
        let l = sqrt( dx * dx + dy * dy );
        if ( l == 0 ) continue;
        let nx = -dy / l, ny = dx / l;

        // il raggio cala verso la fine del tratto
        let rA = lerp( raggioBase, raggioFine, s / ultimo );
        let rB = lerp( raggioBase, raggioFine, (s + 1) / ultimo );
        // il primo tratto di un vaso nasce già sottile, non troncato
        if ( livello == 0 && s < ultimo * 0.3 ) {
            rA *= lerp( 0.45, 1, s / (ultimo * 0.3) );
            rB *= lerp( 0.45, 1, (s + 1) / (ultimo * 0.3) );
        }

        // il colore scorre lungo il tratto, con una variazione minuta
        let colore = mescola( coloreInizio, coloreFine, (s + 0.5) / ultimo );
        let scarto = random( -6, 6 );
        colore = [ colore[0] + scarto, colore[1] + scarto * 0.6, colore[2] + scarto * 0.4 ];
        let parete = mescola( colore, [255, 236, 228], 0.32 );  // la parete lascia passare la luce
        let cuore = scurisci( colore, 0.45 );                   // il sangue più denso, al centro
        // il riflesso respira lungo il tubo: la superficie è viva, non plastica
        let respiro = lerp( respiroInizio, respiroFine, (s + 0.5) / ultimo );
        // quanta luce riceve il fianco di questo segmento
        let quanto = intensitaRilievo * ( nx * luceX + ny * luceY );

        // il sangue traspare appena nel tessuto intorno alla colonna
        nastro( a, b, nx, ny, rA * 1.35 + 3 * intensitaSfocatura, rB * 1.35 + 3 * intensitaSfocatura,
                0, colore, 22 );
        // il solco nel tessuto, dal lato opposto alla luce
        nastro( a, b, nx, ny, rA * 1.25, rB * 1.25, -0.2 * quanto, scurisci( colore, 0.6 ), 40 );
        // l'orlo della parete sottile: chiaro, fa passare la luce
        nastro( a, b, nx, ny, rA * 1.06, rB * 1.06, 0, parete, 170 );
        // la colonna di sangue: scura e decisa
        nastro( a, b, nx, ny, rA * 0.82, rB * 0.82, 0, colore, 250 );
        // il cuore della colonna: il sangue più denso, se il vaso è largo
        if ( rA > 1.6 )
            nastro( a, b, nx, ny, rA * 0.42, rB * 0.42, 0, cuore, 130 );
        // il riflesso bagnato: stretto, dal lato della luce, solo a tratti
        if ( rA > 1 )
            nastro( a, b, nx, ny, max( rA * 0.15, 0.4 ), max( rB * 0.15, 0.4 ),
                    0.6 * quanto, [255, 238, 230], 120 * respiro );
    }
}

// Un pezzo di colonna: quadrilatero pieno da a a b, largo i due raggi, col
// centro spostato di una frazione del raggio lungo la normale. Lo
// spostamento è positivo verso la normale, negativo contro: chi chiama
// decide da che parte, secondo la luce
function nastro( a, b, nx, ny, raggioA, raggioB, spostamento, colore, alpha ) {
    fill( colore[0], colore[1], colore[2], alpha );
    quad( a.x + nx * raggioA * (1 + spostamento), a.y + ny * raggioA * (1 + spostamento),
          b.x + nx * raggioB * (1 + spostamento), b.y + ny * raggioB * (1 + spostamento),
          b.x - nx * raggioB * (1 - spostamento), b.y - ny * raggioB * (1 - spostamento),
          a.x - nx * raggioA * (1 - spostamento), a.y - ny * raggioA * (1 - spostamento) );
}

// Versione più scura di un colore
function scurisci( c, f ) {
    return [ c[0] * (1 - f), c[1] * (1 - f), c[2] * (1 - f) ];
}

// Colore del sangue a una certa altezza, spostato dall'ossigenazione del
// vaso: l'arteria è più rossa e viva, la vena più cupa e appena blu. Alla
// stessa altezza è sempre lo stesso colore: i tratti si innestano senza salti
function coloreVaso( y ) {
    let c = coloreAlleFermate( fermateVasi, constrain( y / height, 0, 1 ) );
    return [ c[0] + ossigenazioneVaso * 24,
             c[1] - ossigenazioneVaso * 12,
             c[2] - ossigenazioneVaso * 8 ];
}

// Capillari: collegano i punti campionati sui tratti vicini. Per non
// confrontare ogni punto con tutti, i punti stanno in una griglia di celle
// larghe quanto la distanza massima: ogni punto guarda solo nelle nove
// celle intorno alla sua.
function capillari() {
    let cella = distanzaCollegamento;
    let griglia = new Map();
    for (let i = 0; i < puntiRete.length; i++) {
        let p = puntiRete[i];
        let chiave = floor( p.x / cella ) + ',' + floor( p.y / cella );
        if ( !griglia.has( chiave ) ) griglia.set( chiave, [] );
        griglia.get( chiave ).push( p );
    }
    for (let i = 0; i < puntiRete.length; i++) {
        let p = puntiRete[i];
        if ( p.collegamenti >= 2 ) continue;   // al massimo due capillari per punto
        let gx = floor( p.x / cella ), gy = floor( p.y / cella );
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                let vicini = griglia.get( (gx + ox) + ',' + (gy + oy) );
                if ( !vicini ) continue;
                for (let v = 0; v < vicini.length; v++) {
                    let q = vicini[v];
                    if ( q.indice <= p.indice ) continue;    // ogni coppia una volta sola
                    if ( q.tratto == p.tratto ) continue;    // mai dentro lo stesso tratto
                    if ( q.collegamenti >= 2 ) continue;
                    let d = dist( p.x, p.y, q.x, q.y );
                    if ( d > 4 && d < distanzaCollegamento
                         && random() < densitaCollegamenti
                         && p.collegamenti < 2 ) {
                        capillare( p, q );
                        p.collegamenti++;
                        q.collegamenti++;
                    }
                }
            }
        }
    }
}

// Un capillare: serpeggia fra due punti come i vasi — lo stesso percorso a
// punti, con il rumore che lo torce — e resta un filo tenue, più chiaro
// dei vasi, perso nel tessuto
function capillare( p, q ) {
    let mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
    let dx = q.x - p.x, dy = q.y - p.y;
    let lunghezza = sqrt( dx * dx + dy * dy );
    let nx = -dy / lunghezza, ny = dx / lunghezza;   // perpendicolare
    let arco = random( -0.3, 0.3 ) * lunghezza;     // quanto il capillare piega
    let cx = mx + nx * arco, cy = my + ny * arco;
    // curva di base con il controllo raddoppiato: passa per percorso()
    let punti = percorso( p.x, p.y, cx, cy, cx, cy, q.x, q.y, lunghezza );
    let colore = mescola( coloreVaso( my ), [255, 235, 224], 0.45 );
    let spessore = max( 0.8, min( p.spessore, q.spessore ) * 0.55 );
    noFill();
    strokeJoin( ROUND );
    strokeCap( ROUND );
    stroke( colore[0], colore[1], colore[2], 20 + 25 * intensitaSfocatura );
    strokeWeight( spessore + 4 * intensitaSfocatura );
    beginShape();
    for (let i = 0; i < punti.length; i++) vertex( punti[i].x, punti[i].y );
    endShape();
    stroke( colore[0], colore[1], colore[2], 150 );
    strokeWeight( spessore );
    beginShape();
    for (let i = 0; i < punti.length; i++) vertex( punti[i].x, punti[i].y );
    endShape();
}

// Sfondo: gradiente verticale riga per riga, qualche macchia grande di
// variazione, e la trama del tessuto a due scale
function sfondo() {
    noStroke();
    for (let y = 0; y < height; y++) {
        let c = coloreSfondo( y / height );
        fill( c[0], c[1], c[2] );
        rect( 0, y, width, 1 );
    }
    for (let m = 0; m < numeroMacchieSfondo; m++) {
        let y = random( height );
        let c = coloreSfondo( y / height );
        let scarto = random( -28, 28 );
        macchia( random( width ), y, random( 200, 520 ),
                 [ c[0] + scarto, c[1] + scarto * 0.85, c[2] + scarto * 0.8 ],
                 random( 0.05, 0.11 ), random( 0.35, 0.9 ) );
    }
    image( tramaGrossa, 0, 0, width, height );
    image( tramaFine, 0, 0, width, height );
}

// Colore a una certa quota fra le fermate: lo usano lo sfondo e i vasi
function coloreAlleFermate( fermate, f ) {
    for (let i = 0; i < fermate.length - 1; i++) {
        let da = fermate[i], a = fermate[i + 1];
        if ( f <= a[0] ) return mescola( da[1], a[1], (f - da[0]) / (a[0] - da[0]) );
    }
    return fermate[fermate.length - 1][1];
}

// Colore del gradiente dello sfondo a una certa altezza
function coloreSfondo( f ) {
    return coloreAlleFermate( fermateSfondo, f );
}

// La trama del tessuto, generata una volta per configurazione: due tele di
// rumore, una a macchie grandi e una a macchioline fitte
function generaTrama() {
    tramaGrossa = telaTrama( scalaTramaGrossa, ampiezzaTramaGrossa, 10 );
    tramaFine = telaTrama( scalaTramaFine, ampiezzaTramaFine, 60 );
}

// Una tela di trama: rumore di Perlin campionato su una tela quattro volte
// più piccola della finestra e poi ingrandita — dove il rumore è alto il
// sangue affiora e scurisce, dove è basso il tessuto è più chiaro e grasso
function telaTrama( scala, ampiezza, seme ) {
    let g = createGraphics( floor( width / 4 ), floor( height / 4 ) );
    g.pixelDensity( 1 );
    g.loadPixels();
    for (let y = 0; y < g.height; y++) {
        for (let x = 0; x < g.width; x++) {
            let n = noise( x / scala, y / scala, seme );
            let i = ( y * g.width + x ) * 4;
            if ( n > 0.5 ) {
                g.pixels[i] = 74;
                g.pixels[i + 1] = 20;
                g.pixels[i + 2] = 26;
                g.pixels[i + 3] = ( n - 0.5 ) * 2 * ampiezza;
            } else {
                g.pixels[i] = 255;
                g.pixels[i + 1] = 240;
                g.pixels[i + 2] = 232;
                g.pixels[i + 3] = ( 0.5 - n ) * 2 * ampiezza * 0.75;
            }
        }
    }
    g.updatePixels();
    return g;
}

// Una macchia morbida ed ellittica: nel tessuto le variazioni sono
// allungate e orientate in tutte le direzioni, non bolle rotonde.
// Il gradiente è centrato su (0,0) e la trasformazione lo porta al suo
// posto: prima lo sposta, poi lo ruota e lo schiaccia.
function macchia( cx, cy, raggio, colore, trasparenza, allungamento ) {
    let rosso = floor( colore[0] ), verde = floor( colore[1] ), blu = floor( colore[2] );
    let da = 'rgba(' + rosso + ',' + verde + ',' + blu + ',' + trasparenza + ')';
    let a = 'rgba(' + rosso + ',' + verde + ',' + blu + ',0)';
    let gradiente = drawingContext.createRadialGradient( 0, 0, 0, 0, 0, raggio );
    gradiente.addColorStop( 0, da );
    gradiente.addColorStop( 1, a );
    drawingContext.save();
    drawingContext.translate( cx, cy );
    drawingContext.rotate( random( TWO_PI ) );
    drawingContext.scale( 1, allungamento );
    drawingContext.fillStyle = gradiente;
    drawingContext.fillRect( -raggio, -raggio, raggio * 2, raggio * 2 );
    drawingContext.restore();
}

// Vignettatura: nella fotografia macro i bordi cadono nell'ombra, e il
// centro sembra immerso nel corpo
function vignettatura() {
    let centro = 'rgba(60,18,24,0)';
    let bordo = 'rgba(60,18,24,' + 0.45 * intensitaVignettatura + ')';
    let interno = min( width, height ) * 0.42;
    let esterno = max( width, height ) * 0.72;
    let gradiente = drawingContext.createRadialGradient( width / 2, height / 2, interno,
                                                          width / 2, height / 2, esterno );
    gradiente.addColorStop( 0, centro );
    gradiente.addColorStop( 1, bordo );
    drawingContext.fillStyle = gradiente;
    drawingContext.fillRect( 0, 0, width, height );
}

// Profondità di campo: una copia sfocata dell'immagine viene mascherata con
// un gradiente radiale e sovrapposta alla tela — dentro il cerchio a fuoco
// svanisce, fuori resta: il centro è nitido, i bordi si perdono, come in una
// fotografia con un piano focale
function profonditaDiCampo() {
    if ( telaSfocata == null ) {
        telaSfocata = createGraphics( width, height );
        telaSfocata.pixelDensity( 1 );
    }
    let contesto = telaSfocata.drawingContext;
    contesto.clearRect( 0, 0, width, height );
    // copia della tela, sfocata quanto l'obiettivo fuori fuoco
    contesto.filter = 'blur(' + sfocaturaFuoriFuoco + 'px)';
    contesto.drawImage( drawingContext.canvas, 0, 0 );
    contesto.filter = 'none';
    // la copia resta visibile solo fuori dal cerchio a fuoco
    contesto.globalCompositeOperation = 'destination-in';
    let maschera = contesto.createRadialGradient( width / 2, height / 2, raggioFuoco,
                                                  width / 2, height / 2, raggioFuoriFuoco );
    maschera.addColorStop( 0, 'rgba(0,0,0,0)' );
    maschera.addColorStop( 1, 'rgba(0,0,0,1)' );
    contesto.fillStyle = maschera;
    contesto.fillRect( 0, 0, width, height );
    contesto.globalCompositeOperation = 'source-over';
    // la copia mascherata copre la tela nitida ai bordi
    drawingContext.drawImage( contesto.canvas, 0, 0 );
}

// La membrana fra i piani di profondità: uno strato di tessuto, riga per
// riga col colore dello sfondo, più un po' di trama fine. I vasi disegnati
// prima finiscono sotto e si intravedono, come dietro un velo bagnato
function membrana() {
    noStroke();
    for (let y = 0; y < height; y++) {
        let c = coloreSfondo( y / height );
        fill( c[0], c[1], c[2], veloMembrana );
        rect( 0, y, width, 1 );
    }
    tint( 255, 128 );
    image( tramaFine, 0, 0, width, height );
    noTint();
}

// Velature sopra la rete: il tessuto copre in parte i vasi, che così non
// sembrano sovrapposti come in un disegno vettoriale
function velature() {
    for (let m = 0; m < numeroVelature; m++) {
        let y = random( height );
        let c = coloreSfondo( y / height );
        let scarto = random( -18, 18 );
        macchia( random( width ), y, random( 260, 560 ),
                 [ c[0] + scarto, c[1] + scarto, c[2] + scarto ],
                 random( 0.04, 0.09 ), random( 0.3, 0.7 ) );
    }
}

// Grana della fotografia: una variazione minuta, uguale sui tre canali
function grana() {
    loadPixels();
    for (let i = 0; i < pixels.length; i += 4) {
        let granello = random( -intensitaTexture, intensitaTexture );
        pixels[i] += granello;
        pixels[i + 1] += granello;
        pixels[i + 2] += granello;
    }
    updatePixels();
}

// Mescola due colori [rosso, verde, blu]
function mescola( a, b, f ) {
    return [ lerp( a[0], b[0], f ), lerp( a[1], b[1], f ), lerp( a[2], b[2], f ) ];
}

// Creatura: VORAGO, entita incorporea: una sagoma scura e sfumata che
// cammina su molte zampe sottili, di cui si vedono solo due occhi luminosi.
//
// Stato interno: hunger e growth.
// La fame sale in fretta e cala poco dopo ogni ingestione, quindi la creatura
// e quasi sempre a caccia.
// La crescita ingrandisce la sagoma e allunga le zampe.
// Sotto la soglia di fame vaga indifferente, sopra caccia, e oltre la
// soglia di frenesia diventa aggressiva: scatti e occhi che sfavillano.
//
// Interazione: la creatura percepisce il cursore come una luce, la segue
// con lo sguardo, la insegue e la avvolge con le zampe. Dopo ogni ingestione
// digerisce, ma per poco: torna presto a caccia, perche non e mai sazia.
//
// Regole: il corpo si muove con accelerazione e molta inerzia, quindi curva
// largo e rallenta prima di girare, e si allunga lungo il moto. In caccia non
// punta dove la luce e, ma dove sta andando: la anticipa e le taglia la
// strada. Da vicino non si butta subito addosso: prima striscia piano e ogni
// tanto scatta, con un ritmo che non si puo prevedere. Le zampe sono
// una decina, sfasate fra loro, e si allungano e ritirano a turno: il passo
// avanza con lo spostamento, quindi camminano quando si muove e si fermano
// quando sta ferma. Ogni zampa segue con un ritardo suo. La sagoma e una
// nuvola di puntini, come la grana del fondo: si increspa con onde lente, i
// punti tremano a ogni fotogramma e si diradano verso il bordo, quindi non
// c'e un contorno netto, e la massa si mescola al fondo. Attorno alla massa si
// allarga un alone di buio: l'ombra divora la luce intorno a se, e piu e
// affamata piu ne consuma. Gli occhi restano nitidi e seguono il cursore.

const PARAMETRI = {
  raggioCorpo: 92,
  velocitaRiposo: 24,
  velocitaMinimaCaccia: 55,
  velocitaMassimaCaccia: 190,
  // meno accelerazione: curva largo e con inerzia, invece di scattare
  accelerazioneCaccia: 1.5,
  // in frenesia corre di piu, accelera di piu e punta meno dritto
  velocitaFrenesia: 1.35,
  accelerazioneFrenesia: 1.15,
  oscillazioneFrenesia: 2.4,
  sogliaIngestione: 34,
  durataIngestione: 1250,
  // la digestione e breve: dopo un pasto torna presto a caccia
  durataDigestione: 1600,
  // l'inseguimento: la creatura non punta dove la luce e, ma dove sta andando.
  // `previsioneInseguimento` e quanto avanti la guarda, in secondi, e
  // `anticipoMassimo` il limite in pixel, perche con la luce che corre non
  // finisca a puntare fuori dallo schermo
  previsioneInseguimento: 0.3,
  anticipoMassimo: 240,
  // l'agguato: sotto questa distanza la creatura non si butta addosso, prima
  // striscia piano e ogni tanto scatta. Il ritmo viene da noise, quindi il
  // momento dello scatto non si puo prevedere
  distanzaAgguato: 240,
  velocitaAgguatoLenta: 0.3,
  velocitaRitmoAgguato: 0.6,
  scattoAgguato: 2.5,
  // come si stima il movimento della luce: piu alto, piu la stima e pronta,
  // ma piu trema
  lisciaturaVelocitaLuce: 12,
  // la luce disegnata al posto del cursore: e quello che la creatura insegue
  diametroLuce: 24,
  crescitaLuceConFame: 0.6,
  pulsazioneLuce: 0.08,
  pulsazioneLuceConFame: 0.14,
  // la luce e fatta di tre chiazze sovrapposte, sempre piu larghe e sempre piu
  // tenui: il nucleo bianco, il corpo colorato e l'alone che si spande
  // lontano. E l'alone largo a far leggere la luce come qualcosa che illumina
  // lo spazio intorno, invece di un dischetto chiaro. Le misure sono in
  // diametri della luce: quanto e larga, quanto e intensa al centro (0-255) e
  // quanto e raccolta la sua caduta
  ampiezzaNucleoLuce: 1.1,
  opacitaNucleoLuce: 255,
  cadutaNucleoLuce: 2.2,
  ampiezzaCorpoLuce: 2.2,
  opacitaCorpoLuce: 140,
  cadutaCorpoLuce: 1.8,
  ampiezzaAloneLuce: 5.5,
  opacitaAloneLuce: 55,
  cadutaAloneLuce: 1.5,
  crescitaFame: 5.5,
  fameConsumata: 14,
  sogliaFameCaccia: 30,
  // oltre questa fame la creatura entra in frenesia
  sogliaFrenesia: 68,
  crescitaPerPasto: 0.12,
  crescitaMassima: 1.6,
  margineSchermo: 14,
  velocitaPulsazioneMinima: 1.1,
  velocitaPulsazioneMassima: 2.8,
  famePerPulsazione: 0.045,
  // quanto il corpo resta indietro mentre si sposta
  trascinamentoCorpo: 0.08,
  // di quanto la sagoma si allunga lungo il moto: a questa velocita
  // l'allungamento e gia al massimo
  velocitaAllungamento: 180,
  allungamentoMassimo: 0.24,
  // quanto e larga la creatura rispetto al raggio del corpo, zampe comprese:
  // serve a tenerla dentro lo schermo
  raggioEstensione: 2.0,

  // la sagoma: una nuvola di puntini, piu fitti al centro e via via piu radi
  // verso il bordo. Non c'e un contorno da ammorbidire: la massa finisce dove
  // i punti si diradano, come la grana del fondo
  puntiSagoma: 700,
  // quanto e larga la nuvola rispetto al raggio del corpo
  raggioSagoma: 1.0,
  // diametro di ogni punto, sempre rispetto al raggio del corpo
  diametroPuntoSagoma: 0.07,
  opacitaSagoma: 110,
  // quanto in fretta i punti si diradano verso il bordo: piu alto, piu il
  // bordo della massa si dissolve nel fondo
  cadutaSagoma: 1.0,
  // di quanto i punti si stringono verso il centro: piu alto, piu il corpo
  // ha un nucleo denso e un bordo rado
  concentrazioneSagoma: 0.75,
  // di quanto trema ogni punto a ogni fotogramma, sempre rispetto al raggio
  // del corpo: e questo che fa brillare la nuvola come grana di pellicola
  tremolioSagoma: 0.02,
  // il nucleo: un'ombra piena al centro, sotto i puntini, perche la massa
  // non resti troppo trasparente
  opacitaNucleoSagoma: 110,
  diametroNucleoSagoma: 0.8,
  // la sfocatura che impasta i puntini fra loro e con il fondo. Bassa, cosi
  // i puntini restano distinguibili: piu alta, piu la nuvola diventa una
  // massa continua, e piu il tremolio dei punti si perde
  sfocaturaOmbra: 5,
  // ampiezza e velocita con cui la sagoma si increspa
  deformazioneSagoma: 0.28,
  ondeSagoma: 3,
  velocitaOndaSagoma: 0.5,
  deformazioneConVelocita: 0.006,

  // la penombra: attorno alla massa si allarga un alone di buio, come se
  // l'ombra succhiasse la luce intorno a se. E questa che la fa leggere sul
  // fondo, invece di lasciare la creatura confusa nel nero
  // quanto e larga la penombra rispetto al raggio del corpo
  raggioPenombra: 2.4,
  // quanto e scura al centro, sotto il corpo, da 0 a 255, e che forma ha la
  // sua caduta: sotto 1 il buio resta pieno sotto la massa e si dirada tardi,
  // come un'ombra che ha corpo
  opacitaPenombra: 70,
  cadutaPenombra: 0.7,
  // quanto la fame allarga la penombra: un'ombra affamata divora piu luce
  famePenombra: 0.5,

  // le zampe: la sagoma allunga e ritira zampe sottili che la spostano.
  // Sono una decina e non sono simmetriche: non devono leggersi come le
  // otto zampe di un ragno
  numeroZampe: 20,
  puntiZampa: 12,
  // ogni campione della zampa e un gruppetto di puntini sparsi attorno alla
  // linea, come la sagoma: la zampa non e un tubo liscio
  puntiPerZampa: 3,
  dimensionePuntoZampa: 0.6,
  // lunghezza e spessore rispetto al raggio del corpo
  lunghezzaZampa: 0.85,
  crescitaZampe: 0.3,
  spessoreZampa: 0.05,
  opacitaZampa: 90,
  // la radice sta dentro la sagoma, cosi la zampa sembra uscire dalla massa
  raggioRadiceZampa: 0.32,
  // l'oscillazione del passo e la velocita con cui avanza
  ampiezzaPasso: 0.3,
  passiPerVelocita: 0.06,
  velocitaPassoLento: 0.5,
  // la base di ogni zampa vaga lentamente attorno al corpo
  derivaZampa: 0.4,
  velocitaDerivaZampa: 0.1,
  // quanto una zampa resta indietro quando il corpo si sposta: troppo, e la
  // radice esce dalla sagoma e la zampa sembra staccata
  trascinamentoZampa: 0.035,
  // quando caccia, le zampe si protendono verso il cursore
  protensioneCaccia: 0.55,

  // gli occhi: due punti luminosi che seguono il cursore
  diametroOcchio: 0.036,
  distanzaOcchi: 0.42,
  altezzaOcchi: 0.22,
  ampiezzaSguardo: 0.07,
  luminositaOcchi: 1.0,
  // l'alone attorno a ogni occhio: quanto e largo, in diametri dell'occhio,
  // quanto e intenso al centro (0-255) e quanto e raccolto il suo chiarore
  aloneOcchio: 3.4,
  opacitaAloneOcchio: 150,
  cadutaAloneOcchio: 2,

  // lo sfondo: sfumatura verticale, luce soffusa dall'alto e grana.
  // Attenzione al contrasto: la creatura e quasi nera, quindi si vede solo se
  // il fondo resta un po' piu chiaro di lei. Se lo sfondo diventa nero pieno,
  // l'ombra sparisce dentro
  // quanto e largo il fascio di luce dall'alto, in frazione della dimensione
  // maggiore della finestra
  raggioLuce: 0.6,
  // perche l'ombra abbia qualcosa da mangiare, ci vuole luce: quanto e
  // intensa al centro del fascio (0-255) e quanto e raccolta
  opacitaLuce: 90,
  cadutaLuce: 2.2,
  // la vignettatura: gli angoli si spengono, cosi la scena ha un centro
  // illuminato e un fuori buio, invece di essere uniforme. `inizioVignetta` e
  // dove comincia a scurire (0 al centro, 1 agli angoli)
  inizioVignetta: 0.35,
  opacitaVignetta: 80,
  // la grana: fotogrammi di rumore preparati all'avvio, che si alternano a
  // ogni fotogramma. E la grana di una pellicola, pixel per pixel, non
  // puntini disegnati a mano
  numeroGranaFrames: 5,
  granaScala: 2,
  granaChiarore: 190,
  opacitaGrana: 40,
};

const COLORI = {
  fondoAlto: [30, 30, 37],
  fondoBasso: [3, 3, 4],
  alone: [176, 186, 208],
  sagoma: [3, 3, 4],
  occhio: [255, 255, 255],
  // la luce del cursore: un bianco caldo, con l'alone arancione. Il fondo e
  // freddo e azzurrognolo, quindi una luce calda si stacca subito e sembra
  // accesa davvero
  luce: [255, 243, 214],
  aloneLuce: [255, 186, 108],
};

const STATO = {
  inquietudine: "inquietudine",
  caccia: "caccia",
  frenesia: "frenesia",
  ingestione: "ingestione",
  digestione: "digestione",
};

let hunger = 70;
let growth = 1.0;

let statoCorrente = STATO.inquietudine;
let inizioStato = 0;
let progressoIngestione = 0;

let creaturaX = 0;
let creaturaY = 0;
let velocitaX = 0;
let velocitaY = 0;
let ritardoX = 0;
let ritardoY = 0;
let tempoPrecedente = 0;

let bersaglioX = 0;
let bersaglioY = 0;
let cursorePresente = false;
let pastoX = 0;
let pastoY = 0;

// quanto si sta muovendo la luce, e dove stava al fotogramma precedente: serve
// alla creatura per anticiparla invece di rincorrerla da dietro
let luceVelocitaX = 0;
let luceVelocitaY = 0;
let lucePrimaX = 0;
let lucePrimaY = 0;

// dove guarda la creatura: verso il cursore. (0, 0) e dritto davanti
let sguardoX = 0;
let sguardoY = 0;

// le zampe, e quanto e avanzato il passo: cresce con lo spostamento, cosi
// le zampe camminano solo mentre la creatura si muove
let zampe = [];
let passo = 0;

// i fotogrammi di grana, preparati all'avvio e alternati a ogni fotogramma
let granaFrames = [];

// la nuvola della sagoma: posizioni fisse, che poi respirano e tremano a
// ogni fotogramma. Se fossero sorteggiate da capo ogni volta, la massa si
// disferebbe invece di restare
let nubeSagoma = [];

// lo strato su cui disegno sagoma e zampe: si sfoca tutto insieme, con una
// sola operazione, invece che cerchio per cerchio
let stratoOmbra;

// lo strato del fondo: sfumatura e luce dall'alto non cambiano mai, quindi
// si disegnano una volta sola e poi si ricopiano
let stratoFondo;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noiseDetail(2, 0.5);
  tempoPrecedente = millis();
  // senza lisciatura la grana resta a quadretti netti invece che sfocata
  noSmooth();
  stratoOmbra = createGraphics(width, height);
  stratoFondo = createGraphics(width, height);
  creaFondo(stratoFondo);
  creaGrana();
  inizializzaNuvole();
  inizializzaZampe();
  noCursor();
}

function draw() {
  const adesso = millis();
  const dt = constrain((adesso - tempoPrecedente) / 1000, 0, 0.05);
  tempoPrecedente = adesso;
  const tempo = adesso / 1000;

  disegnaFondo();
  aggiornaVelocitaLuce(dt);
  aggiornaStato(dt, adesso, tempo);
  aggiornaRitardoCorpo(dt);
  aggiornaSguardo(dt);
  aggiornaZampe(dt, tempo);
  disegnaCreatura(tempo);
  disegnaLuce(tempo);
}

function inizializzaZampe() {
  const numero = PARAMETRI.numeroZampe;

  for (let i = 0; i < numero; i++) {
    // le zampe si distribuiscono attorno al corpo con uno scarto irregolare:
    // non stanno a intervalli uguali, quindi non sembrano una raggiera
    const angoloBase = i / numero * TWO_PI
      + (noise(i * 3.7, 1.3) - 0.5) * 0.55;

    zampe.push({
      angoloBase,
      angoloRadice: angoloBase,
      angolo: angoloBase,
      fase: i * 1.37,
      // ogni zampa reagisce con una velocita sua: non si muovono all'unisono
      reattivita: 1.6 + (i % 4) * 0.5,
      velocitaDeriva: PARAMETRI.velocitaDerivaZampa * (0.7 + (i % 3) * 0.45),
      trascinamento: PARAMETRI.trascinamentoZampa * (0.6 + (i % 5) * 0.3),
      velocitaRitardo: 1.2 + (i % 3) * 0.7,
      ritardoX: 0,
      ritardoY: 0,
      // lunghezze diverse: alcune zampe sono molto piu lunghe di altre
      lunghezza: 0.6 + noise(i * 7.3, 3.7) * 0.7,
      // e ognuna si piega di lato in modo suo
      piega: (noise(i * 5.1, 9.4) - 0.5) * 2,
    });
  }
}

function aggiornaZampe(dt, tempo) {
  const velocita = sqrt(velocitaX * velocitaX + velocitaY * velocitaY);
  // il passo avanza con lo spostamento: ferma, la creatura non cammina
  passo += velocita * dt * PARAMETRI.passiPerVelocita;

  const direzioneCursore = atan2(bersaglioY - creaturaY, bersaglioX - creaturaX);
  const pasto = statoCorrente === STATO.ingestione
    ? posizionePasto(progressoIngestione)
    : { x: pastoX, y: pastoY };
  const direzionePasto = atan2(pasto.y - creaturaY, pasto.x - creaturaX);

  for (let i = 0; i < zampe.length; i++) {
    const zampa = zampe[i];

    // la base di ogni zampa vaga lentamente: le zampe si spostano lungo il
    // corpo invece di restare sempre sugli stessi raggi
    const deriva = (noise(i * 4.3, tempo * zampa.velocitaDeriva) - 0.5)
      * PARAMETRI.derivaZampa * 2;
    zampa.angoloRadice = zampa.angoloBase + deriva;

    // quando il corpo si sposta, ogni zampa resta indietro di un po', con un
    // ritardo suo: e il follow through delle zampe
    const seguitoRitardo = 1 - exp(-zampa.velocitaRitardo * dt);
    zampa.ritardoX = lerp(
      zampa.ritardoX,
      -velocitaX * zampa.trascinamento,
      seguitoRitardo
    );
    zampa.ritardoY = lerp(
      zampa.ritardoY,
      -velocitaY * zampa.trascinamento,
      seguitoRitardo
    );

    // l'oscillazione del passo: ogni zampa e sfasata rispetto alle altre,
    // e c'e sempre un lento dondolio anche quando e ferma
    const fasePasso = passo + tempo * PARAMETRI.velocitaPassoLento + zampa.fase;
    const passoZampa = sin(fasePasso) * PARAMETRI.ampiezzaPasso;
    let angoloDesiderato = zampa.angoloRadice + passoZampa;

    if (statoCorrente === STATO.frenesia) {
      // in frenesia le zampe frustano: si aprono e si richiudono in fretta
      const frusta = sin(tempo * (3.2 + i * 0.25) + zampa.fase) * 0.6;
      angoloDesiderato = zampa.angoloRadice + frusta;
    } else if (statoCorrente === STATO.caccia) {
      // le zampe dal lato del cursore si protendono verso di lui
      const errore = constrain(
        angoloDifferenza(zampa.angoloRadice, direzioneCursore),
        -0.9,
        0.9
      );
      angoloDesiderato = zampa.angoloRadice
        + errore * PARAMETRI.protensioneCaccia
        + passoZampa * 0.5;
    } else if (statoCorrente === STATO.ingestione) {
      // le zampe si chiudono intorno al pasto e lo tirano dentro
      const convergenza = interpolazioneMorbida(0, 0.35, progressoIngestione);
      const errore = constrain(
        angoloDifferenza(zampa.angoloRadice, direzionePasto),
        -1.6,
        1.6
      );
      angoloDesiderato = zampa.angoloRadice + errore * convergenza;
    }

    const differenza = angoloDifferenza(zampa.angolo, angoloDesiderato);
    zampa.angolo += differenza * (1 - exp(-zampa.reattivita * dt));
  }
}

// differenza fra due angoli, prendendo il giro piu corto: fra -PI e PI
function angoloDifferenza(angoloIniziale, angoloFinale) {
  let differenza = (angoloFinale - angoloIniziale) % TWO_PI;
  if (differenza > PI) differenza -= TWO_PI;
  if (differenza < -PI) differenza += TWO_PI;
  return differenza;
}

function aggiornaStato(dt, adesso, tempo) {
  if (statoCorrente === STATO.ingestione) {
    progressoIngestione = constrain(
      (adesso - inizioStato) / PARAMETRI.durataIngestione,
      0,
      1
    );

    if (progressoIngestione >= 1) {
      hunger = max(0, hunger - PARAMETRI.fameConsumata);
      growth = min(PARAMETRI.crescitaMassima, growth + PARAMETRI.crescitaPerPasto);
      cambiaStato(STATO.digestione, adesso);
    }

    return;
  }

  if (statoCorrente === STATO.digestione) {
    hunger = min(100, hunger + PARAMETRI.crescitaFame * dt * 0.18);
    velocitaX = lerp(velocitaX, 0, min(1, dt * 1.4));
    velocitaY = lerp(velocitaY, 0, min(1, dt * 1.4));
    creaturaX += velocitaX * dt;
    creaturaY += velocitaY * dt;

    if (adesso - inizioStato < PARAMETRI.durataDigestione) {
      return;
    }

    cambiaStato(STATO.inquietudine, adesso);
  } else {
    hunger = min(100, hunger + PARAMETRI.crescitaFame * dt);
  }

  // caccia solo se e abbastanza affamata: sazia, ignora il cursore
  const abbastanzaAffamata = hunger >= PARAMETRI.sogliaFameCaccia;
  const inFrenesia = hunger >= PARAMETRI.sogliaFrenesia;
  const stavaCacciando = statoCorrente === STATO.caccia || statoCorrente === STATO.frenesia;

  if (statoCorrente === STATO.inquietudine && cursorePresente && abbastanzaAffamata) {
    cambiaStato(inFrenesia ? STATO.frenesia : STATO.caccia, adesso);
  } else if (stavaCacciando && (!cursorePresente || !abbastanzaAffamata)) {
    cambiaStato(STATO.inquietudine, adesso);
  } else if (statoCorrente === STATO.caccia && inFrenesia) {
    cambiaStato(STATO.frenesia, adesso);
  } else if (statoCorrente === STATO.frenesia && !inFrenesia) {
    cambiaStato(STATO.caccia, adesso);
  }

  // ricalcolato dopo il passaggio: il nuovo stato vale gia in questo fotogramma
  const cacciando = statoCorrente === STATO.caccia || statoCorrente === STATO.frenesia;

  if (cacciando) {
    aggiornaCaccia(dt, tempo);
    if (distanzaCreatura(bersaglioX, bersaglioY) < PARAMETRI.sogliaIngestione * growth) {
      iniziaIngestione(adesso);
    }
  } else {
    aggiornaInquietudine(dt, tempo);
  }

  limitaPosizione();
}

function aggiornaInquietudine(dt, tempo) {
  const derivaX = (noise(tempo * 0.13, 12.4) - 0.5) * 2;
  const derivaY = (noise(tempo * 0.13, 31.7) - 0.5) * 2;
  const velocita = PARAMETRI.velocitaRiposo * (0.72 + hunger / 260);

  // segue la deriva con molta calma: il vagare risulta lento e continuo
  velocitaX = lerp(velocitaX, derivaX * velocita, min(1, dt * 0.6));
  velocitaY = lerp(velocitaY, derivaY * velocita, min(1, dt * 0.6));
  creaturaX += velocitaX * dt;
  creaturaY += velocitaY * dt;
}

// dove la creatura punta: la luce, spostata di quanto si sta muovendo. E cosi
// che la anticipa e le taglia la strada, invece di rincorrerla da dietro
function puntoAnticipato() {
  let x = luceVelocitaX * PARAMETRI.previsioneInseguimento;
  let y = luceVelocitaY * PARAMETRI.previsioneInseguimento;
  const lunghezza = sqrt(x * x + y * y);

  // con la luce che corre l'anticipo non deve diventare enorme
  if (lunghezza > PARAMETRI.anticipoMassimo) {
    const riduzione = PARAMETRI.anticipoMassimo / lunghezza;
    x *= riduzione;
    y *= riduzione;
  }

  return { x: bersaglioX + x, y: bersaglioY + y };
}

// l'agguato: da vicino la creatura non si butta addosso, prima striscia piano
// e ogni tanto scatta. Il ritmo viene da noise, quindi il momento dello scatto
// non si prevede. In frenesia non c'e agguato: si butta addosso e basta
function fattoreAgguato(tempo, frenesia) {
  if (frenesia) return 1;
  if (distanzaCreatura(bersaglioX, bersaglioY) > PARAMETRI.distanzaAgguato) return 1;

  const ritmo = pow(
    noise(tempo * PARAMETRI.velocitaRitmoAgguato, 5.1),
    PARAMETRI.scattoAgguato
  );
  return lerp(PARAMETRI.velocitaAgguatoLenta, 1, ritmo);
}

function aggiornaCaccia(dt, tempo) {
  const frenesia = statoCorrente === STATO.frenesia;
  const punta = puntoAnticipato();
  const dx = punta.x - creaturaX;
  const dy = punta.y - creaturaY;
  const direzione = atan2(dy, dx);
  // in frenesia la direzione e piu irregolare: non punta dritto al bersaglio
  const oscillazione = sin(
    tempo * (frenesia ? 3.6 : 2.2) + noise(tempo * 0.7, 8.3) * TWO_PI
  ) * (0.12 + hunger * 0.0025) * (frenesia ? PARAMETRI.oscillazioneFrenesia : 1);
  const angolo = direzione + oscillazione;
  const intensitaFame = hunger / 100;
  const velocita = lerp(
    PARAMETRI.velocitaMinimaCaccia,
    PARAMETRI.velocitaMassimaCaccia,
    intensitaFame
  ) * (frenesia ? PARAMETRI.velocitaFrenesia : 1)
    * fattoreAgguato(tempo, frenesia);

  // il freno che evita di superare la luce si misura sulla luce vera, non sul
  // punto anticipato: altrimenti rallenterebbe quando la luce gli viene incontro
  const distanzaLuce = max(1, distanzaCreatura(bersaglioX, bersaglioY));
  const velocitaDesiderata = min(velocita, distanzaLuce * 1.5);
  const accelerazione = PARAMETRI.accelerazioneCaccia
    * (frenesia ? PARAMETRI.accelerazioneFrenesia : 1);
  const seguito = 1 - exp(-accelerazione * dt);

  velocitaX = lerp(velocitaX, cos(angolo) * velocitaDesiderata, seguito);
  velocitaY = lerp(velocitaY, sin(angolo) * velocitaDesiderata, seguito);
  creaturaX += velocitaX * dt;
  creaturaY += velocitaY * dt;
}

function aggiornaRitardoCorpo(dt) {
  // il corpo resta indietro mentre si sposta: la sagoma sembra trascinata
  const seguito = 1 - exp(-1.6 * dt);
  ritardoX = lerp(ritardoX, -velocitaX * PARAMETRI.trascinamentoCorpo, seguito);
  ritardoY = lerp(ritardoY, -velocitaY * PARAMETRI.trascinamentoCorpo, seguito);
}

function aggiornaSguardo(dt) {
  // lo sguardo segue il cursore, ma con un po' di ritardo
  let versoX = sguardoX;
  let versoY = sguardoY;

  if (cursorePresente) {
    const angolo = atan2(bersaglioY - creaturaY, bersaglioX - creaturaX);
    versoX = cos(angolo);
    versoY = sin(angolo);
  }

  const seguito = 1 - exp(-5 * dt);
  sguardoX = lerp(sguardoX, versoX, seguito);
  sguardoY = lerp(sguardoY, versoY, seguito);
}

function aggiornaVelocitaLuce(dt) {
  if (dt <= 0) return;

  // il cursore si muove a scatti, quindi la sua velocita viene lisciata
  const seguito = 1 - exp(-PARAMETRI.lisciaturaVelocitaLuce * dt);
  const versoX = cursorePresente ? (bersaglioX - lucePrimaX) / dt : 0;
  const versoY = cursorePresente ? (bersaglioY - lucePrimaY) / dt : 0;

  luceVelocitaX = lerp(luceVelocitaX, versoX, seguito);
  luceVelocitaY = lerp(luceVelocitaY, versoY, seguito);

  lucePrimaX = bersaglioX;
  lucePrimaY = bersaglioY;
}

function iniziaIngestione(adesso) {
  cambiaStato(STATO.ingestione, adesso);
  pastoX = bersaglioX;
  pastoY = bersaglioY;
  cursorePresente = false;
  progressoIngestione = 0;
  velocitaX *= 0.35;
  velocitaY *= 0.35;
}

function cambiaStato(nuovoStato, adesso) {
  statoCorrente = nuovoStato;
  inizioStato = adesso;
}

function distanzaCreatura(x, y) {
  return dist(creaturaX, creaturaY, x, y);
}

// dove si trova il pasto mentre viene inghiottito: viene tirato verso il centro
function posizionePasto(progresso) {
  const ritiro = interpolazioneMorbida(0.2, 0.85, progresso);
  return {
    x: lerp(pastoX, creaturaX, ritiro),
    y: lerp(pastoY, creaturaY, ritiro),
  };
}

function limitaPosizione() {
  const scala = scalaCreatura();
  const estensione = estensioneMassima() * scala;
  const limiteX = max(0, width / 2 - estensione);
  const limiteY = max(0, height / 2 - estensione);
  const xPrima = creaturaX;
  const yPrima = creaturaY;

  creaturaX = constrain(creaturaX, -limiteX, limiteX);
  creaturaY = constrain(creaturaY, -limiteY, limiteY);

  if (creaturaX !== xPrima) velocitaX *= -0.25;
  if (creaturaY !== yPrima) velocitaY *= -0.25;
}

function estensioneMassima() {
  const corpo = PARAMETRI.raggioCorpo * growth * PARAMETRI.raggioEstensione;
  return corpo + PARAMETRI.margineSchermo;
}

function scalaCreatura() {
  const spazio = min(width, height) / 2 - PARAMETRI.margineSchermo;
  return min(1, max(0.08, spazio / estensioneMassima()));
}

function interpolazioneMorbida(inizio, fine, valore) {
  const t = constrain((valore - inizio) / (fine - inizio), 0, 1);
  return t * t * (3 - 2 * t);
}

// il colore di COLORI scritto come lo vuole il browser: rgba(r, g, b, a),
// con l'opacita da 0 a 1
function coloreTrasparente(colore, opacita) {
  return "rgba(" + colore[0] + "," + colore[1] + "," + colore[2] + "," + opacita + ")";
}

// una chiazza tonda sfumata: piena al centro, sempre piu tenue verso il bordo,
// trasparente alla fine. La curva e calcolata in alcuni punti e il browser la
// interpola fra l'uno e l'altro: con abbastanza punti la sfumatura e continua,
// senza anelli. `caduta` decide che forma ha la curva: sotto 1 la chiazza resta
// accesa a lungo e si spegne tardi (una macchia larga e morbida), sopra 1 il
// centro resta acceso e il bordo si spegne prima (un chiarore raccolto)
function disegnaChiazza(contesto, raggio, colore, opacita, caduta) {
  if (raggio <= 0 || opacita <= 0) return;

  const a = constrain(opacita, 0, 255) / 255;
  const passi = 8;
  const sfumatura = contesto.createRadialGradient(0, 0, 0, 0, 0, raggio);

  for (let i = 0; i <= passi; i++) {
    const t = i / passi;
    sfumatura.addColorStop(t, coloreTrasparente(colore, a * pow(1 - t, caduta)));
  }

  contesto.fillStyle = sfumatura;
  contesto.beginPath();
  contesto.arc(0, 0, raggio, 0, TWO_PI);
  contesto.fill();
}

function creaFondo(g) {
  g.clear();
  const contesto = g.drawingContext;

  // sfumatura verticale: piu chiara in alto, quasi nera in basso. La calcola
  // il browser da un capo all'altro, quindi non ha gradini da mostrare
  const verticale = contesto.createLinearGradient(0, 0, 0, height);
  verticale.addColorStop(0, coloreTrasparente(COLORI.fondoAlto, 1));
  verticale.addColorStop(1, coloreTrasparente(COLORI.fondoBasso, 1));
  contesto.fillStyle = verticale;
  contesto.fillRect(0, 0, width, height);

  // la luce soffusa che filtra dall'alto: una sola chiazza larga, con il
  // centro sopra il bordo dello schermo
  contesto.save();
  contesto.translate(width / 2, -height * 0.15);
  disegnaChiazza(
    contesto,
    max(width, height) * PARAMETRI.raggioLuce,
    COLORI.alone,
    PARAMETRI.opacitaLuce,
    PARAMETRI.cadutaLuce
  );
  contesto.restore();

  // la vignettatura: al centro non cambia niente, verso gli angoli il fondo si
  // spegne. E quello che tiene insieme la scena: la luce cade al centro, il
  // buio si accumula ai bordi
  const diagonale = sqrt(width * width + height * height) / 2;
  const vignetta = contesto.createRadialGradient(
    width / 2,
    height / 2,
    diagonale * PARAMETRI.inizioVignetta,
    width / 2,
    height / 2,
    diagonale
  );
  vignetta.addColorStop(0, coloreTrasparente(COLORI.fondoBasso, 0));
  vignetta.addColorStop(1, coloreTrasparente(COLORI.fondoBasso, PARAMETRI.opacitaVignetta / 255));
  contesto.fillStyle = vignetta;
  contesto.fillRect(0, 0, width, height);
}

function disegnaFondo() {
  // sfumatura e luce dall'alto sono sempre le stesse: si preparano una volta
  // sola e poi si ricopiano, invece di ricalcolarle a ogni fotogramma
  image(stratoFondo, 0, 0);

  // la grana: a ogni fotogramma se ne mostra uno diverso, come in una
  // pellicola. I fotogrammi sono gia pronti, quindi non costa quasi nulla
  const fotogramma = granaFrames[floor(random(granaFrames.length))];
  if (fotogramma) {
    image(fotogramma, 0, 0, width, height);
  }
}

// prepara i fotogrammi di grana: ognuno e un rettangolo di rumore, con ogni
// pixel piu o meno chiaro e piu o meno trasparente
function creaGrana() {
  granaFrames = [];
  const larghezza = max(1, ceil(width / PARAMETRI.granaScala));
  const altezza = max(1, ceil(height / PARAMETRI.granaScala));

  for (let f = 0; f < PARAMETRI.numeroGranaFrames; f++) {
    const fotogramma = createGraphics(larghezza, altezza);
    fotogramma.loadPixels();

    for (let i = 0; i < fotogramma.pixels.length; i += 4) {
      const chiarore = PARAMETRI.granaChiarore * (0.5 + random() * 0.5);
      fotogramma.pixels[i] = chiarore;
      fotogramma.pixels[i + 1] = chiarore;
      fotogramma.pixels[i + 2] = chiarore;
      fotogramma.pixels[i + 3] = random() * PARAMETRI.opacitaGrana;
    }

    fotogramma.updatePixels();
    granaFrames.push(fotogramma);
  }
}

function disegnaCreatura(tempo) {
  const scala = scalaCreatura();
  const fame = hunger / 100;
  const pulsazione = sin(
    tempo * lerp(
      PARAMETRI.velocitaPulsazioneMinima,
      PARAMETRI.velocitaPulsazioneMassima,
      fame
    ) * TWO_PI
  );
  const fattoreCorpo = 1 + pulsazione * (0.05 + fame * PARAMETRI.famePerPulsazione);

  const velocita = sqrt(velocitaX * velocitaX + velocitaY * velocitaY);
  const allungamento = constrain(
    velocita / PARAMETRI.velocitaAllungamento,
    0,
    PARAMETRI.allungamentoMassimo
  );
  const direzione = atan2(velocitaY, velocitaX);
  const raggio = PARAMETRI.raggioCorpo * growth * scala * fattoreCorpo;

  // sagoma e zampe vanno su uno strato a parte, cosi si sfocano tutte
  // insieme, con una sola operazione, invece che cerchio per cerchio
  stratoOmbra.clear();
  stratoOmbra.push();
  // il corpo resta un po' indietro rispetto al centro: viene trascinato
  stratoOmbra.translate(
    width / 2 + creaturaX + ritardoX,
    height / 2 + creaturaY + ritardoY
  );

  // la penombra: non si allunga con il corpo, e un alone fermo di buio
  disegnaPenombra(stratoOmbra, raggio, fame);

  stratoOmbra.push();
  // la sagoma si allunga lungo il moto e si schiaccia di traverso
  if (velocita > 1) {
    stratoOmbra.rotate(direzione);
    stratoOmbra.scale(1 + allungamento, 1 - allungamento * 0.55);
    stratoOmbra.rotate(-direzione);
  }
  disegnaZampe(stratoOmbra, raggio);
  disegnaSagoma(stratoOmbra, tempo, raggio);
  stratoOmbra.pop();
  stratoOmbra.pop();

  // la sfocatura scioglie il contorno nel fondo: la creatura sembra un'ombra
  // mescolata alla luce, non una figura ritagliata
  drawingContext.filter = "blur(" + PARAMETRI.sfocaturaOmbra * scala + "px)";
  image(stratoOmbra, 0, 0);
  drawingContext.filter = "none";

  // gli occhi restano nitidi: la sfocatura vale solo per l'ombra
  push();
  translate(width / 2 + creaturaX + ritardoX, height / 2 + creaturaY + ritardoY);
  disegnaOcchi(tempo, raggio);

  if (statoCorrente === STATO.ingestione) {
    disegnaImpulso(progressoIngestione, scala);
  }
  pop();
}

function disegnaPenombra(g, raggio, fame) {
  // piu e affamata, piu l'ombra si allarga intorno a se
  const moltiplicatore = PARAMETRI.raggioPenombra
    * (1 + fame * PARAMETRI.famePenombra);

  // una sola chiazza di buio, piena sotto il corpo e via via piu tenue verso
  // fuori: l'ombra non ha un bordo, si spegne dentro il fondo
  disegnaChiazza(
    g.drawingContext,
    raggio * moltiplicatore,
    COLORI.sagoma,
    PARAMETRI.opacitaPenombra,
    PARAMETRI.cadutaPenombra
  );
}

function disegnaZampe(g, raggio) {
  const aumento = max(0, growth - 1);
  let estensione = 1;

  if (statoCorrente === STATO.caccia) {
    estensione = 1.12 + hunger * 0.002;
  } else if (statoCorrente === STATO.frenesia) {
    estensione = 1.35;
  } else if (statoCorrente === STATO.ingestione) {
    // prima si allungano per avvolgere il pasto, poi lo tirano dentro
    estensione = lerp(1.4, 0.8, interpolazioneMorbida(0.15, 0.8, progressoIngestione));
  } else if (statoCorrente === STATO.digestione) {
    estensione = 0.8;
  }

  g.noStroke();

  for (let i = 0; i < zampe.length; i++) {
    const zampa = zampe[i];
    const lunghezza = raggio * PARAMETRI.lunghezzaZampa * zampa.lunghezza
      * (1 + aumento * PARAMETRI.crescitaZampe) * estensione;
    disegnaZampa(g, zampa, raggio, lunghezza);
  }
}

function disegnaZampa(g, zampa, raggio, lunghezza) {
  // la radice sta dentro la sagoma: la zampa sembra uscire dalla massa
  const radiceX = cos(zampa.angoloRadice) * raggio * PARAMETRI.raggioRadiceZampa
    + zampa.ritardoX;
  const radiceY = sin(zampa.angoloRadice) * raggio * PARAMETRI.raggioRadiceZampa
    + zampa.ritardoY;

  const dirX = cos(zampa.angolo);
  const dirY = sin(zampa.angolo);
  const normaleX = -dirY;
  const normaleY = dirX;

  // il ginocchio: la zampa si piega di lato, come un arto
  const piega = zampa.piega * lunghezza * 0.4;
  const controlloX = radiceX + dirX * lunghezza * 0.55 + normaleX * piega * 0.8;
  const controlloY = radiceY + dirY * lunghezza * 0.55 + normaleY * piega * 0.8;
  const puntaX = radiceX + dirX * lunghezza + normaleX * piega;
  const puntaY = radiceY + dirY * lunghezza + normaleY * piega;

  // la zampa e una fila di cerchi che si assottigliano verso la punta,
  // semitrasparenti: dove si sovrappongono il colore si accumula
  for (let i = 0; i <= PARAMETRI.puntiZampa; i++) {
    const t = i / PARAMETRI.puntiZampa;
    const unoMenoT = 1 - t;
    const x = unoMenoT * unoMenoT * radiceX
      + 2 * unoMenoT * t * controlloX
      + t * t * puntaX;
    const y = unoMenoT * unoMenoT * radiceY
      + 2 * unoMenoT * t * controlloY
      + t * t * puntaY;

    // ogni campione e un gruppetto di puntini sparsi attorno alla linea,
    // come la sagoma: la zampa si dissolve verso la punta e non e un tubo
    const larghezza = PARAMETRI.spessoreZampa * raggio * pow(1 - t, 0.7);
    const opacita = PARAMETRI.opacitaZampa * (1 - t * 0.6);
    const diametro = max(1, larghezza * 2 * PARAMETRI.dimensionePuntoZampa);

    for (let k = 0; k < PARAMETRI.puntiPerZampa; k++) {
      const dx = (random() - 0.5) * larghezza * 2;
      const dy = (random() - 0.5) * larghezza * 2;

      g.fill(COLORI.sagoma[0], COLORI.sagoma[1], COLORI.sagoma[2], opacita);
      g.ellipse(x + dx, y + dy, diametro, diametro);
    }
  }
}

// prepara la nuvola della sagoma: le posizioni dei puntini, che poi respirano
// e tremano a ogni fotogramma
function inizializzaNuvole() {
  nubeSagoma = [];

  for (let i = 0; i < PARAMETRI.puntiSagoma; i++) {
    nubeSagoma.push({
      angolo: random(TWO_PI),
      // la radice della distanza dal centro: cosi i punti si stringono verso
      // il centro invece di spargersi uniformi
      frazione: pow(random(), PARAMETRI.concentrazioneSagoma),
      // ogni punto ha una dimensione e una trasparenza sue
      dimensione: 0.6 + random() * 0.8,
      opacita: 0.45 + random() * 0.55,
    });
  }
}

function disegnaSagoma(g, tempo, raggio) {
  g.noStroke();

  const tempoOnda = tempo * PARAMETRI.velocitaOndaSagoma;
  const velocita = sqrt(velocitaX * velocitaX + velocitaY * velocitaY);
  const deformazione = PARAMETRI.deformazioneSagoma
    * (1 + velocita * PARAMETRI.deformazioneConVelocita);

  const raggioNube = raggio * PARAMETRI.raggioSagoma;

  // prima il nucleo, cosi i puntini gli stanno sopra
  g.fill(
    COLORI.sagoma[0],
    COLORI.sagoma[1],
    COLORI.sagoma[2],
    PARAMETRI.opacitaNucleoSagoma
  );
  g.ellipse(0, 0, raggio * PARAMETRI.diametroNucleoSagoma, raggio * PARAMETRI.diametroNucleoSagoma);

  for (let i = 0; i < nubeSagoma.length; i++) {
    const punto = nubeSagoma[i];

    // due onde lente, con un numero intero di lobi, fanno respirare la
    // nuvola: i punti si allontanano e si riavvicinano al centro
    const onda = sin(punto.angolo * PARAMETRI.ondeSagoma + tempoOnda) * deformazione
      + sin(punto.angolo * (PARAMETRI.ondeSagoma * 2 + 1) - tempoOnda * 0.7)
      * deformazione * 0.4;
    const angolo = punto.angolo + onda * 0.4;
    const distanza = punto.frazione * raggioNube * (1 + onda);

    // il tremolio: ogni punto si sposta di poco e a caso, a ogni fotogramma
    const tremore = PARAMETRI.tremolioSagoma * raggio;
    const x = cos(angolo) * distanza + (random() - 0.5) * tremore * 2;
    const y = sin(angolo) * distanza + (random() - 0.5) * tremore * 2;

    // piu il punto sta fuori, piu e tenue e piccolo: il bordo si dissolve
    const opacita = PARAMETRI.opacitaSagoma
      * pow(1 - punto.frazione, PARAMETRI.cadutaSagoma) * punto.opacita;
    const diametro = max(1, raggio * PARAMETRI.diametroPuntoSagoma * punto.dimensione);

    g.fill(COLORI.sagoma[0], COLORI.sagoma[1], COLORI.sagoma[2], opacita);
    g.ellipse(x, y, diametro, diametro);
  }
}

function disegnaOcchi(tempo, raggio) {
  const fame = hunger / 100;
  const frenesia = statoCorrente === STATO.frenesia;
  const digerendo = statoCorrente === STATO.digestione;

  // gli occhi si stringono un po' quando la creatura e in frenesia
  const distanza = PARAMETRI.distanzaOcchi * raggio * (frenesia ? 0.9 : 1);
  const baseY = -PARAMETRI.altezzaOcchi * raggio;

  // piu fame = occhi piu grandi e piu intensi; in digestione si spengono
  const scalaOcchio = 1 + fame * 0.5 + (frenesia ? 0.25 : 0);
  const diametro = PARAMETRI.diametroOcchio * raggio * scalaOcchio;
  const intensita = (0.45 + fame * 0.55)
    * (digerendo ? 0.55 : 1)
    * PARAMETRI.luminositaOcchi;

  // un tremolio dell'intensita, piu rapido in frenesia
  const tremolio = 0.82 + noise(tempo * (frenesia ? 6 : 1.6), 3.3) * 0.35;

  // lo sguardo: gli occhi si spostano verso il cursore
  const sguardo = PARAMETRI.ampiezzaSguardo * raggio;
  const occhioX = sguardoX * sguardo;
  const occhioY = sguardoY * sguardo;

  noStroke();

  for (let lato = -1; lato <= 1; lato += 2) {
    const x = occhioX + lato * distanza / 2;
    const y = occhioY + baseY;

    // l'alone attorno all'occhio: una sola chiazza sfumata, che schiarisce
    // appena l'ombra intorno
    push();
    translate(x, y);
    disegnaChiazza(
      drawingContext,
      diametro * PARAMETRI.aloneOcchio,
      COLORI.occhio,
      PARAMETRI.opacitaAloneOcchio * intensita * tremolio,
      PARAMETRI.cadutaAloneOcchio
    );
    pop();

    // il punto intenso, nitido
    fill(255, 255, 255, 255 * intensita);
    ellipse(x, y, diametro);
  }
}

function disegnaImpulso(progresso, scala) {
  const apertura = interpolazioneMorbida(0.55, 0.94, progresso);
  if (apertura <= 0 || apertura >= 1) return;

  const raggio = (22 + apertura * 150) * scala;
  const opacita = (1 - apertura) * 150;
  const centroX = pastoX - creaturaX;
  const centroY = pastoY - creaturaY;

  noFill();
  stroke(COLORI.luce[0], COLORI.luce[1], COLORI.luce[2], opacita);
  strokeWeight(max(0.7, 2.2 * scala * (1 - apertura)));
  ellipse(centroX, centroY, raggio * 2, raggio * 1.45);
  noStroke();
}

function disegnaLuce(tempo) {
  const fame = hunger / 100;

  // piu la creatura e affamata, piu la luce si ingrossa e si fa intensa
  const diametroPieno = PARAMETRI.diametroLuce
    * (1 + PARAMETRI.crescitaLuceConFame * fame);

  let diametro = diametroPieno;
  let visibilita = 1;
  let centroX = bersaglioX;
  let centroY = bersaglioY;

  if (statoCorrente === STATO.ingestione) {
    // la luce viene mangiata: si ritira e si spegne mentre la creatura la
    // avvolge, finche non resta piu niente
    const ritiro = interpolazioneMorbida(0, 0.48, progressoIngestione);
    diametro = diametroPieno * (1 - ritiro);
    visibilita = 1 - ritiro;
    // mentre viene inghiottita la luce e tirata verso il centro del corpo
    const pasto = posizionePasto(progressoIngestione);
    centroX = pasto.x;
    centroY = pasto.y;
    if (diametro <= 0.1) return;
  } else if (!cursorePresente) {
    return;
  }

  push();
  translate(width / 2 + centroX, height / 2 + centroY);
  disegnaPuntoLuce(diametro, visibilita, tempo, fame);
  pop();
}

function disegnaPuntoLuce(diametro, visibilita, tempo, fame) {
  const raggio = diametro / 2;

  // pulsa di piu quando la fame e alta
  const ampiezza = PARAMETRI.pulsazioneLuce
    + PARAMETRI.pulsazioneLuceConFame * fame;
  const pulsazione = 1 + sin(tempo * 5) * ampiezza;

  // una luce accesa si somma a quello che ha davanti, non lo copre: cosi le
  // chiazze si sommano fra loro e il centro arriva al bianco, come una luce
  // vera, invece di restare un disegno chiaro appoggiato sul fondo
  push();
  blendMode(ADD);

  // l'alone che si spande lontano, il corpo colorato, il nucleo bianco: tre
  // chiazze sfumate, sempre piu strette e piu chiare
  disegnaChiazza(
    drawingContext,
    raggio * PARAMETRI.ampiezzaAloneLuce * pulsazione,
    COLORI.aloneLuce,
    PARAMETRI.opacitaAloneLuce * visibilita,
    PARAMETRI.cadutaAloneLuce
  );
  disegnaChiazza(
    drawingContext,
    raggio * PARAMETRI.ampiezzaCorpoLuce * pulsazione,
    COLORI.luce,
    PARAMETRI.opacitaCorpoLuce * visibilita,
    PARAMETRI.cadutaCorpoLuce
  );
  disegnaChiazza(
    drawingContext,
    raggio * PARAMETRI.ampiezzaNucleoLuce * pulsazione,
    COLORI.luce,
    PARAMETRI.opacitaNucleoLuce * visibilita,
    PARAMETRI.cadutaNucleoLuce
  );

  pop();
  blendMode(BLEND);
}

function mouseMoved() {
  registraCursore();
}

function mouseDragged() {
  registraCursore();
}

function mouseEntered() {
  noCursor();
  registraCursore();
}

function mouseOut() {
  cursorePresente = false;
  cursor(ARROW);
}

function registraCursore() {
  if (statoCorrente === STATO.ingestione) return;

  bersaglioX = mouseX - width / 2;
  bersaglioY = mouseY - height / 2;
  cursorePresente = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  creaGrana();
  // gli strati devono seguire la nuova dimensione
  stratoOmbra.remove();
  stratoOmbra = createGraphics(width, height);
  stratoFondo.remove();
  stratoFondo = createGraphics(width, height);
  creaFondo(stratoFondo);
  limitaPosizione();
}

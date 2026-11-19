/*
 * Schotter ("Ghiaia") — Georg Nees, 1968
 * Ricostruzione animata con p5.js — Modalità 2: fronte di disordine in movimento
 *
 * Nell'opera originale di Nees il disordine dipende dalla posizione verticale:
 * le righe in alto sono ordinate e la perturbazione cresce verso il basso.
 * Questa animazione trasforma quella progressione spaziale in una progressione
 * temporale: un fronte di disordine attraversa la composizione, così ogni
 * riga passa dall'ordine al disordine in un momento diverso.
 */

// ---------- Parametri numerici ----------

const COLS = 12;              // numero di colonne della griglia
const ROWS = 22;              // numero di righe della griglia
const SQUARE_SIZE = 26;       // lato di ogni quadrato (pixel)
const SPACING_X = 30;         // distanza orizzontale tra le posizioni della griglia
const SPACING_Y = 30;         // distanza verticale tra le posizioni della griglia
const MAX_DISPLACEMENT_X = 12; // spostamento orizzontale massimo all'ultima riga (pixel)
const MAX_DISPLACEMENT_Y = 8;  // spostamento verticale massimo all'ultima riga (pixel)
// Nota: le costanti di p5.js come PI sono disponibili solo dentro setup()/draw(),
// quindi qui, fuori dalle funzioni, usiamo Math.PI.
const MAX_ROTATION = Math.PI / 2; // angolo di rotazione massimo all'ultima riga (radianti)
const SEED = 42;              // seme casuale — lo stesso seme dà sempre la stessa composizione

// Esponenti che controllano la progressione non lineare del disordine.
// Esponente più basso = crescita più rapida all'inizio; più alto = crescita più lenta.
// Lo spostamento usa una curva delicata, così le prime righe restano quasi ordinate.
// La rotazione usa una curva più marcata, così cresce più velocemente dello spostamento.
const DISPLACEMENT_CURVE = 0.8; // delicata: appena percettibile all'inizio, moderata in fondo
const ROTATION_CURVE = 0.9;     // marcata: cresce più in fretta, domina la metà inferiore

// ---------- Parametri dell'animazione ----------

const CYCLE_DURATION = 22;    // secondi per un ciclo completo (avanti + pausa + indietro)
const HOLD_DURATION = 2;      // secondi di pausa a disordine massimo
const FRONT_WIDTH = 0.8;      // ampiezza della zona di transizione morbida (0-1)
const PROPAGATION_DIRECTION = 1; // 1 = dall'alto verso il basso, -1 = dal basso verso l'alto

// Modalità: 'auto' = animazione automatica, 'mouse' = controllo con mouseY,
// 'hand' = tracciamento della mano con webcam.
let MODE = 'hand';

// ---------- Variabili del tracciamento della mano ----------
// Contengono i valori grezzi e smussati del tracciamento della mano.
// Il video della webcam e i punti di riferimento non vengono mai disegnati.

let videoCapture;             // elemento video creato da p5 (nascosto)
let handsTracker;             // istanza di MediaPipe Hands
let handDetected = false;     // indica se una mano è attualmente visibile
let lastHandTime = 0;         // istante in cui la mano è stata vista per l'ultima volta
let handTrackingActive = false; // true finché il ciclo di tracciamento deve continuare
let handTrackingErrors = 0;   // errori consecutivi del tracciatore

// Valori grezzi dei punti di riferimento (intervallo 0-1)
let rawHandY = 0.5;           // posizione verticale della mano (0 = alto, 1 = basso)
let rawHandOpenness = 0;      // apertura della mano (0 = pugno, 1 = mano aperta)

// Valori smussati usati per l'animazione (media mobile esponenziale)
let smoothHandY = 0.5;
let smoothHandOpenness = 0;

// Costanti di smussamento e temporizzazione
const HAND_SMOOTHING = 0.05;  // più basso = più fluido ma più lento a rispondere
const HAND_TIMEOUT = 2000;    // ms prima di tornare all'ordine se la mano scompare
const TRACK_INTERVAL = 83;    // ms tra un fotogramma e l'altro (circa 12 fps)
const MAX_TRACK_ERRORS = 3;   // errori prima di passare alla modalità mouse

// ---------- Parametri audio ----------
// Il sistema sonoro segue la stessa logica del sistema visivo:
//   visivo:  posizione = posizioneOrdinata + scartoFisso * disordine
//   audio:   frequenza = frequenzaStabile + disassonanzaFissa * disordine
// Le disassonanze target vengono generate una volta e non cambiano a ogni fotogramma.

const MASTER_VOLUME = 1.0;    // volume generale

const FUNDAMENTAL = 55;       // Hz — A1 basso, drone scuro

// Il drone è un tappeto, non il protagonista: sta in basso e si abbassa
// quando il disordine cresce, lasciando spazio alla melodia. Visivo e mix
// si muovono insieme.
const FUNDAMENTAL_VOLUME = 0.15; // livello del drone a disordine = 0
const DRONE_FADE = 0.6;         // a disordine = 1 il drone scende al 40% del suo livello

// Un filtro passa-basso è il rimedio più efficace contro un timbro duro e metallico.
// Qui tutti gli oscillatori sono seni puri, quindi non c'è vero contenuto acuto
// da togliere: il filtro rende però il mix più caldo senza costi musicali.
const LOWPASS_CUTOFF = 1200;  // Hz — ben sopra la nota melodica più alta (440 Hz)
const LOWPASS_Q = 0.5;        // sotto 1 = risposta gentile, senza picco di risonanza

// La disassonanza è un RAPPORTO, non un valore assoluto in Hz. Un valore assoluto
// di 30 Hz su una fondamentale di 55 Hz è uno spostamento del 55%: è quello che
// rendeva il drone metallico. Come rapporto resta sempre una deriva sottile,
// qualunque sia la frequenza fondamentale.
const DETUNE_RATIO = 0.015;   // ±1,5% di deriva a disordine = 1
const LFO_RATE = 0.05;        // Hz — oscillazione molto lenta
const LFO_DEPTH = 0.004;      // ±0,4% di modulazione di frequenza a disordine = 1
const AUDIO_SMOOTHING = 0.03; // inerzia leggermente maggiore rispetto allo smussamento visivo

// Strato melodico — scala modale per far emergere gradualmente le note
const SCALE_ROOT = 220;       // Hz — A3, nota fondamentale della scala
const SCALE_INTERVALS = [1, 9/8, 5/4, 3/2, 5/3, 2]; // intonazione giusta, sorbita come un modo maggiore
const NUM_MELODIC_NOTES = 5;  // numero di note melodiche nella scala

// Volume per nota. Il caso peggiore è il drone più tutte le note insieme,
// quindi il valore deve restare abbastanza basso che il totale non superi 1.0.
// 0,13 × 5 note + 0,15 drone = 0,80 di picco — margine comodo.
const MELODIC_VOLUME = 0.13;  // volume di ciascuna nota melodica

// Il vibrato fa sembrare le note suonate invece che programmate: una piccola
// oscillazione lenta dell'altezza. Velocità e profondità sono diverse per ogni
// nota e vengono generate una volta.
const VIBRATO_RATE = 5;       // Hz — centro dell'intervallo casuale delle velocità
const VIBRATO_SPREAD = 1.2;   // Hz — ogni nota ha una velocità intorno a VIBRATO_RATE
const VIBRATO_DEPTH = 0.004;  // ±0,4% di oscillazione — oltre diventa ruvido

// ---------- Tela ----------

const MARGIN = 60; // margine bianco attorno alla griglia
const HINT_FONT_SIZE = 24; // dimensione dell'indicazione, in pixel
const HINT_PADDING = 10; // spaziatura intorno al testo, in pixel
const HINT_BACKGROUND_ALPHA = 1; // opacità del fondo bianco
const HINT_BORDER_WIDTH = 2; // spessore del bordo, in pixel

// ---------- Dati dei quadrati ----------

// Ogni quadrato conserva i propri valori target fissi, generati una sola volta
// all'inizio. Così l'animazione è deterministica e lo stato finale (disordine
// massimo) corrisponde esattamente alla ricostruzione statica.
const squares = [];

function setup() {
  const canvasWidth = COLS * SPACING_X + MARGIN * 2;
  const canvasHeight = ROWS * SPACING_Y + MARGIN * 2;
  createCanvas(canvasWidth, canvasHeight);

  // Fissa il seme casuale, così la composizione è identica a ogni caricamento.
  randomSeed(SEED);

  // Genera tutti i valori target una sola volta, nello stesso ordine della
  // ricostruzione statica. Questi valori sono fissi e non cambiano durante
  // l'animazione. Usiamo lerp() per interpolare tra lo stato ordinato e questi
  // target, invece di chiamare random() a ogni fotogramma: il moto resta fluido
  // e deterministico.
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const progress = row / (ROWS - 1);
      const displacementFactor = pow(progress, DISPLACEMENT_CURVE);
      const rotationFactor = pow(progress, ROTATION_CURVE);

      const baseX = MARGIN + col * SPACING_X + SPACING_X / 2;
      const baseY = MARGIN + row * SPACING_Y + SPACING_Y / 2;

      const targetOffsetX = random(-MAX_DISPLACEMENT_X * displacementFactor, MAX_DISPLACEMENT_X * displacementFactor);
      const targetOffsetY = random(-MAX_DISPLACEMENT_Y * displacementFactor, MAX_DISPLACEMENT_Y * displacementFactor);
      const targetRotation = random(-MAX_ROTATION * rotationFactor, MAX_ROTATION * rotationFactor);

      squares.push({ baseX, baseY, targetOffsetX, targetOffsetY, targetRotation });
    }
  }

  // Inizia il tracciamento della mano se la modalità è 'hand'.
  // Se webcam o tracciamento falliscono, passa con grazia al controllo col mouse.
  if (MODE === 'hand') {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        setupHandTracking();
      } catch (e) {
        console.warn('Avvio del tracciamento della mano fallito, passo alla modalità mouse:', e);
        passaAMouse();
      }
    } else {
      console.warn('API della webcam non disponibile, passo alla modalità mouse');
      passaAMouse();
    }
  }

  // Indicazione al centro del canvas: scompare alla prima interazione.
  // In modalità mano mostra prima il caricamento del modello MediaPipe.
  const testoIniziale = MODE === 'hand'
    ? 'clicca per attivare l’audio — caricamento del tracciamento…'
    : 'clicca per attivare l’audio — muovi il mouse per giocare';
  hint = createP(testoIniziale);
  hint.style('font-size', HINT_FONT_SIZE + 'px');
  hint.style('color', '#000');
  hint.style('font-weight', 'bold');
  hint.style('background', `rgba(255, 255, 255, ${HINT_BACKGROUND_ALPHA})`);
  hint.style('border', `${HINT_BORDER_WIDTH}px solid #000`);
  hint.style('padding', HINT_PADDING + 'px');
  hint.style('border-radius', HINT_PADDING / 2 + 'px');
  hint.style('position', 'absolute');
  hint.style('top', '50%');
  hint.style('left', '50%');
  hint.style('transform', 'translate(-50%, -50%)');
  hint.style('text-align', 'center');
  hint.style('margin', '0');
  hint.style('pointer-events', 'none');
  hint.style('user-select', 'none');

}

// Funzione standard per transizioni morbide, rinominata per non confliggere
// con la smoothstep() integrata in p5.js 2.
// Restituisce 0 per x <= edge0, 1 per x >= edge1, con una curva a S in mezzo.
function transizioneMorbida(edge0, edge1, x) {
  const t = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// ---------- Variabili audio ----------
// Oscillatori e nodi di guadagno del drone ambient.
// Tutti i target di disassonanza vengono generati una volta e restano fissi.

let audioInitialized = false;
let masterGain;
let lowpassFilter;
let limiter;
let fundamentalOsc;
let melodicOscs = [];    // note melodiche che emergono con il disordine

// Target fisso di disassonanza della fondamentale (generato una volta, come i target visivi).
// È l'analogo degli scarti fissi dei quadrati: ogni suono deriva del suo ammontare costante.
let fundamentalDetuning = 0;

// Carattere del vibrato di ogni nota melodica (generato una volta)
const noteDetunes = [];          // piccolo scarto di altezza rispetto all'intonazione giusta
const noteVibratoRates = [];     // Hz — velocità del vibrato di ogni nota
const noteVibratoPhases = [];    // radianti — punto di partenza del vibrato di ogni nota

// Valori audio smussati (inerzia leggermente maggiore rispetto al visivo)
let smoothAudioDisorder = 0;

// Elementi dell'interfaccia (dichiarati globalmente perché draw() li usi)
let hint;

// ---------- Funzioni audio ----------

// Inizializza il contesto audio e crea il sistema sonoro del drone.
// Va chiamato dopo un'interazione dell'utente (regole di autoplay del browser).
function initAudio() {
  if (audioInitialized) return;
  audioInitialized = true;

  // Catena di guadagno: oscillatori → masterGain → passa-basso → limiter → altoparlanti
  // Il limiter interviene solo su un vero superamento di livello. Non è usato
  // per tenere basso il volume: una compressione continua schiaccia il mix,
  // e un drone basso schiacciato suona metallico.
  const audioContext = getAudioContext();

  masterGain = audioContext.createGain();
  masterGain.gain.value = MASTER_VOLUME;

  // Calore: taglia tutto ciò che sta sopra la nota melodica più alta. I seni
  // non hanno quasi energia lassù, quindi questo addolcisce solo le eventuali
  // distorsioni introdotte dalla somma.
  lowpassFilter = audioContext.createBiquadFilter();
  lowpassFilter.type = 'lowpass';
  lowpassFilter.frequency.value = LOWPASS_CUTOFF;
  lowpassFilter.Q.value = LOWPASS_Q;

  limiter = audioContext.createDynamicsCompressor();
  limiter.threshold.value = -1;  // in dB: interviene solo appena sotto il livello massimo
  limiter.knee.value = 0;         // ginocchio duro, così resta fuori dal percorso
  limiter.ratio.value = 20;       // brickwall — prende i picchi, non pompa
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;

  masterGain.connect(lowpassFilter);
  lowpassFilter.connect(limiter);
  limiter.connect(audioContext.destination);

  // Oscillatore fondamentale — un seno morbido, sempre presente.
  // Un seno non ha armoniche superiori, quindi suona come un drone fluido
  // invece che come un tono ronzante.
  fundamentalOsc = new p5.Oscillator('sine');
  fundamentalOsc.freq(FUNDAMENTAL, 0);
  fundamentalOsc.amp(FUNDAMENTAL_VOLUME, 0);
  // In p5.sound 0.4.1 l'uscita è già collegata agli altoparlanti: staccala
  // per far passare il suono solo dalla catena masterGain → filtro → limiter.
  fundamentalOsc.disconnect();
  fundamentalOsc.connect(masterGain);
  fundamentalOsc.start();

  // Target fisso di disassonanza della fondamentale, generato una volta e mai cambiato.
  // Stessa idea degli scarti fissi dei quadrati: un target costante, raggiunto gradualmente.
  // È memorizzato come rapporto con la fondamentale, così la deriva resta sottile e musicale.
  fundamentalDetuning = random(-DETUNE_RATIO, DETUNE_RATIO);

  // Oscillatori melodici — note della scala modale, introdotte gradualmente.
  // Ogni nota riceve una velocità di vibrato, una fase e una micro-disassonanza
  // proprie, generate una volta. Come gli scarti dei quadrati, sono target
  // costanti, mai rigenerati a ogni fotogramma.
  for (let i = 0; i < NUM_MELODIC_NOTES; i++) {
    const osc = new p5.Oscillator('sine');

    // Piccolo scarto fisso rispetto all'intonazione giusta. Senza di esso gli
    // accordi sarebbero perfettamente statici e suonerebbero sintetici; qualche
    // centesimo di "imprecisione" li fa sembrare suonati.
    noteDetunes.push(random(-0.004, 0.004));
    noteVibratoRates.push(VIBRATO_RATE + random(-VIBRATO_SPREAD, VIBRATO_SPREAD));
    noteVibratoPhases.push(random(0, 2 * PI)); // ogni nota parte da un punto diverso

    osc.freq(SCALE_ROOT * SCALE_INTERVALS[i], 0);
    osc.amp(0, 0); // parte dal silenzio, emerge con il disordine
    osc.disconnect(); // come per il drone: evita l'uscita diretta agli altoparlanti
    osc.connect(masterGain);
    osc.start();
    melodicOscs.push(osc);
  }

}

// Aggiorna il sistema audio in base al valore di disordine corrente.
// Usa la stessa logica concettuale del sistema visivo:
//   frequenza = frequenzaStabile + disassonanzaFissa * disordine
// La modulazione LFO è calcolata nel tempo per robustezza.
function updateAudio(disorder) {
  if (!audioInitialized) return;

  // Smussamento forte per un'evoluzione fluida e continua
  // Inerzia leggermente maggiore rispetto a quella visiva
  smoothAudioDisorder = lerp(smoothAudioDisorder, disorder, AUDIO_SMOOTHING);
  const d = smoothAudioDisorder;
  const t = millis() / 1000;

  // Fondamentale: frequenza stabile + deriva di disassonanza fissa + LFO lenta.
  // frequenza = FUNDAMENTAL * (1 + disassonanza + lfo): entrambi i termini sono rapporti.
  const lfoValue = Math.sin(2 * PI * LFO_RATE * t) * LFO_DEPTH * d;
  fundamentalOsc.freq(FUNDAMENTAL * (1 + fundamentalDetuning * d + lfoValue));

  // Il drone si ritira mentre la melodia emerge: all'aumentare del disordine
  // il mix passa dal drone alla melodia. Peso visivo e sonoro si muovono insieme.
  fundamentalOsc.amp(FUNDAMENTAL_VOLUME * (1 - DRONE_FADE * d), 0);

  // Note melodiche: entrano una a una all'aumentare del disordine.
  // Ogni nota, una volta emersa, resta presente: niente si spegne, quindi
  // aumentare il disordine aggiunge solo note, esattamente come il fronte visivo.
  for (let i = 0; i < NUM_MELODIC_NOTES; i++) {
    // Soglie sfalsate: prima nota a d=0,1, ultima a d=0,9
    const threshold = 0.1 + (i / NUM_MELODIC_NOTES) * 0.8;
    const noteLevel = transizioneMorbida(threshold, threshold + 0.15, d);
    melodicOscs[i].amp(noteLevel * MELODIC_VOLUME, 0);

    // Vibrato: una piccola oscillazione lenta dell'altezza che fa sembrare
    // la nota suonata, non programmata.
    const vibrato =
      Math.sin(2 * PI * noteVibratoRates[i] * t + noteVibratoPhases[i]) *
      VIBRATO_DEPTH *
      noteLevel;
    melodicOscs[i].freq(SCALE_ROOT * SCALE_INTERVALS[i] * (1 + noteDetunes[i] + vibrato));
  }
}

// ---------- Tracciamento della mano ----------

// Inizializza la cattura della webcam e il tracciatore MediaPipe Hands.
// Il video non viene mai disegnato sul canvas.
function setupHandTracking() {
  videoCapture = createCapture(VIDEO);
  videoCapture.size(320, 240); // piccole dimensioni per le prestazioni
  videoCapture.hide();         // completamente nascosto rispetto al canvas

  handsTracker = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
  });
  handsTracker.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, // modello leggero per le prestazioni
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  handsTracker.onResults(onHandResults);

  // Un solo fotogramma alla volta. Soprattutto, il modello viene inizializzato
  // una volta sola prima di iniziare: send() lo inizializzerebbe da sé, e più
  // chiamate sovrapposte creerebbero inizializzazioni concorrenti che si
  // sovrascrivono i file temporanei.
  let lastTrackTime = 0;
  const trackHand = async () => {
    if (!handTrackingActive || MODE !== 'hand') return;

    const now = millis();
    if (now - lastTrackTime >= TRACK_INTERVAL &&
        videoCapture.elt && videoCapture.elt.readyState >= 2) {
      lastTrackTime = now;
      try {
        await handsTracker.send({ image: videoCapture.elt });
        handTrackingErrors = 0;
      } catch (e) {
        handTrackingErrors++;
        if (handTrackingErrors >= MAX_TRACK_ERRORS) {
          console.warn('Tracciamento della mano non disponibile, passo alla modalità mouse:', e);
          passaAMouse();
          return;
        }
      }
    }

    // Il ciclo riparte solo dopo che la send() precedente è finita.
    requestAnimationFrame(trackHand);
  };

  handsTracker.initialize().then(() => {
    if (MODE !== 'hand') return;
    handTrackingActive = true;
    if (hint) {
      hint.elt.textContent = 'clicca per attivare l’audio — muovi la mano per giocare';
    }
    requestAnimationFrame(trackHand);
  }).catch((e) => {
    console.warn('Inizializzazione del tracciatore fallita, passo alla modalità mouse:', e);
    passaAMouse();
  });
}

// Disattiva la webcam e continua con il controllo del mouse.
function passaAMouse() {
  handTrackingActive = false;
  MODE = 'mouse';

  // Ferma il flusso della webcam: in modalità mouse non serve più.
  if (videoCapture && videoCapture.elt && videoCapture.elt.srcObject) {
    videoCapture.elt.srcObject.getTracks().forEach((track) => track.stop());
  }

  if (hint) {
    hint.elt.textContent = 'clicca per attivare l’audio — muovi il mouse per giocare';
  }
}

// Elabora i risultati del tracciamento.
// Calcola la posizione verticale e l'apertura della mano dai punti di riferimento.
function onHandResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    // Media delle coordinate Y di tutti i punti (0 = alto, 1 = basso)
    let sumY = 0;
    for (const lm of landmarks) {
      sumY += lm.y;
    }
    rawHandY = sumY / landmarks.length;

    // Stima l'apertura della mano dalla distanza delle dita rispetto alla mano
    const wrist = landmarks[0];
    const middleMCP = landmarks[9];
    const handSize = Math.sqrt(
      Math.pow(wrist.x - middleMCP.x, 2) +
      Math.pow(wrist.y - middleMCP.y, 2)
    );

    const fingertips = [4, 8, 12, 16, 20]; // pollice, indice, medio, anulare, mignolo
    let sumDist = 0;
    for (const idx of fingertips) {
      const tip = landmarks[idx];
      sumDist += Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) +
        Math.pow(tip.y - wrist.y, 2)
      );
    }
    const avgDist = sumDist / fingertips.length;
    const normalizedDist = avgDist / handSize;

    // Mappa la distanza normalizzata all'apertura: pugno ≈ 0, mano aperta ≈ 1
    rawHandOpenness = constrain((normalizedDist - 0.5) / 1.0, 0, 1);

    handDetected = true;
    lastHandTime = millis();
  } else {
    handDetected = false;
  }
}

function draw() {
  const t = millis() / 1000; // tempo in secondi
  const transitionDuration = (CYCLE_DURATION - HOLD_DURATION) / 2;

  // Il fronte deve viaggiare da fuori la composizione a fuori la composizione,
  // così tutte le righe raggiungono il disordine (o l'ordine) massimo agli estremi.
  const FRONT_START = -FRONT_WIDTH / 2;
  const FRONT_END = 1 + FRONT_WIDTH / 2;

  let frontPosition;
  let isForward;
  let intensity = 1; // moltiplicatore del disordine (1 = target Schotter pieni)

  if (MODE === 'hand') {
    // Tracciamento della mano: la posizione Y controlla la propagazione,
    // l'apertura controlla l'intensità. L'interazione non modifica la regola
    // generativa di Nees: permette a chi guarda di percorrere manualmente lo
    // stesso processo ordine → disordine che la versione automatica svolge nel tempo.
    isForward = true;

    // Smussamento temporale per una risposta fluida e senza salti
    smoothHandY = lerp(smoothHandY, rawHandY, HAND_SMOOTHING);
    smoothHandOpenness = lerp(smoothHandOpenness, rawHandOpenness, HAND_SMOOTHING);

    // Se la mano scompare, mantiene brevemente l'ultimo stato valido,
    // poi torna gradualmente verso l'ordine.
    if (!handDetected && millis() - lastHandTime > HAND_TIMEOUT) {
      smoothHandY = lerp(smoothHandY, 0, HAND_SMOOTHING);
      smoothHandOpenness = lerp(smoothHandOpenness, 0, HAND_SMOOTHING);
    }

    // Mappa la Y della mano sulla posizione del fronte (alto = ordinato, basso = Schotter completo)
    frontPosition = FRONT_START + (FRONT_END - FRONT_START) * smoothHandY;

    // L'apertura della mano controlla l'intensità del disordine
    intensity = smoothHandOpenness;
  } else if (MODE === 'mouse') {
    // Modalità mouse: mouseY controlla la progressione del disordine.
    isForward = true;
    const clampedMouseY = constrain(mouseY, 0, height);
    frontPosition = FRONT_START + (FRONT_END - FRONT_START) * (clampedMouseY / height);
  } else {
    // Animazione automatica: il fronte avanza, si ferma, poi torna indietro.
    // L'easing sinusoidale garantisce accelerazione e decelerazione morbide.
    const cycleTime = t % CYCLE_DURATION;
    if (cycleTime < transitionDuration) {
      // Fase in avanti: il disordine si accumula dall'alto verso il basso
      isForward = true;
      const phaseT = cycleTime / transitionDuration;
      frontPosition = FRONT_START + (FRONT_END - FRONT_START) * (1 - cos(PI * phaseT)) / 2;
    } else if (cycleTime < transitionDuration + HOLD_DURATION) {
      // Fase di pausa: lo stato Schotter completo è ben visibile
      isForward = true;
      frontPosition = FRONT_END;
    } else {
      // Fase inversa: l'ordine si accumula dall'alto verso il basso
      isForward = false;
      const phaseT = (cycleTime - transitionDuration - HOLD_DURATION) / transitionDuration;
      frontPosition = FRONT_END - (FRONT_END - FRONT_START) * (1 - cos(PI * phaseT)) / 2;
    }
  }

  background(255);
  stroke(0);
  strokeWeight(1);
  noFill();

  // Nasconde l'indicazione dopo la prima interazione
  if (audioInitialized && hint) {
    hint.hide();
  }

  // Calcola il valore globale di disordine per l'audio (0 = ordinato, 1 = Schotter completo)
  // Usa lo stesso valore di progressione che controlla la trasformazione visiva.
  let audioDisorder;
  if (MODE === 'hand') {
    audioDisorder = smoothHandY * smoothHandOpenness;
  } else if (MODE === 'mouse') {
    audioDisorder = constrain(mouseY / height, 0, 1);
  } else {
    // Modalità automatica: normalizza frontPosition nell'intervallo 0-1
    audioDisorder = constrain((frontPosition - FRONT_START) / (FRONT_END - FRONT_START), 0, 1);
  }
  updateAudio(audioDisorder);

  // L'opera originale distribuisce il disordine crescente nello spazio,
  // dall'alto verso il basso. Questa animazione svolge la stessa transizione
  // progressivamente nel tempo.
  //
  // Fase in avanti: le righe dietro il fronte sono completamente disordinate
  // e restano tali; quelle nella zona di transizione si avvicinano gradualmente
  // al loro target; quelle davanti restano ordinate. L'area disordinata cresce solo.
  //
  // Fase inversa: lo stesso principio al contrario — le righe dietro il fronte
  // sono completamente ordinate e restano tali; quelle nella zona di transizione
  // tornano gradualmente all'ordine; quelle davanti restano disordinate.
  // L'area ordinata cresce solo.
  for (let row = 0; row < ROWS; row++) {
    const rowProgress = row / (ROWS - 1);

    // Applica la direzione di propagazione: inverte rowProgress per andare dal basso verso l'alto
    const effectiveRowProgress = PROPAGATION_DIRECTION === 1 ? rowProgress : 1 - rowProgress;

    // Transizione cumulativa morbida.
    // rawDisorder = 0 per le righe ben dietro il fronte, 1 per quelle ben davanti.
    const rawDisorder = transizioneMorbida(
      frontPosition - FRONT_WIDTH / 2,
      frontPosition + FRONT_WIDTH / 2,
      effectiveRowProgress
    );

    // Avanti: righe dietro il fronte → 1 (disordinate), davanti → 0 (ordinate)
    // Indietro: righe dietro il fronte → 0 (ordinate), davanti → 1 (disordinate)
    const localDisorder = isForward ? 1 - rawDisorder : rawDisorder;

    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      const sq = squares[idx];

      // Interpola posizione e rotazione con lerp().
      // A localDisorder = 0: il quadrato è nella sua posizione di griglia, senza rotazione.
      // A localDisorder = 1: è nel suo stato target spostato e ruotato,
      // esattamente come nella ricostruzione statica.
      // intensity scala i target Schotter fissi (apertura della mano, o 1 di default).
      const x = lerp(sq.baseX, sq.baseX + sq.targetOffsetX * intensity, localDisorder);
      const y = lerp(sq.baseY, sq.baseY + sq.targetOffsetY * intensity, localDisorder);
      const angle = lerp(0, sq.targetRotation * intensity, localDisorder);

      push();
      translate(x, y);
      rotate(angle);
      rectMode(CENTER);
      rect(0, 0, SQUARE_SIZE, SQUARE_SIZE);
      pop();
    }
  }
}

// Attiva l'audio alla prima interazione dell'utente (regole di autoplay del browser)
function mousePressed() {
  if (!audioInitialized) {
    userStartAudio();
    initAudio();
  }
}

function keyPressed() {
  if (!audioInitialized) {
    userStartAudio();
    initAudio();
  }
}

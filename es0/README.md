# Schotter — Georg Nees (1968) — ricostruzione con p5.js

Ricostruzione generativa di *Schotter* ("Ghiaia", 1968) di Georg Nees, uno dei primi lavori di computer art. La composizione è una griglia verticale di quadrati non riempiti che perde progressivamente l'ordine attraverso spostamenti e rotazioni casuali dall'alto verso il basso.

## File

| File | Contenuto |
|------|-----------|
| `index.html` | Pagina d'ingresso — carica p5.js 2.3.3, p5.sound 0.4.1 e MediaPipe Hands da CDN |
| `style.css` | Stile minimale — centra la tela su pagina bianca |
| `sketch.js` | Tutta la logica generativa, i parametri, l'animazione, il tracciamento della mano e l'audio |

## Esecuzione

Apri la cartella con **Live Server**. Serve per la webcam (che richiede `localhost` o HTTPS) e per l'audio: il browser sblocca il suono solo dopo un clic o un tasto. Non c'è nessun passaggio di build.

## Parametri

Tutti i valori importanti sono costanti nominate all'inizio di `sketch.js`.

### Griglia e aspetto

| Costante | Valore | Descrizione |
|----------|--------|-------------|
| `COLS` | `12` | Numero di colonne |
| `ROWS` | `22` | Numero di righe |
| `SQUARE_SIZE` | `26` | Lato di ogni quadrato (pixel) |
| `SPACING_X` | `30` | Distanza orizzontale tra le posizioni della griglia |
| `SPACING_Y` | `30` | Distanza verticale tra le posizioni della griglia |
| `SEED` | `42` | Seme casuale — lo stesso seme dà sempre la stessa composizione |

### Limiti del disordine

| Costante | Valore | Descrizione |
|----------|--------|-------------|
| `MAX_DISPLACEMENT_X` | `12` | Spostamento orizzontale massimo all'ultima riga (pixel) |
| `MAX_DISPLACEMENT_Y` | `8` | Spostamento verticale massimo all'ultima riga (pixel) |
| `MAX_ROTATION` | `Math.PI / 2` | Angolo di rotazione massimo all'ultima riga (radianti) |

### Curve di progressione del disordine

| Costante | Valore | Descrizione |
|----------|--------|-------------|
| `DISPLACEMENT_CURVE` | `0.8` | Esponente dello spostamento — più basso = crescita più rapida all'inizio |
| `ROTATION_CURVE` | `0.9` | Esponente della rotazione — più basso = crescita più rapida all'inizio |

### Animazione

| Costante | Valore | Descrizione |
|----------|--------|-------------|
| `CYCLE_DURATION` | `22` | Secondi per un ciclo automatico completo |
| `HOLD_DURATION` | `2` | Secondi di pausa a disordine massimo |
| `FRONT_WIDTH` | `0.8` | Ampiezza della zona di transizione morbida (0–1) |
| `PROPAGATION_DIRECTION` | `1` | `1` = dall'alto verso il basso, `-1` = dal basso verso l'alto |
| `MODE` | `'hand'` | `'auto'`, `'mouse'` o `'hand'` |

### Tracciamento della mano

| Costante | Valore | Descrizione |
|----------|--------|-------------|
| `HAND_SMOOTHING` | `0.05` | Fattore di smussamento temporale |
| `HAND_TIMEOUT` | `2000` | ms prima di tornare all'ordine se la mano scompare |

### Audio

| Costante | Valore | Descrizione |
|----------|--------|-------------|
| `MASTER_VOLUME` | `1.0` | Volume generale (dopo il master c'è un limiter che prende i veri picchi) |
| `FUNDAMENTAL` | `55` | Hz — A1 basso, drone scuro |
| `FUNDAMENTAL_VOLUME` | `0.15` | Livello del drone a disordine = 0 |
| `DRONE_FADE` | `0.6` | A disordine = 1 il drone scende al 40% del suo livello |
| `LOWPASS_CUTOFF` | `1200` | Hz — taglio sopra questa frequenza, ben oltre la nota melodica più alta |
| `LOWPASS_Q` | `0.5` | Sotto 1, così il filtro resta gentile |
| `DETUNE_RATIO` | `0.015` | Deriva del ±1,5% a disordine = 1 (un rapporto, non Hz: mantiene il drone morbido) |
| `LFO_RATE` | `0.05` | Hz — velocità della modulazione lenta |
| `LFO_DEPTH` | `0.004` | Modulazione di frequenza del ±0,4% a disordine = 1 |
| `AUDIO_SMOOTHING` | `0.03` | Inerzia leggermente maggiore rispetto a quella visiva |
| `SCALE_ROOT` | `220` | Hz — A3, nota fondamentale della scala modale |
| `SCALE_INTERVALS` | `[1, 9/8, 5/4, 3/2, 5/3, 2]` | Intervalli in intonazione giusta |
| `NUM_MELODIC_NOTES` | `5` | Numero di note melodiche nella scala |
| `MELODIC_VOLUME` | `0.13` | Volume di ciascuna nota — basso abbastanza perché 5 note più il drone restino sotto 1.0 |
| `VIBRATO_RATE` | `5` | Hz — centro dell'intervallo casuale delle velocità di vibrato |
| `VIBRATO_SPREAD` | `1.2` | Hz — ogni nota ha una velocità intorno a `VIBRATO_RATE` |
| `VIBRATO_DEPTH` | `0.004` | Oscillazione del ±0,4% — oltre diventa ruvido |

### Indicazione

| Costante | Valore | Descrizione |
|----------|--------|-------------|
| `HINT_FONT_SIZE` | `24` | Dimensione del testo, in pixel |
| `HINT_PADDING` | `10` | Spaziatura interna, in pixel |
| `HINT_BACKGROUND_ALPHA` | `1` | Opacità del fondo bianco |
| `HINT_BORDER_WIDTH` | `2` | Spessore del bordo nero, in pixel |

## Modalità di interazione

### Automatica (`MODE = 'auto'`)

Un fronte di disordine attraversa la composizione dall'alto verso il basso:

1. **Avanti** — il disordine si accumula dall'alto verso il basso; le righe già attraversate restano nel loro stato target.
2. **Pausa** — lo stato Schotter completo resta visibile per `HOLD_DURATION` secondi.
3. **Indietro** — l'ordine torna progressivamente dall'alto verso il basso.

### Mouse (`MODE = 'mouse'`)

La posizione verticale del mouse controlla la stessa progressione cumulativa:

- mouse in alto → griglia perfettamente ordinata;
- mouse a metà → circa metà della composizione ha completato la transizione;
- mouse in basso → ricostruzione Schotter completa.

### Tracciamento della mano (`MODE = 'hand'`)

Usa webcam e MediaPipe Hands per tracciare una mano:

- **posizione Y della mano** → propagazione del disordine (alto = ordinato, basso = Schotter completo);
- **apertura della mano** → moltiplicatore di intensità del disordine (pugno = 0, mano aperta = 1).

Muovendo una mano aperta verso il basso si costruisce progressivamente la composizione completa. Chiudendo la mano si riduce la perturbazione verso l'ordine. L'interazione non modifica la regola generativa di Nees: permette a chi guarda di percorrere manualmente lo stesso processo ordine → disordine che la versione automatica svolge nel tempo.

Se la mano scompare per un attimo, l'ultimo stato valido viene mantenuto brevemente, poi si torna gradualmente all'ordine. Se il tracciamento fallisce del tutto, lo sketch passa alla modalità mouse.

## Suono generativo

Un drone ambient scuro segue lo stesso parametro di disordine che controlla la trasformazione visiva. Il sistema sonoro usa la stessa logica concettuale del sistema visivo:

- **visivo:** `posizione = posizioneOrdinata + scartoFisso * disordine`;
- **audio:** `frequenza = frequenzaStabile + disassonanzaFissa * disordine`.

Le disassonanze target vengono generate una volta e non vengono mai rigenerate a ogni fotogramma. Tutti i parametri audio usano uno smussamento forte per un'evoluzione continua.

### Strati sonori

- **Drone fondamentale** — seno basso (55 Hz), sempre presente.
- **Note melodiche** — note della scala modale (intonazione giusta) che emergono una a una con il disordine.
- **Modulazione LFO** — modulazione lenta della frequenza che cresce con il disordine.
- **Filtro passa-basso** — taglia sopra `LOWPASS_CUTOFF`, rendendo il mix più caldo e togliendo l'eventuale durezza della somma.
- **Limiter** — un `DynamicsCompressorNode` usato come brickwall, così il brano può essere ascoltato alto senza clipping.

Gli oscillatori vengono staccati dall'uscita predefinita di p5.sound e collegati solo alla catena `masterGain → filtro → limiter`: con p5.sound 0.4.1 l'uscita degli oscillatori è già collegata agli altoparlanti, e senza `disconnect()` il suono bypasserebbe filtro e limiter.

A disordine = 0 il suono è minimale e stabile. A disordine = 1 è denso e testurale, ma resta ambient e controllato.

## Interfaccia

- **Indicazione** — al centro della tela, scompare dopo la prima interazione. In modalità mano mostra «caricamento del tracciamento…» finché MediaPipe non è pronto, poi «muovi la mano per giocare»; se il tracciamento fallisce, passa a «muovi il mouse per giocare».

## Logica generativa

Ogni quadrato conserva valori target fissi generati una volta all'inizio:

- `baseX`, `baseY` — posizione originale nella griglia;
- `targetOffsetX`, `targetOffsetY` — spostamento target;
- `targetRotation` — rotazione target.

Durante l'animazione ogni quadrato interpola dal suo stato ordinato al suo stato target con `lerp()`:

```
x = lerp(baseX, baseX + targetOffsetX * intensity, localDisorder)
y = lerp(baseY, baseY + targetOffsetY * intensity, localDisorder)
angle = lerp(0, targetRotation * intensity, localDisorder)
```

Il valore `localDisorder` (0–1) viene calcolato riga per riga con una funzione cumulativa `transizioneMorbida`, basata sulla posizione della riga rispetto al fronte in movimento. Così l'animazione è deterministica e lo stato finale corrisponde esattamente alla ricostruzione statica.

## Riferimenti

- Georg Nees, *Schotter* ("Ghiaia"), 1968 — disegno a plotter, una delle prime opere generative;
- [p5.js](https://p5js.org/) — libreria JavaScript per arte creativa;
- [p5.sound.js](https://p5js.org/reference/p5.sound/) — libreria audio per p5.js;
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) — tracciamento della mano.

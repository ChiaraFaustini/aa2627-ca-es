// Obiettivo: far generare un'immagine e la sua animazione attraverso la definizione dei calcoli
// necessari per ottenere le componenti di rosso, verde e blu di tutti i pixel, lasciando che
// il caso o il rumore ne determinino l'aspetto.
//
// Vincoli ricavati dalle specifiche:
// - Tela di 600x600 pixel e immagine elaborata di 200x200 pixel, come nel codice di base
// - Codice di base invariato, tranne i calcoli di r, g e b nella funzione tixy(), dove si possono aggiungere altre variabili
// - Variabile t usata almeno una volta nei calcoli, per animare l'immagine
// - Almeno una delle funzioni random(), randomGaussian() e noise(), con il risultato usato nel calcolo di r, g o b
// - Anteprima "preview.png" con un fotogramma rappresentativo del risultato

function tixy(t, i, x, y) {
  // t = secondi (con decimali)
  // i = indice del pixel
  // x = coordinata x da 0.0 a 1.0
  // y = coordinata y da 0.0 a 1.0

  let r = 0; // calcolo del rosso
  let g = 0; // calcolo del verde
  let b = 0; // calcolo del blu

  return [r, g, b];
}

let risoluzione = 200;
let bitmap;

function setup() {
  createCanvas(600, 600);
  pixelDensity(1);
  noSmooth();
  bitmap = createImage(risoluzione, risoluzione);
  bitmap.loadPixels();
  bitmap.pixels.fill(255);
}

function draw() {
  background(0);
  let i = 0;
  let t = millis() / 1000;
  let iPix = 0;
  for (let y = 0; y < risoluzione; y++) {
    let yn = y / risoluzione;
    for (let x = 0; x < risoluzione; x++, i++) {
      let xn = x / risoluzione;
      let col = tixy(t, i, xn, yn);
      bitmap.pixels[iPix++] = col[0];
      bitmap.pixels[iPix++] = col[1];
      bitmap.pixels[iPix++] = col[2];
      iPix++;
    }
  }
  bitmap.updatePixels();
  image(bitmap, 0, 0, width, height);
}

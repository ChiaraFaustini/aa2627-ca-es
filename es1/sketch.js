function tixy(t, i, x, y) {
    // t = secondi (con decimali)
    // i = indice del pixel
    // x = coordinata x da 0.0 a 1.0
    // y = coordinata y da 0.0 a 1.0

    // il primo rumore sposta lo spazio lungo un vortice: è il domain warping,
    // e trasforma le macchie morbide in pieghe e venature
    let warp = noise(x * 3.0, y * 3.0, t * 0.04);
    let angolo = warp * 6.2831;
    let mx = x + cos(angolo) * 0.30;
    let my = y + sin(angolo) * 0.30;

    // il secondo rumore è la materia: una sostanza densa che scorre lenta
    let materia = noise(mx * 5.0, my * 5.0, t * 0.05);

    // le creste della materia diventano filamenti sottili, non macchie
    let vena = 1 - abs(sin(materia * 26 + t * 0.25));
    vena = pow(vena, 8);

    // zone dense e zone quasi nere, con un respiro lento che attraversa l'immagine
    let densa = pow(materia, 2.5);
    let pulsazione = 0.85 + 0.15 * sin(t * 0.8 - (x + y) * 6);

    // grana minuta: rompe la levigatezza del rumore senza diventare disturbo
    let grana = random(-4, 4);

    let r = 4 + (densa * 90 + vena * 195) * pulsazione + grana;
    let g = 0 + (densa * 8 + vena * 18) * pulsazione + grana * 0.4;
    let b = 5 + (densa * 16 + vena * 34) * pulsazione + grana * 0.6;

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
    let t = millis()/1000;
    let iPix = 0;
    for (let y = 0; y < risoluzione; y++) {
        let yn = y/risoluzione; 
        for (let x = 0; x < risoluzione; x++, i++) {
            let xn = x/risoluzione;
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

function tixy(t, i, x, y) {
    // t = secondi (con decimali)
    // i = indice del pixel
    // x = coordinata x da 0.0 a 1.0
    // y = coordinata y da 0.0 a 1.0

    // il primo rumore sposta lo spazio lungo un vortice: è il domain warping,
    // e trasforma le macchie morbide in pieghe e venature
    let warp = noise(x * 1.6, y * 1.6, t * 0.03);
    let angolo = warp * 6.2831;
    let mx = x + cos(angolo) * 0.45;
    let my = y + sin(angolo) * 0.45;

    // il secondo rumore è la materia: una sostanza densa che scorre lenta
    let materia = noise(mx * 3.6, my * 3.6, t * 0.04);

    // zone di rosso denso separate da vuoti quasi neri
    let massa = pow(max(0, materia - 0.42), 1.5) * 700 * (0.6 + warp);

    // strato largo di rosso spento: riempie i passaggi fra il nero e le creste
    let carne = max(0, materia - 0.25) * 70;

    // le creste della materia diventano filamenti sottili, non macchie
    let vena = 1 - abs(sin(materia * 50 + warp * 3 + t * 0.25));
    vena = pow(vena, 2.5);

    // il blu non è un punto a sé: cresce dove cresce il rosso, come il violetto
    // che traspare sotto la superficie delle vene
    let venaBlu = vena * (0.18 + 0.08 * warp);

    // in più, qualche filamento sottile quasi solo blu, a frequenza diversa
    // dalle vene rosse: l'esponente lo riduce a una linea di pochi pixel
    let filo = 1 - abs(sin(materia * 74 + warp * 2.2 - t * 0.18));
    // alone debole intorno al filo: ne ammorbidisce il bordo sui pixel vicini
    let aloneFilo = pow(filo, 3) * 0.3;
    filo = pow(filo, 6);

    // respiro lento che attraversa l'immagine
    let respiro = 0.85 + 0.15 * sin(t * 0.6 - x * 4 - y * 2);

    // grana minuta: rompe la levigatezza del rumore senza diventare disturbo
    let grana = random(-3, 3);

    let r = 4 + carne + massa * respiro + vena * 170 * respiro + filo * 60 + aloneFilo * 25 + grana;
    let g = 2 + carne * 0.03 + massa * 0.045 * respiro + vena * 16 * respiro + filo * 25 + aloneFilo * 8 + grana * 0.4;
    let b = 6 + carne * 0.05 + massa * 0.10 * respiro + venaBlu * 150 * respiro + filo * 210 + aloneFilo * 70 + grana * 0.6;

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

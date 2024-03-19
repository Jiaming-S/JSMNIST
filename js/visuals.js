

const nn = new NeuralNetwork(load=true);
const ds = new DatasetMNIST();

const sidebarCanvas = document.querySelector("#sidebar-canvas");
const sidebarCtx = sidebarCanvas.getContext('2d');

document.querySelector('#next-button').addEventListener('click', () => {
  ds.getNextSample();
  mainCanvasState.reset();
  
  renderSidebar();
  renderMainCanvas();
});

const mainCanvas = document.querySelector('#main-canvas');
const mainCtx = mainCanvas.getContext('2d');

class CanvasState {
  constructor() {
    this.state = nj.zeros([28, 28]);
    this.boundingRect = mainCanvas.getBoundingClientRect(); 

    mainCanvas.addEventListener('click', (e) => {
      let coords = this.coordToInd(e.clientX, e.clientY);
      this.draw(coords.r, coords.c);
      renderMainCanvas();
    });

    let mouseHeld = false;
    document.addEventListener('mousedown', (e) => (mouseHeld = true));
    document.addEventListener('mouseup', (e) => (mouseHeld = false));
    document.addEventListener('mousemove', (e) => {
      if (mouseHeld) {
        let coords = this.coordToInd(e.clientX, e.clientY);
        this.draw(coords.r, coords.c);
        renderMainCanvas();
      }
    });
  }

  reset() {
    this.state = nj.zeros([28, 28]);
  }

  coordToInd(x, y) {
    let row = parseInt((y - this.boundingRect.y) * 28 / 700);
    let col = parseInt((x - this.boundingRect.x) * 28 / 700);
    if (row < 0 || col < 0 || row >= 28 || col >= 28) {
      return {
        r: -1, 
        c: -1,
      };
    }
    else {
      return {
        r: row,
        c: col,
      }
    }
  }

  draw(r, c) {
    const kernel = [
      [0.2, 0.5, 0.2], 
      [0.5, 0.8, 0.5],
      [0.2, 0.5, 0.2], 
    ];
    const kernelCenter = 1;
    const kernelSize = 3;

    for (let i = 0; i < kernelSize; i++) {
      for (let j = 0; j < kernelSize; j++) {
        let stateR = r + (kernelCenter - i);
        let stateC = c + (kernelCenter - j);
        if (stateR < 0 || stateC < 0 || stateR > 28 || stateC > 28) continue;

        this.state.set(stateR, stateC, this.state.get(stateR, stateC) + kernel[i][j]);
      }
    }
  }

  getState() {
    return this.state;
  }
}

const mainCanvasState = new CanvasState();

function visualizeSample(ctx, xpos, ypos, size, sample) {
  let pixelSize = size / 28;
  let pic = nj.zeros([28, 28]); 

  if (sample !== null) pic = sample.reshape(28, 28);

  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
      ctx.fillStyle = `hsl(0, 0%, ${pic.get(i, j) * 100}%)`;
      ctx.fillRect(xpos + pixelSize * j, ypos + pixelSize * i, pixelSize, pixelSize);
    }
  }
}

function visualizeOutputs(ctx, xpos, ypos, size, outputs) {
  let pixelSize = size / 10;
  let res = nj.zeros(10);

  if (outputs !== null) res = nj.array(outputs);
  res = res.subtract(res.min());
  res = res.divide(res.max());

  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = `hsl(0, 0%, ${res.get(i) * 100}%)`;
    if (res.get(i) >= 0.999) ctx.fillStyle = 'red';  
    ctx.fillRect(xpos, ypos + pixelSize * i, pixelSize, pixelSize);
    ctx.font = `${parseInt(pixelSize / 1.5)}px Inter`;
    ctx.fillText(`${i}`, xpos + pixelSize * 1.1, ypos + pixelSize * (i + 0.75)); 
  }
}



/// --- RENDER MAIN CANVAS --- ///
function renderMainCanvas (){
  visualizeSample(mainCtx, 0, 0, 700, mainCanvasState.getState());

  let outputs = nn.forward(mainCanvasState.getState().flatten());
  visualizeOutputs(mainCtx, 750, 0, 700, outputs);
}
renderMainCanvas();
/// --- RENDER MAIN CANVAS --- ///








/// --- RENDER SIDEBAR CANVAS --- ///
function renderSidebar (){
  // sidebarCtx.clearRect(0, 0, sidebarCanvas.width, sidebarCanvas.height);
  visualizeSample(sidebarCtx, 0, 0, 200, ds.getNextSample(false).x);

  if (ds.getNextSample(false) == null) {
    document.querySelector('#sidebar-truth').textContent = "--";
    document.querySelector('#sidebar-prediction').textContent = "--";
  }
  else {
    let truth = ds.getNextSample(false).y;
    truth = truth.tolist().indexOf(1) + 1;
    document.querySelector('#sidebar-truth').textContent = truth;
  
    let out = nn.forward(ds.getNextSample(false)?.x);
    let curMax = 0;
    let pred = -1;
    for (let i = 0; i <= out.length; i++) {
      if (out[i] > curMax) {
        curMax = out[i];
        pred = i;
      }
    }
    document.querySelector('#sidebar-prediction').textContent = pred;
  }
}
renderSidebar();
/// --- RENDER SIDEBAR CANVAS --- ///





const isDebug = window.location.host.includes('localhost:800');
const apiUrlBase = isDebug ? 'http://localhost:8000/' : 'https://chanabi.deno.dev/';
const xhr = new XMLHttpRequest();

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector('canvas#canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'rgb(0, 0, 0)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

/**
 * @type {HTMLInputElement}
 */
const input = document.querySelector('input#message');
input.addEventListener('change', (ev) => {
  if (!ev.target.value) return;
  /**
   * @type {string}
   * メッセージ花火で打ち上げる文字列
   */
  const message = ev.target.value;
  const len = message.length;
  const charSize = (canvas.height) / len;
  console.log(charSize);

  // 文字の大きさを指定
  if (len > 0) ctx.font = `${charSize}px "Noto Sans JP"`;

  // canvasの初期化
  ctx.clearRect(0, 0, canvas.width, canvas.width);
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // canvasに文字列を描画
  ctx.fillStyle = 'rgb(255, 255, 255)';
  const textSize = ctx.measureText(message);
  const textHeight = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;
  const textWidth = textSize.width;
  console.log(textSize);
  ctx.fillText(message, (canvas.width - textWidth) / 2, (canvas.height + textHeight) / 2);
});

/**
 * @type {HTMLButtonElement}
 */
const submitButton = document.querySelector('input#submit[type="button"]');
submitButton.addEventListener('click', () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  console.log(imageData)
  const dots = [];

  const interval = 3;
  console.log(canvas.height * canvas.width);
  for (let i = 0; i < canvas.height; i++) {
    if (i % interval !== 0) continue;
    for (let j = 0; j < canvas.width; j++) {
      if (j % interval !== 0) continue;
      const base = (i * canvas.width + j) * 4;
      if (imageData[base] === 255 && imageData[base + 1] === 255 && imageData[base + 2] === 255) {
        dots.push([j, i]);
      }
    }
  }

  const body = {
    message: input.value,
    dots: dots
  };
  console.log(body);

  // xhrを使ってAPIリクエストを行う
  // 参考: https://kinsta.com/jp/knowledgebase/javascript-http-request/
  xhr.open('post', apiUrlBase + 'message');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 201) {
      console.log(JSON.parse(xhr.responseText));
    } else {
      console.log(`Error: ${xhr.status}`);
    }
  };
  xhr.send(JSON.stringify(body));
})
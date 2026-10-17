const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:#08090d; display:flex; align-items:center; justify-content:center; height:100vh;">
        <h1 id="counter" style="color:white; font-size:60px;">Frame 0</h1>
        <script>
          function setFrame(n) {
            document.getElementById('counter').innerText = 'Frame ' + n;
          }
        </script>
      </body>
    </html>
  `);

  console.time('30 frames');
  for (let i = 0; i < 30; i++) {
    await page.evaluate((n) => setFrame(n), i);
    await page.screenshot({ type: 'jpeg', quality: 90 });
  }
  console.timeEnd('30 frames');

  await browser.close();
})();

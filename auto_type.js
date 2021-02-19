const puppeteer = require("puppeteer");

// 設定値
const target_url = ""; // 対象サイトのURLを入力してください。
const options = {
  headless: false,
  defaultViewport: null,
  args: [
    //'--start-fullscreen',
    //'--disable-infobars',
    //'--incognito'
  ],
};
// パターン1: 丁度一位になるくらいの時間は...{sleep_.._alphabets: 50, sleep_.._words: 500}
// パターン2: 最速になる時間は...{sleep_.._alphabets: 0, sleep_.._words: 0}
const sleep_ms_between_alphabets = 0;
const sleep_ms_between_words = 0;
const alphabet_exceptions = ["-"];

var prev_word = "";
(async () => {
  async function sleep(delay_ms) {
    return new Promise((resolve) => setTimeout(resolve, delay_ms));
  }
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto(target_url);
  await page.keyboard.down("Enter");
  await page.waitForSelector(".return", { visible: true });

  let words = [];

  try {
    while (true) {
      const word = await page.$eval(".word", (el) => {
        return el.innerText;
      });
      if (prev_word === word) {
        throw "新しい単語ではありません。";
      }
      words.push(word);
      console.log(`${words.length}番目...「${word}」`);
      if (sleep_ms_between_words !== 0) {
        await sleep(sleep_ms_between_words);
      }
      for (let alphabet of word.split("")) {
        const charCode = alphabet_exceptions.includes(alphabet)
          ? alphabet
          : "Key" + alphabet.toUpperCase();
        await page.keyboard.down(charCode);
        if (sleep_ms_between_alphabets !== 0) {
          await sleep(sleep_ms_between_alphabets);
        }
      }
      prev_word = word;

      // 時間切れになった際、終了する
      const result = await page.$(".result-box");
      if (result !== null) {
        throw "制限時間が終了しました。";
      }
    }
  } catch (err) {
    console.log(`[ERROR]::${err}`);
  } finally {
    console.log(`タイプした単語数は「${words.length}単語」です！`);
  }

  // await page.screenshot({path: 'score.png'});
  // await browser.close();
})();

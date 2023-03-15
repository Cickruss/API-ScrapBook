const puppeteer = require('puppeteer');

async function initBrowser() {

    const browser = await puppeteer.launch({ args: ["--incognito"], headless: false }); //Launches browser in incognito
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage(); //Ensures the new page is also incognito
    await page.evaluateOnNewDocument(() => { delete navigator.proto.webdriver; });
    await page.goto('http://localhost/Biblivre5/?action=circulation_reservation'); //goes to given link
    return page;
}

async function Login(page) {
    await page.type('[name="username"]', 'admin');
    await page.type('[name="password"]', 'abracadabra');
    await page.focus('[name="password"]');
    await page.keyboard.press('Enter');
    await page.waitForNavigation();

    return page;
}

(async () => {
    const page = await initBrowser()
    await Login(page)
})()

// chamada de função padrão //
/*(async () => {
    const page = await initBrowser()
    await Login(page)
})() */



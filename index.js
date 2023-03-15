const puppeteer = require('puppeteer');


async function Login(params) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('http://localhost/Biblivre5/?action=circulation_reservation');
    await page.type('[name="username"]', 'admin');
    await page.type('[name="password"]', 'abracadabra');
    await page.focus('[name="password"]');
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    await page.click('[data-action="circulation_lending"]');

}

const page = Login();

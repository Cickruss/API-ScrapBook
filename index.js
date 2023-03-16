const puppeteer = require('puppeteer');

// INICIAR SISTEMA //
async function initBrowser() {

    const browser = await puppeteer.launch({ args: ["--incognito"], headless: false });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.evaluateOnNewDocument(() => { delete navigator.proto.webdriver; });
    await page.goto('http://127.0.0.1:8080/Biblivre5/'); //goes to given link
    return page;
}

async function Login(page) {
    await page.type('[name="username"]', 'admin');
    await page.type('[name="password"]', 'abracadabra');
    await page.focus('[name="password"]');
    await page.keyboard.press('Enter');

    return page;
}
///////////////////////////////


// ABRE A ABA DE EMPRÉSTIMOS //
async function LendingPage(page) {
    const menuCirculation = await page.$('li.menu_circulation');
    await menuCirculation.hover();
    await page.waitForSelector('ul.submenu');
    const lendingOption = await menuCirculation.$('a[href="?action=circulation_lending"]');
    await lendingOption.click();
}
async function InputNameFromCard(page) {
    const inputUser = '[placeholder="Preencha os termos da pesquisa"]';
    const userRegistration = '00001';
    await page.type(inputUser, userRegistration);
    await page.focus(inputUser);
    await page.keyboard.press('Enter');
}

async function InputBookFromRfid(page) {
    const InputBook = '[placeholder="Tombo patrimonial"]';
    let bookRegistration = 'Bib.2023.1';
    await page.type(InputBook, bookRegistration);
    await page.focus(InputBook);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const [lendingButton] = await page.$x("//a[contains(text(), 'Emprestar')]");
    await lendingButton.click();
}

// Tempo de desenvolvimento: 2h20 :)))
///////////////////////////////////////////


// FUNÇÃO PRINCIPAL //
(async () => {
    const page = await initBrowser()
    await Login(page);
    await page.waitForNavigation();
    await LendingPage(page);
    await page.waitForNavigation();
    await InputNameFromCard(page);
    await InputBookFromRfid(page);
})()
/////////////////////////////////////////
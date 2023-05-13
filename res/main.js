const puppeteer = require('puppeteer');
//const Load = require('./LoanPage');

// INICIAR SISTEMA //
async function initBrowser() {

    const browser = await puppeteer.launch({ args: ["--incognito"], headless: false });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.evaluateOnNewDocument(() => { delete navigator.webdriver; });
    await page.goto('http://127.0.0.1:8080/Biblivre5/');
    return page;
}

async function Login(page) {
    await page.type('[name="username"]', 'admin');
    await page.type('[name="password"]', 'abracadabra');
    await page.focus('[name="password"]');
    await page.keyboard.press('Enter');

    return page;
}
// ABRE A ABA DE EMPRÉSTIMOS //

async function LendingPage(page) {
    const menuCirculation = await page.$('li.menu_circulation');
    await menuCirculation.hover();
    await page.waitForSelector('ul.submenu');
    const lendingOption = await menuCirculation.$('a[href="?action=circulation_lending"]');
    await lendingOption.click();
}
async function InputNameFromCard(page, idCard) {
    const inputUser = '[placeholder="Preencha os termos da pesquisa"]';
    await page.evaluate(async () => {
        const divNome = Array.from(document.querySelectorAll('div.combo_text')).find(div => div.textContent.trim() === 'Nome ou Matrícula');
        const divObservacoes = Array.from(document.querySelectorAll('div.combo_row')).find(div => div.textContent.trim() === 'Observações');

        if (divNome) {
            divNome.click();
            await new Promise(resolve => setTimeout(resolve, 0)); // Aguarda 1 segundo (ajuste conforme necessário)
            if (divObservacoes) {
                divObservacoes.click();
            }
        }
    });
    // const nameForInput = assignLetters(idCard); NAO PRECISAMOS MAIS PQ CONSEGUIMOS PELAS OBSERVAÇÕES
    await page.type(inputUser, idCard);
    await page.focus(inputUser);
    await page.keyboard.press('Enter');
}

async function InputBookFromRfid(page, bookRegistration) {
    const inputBook = '[placeholder="Tombo patrimonial"]';
    await page.type(inputBook, bookRegistration);
    await page.focus(inputBook);
    await page.keyboard.press('Enter');
    await GetUserName(page)
}


async function ClickLendingButton(page) {
    await page.waitForTimeout(500);
    await page.evaluate(() => {
        const buttons = document.querySelectorAll('a.button.center');
        for (const button of buttons) {
            if (button.textContent.trim() === 'Emprestar') {
                button.click();
                break;
            }
        }
    });
}
async function ClearInput(page){
    const inputBook = '[placeholder="Tombo patrimonial"]';
    await page.focus(inputBook);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
}
async function GetUserName(page){
    let name = await page.evaluate(() => {
        const label = document.querySelector('label');
        if (label.textContent.trim() === 'Nome') {
            const nameElement = label.nextSibling;
            return nameElement.textContent.trim();
        }
        return null;
    });
    name = name.substring(2, name.length);
    console.log("Nome: " + name);
    return name;
}
async function GetBookTitle(page) {
    await page.waitForSelector('#holding_search div.record');
    let bookTitle = await page.evaluate(() => {
        const holdingSearchDiv = document.querySelector('#holding_search');
        const recordDiv = holdingSearchDiv.querySelector('div.record');
        const titleLabel = recordDiv.querySelector('label');

        if (titleLabel && titleLabel.textContent.trim() === 'Título') {
            const titleText = titleLabel.nextSibling.textContent.trim();
            return titleText;
        }

        return null;
    });
    bookTitle = bookTitle.substring(2);
    console.log("Titulo: " + bookTitle)
    return bookTitle;
}

async function GetBookAuthor(page) {
    await page.waitForSelector('#holding_search div.record');

    let bookAuthor = await page.evaluate(() => {
        const holdingSearchDiv = document.querySelector('#holding_search');
        const recordDiv = holdingSearchDiv.querySelector('div.record');
        const authorLabel = recordDiv.querySelector('label:nth-of-type(2)');
        const authorText = authorLabel.nextSibling.textContent.trim();

        return authorText;
    });
    bookAuthor = bookAuthor.substring(2);
    console.log("Autor: "+bookAuthor);
    return bookAuthor;
}
async function GetReturnDate(page) {
    await page.waitForSelector('.result.user_lending');
    let returnDate = await page.evaluate(() => {
        const lendingDiv = document.querySelector('.result.user_lending');
        const lendingDateLabel = Array.from(lendingDiv.querySelectorAll('label')).find(label => label.textContent.trim() === 'Data prevista para devolução');
        if (lendingDateLabel) {
            const returnDateText = lendingDateLabel.nextSibling.textContent.trim();
            return returnDateText;
        }
        return null;
    });
    returnDate = returnDate.substring(2);
    console.log("Data de devolução: "+returnDate);
    return returnDate;
}

async function ClickGiveBack(page) {
    await page.waitForTimeout(500);
    await page.evaluate(() => {
        const devolverButton = document.querySelector('div.buttons a[onclick^="HoldingSearch.returnLending"]');
        if (devolverButton) {
            devolverButton.click();
        }
    });
}
async function Lending(page){
    await ClickLendingButton(page);
    await GetReturnDate(page);
    await ClearInput(page);
}
async function ReturnBook(page){
    await ClickGiveBack(page);
    await ClearInput(page)
}
async function SearchBook(page, idCard, bookRegistration){
    await page.waitForNavigation();
    await InputNameFromCard(page, idCard);
    await InputBookFromRfid(page, bookRegistration);
    await GetBookTitle(page);
    await GetBookAuthor(page);
}

// FUNÇÃO PRINCIPAL //

// LendingAndReturn: 7h30min.
// GetInfo: 3h12min.

(async () => {
    const page = await initBrowser()
    await Login(page);

    //Navegar para a pagina de emprestimos
    await page.waitForNavigation();
    await LendingPage(page);
    const idCard = '3816698861';
    const bookRegistration = '2786198664';

    // Pegar Informações do Livro //
    await SearchBook(page, idCard, bookRegistration);

    // Emprestimo livro //
    await Lending(page);

    // Devolução de livro //
    //await ReturnBook(page);


    /*// Cadastro de usuários //
    await page.waitForNavigation();
    await UserRegistration(page);
    await page.waitForNavigation();
    await ClickNewUser(page);
    await page.waitForNavigation();
    await EnterUserName(page);
    await EnterUserType(page);
    await EnterUserEmail(page);
    await EnterRfidId(page);*/



})()
/////////////////////////////////////////

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
async function ChangeComboBoxLendingPage(page){
    const comboTextField = await page.$('div.combo_text');
    await comboTextField.click();
    const [observation] = await page.$x("//div[contains(text(), 'Observações')]");
    await observation.click();
}
async function InputNameFromCard(page) {
    const inputUser = '[placeholder="Preencha os termos da pesquisa"]';
    const userRegistration = '1044597020';
    await page.type(inputUser, userRegistration);
    await page.focus(inputUser);
    await page.keyboard.press('Enter');
}

async function InputBookFromRfid(page) {
    const inputBook = '[placeholder="Tombo patrimonial"]';
    let bookRegistration = ['1044600329','3816698861'];
    for (let i = 0; i < bookRegistration.length; i++) {
        await page.type(inputBook, '');
        await page.type(inputBook, bookRegistration[i]);
        await page.focus(inputBook);
        await page.keyboard.press('Enter');
    }
}

async function ClickLendingButton(page) {
    await page.waitForTimeout(500);
    const [lendingButton] = await page.$x("//a[contains(text(), 'Emprestar')]");
    await lendingButton.click();
}
async function ClickGiveBack(page) {
    await page.waitForTimeout(500);
    const [lendingButton] = await page.$x("//a[contains(text(), 'Devolver')]");
    await lendingButton.click();
}

// Tempo de desenvolvimento: 3h :)))
///////////////////////////////////////////
// Cadastro de usuário -> Novo usuário
// Esperar campo de nome ser preenchido
// Conferir se o campo de nome está preenchido
// Se sim, passar para o campo de telefone ou outra coisa
// Confirmar se o campo de nome está vazio, se sim -> esperar que seja diferente de "" (o admin passar o cartão)
// Cadastrar depois disso


// TELA DE CADASTRO DE USUÁRIOS //
async function UserRegistration(page){
    const menuCirculation = await page.$('li.menu_circulation');
    await menuCirculation.hover();
    await page.waitForSelector('ul.submenu');
    const lendingOption = await menuCirculation.$('a[href="?action=circulation_user"]');
    await lendingOption.click();
}

// Função que clica no botão de Novo Usuário.
async function ClickNewUser(page){
    const newUserButton = ".new_record_button";
    await page.click(newUserButton);
}

async function EnterUserName(page){
    await page.waitForSelector('[name="name"]')
    const usernameField = '[name="name"]';
    //const usernameField = await page.$('input[name="name"]');
    //await page.focus(usernameField);
    const userName = 'Bruninha Gameplay';
    async function EnterUserType(page) {
        const userTypeField = '[name="type"]';
        const type = '1';
        await page.select(userTypeField, type);
    }
    async function EnterUserEmail(page) {
        const userEmail = "porcoassado@yahoo.com";
        const userEmailField = '[name="email"]';
        await page.type(userEmailField, userEmail);
    }
    async function EnterRfidId(page) {
    await page.type(usernameField, userName); //ao inves de nome do leitor será o nome do formulário.
}
    const rfidId = "3815190397";
    const obsField = '[name="obs"]'
    await page.type(obsField, rfidId);
}
// Tempo de desenvolvimento: 1:24


// FUNÇÃO PRINCIPAL //
(async () => {
    const page = await initBrowser()
    await Login(page);

    // Emprestimo livro //
    await page.waitForNavigation();
    await LendingPage(page);
    await page.waitForNavigation();
    await ChangeComboBoxLendingPage(page);
    await InputNameFromCard(page);
    await InputBookFromRfid(page);
    await ClickLendingButton(page);
    /////////////////////

    /*// Devolução de livro //
    await page.waitForNavigation();
    await LendingPage(page);
    await page.waitForNavigation();
    await InputNameFromCard(page);
    await InputBookFromRfid(page);
    await ClickGiveBack(page);
    ///////////////////////*/


    /*// Cadastro de usuários //
    await page.waitForNavigation();
    await UserRegistration(page);
    await page.waitForNavigation();
    await ClickNewUser(page);
    await page.waitForNavigation();
    await EnterUserName(page);
    await EnterUserType(page);
    await EnterUserEmail(page);
    await EnterRfidId(page);*!/*/



})()
/////////////////////////////////////////
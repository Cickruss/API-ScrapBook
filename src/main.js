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
async function InputNameFromCard(page) {
    const inputUser = '[placeholder="Preencha os termos da pesquisa"]';
    const idCard = '1044600329';
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
    const nameForInput = assignLetters(idCard);
    await page.type(inputUser, nameForInput);
    await page.focus(inputUser);
    await page.keyboard.press('Enter');
}

async function InputBookFromRfid(page) {
    const inputBook = '[placeholder="Tombo patrimonial"]';
    let bookRegistration = '456789'; // PEGAR INPUT RFID PARAMETRO

    await page.type(inputBook, bookRegistration);
    await page.focus(inputBook);
    await page.keyboard.press('Enter');
    //await page.waitForTimeout(2000);
    //  await ClickLendingButton(page);
    //await page.waitForTimeout(2000);
    await page.focus(inputBook);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

}

async function GetBookTitle(page){
    const bookTitle = await page.evaluate(() => {
        const divRecord = document.querySelector('div.record');
        if (divRecord) {
            const tituloLabel = divRecord.querySelector('label');
            if (tituloLabel && tituloLabel.textContent.trim() === 'Título') {
                const tituloText = tituloLabel.nextSibling.textContent.trim();
                return tituloText;
            }
        }
        return null;
    });
    console.log(bookTitle.substring(2,bookTitle.length));
    return bookTitle.substring(2,bookTitle.length);
}

async function GetBookAuthor(page) {
    const autor = await page.evaluate(() => {
        const divRecord = document.querySelector('div.record');
        if (divRecord) {
            const tituloLabel = divRecord.querySelector('label');
            if (tituloLabel && tituloLabel.textContent.trim() === 'Título') {
                const tituloText = tituloLabel.nextSibling.textContent.trim();
                const autorLabel = Array.from(divRecord.querySelectorAll('label')).find(label => label.textContent.trim() === 'Autor');
                if (autorLabel) {
                    const autorElement = autorLabel.nextSibling;
                    if (autorElement) {
                        return autorElement.textContent.trim();
                    }
                }
            }
        }
        return null;
    });

    console.log(autor.substring(2,autor.length));
    return autor.substring(2,autor.length);
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
async function ClickGiveBack(page) {
    await page.waitForTimeout(500);
    const [lendingButton] = await page.$x("//a[contains(text(), 'Devolver')]");
    await lendingButton.click();
}

function assignLetters(idCard){
    let equivalentLetters = ['a', 'r', 'n', 'd','u', 't', 'e', 'c', 'h', 'g'];
    //let idCard = "1044600329";
    let idCardArray = idCard.split('');
    let nameForInput = '';
    for (i = 0; i < idCardArray.length; i ++) {
        nameForInput += (equivalentLetters[idCardArray[i]]);
    }
    //console.log(nameForInput)
    return nameForInput;
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
// Tempo de desenvolvimento: 1h24min


// FUNÇÃO PRINCIPAL //

// A função de desenvolvimento do empréstimo de livros durou 6h15min
(async () => {
    const page = await initBrowser()
    await Login(page);

    // Emprestimo livro //
    await page.waitForNavigation();
    await LendingPage(page);
    await page.waitForNavigation();
    await InputNameFromCard(page);
    await InputBookFromRfid(page);
    await GetBookTitle(page);
    await GetBookAuthor(page);
    //await ClickLendingButton(page);
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
const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
//const idCard = document.querySelector('#input').value;
const bookRegistration = '2786460808';
//const idCard = '1044600329';



app.get('/open-biblivre', async (req, res) => {
    document.getElementById('saveButton').addEventListener('click', () => {
        const userId = document.getElementById('userIdInput').value;
        const bookId = document.getElementById('bookIdInput').value;

        const data = {
            userId: userId,
            bookId: bookId,
        };

        const jsonData = JSON.stringify(data);

        // ... Resto do código para escrever o objeto JSON em um arquivo ou fazer o que for necessário com ele
    });

    try {
        const browser = await puppeteer.launch({ args: ["--incognito"], headless: false });
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.evaluateOnNewDocument(() => { delete navigator.webdriver; });
        await page.goto('http://127.0.0.1:8080/Biblivre5/');
        await Login(page);
        await page.waitForNavigation();
        await LendingPage(page);
        await SearchUser(page, idCard);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.use(express.static('C:\\Users\\Isadora\\IdeaProjects\\Curumim\\res\\index.html')); // Serve o arquivo HTML estático


app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});



/*  const openBiblivreButton = document.getElementById('openBiblivreButton');
  openBiblivreButton.addEventListener('click', async () => {
      try {
          const page = await initBrowser();
          alert("Catato")
          // Aqui você pode adicionar mais lógica para interagir com a página do Biblivre, se necessário
      } catch (error) {
          console.error(error);
      }
  });*/

/*
// Função para abrir o Biblivre usando o Puppeteer
function initBrowser() {
  return new Promise(async (resolve, reject) => {
      try {
          const browser = await puppeteer.launch({ args: ["--incognito"], headless: false });
          const context = await browser.createIncognitoBrowserContext();
          const page = await context.newPage();
          await page.evaluateOnNewDocument(() => { delete navigator.webdriver; });
          await page.goto('http://127.0.0.1:8080/Biblivre5/');
          resolve(page);
      } catch (error) {
          reject(error);
      }
  });
}
*/


// INICIAR SISTEMA //

/*async function initBrowser() {

    const browser = await puppeteer.launch({ args: ["--incognito"], headless: false });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.evaluateOnNewDocument(() => { delete navigator.webdriver; });
    await page.goto('http://127.0.0.1:8080/Biblivre5/');
    return page;
}

*/
async function  Login(page) {
    await page.type('[name="username"]', 'admin');
    await page.type('[name="password"]', 'abracadabra');
    await page.focus('[name="password"]');
    await page.keyboard.press('Enter');
    return page;
}

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
async function GetUserName(page) {
    await page.waitForSelector('div.record');

    let userName = await page.evaluate(() => {
        const recordDiv = document.querySelector('div.record');
        const nameLabel = recordDiv.querySelector('label');
        if (nameLabel && nameLabel.textContent.trim() === 'Nome') {
            const nameText = nameLabel.nextSibling.textContent.trim();
            return nameText;
        }

        return null;
    });

    if (userName) {
        userName = userName.substring(2);
        console.log("Nome: " + userName);
        return userName;
    }
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
async function StartConnection(){
    const page = await initBrowser()
    await Login(page);

    await page.waitForNavigation();
    await LendingPage(page);
    return page;
}
async function SearchUser(page, idCard){
    await page.waitForNavigation();
    await InputNameFromCard(page, idCard);
    return await GetUserName(page)
}
async function SearchBook(page, bookRegistration){
    await InputBookFromRfid(page, bookRegistration);
    await GetBookTitle(page);
    await GetBookAuthor(page);
}


// FUNÇÃO PRINCIPAL //

// LendingAndReturn: 7h30min.
// GetInfo: 3h12min.

/*
(async () => {

    const page = await StartConnection();
    const idCard = '1044600329';
    const bookRegistration = '2786460808';
    await initBrowser(page);
    // Pegar informações do usuário //
   // await SearchUser(page, idCard);

    // Pegar Informações do Livro //
    //await SearchBook(page,bookRegistration);

    // Emprestimo livro //
    //await Lending(page);

    // Devolução de livro //
    //await ReturnBook(page);
})
    /* Cadastro de usuários //
    await page.waitForNavigation();
    await UserRegistration(page);
    await page.waitForNavigation();
    await ClickNewUser(page);
    await page.waitForNavigation();
    await EnterUserName(page);
    await EnterUserType(page);
    await EnterUserEmail(page);
    await EnterRfidId(page);
})() }
































/////////////////////////////////////////
/*// TELA DE CADASTRO DE USUÁRIOS //
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
// Tempo de desenvolvimento: 1h24min*/

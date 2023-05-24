const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');

let page;

let idCard, username, idBook, bookTitle, bookAuthor;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/Pages/redPage.html');
})
app.post('/', (req, res) => {
    idCard = req.body.idCardInput;
    console.log('Valor do input:', idCard);
    res.send('Valor do input recebido: ' + idCard);
    return idCard;
});
app.get('/yellowPage', async (req, res) => {
    console.log('Id card Passou para o programa global: \n' + idCard);
    try {
        const browser = await puppeteer.launch({ args: ["--incognito"], headless: false });
        const context = await browser.createIncognitoBrowserContext();
        page = await context.newPage();
        await page.evaluateOnNewDocument(() => { delete navigator.webdriver; });
        await page.goto('http://127.0.0.1:8080/Biblivre5/');
        console.log("Biblivre entrou");
        await Login(page);
        await page.waitForNavigation();
        await LendingPage(page);
        await page.waitForNavigation();
        username = await InputNameFromCard(page, idCard);
        console.log("Username Retornado ao servidor: "+ username);


        res.sendFile(__dirname + '/Pages/yellowPage.html');
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});
app.get('/bluePageLend', async (req, res) => {
    res.sendFile(__dirname + '/Pages/bluePageLend.html');
});
app.post('/bluePageLend', (req, res) => {
    idBook = req.body.idBookInput;
    console.log('Valor do input:', idBook);
    return idBook;
});
app.get('/bluePageInfo', async (req, res) => {
    console.log('Entrou na tela de informações do livro');
    console.log('IdBook: ' + idBook);
    try{
         await InputBookFromRfid(page, idBook);
         bookTitle = await GetBookTitle(page);
         console.log(bookTitle);
         res.sendFile(__dirname + '/Pages/bluePageInfo.html');
    }catch (error) {
        console.error(error);
        res.sendStatus(500);
    }


});
app.get('/greenPage', (req, res) => {
    res.sendFile(__dirname + '/Pages/greenPage.html');
})

app.listen(8081, () => {
    console.log('Server on!');
});

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
    await page.evaluate(async (idCard) => {
        const divNome = Array.from(document.querySelectorAll('div.combo_text')).find(div => div.textContent.trim() === 'Nome ou Matrícula');
        const divObservacoes = Array.from(document.querySelectorAll('div.combo_row')).find(div => div.textContent.trim() === 'Observações');

        if (divNome) {
            divNome.click();
            await new Promise(resolve => setTimeout(resolve, 0)); // Aguarda 1 segundo (ajuste conforme necessário)
            if (divObservacoes) {
                divObservacoes.click();
            }
        }
        const inputElement = document.querySelector('[placeholder="Preencha os termos da pesquisa"]');
        inputElement.value = idCard;
    }, idCard);

    await page.focus(inputUser);
    // await page.type(inputUser, String(idCard));
    await page.keyboard.press('Enter');
    const username = await GetUserName(page);
    return username;

}
async function GetUserName(page) {
    await page.waitForSelector('div.record');

    let username = await page.evaluate(() => {
        const recordDiv = document.querySelector('div.record');
        const nameLabel = recordDiv.querySelector('label');
        if (nameLabel && nameLabel.textContent.trim() === 'Nome') {
            const nameText = nameLabel.nextSibling.textContent.trim();
            return nameText;
        }

        return null;
    });

    if (username) {
        username = username.substring(2);
        console.log("Nome: " + username);
        return username;
    }
}

async function InputBookFromRfid(page, idBook) {
    const inputBook = '[placeholder="Tombo patrimonial"]';
    await page.type(inputBook, '');
    await page.type(inputBook, idBook);
    await page.focus(inputBook);
    await page.keyboard.press('Enter');
}
async function GetBookTitle(page) {
    await page.waitForSelector('#holding_search div.record');// TIMEOUT QUANDO APERTA O BOTÃO CANCELAR
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

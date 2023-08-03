const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const bodyParser = require('body-parser');

let page, browser;
let idCard, username, idBook, bookTitle, bookAuthor, returnDate;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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
        browser = await puppeteer.launch({ args: ["--incognito"], headless: true });
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
        res.sendFile(__dirname + '/res/Pages/yellowPage.html');

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});
app.get('/bluePageLend', async (req, res) => {
    res.sendFile(__dirname + '/res/Pages/bluePageLend.html');
});
app.post('/bluePageReturn', (req, res) => {
    idBook = req.body.idBookInput;

    console.log('Valor do input:', idBook);
    return idBook;
});
app.get('/bluePageReturn', async (req, res) => {
    res.sendFile(__dirname + '/res/Pages/bluePageReturn.html');
});
app.post('/bluePageLend', (req, res) => {
    idBook = req.body.idBookInput;

    console.log('Valor do input:', idBook);
    return idBook;
});
app.get('/bluePageInfoLend', async (req, res) => {
    console.log('Entrou na tela de informações do livro');
    console.log('IdBook: ' + idBook);
    try{
         await InputBookFromRfid(page, idBook);
         bookTitle = await GetBookTitle(page);
         bookAuthor = await GetBookAuthor(page);
         console.log(bookTitle);
         console.log(bookAuthor)
         res.sendFile(__dirname + '/res/Pages/bluePageInfoLend.html');
    }catch (error) {
        console.error(error);
        res.sendStatus(500);
    }


});
app.post('/bluePageReturn', (req, res) => {
    idBook = req.body.idBookInput;

    console.log('Valor do input:', idBook);
    return idBook;
});
app.get('/bluePageInfoReturn', async (req, res) => {
    console.log('Entrou na tela de informações do livro');
    console.log('IdBook: ' + idBook);
    try{
        await InputBookFromRfid(page, idBook);
        bookTitle = await GetBookTitle(page);
        console.log(bookTitle);
        res.sendFile(__dirname + '/res/Pages/bluePageInfoReturn.html');
    }catch (error) {
        console.error(error);
        res.sendStatus(500);
    }


});
app.get('/greenPageLend', async (req, res) => {
    await ClickLendingButton(page)
    returnDate = await GetReturnDate(page);
    console.log(returnDate);
    await page.close();
    await browser.close()

    res.sendFile(__dirname + '/res/Pages/greenPageLend.html');
})
app.get('/greenPageReturn', async (req, res) => {
    await ClickGiveBack(page);
    await page.close();
    await browser.close();
    res.sendFile(__dirname + '/res/Pages/greenPageReturn.html');
})


app.get('/username', async (req, res) => {
    res.send(username);
});
app.get('/bookTitle', (req, res) => {
    res.send(bookTitle)
})
app.get('/bookAuthor', (req, res) => {
    res.send(bookAuthor)
})
app.get('/returnDate', (req, res) => {
    res.send(returnDate)
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
    await page.$eval(inputBook, (element) => {
        element.value = '';
    });
    await page.type(inputBook, idBook);
    await page.focus(inputBook);
    await page.keyboard.press('Enter');
}
async function GetBookTitle(page) {

    //await page.waitForSelector('#holding_search div.record');
    await page.waitForTimeout(1000);
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

    await page.waitForTimeout(1000);
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
    await page.evaluate(() => {
        const devolverButton = document.querySelector('div.buttons a[onclick^="HoldingSearch.returnLending"]');
        if (devolverButton) {
            devolverButton.click();
        }
    });
}


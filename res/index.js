const express = require('express');
const app = express();
const bodyParser = require('body-parser');
let idCard;

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
app.get('/yellowPage', (req, res) =>{
    res.sendFile(__dirname + '/Pages/yellowPage.html');
    console.log('Id card Passou para o programa global: \n' + idCard);
})

app.listen(8081, () => {
    console.log('Server on!');
});

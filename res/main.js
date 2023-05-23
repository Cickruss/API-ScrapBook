const yellowPage = document.querySelector('section[id="yellowPage"]');

app.listen(port, () => {
    console.log(`Cliente ouvindo na porta ${port}`);
});

document.querySelector('#userIdInput').addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        const idCard = document.getElementById('userIdInput').value;

        const data = {
            idCard: idCard,
            userName: null,
            bookId: null,
            bookName: null,
            bookAuthor: null
        };
        const jsonData = JSON.stringify(data);
        localStorage.setItem('Cliente', jsonData);

        const searchUserResponse = await fetch('http://localhost:4000/open-biblivre', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idCard }),
        });



        if (searchUserResponse.ok) {

            console.log('ID do usuário enviado com sucesso!');
            const openBiblivreResponse = await fetch('http://localhost:4000/open-biblivre', {
                method: 'GET'
            });

            if (openBiblivreResponse.ok) {
                console.log('Biblivre aberto com sucesso!');
            } else {
                console.error('Erro ao abrir o Biblivre.');
            }
        } else {
            console.error('Erro ao enviar o ID do usuário.');
        }
    }
});


/*function ToYellowPage() {
    redPage.style.display = "none";
    yellowPage.style.display = "block";
}*/

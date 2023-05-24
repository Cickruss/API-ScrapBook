
async function connectBiblivre() {
    const openBiblivreResponse = await fetch('http://localhost:3000/open-biblivre', {
        method: 'GET'
    });

    if (openBiblivreResponse.ok) {
        console.log('Biblivre aberto com sucesso!');
    } else {
        console.error('Erro ao abrir o Biblivre.');
    }
    return openBiblivreResponse;

}
const redPage = document.querySelector('section[id="redPage"]');
const yellowPage = document.querySelector('section[id="yellowPage"]');

function ToYellowPage() {
    redPage.style.display = "none";
    yellowPage.style.display = "block";
}
"use strict";
const myField = document.getElementById('field');
const boardSize = document.getElementById('board_size');
// const turnCount = document.getElementById('turnCount');
/* const startField = document.getElementById('startField');
const playerName = document.getElementById('playerName'); */
/* const turnTimer = document.getElementById('turnTimer');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds'); */
const resetGameBtn = document.getElementById('resetGameBtn');
// const endField = document.getElementById('endField');

let myCardArray;
let clickCount = 0;
let tempCard1, tempCard2;
let numSets = 0;
let foundSets = 0;

class Card {
    constructor(cardObject){
        this._card1 = cardObject.card1;
        this._card2 = cardObject.card2;
        this._set = cardObject.set;
        this._sound = cardObject.sound;
    }
}

// start field elements
const startFieldDiv = {
    startField: document.getElementById('startField'),
    playerName: document.getElementById('playerName')
}

// current game elements
const currentGameStats = {
    turnTimer: document.getElementById('turnTimer'),
    turnCount: document.getElementById('turnCount'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    min: 0,
    sec: 0
}

// end field elements
const endFieldDiv = {
    endField: document.getElementById('endField'),
    endMinutes: document.getElementById('endMinutes'),
    endSeconds: document.getElementById('endSeconds'),
    endTurn: document.getElementById('endTurn'),
    playAgain: document.getElementById('playAgain')
}
// de volgende regel krijg je vast cadeau:
/* const myCardArray = ["duck", "kitten", "piglet", "puppy", 
    "calf", "veal", "lamb", "rooster", "horse", "mouse",
    "dog", "cat", "goose", "goat", "sheep", "pig", "cow",
    "chick", "hen"]; */

// get card data from json file
fetch("./cards.json")
    .then(response => response.json())
    .then(data => {
        myCardArray = data.map(card => new Card(card))
    })    

// event listeners
myField.addEventListener('click', onClickCard);

boardSize.addEventListener('change', (e) => {
    startFieldDiv.startField.style.display = 'none';
    currentGameStats.turnTimer.style.display = 'flex';
    onSelectFieldSize(e);
});

resetGameBtn.addEventListener('click', () => {
    startOfGame();
})

endFieldDiv.playAgain.addEventListener('click', () => {
    startOfGame();
})

window.addEventListener('load', () => {
    startOfGame();
    checkLocalStorage();  
});

function populateField(board) {
    //myField.innerHTML = '';
    myField.style.display = 'flex';
    setInterval(gameTime, 1000);
    const myCardSet = createCardDeck(board, myCardArray);
    myCardSet.forEach((elem) => {
        // create div and img elements
        let newTile = document.createElement('div');
        let newCard = document.createElement('img');
        newTile.setAttribute('class', board);
        let imageURL = `img/${elem._card1}.jpg`;
        newCard.setAttribute('src', imageURL);
        newCard.setAttribute('name', elem._card1);
        newCard.setAttribute('data-cardset', elem._set);
        newTile.appendChild(newCard);

        // create cover img element
        let cover = document.createElement('img');
        cover.setAttribute('src', 'img/cover.png');
        cover.setAttribute('class', 'covered');
        newTile.appendChild(cover);

        myField.appendChild(newTile);
    })
}

function onClickCard(e) {
    // show image behind cover
    if (e.target.className === 'covered'){
        // playSound(e);
        e.target.className = 'uncovered';
    } 

    // ignore click on myField
    if (e.target.className.match(/^board/)) {
        return;
    }

    clickCount++;
    // check if clickCount is odd or even
    if (clickCount % 2 === 0) {
        tempCard2 = e.target.parentElement.firstChild;
        myField.removeEventListener('click', onClickCard);
        currentGameStats.turnCount.innerHTML = clickCount / 2;
        setTimeout(checkCards, 1000);
        if (foundSets === numSets) {
            // endOfGame();
        }
    } else {
        tempCard1 = e.target.parentElement.firstChild;
        console.log(e.target)
    }
}

// add and play sound
function playSound(e) {
    let url = '../snd/' + e.target.parentElement.firstChild.name + '.wav';
    let audio = new Audio(url);
    audio.play();
}

// shuffle an array. 
function shuffle(arr) {
    let len = arr.length;
    let t;
    while (len > 0){
        // get a random number between 0 and len.
        let rand = Math.floor((Math.random() * len--))
        
        // get index from arr and swap with last element
        t = arr[len];
        arr[len] = arr[rand];
        arr[rand] = t;
    }
    return arr;
}

// select the size of the field
function onSelectFieldSize(e) {
    let boardClass;
    switch (e.target.value) {
        case '4':
            boardClass = 'board4';
            numSets = 8;
            break;
        case '5':
            boardClass = 'board5';
            numSets = 12;
            break;
        case '6':
            boardClass = 'board6';
            numSets = 18;
            break;
    }
    // reset number of turns
    currentGameStats.turnCount.innerHTML = 0;
    populateField(boardClass);
}

// create card deck based on field size
function createCardDeck(size, arr) {
    // get last number of size
    let num = Number(size.match(/\d/));
    arr = shuffle(arr);
    let newDeckSize = [];

    // set number of items to select
    switch (num) {
        case 4:
            num = 8;
            break;
        case 5:
            num = 12;
            break;
        case 6:
            num = 18;
            break;
    }

    // push num items
    for (let i = 0; i < num; i++){
        newDeckSize.push(arr[i]);
    }

    // double the deck size
    let dblCardArray = newDeckSize.concat(newDeckSize);

    return shuffle(dblCardArray);
}

// check if cards are from the same set
function checkCards() {
    if (tempCard1.dataset.cardset === tempCard2.dataset.cardset) {
        tempCard1.style.visibility = 'hidden';
        tempCard2.style.visibility = 'hidden';
        foundSets++;
        endOfGame();
    } else {
        tempCard1.parentElement.lastChild.className = 'covered';
        tempCard2.parentElement.lastChild.className = 'covered';
    }
    // make click event available
    myField.addEventListener('click', onClickCard);
}

// display a start screen
function startOfGame() {
    boardSize.value = 0;
    startFieldDiv.startField.style.display = 'flex';
    currentGameStats.turnTimer.style.display = 'none';
    endFieldDiv.endField.style.display = 'none';
    while (myField.hasChildNodes()) {
        myField.removeChild(myField.firstChild);
    }
}

// display results of the played game
function endOfGame() {
    // check if all sets are found
    if (numSets === foundSets) {
        clearInterval(gameTime);
        endFieldDiv.endField.style.display = 'flex';
        endFieldDiv.endMinutes.innerHTML = currentGameStats.minutes.innerHTML;
        endFieldDiv.endSeconds.innerHTML = currentGameStats.seconds.innerHTML;
        endFieldDiv.endTurn.innerHTML = currentGameStats.turnCount.innerHTML;
        currentGameStats.turnTimer.style.display = 'none';
        currentGameStats.min = 0;
        currentGameStats.sec = 0;
        currentGameStats.turnCount = 0;
        myField.style.display = 'none';
        myCardArray = '';
        clickCount = 0;
        tempCard1 = '';
        tempCard2 = '';
        numSets = 0;
        foundSets = 0;
    }
}

// keep track of time
function gameTime() {
    // update currentGameStats obj minutes and seconds
    if (currentGameStats.sec < 60){
        currentGameStats.sec++;
    } else if ( currentGameStats.sec === 60) {
        currentGameStats.min++;
        currentGameStats.sec = 0;
        if (currentGameStats.min < 10 ) {
            currentGameStats.minutes.innerHTML = '0' + currentGameStats.min;
        } else {
            currentGameStats.minutes.innerHTML = currentGameStats.min;
        }   
    }
    if (currentGameStats.sec < 10) {
        currentGameStats.seconds.innerHTML = '0' + currentGameStats.sec;
    } else {
        currentGameStats.seconds.innerHTML = currentGameStats.sec;
    }
}

// check and set localstorage for stored items
function checkLocalStorage() {
    if (localStorage.getItem('name')){
        playerName.innerHTML = `hello ${localStorage.getItem('name')}`;
        } else {
            // ask user name
            // TODO: username required or not?
            let userName = prompt('What is your name?');
            if (prompt) {
                localStorage.setItem('name', userName);
            }
        }
}

// update localstorage
function updateLocalStorage() {

}
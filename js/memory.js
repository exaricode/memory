"use strict";
import * as ls from './localstorage.js';

const myField = document.getElementById('field');
const boardSize = document.getElementById('board_size');
const resetGameBtn = document.getElementById('resetGameBtn');

let interval;
let myCardArray;
let clickCount = 0;
let tempCard1, tempCard2;
let numSets = 0;
let foundSets = 0;
let currentUser = {
    "name": '',
    "played": 0,
    "succes": 0
}

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
    playerName: document.getElementById('playerName'),
    gameStats: document.getElementById('gameStats'),
    changeUser: document.getElementById('changeUser')
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

// statistics field elements
const totalStatsDiv = {
    totalStats: document.getElementById('totalStats'),
    totalPlay: document.getElementById('totalPlay'),
    totalComplete: document.getElementById('totalComplete'),
    bestTime: document.getElementById('bestTime'),
    averageTime: document.getElementById('averageTime'),
    succesRate: document.getElementById('succesRate'),
    backToStart: document.getElementById('backToStart')
}

// switch user elements
const switchUserDiv = {
    switchUser: document.getElementById('switchUser'),
    allUsers: document.getElementById('allUsers'),
    newUser: document.getElementById('newUser')
}

// get card data from json file
fetch("./cards.json")
    .then(response => response.json())
    .then(data => {
        myCardArray = data.map(card => new Card(card))
    })    

// init game
window.addEventListener('load', () => {
    startOfGame();
    let user = ls.getUser();
    if (typeof(user) === 'string') {
        startFieldDiv.playerName.innerHTML = user;
    } else {
        currentUser.name = user.name;
        currentUser.played = user.played;
        currentUser.succes = user.succes;
        console.log(currentUser);
        startFieldDiv.playerName.innerHTML = `hello ${currentUser.name}`; 
    }
    //ls.updateCurrentUser(currentUser);
});

// event listeners

// set up click event for each displayed card
myField.addEventListener('click', onClickCard);

// set up change event for select field size
boardSize.addEventListener('change', (e) => {
    startFieldDiv.startField.style.display = 'none';
    currentGameStats.turnTimer.style.display = 'flex';
    onSelectFieldSize(e);
});

// set up click event for resetting the game
resetGameBtn.addEventListener('click', () => {
    startOfGame();
});

// set up click event for button at end of the game
endFieldDiv.playAgain.addEventListener('click', () => {
    startOfGame();
});

// go back to start from statistics
totalStatsDiv.backToStart.addEventListener('click', () => {
    totalStatsDiv.totalStats.style.display = 'none';
    startFieldDiv.startField.style.display = 'flex';
})

// set up click event for span to show player statistics
startFieldDiv.gameStats.addEventListener('click', () => {
    startFieldDiv.startField.style.display = 'none';
    totalStatsDiv.totalStats.style.display = 'flex';
    totalStatsDiv.totalPlay.innerHTML = currentUser.played;
    totalStatsDiv.totalComplete.innerHTML = currentUser.played;
    totalStatsDiv.bestTime.innerHTML = 'TODO';
    totalStatsDiv.averageTime.innerHTML = 'Todo';
    totalStatsDiv.succesRate.innerHTML = currentUser.succes;
});

startFieldDiv.changeUser.addEventListener('click', () => {
    switchUserDiv.switchUser.style.display = 'flex';
    startFieldDiv.startField.style.display = 'none';
    while (switchUserDiv.allUsers.hasChildNodes()) {
        switchUserDiv.allUsers.removeChild(switchUserDiv.allUsers.firstChild);
    }
    let users = ls.getUsers();
    for (let user in users) {
        let li = document.createElement('li');
        li.innerHTML = users[user].name;
        // set up click event to switch existing users
        li.addEventListener('click', (e) => {
           currentUser = ls.switchCurrentUser(e.target.innerHTML);
        })
        switchUserDiv.allUsers.appendChild(li);
    }
})

switchUserDiv.newUser.addEventListener('click', () => {
    let user = ls.addNewPlayer();
    currentUser.name = user.name;
    currentUser.played = user.played;
    currentUser.succes = user.succes;
    startFieldDiv.playerName.innerHTML =`hello ${currentUser.name}`;
    startOfGame();
})

// set up the game
function populateField(board) {
    myField.style.display = 'flex';
    interval = setInterval(gameTime, 1000);
    currentUser.played++;
    let myCardSet = createCardDeck(board, myCardArray);
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
        // cover.setAttribute('src', 'img/cover.png');
        cover.setAttribute('class', 'covered');
        newTile.appendChild(cover);

        myField.appendChild(newTile);
    })
}

// switch covered cards
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
        setTimeout(checkCards, 100);
    } else {
        tempCard1 = e.target.parentElement.firstChild;
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
    currentGameStats.turnCount.innerHTML = '';
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

// display the start screen
function startOfGame() {
    clearInterval(interval);
    boardSize.value = 0;
    currentGameStats.turnTimer.style.display = 'none';
    currentGameStats.min = 0;
    currentGameStats.sec = 0;
    currentGameStats.minutes.innerHTML = '00';
    currentGameStats.seconds.innerHTML = '00';
    currentGameStats.turnCount.innerHTML = '0';
    myField.style.display = 'none';
    clickCount = 0;
    tempCard1 = '';
    tempCard2 = '';
    numSets = 0;
    foundSets = 0;
    startFieldDiv.startField.style.display = 'flex';
    currentGameStats.turnTimer.style.display = 'none';
    endFieldDiv.endField.style.display = 'none';
    totalStatsDiv.totalStats.style.display = 'none';
    switchUserDiv.switchUser.style.display = 'none';
    while (myField.hasChildNodes()) {
        myField.removeChild(myField.firstChild);
    }
}

// display results of the played game
function endOfGame() {
    // check if all sets are found
    if (numSets === foundSets) {
        clearInterval(interval);
        let turns = currentGameStats.turnCount.innerHTML;
        let time = `${currentGameStats.minutes.innerHTML} : ${currentGameStats.seconds.innerHTML}`;
        ls.updateHighScore(currentUser.name, turns, time);
        ls.updateCurrentUser(currentUser);
        currentUser.succes = currentUser.played;
        endFieldDiv.endField.style.display = 'flex';
        endFieldDiv.endMinutes.innerHTML = currentGameStats.minutes.innerHTML;
        endFieldDiv.endSeconds.innerHTML = currentGameStats.seconds.innerHTML;
        endFieldDiv.endTurn.innerHTML = currentGameStats.turnCount.innerHTML;
        currentGameStats.turnTimer.style.display = 'none';
        currentGameStats.min = 0;
        currentGameStats.sec = 0;
        currentGameStats.minutes.innerHTML = '';
        currentGameStats.seconds.innerHTML = '';
        currentGameStats.turnCount.innerHTML = '0';
        myField.style.display = 'none';
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

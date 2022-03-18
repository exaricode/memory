"use strict";
import * as ls from './localstorage.js';

const myField = document.getElementById('field');

let interval;
let timeOut;

let myCardArray;
let clickCount = 0;
let tempCard1, tempCard2;
let numSets = 0;
let foundSets = 0;
let currentUser = {
    "name": '',
    "played": 0,
    "succes": 0,
    "best": 0,
    "rate": 0
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
    changeUser: document.getElementById('changeUser'),
    highscore: document.getElementById('highscore'),
    boardSize: document.getElementById('boardSize')
}

// current game elements
const currentGameStats = {
    turnTimer: document.getElementById('turnTimer'),
    turnCount: document.getElementById('turnCount'),
    found: document.getElementById('found'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    min: 0,
    sec: 0,
    resetGameBtn: document.getElementById('resetGameBtn')
}

// end field elements
const endFieldDiv = {
    endField: document.getElementById('endField'),
    newHighscore: document.getElementById('newHighscore'),
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
    bestGame: document.getElementById('bestGame'),
    succesRate: document.getElementById('succesRate'),
    back: document.getElementById('totalStatsback')
}

// switch user elements
const switchUserDiv = {
    switchUser: document.getElementById('switchUser'),
    allUsers: document.getElementById('allUsers'),
    newUser: document.getElementById('newUser'),
    delete: document.getElementById('deleteUser'),
    back: document.getElementById('switchUserBack')
}

const highScoreDiv = {
    all: document.getElementById('allHighscores'),
    hsBtn: Array.from(document.getElementById('hsBtn').children),
    scores: document.getElementById('scores'),
    back: document.getElementById('highscoreBack')
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
        updateCurrentUser(currentUser, user); 
    }
});

// event listeners

// setup click event for each displayed card
myField.addEventListener('click', onClickCard);

// setup change event for select field size
startFieldDiv.boardSize.addEventListener('change', (e) => {
    hideShowDisplay(startFieldDiv.startField,
                    currentGameStats.turnTimer);
    onSelectFieldSize(e);
});

// setup click event for resetting the game
currentGameStats.resetGameBtn.addEventListener('click', () => {
    let user = ls.updateCurrentUser(currentUser);
    clearTimeout(timeOut);
    myField.addEventListener('click', onClickCard);
    updateCurrentUser(currentUser, user);
    startOfGame();
});

// setup click event for button at end of the game
endFieldDiv.playAgain.addEventListener('click', () => {
    startOfGame();
});

// setup click event: show player statistics
startFieldDiv.gameStats.addEventListener('click', () => {
    hideShowDisplay(startFieldDiv.startField,
                    totalStatsDiv.totalStats);
    totalStatsDiv.totalPlay.innerHTML = currentUser.played;
    totalStatsDiv.totalComplete.innerHTML = currentUser.succes;
    totalStatsDiv.bestGame.innerHTML = currentUser.best;
    totalStatsDiv.succesRate.innerHTML = currentUser.rate + '%';
});

// setup click event: switch to change user screen
startFieldDiv.changeUser.addEventListener('click', () => {
    hideShowDisplay(startFieldDiv.startField,
                    switchUserDiv.switchUser);
    while (switchUserDiv.allUsers.hasChildNodes()) {
        switchUserDiv.allUsers.removeChild(switchUserDiv.allUsers.firstChild);
    }
    let users = ls.getUsers();
    for (let user in users) {
        let li = document.createElement('li');
        li.innerHTML = users[user].name;
        // setup click event to switch existing users
        li.addEventListener('click', (e) => {
            let user = ls.switchCurrentUser(e.target.innerHTML);
            if (user !== false) {
                updateCurrentUser(currentUser, user);
                startOfGame();
            }
        })
        switchUserDiv.allUsers.appendChild(li);
    }
});

// setup click event switch to highscore screen
startFieldDiv.highscore.addEventListener('click', () => {
    hideShowDisplay(startFieldDiv.startField,
                    highScoreDiv.all);
    appendHighScores(4);
});

// setup click event to switch user
switchUserDiv.newUser.addEventListener('click', () => {
    let user = ls.addNewPlayer();
    if (user != false) {
        updateCurrentUser(currentUser, user);
        startOfGame();
    }   
});

// setup click event for each highscore button
highScoreDiv.hsBtn.forEach((elem) => {
    elem.addEventListener('click', (e) => {
        appendHighScores(e.target.value);
    });
});

// setup click events for back

// go back to start from statistics
totalStatsDiv.back.addEventListener('click', () => {
    hideShowDisplay(totalStatsDiv.totalStats,
                    startFieldDiv.startField);
});

// go back to start from highscores
highScoreDiv.back.addEventListener('click', () => {
    hideShowDisplay(highScoreDiv.all,
                    startFieldDiv.startField);
});

// go back to start from switch user
switchUserDiv.back.addEventListener('click', () => {
    hideShowDisplay(switchUserDiv.switchUser,
                    startFieldDiv.startField);
});

// delete a user
switchUserDiv.delete.addEventListener('click', () => {
    let len = switchUserDiv.allUsers.children.length;
    for (let i = 0; i < len; i++){
        let btn = document.createElement('button');
        btn.innerHTML = 'X';
        btn.style.backgroundColor = 'red';

        // check if li element has a child element
        if (switchUserDiv.allUsers.children[i].children.length == 0) {
            switchUserDiv.allUsers.children[i].appendChild(btn);
            btn.addEventListener('click', (e) => {
                let t = e.target.parentElement.firstChild.data;
                ls.deleteUser(t);
                switchUserDiv.allUsers.removeChild(e.target.parentElement);
            })
        } else {
            switchUserDiv.allUsers.children[i]
                .removeChild(switchUserDiv.allUsers
                    .children[i].lastChild);
        }
    }
});

// get all highscores from a boardsize
function appendHighScores(size) {
    if (highScoreDiv.scores.children[1]) {
        highScoreDiv.scores.removeChild(highScoreDiv.scores.children[1]);
    }
    let scores = ls.getAllHighScore(size);
    let len = scores.length;
    let tbody = document.createElement('tbody');
    for (let i = 0; i < len; i++) {
        let tr = document.createElement('tr');
        for (let s in scores[i]){
            if ( s !== 'size'){
                let td = document.createElement('td');
                td.innerHTML = scores[i][s];
                tr.appendChild(td);
            }
        }
        tbody.appendChild(tr);
    }
    highScoreDiv.scores.appendChild(tbody);
}

// setup the game
function populateField(board) {
    myField.style.display = 'flex';
    interval = setInterval(gameTime, 1000);
    currentUser.played++;
    let myCardSet = createCardDeck(numSets, myCardArray);
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

// switch covered cards
function onClickCard(e) {
    let temp = e.target.parentElement.firstChild;
    // show image behind cover
    if (e.target.className === 'covered'){
        playSound(e);
        e.target.className = 'uncovered';
    } 

    // ignore click on myField
    if (e.target.className.match(/^board/) || e.target == temp) {
        return;
    }

    clickCount++;
    // check if clickCount is odd or even
    if (clickCount % 2 === 0) {
        tempCard2 = e.target.parentElement.firstChild;
        myField.removeEventListener('click', onClickCard);
        currentGameStats.turnCount.innerHTML = clickCount / 2;
        timeOut = setTimeout(checkCards, 1500);
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
    currentGameStats.turnCount.innerHTML = '0';
    currentGameStats.found.innerHTML = '0';
    populateField(boardClass);
}

// create card deck based on field size
function createCardDeck(size, arr) {
   
    arr = shuffle(arr);
    let newDeckSize = [];

    // push num items
    for (let i = 0; i < size; i++){
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
        currentGameStats.found.innerHTML = foundSets;
        endOfGame();
    } else {
        tempCard1.parentElement.lastChild.className = 'covered';
        tempCard2.parentElement.lastChild.className = 'covered';
    }
    // make click event available
    myField.addEventListener('click', onClickCard);
}

// display the start screen and reset values
function startOfGame() {
    clearInterval(interval);
    startFieldDiv.boardSize.value = 0;
    hideShowDisplay(currentGameStats.turnTimer);
    currentGameStats.min = 0;
    currentGameStats.sec = 0;
    currentGameStats.minutes.innerHTML = '00';
    currentGameStats.seconds.innerHTML = '00';
    currentGameStats.turnCount.innerHTML = '0';
    hideShowDisplay(myField);
    clickCount = 0;
    tempCard1 = '';
    tempCard2 = '';
    numSets = 0;
    foundSets = 0;

    hideShowDisplay(currentGameStats.turnTimer, 
                startFieldDiv.startField);
    hideShowDisplay(endFieldDiv.endField);
    hideShowDisplay(totalStatsDiv.totalStats);
    hideShowDisplay(switchUserDiv.switchUser);
    
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
        let bool = ls.updateHighScore(currentUser.name, turns,
                             time, startFieldDiv.boardSize.value);
        
        if (bool === true) {
            endFieldDiv.newHighscore.innerHTML = "New High Score!"
        }
        currentUser.best = Number(turns);
        currentUser.succes++;
        let user = ls.updateCurrentUser(currentUser);
        updateCurrentUser(currentUser, user);
        hideShowDisplay(currentGameStats.turnTimer,
                        endFieldDiv.endField);
        endFieldDiv.endMinutes.innerHTML = currentGameStats.minutes.innerHTML;
        endFieldDiv.endSeconds.innerHTML = currentGameStats.seconds.innerHTML;
        endFieldDiv.endTurn.innerHTML = currentGameStats.turnCount.innerHTML;
        hideShowDisplay(myField);
    }
}

// update current user
function updateCurrentUser(current, user){
        current.name = user.name;
        current.played = user.played;
        current.succes = user.succes;
        current.best = user.best;
        current.rate = user.rate;
        startFieldDiv.playerName.innerHTML =`Hello ${current.name}`;
}

function hideShowDisplay(hide, show = null) {
    hide.style.display = 'none';
    if (show != null) {
        show.style.display = 'flex';
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

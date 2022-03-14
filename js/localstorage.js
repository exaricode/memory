"use strict"
// check and set localstorage for stored items
function checkLocalStorage() {
    if (!localStorage) {
        return "Acces local storage denied"
    }
    return true
}

// add a new name to local storage
function addPlayerName(users) {
    let userName = prompt('What is your name?');

    if (userName != null && userName != '') {
        const user = {
            "name": userName,
            "played": 0,
            "succes": 0,
            "best": 0,
            "average": 0,
            "rate": 0,
    }
    if (!users.includes(user.name)) {
        users.unshift(user);
    }
    localStorage.setItem('users', JSON.stringify(users));
    }
    return users[0];
}

// add a new user
function addNewPlayer(){
    let users = getUsers();
    let user = addPlayerName(users);
    console.log(user);
    return user;
}

// get all stored users
function getUsers() {
    let check = checkLocalStorage();
    if (!check) {
        return check;
    }
    return JSON.parse(localStorage.getItem('users')) || [];
}

function getUser() {
    let users = getUsers();
    let user;

    if (users[0] == undefined) {
        user = addPlayerName(users); 
    } else {
        user = users[0];
    }
    return user;
}

// switch a user
function switchCurrentUser(e) {
    console.log(e)
    let users = getUsers();
    console.log(users.indexOf(e));
    console.log(users.splice(users.indexOf(e), 1).unshift(e));
    return users.splice(users.indexOf(e), 1).unshift(e);
}

// update current user
function updateCurrentUser(user) {
    let users = JSON.parse(localStorage.getItem('users'));
    
    for (let item in users) {
        if (users[item].name === user.name) {
            users[item].played = user.played;
            users[item].succes = user.succes;
        }
    }
    
    localStorage.setItem('users', JSON.stringify(users));
}

// add new high score
function updateHighScore(name, count, time) {
    //TODO: create object with unique name
    let score = {
        "name": name,
        "count": count,
        "time": time
    }
    if (localStorage.getItem('highscore')) {
        let tempHighScore = JSON.parse(localStorage.getItem('highscore')) || [];
        tempHighScore.push(score);
        localStorage.setItem('highscore', JSON.stringify(tempHighScore));
    }  else {
        localStorage.setItem('highscore', JSON.stringify([score]));
    }
}

export { getUser, getUsers, switchCurrentUser, addNewPlayer, updateHighScore, updateCurrentUser }
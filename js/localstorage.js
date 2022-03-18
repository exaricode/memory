"use strict"
// check and set localstorage for stored items
function checkLocalStorage() {
    if (!localStorage) {
        return "Access local storage denied";
    }
    return true;
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
            "rate": 0
    }

    // check if username already exists
    let t = users.findIndex(elem => elem.name == user.name );
    
    if (t != -1) {
        return false;
    } else {
        users.unshift(user);
    }
    setUsers(users);
    }

    return users[0];
}

// add a new user
function addNewPlayer(){
    const users = getUsers();
    if (users.length > 4) {
        alert('max 5 users');
        return false;
    }
    const user = addPlayerName(users);
    if (user === false) {
        alert('username already exists');
        return false;
    }
    return user;
}

// get all stored users from local storage
function getUsers() {
    const check = checkLocalStorage();
    if (!check) {
        return check;
    }
    return JSON.parse(localStorage.getItem('users')) || [];
}

// set all users in local storage
function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// get first user if it exists
function getUser() {
    const users = getUsers();
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
    let users = getUsers();
    
    let u = '';
    for (let user in users) {
        if (users[user].name === e) {
            u = users[user];
        }
    }
    if (u === '') {
        return false;
    }
    users.splice(users.indexOf(u),1);
    users.unshift(u);
    setUsers(users);
    
    return u;
}

// update current user
function updateCurrentUser(user) {
    let users = getUsers();
    let rate = Number.parseFloat(Number(user.succes) / Number(user.played) * 100);

    users[0].played = user.played;
    users[0].succes = user.succes;
    if (user.best < users[0].best || users[0].best === 0) {
        users[0].best = user.best;
    }
    if (Number.isInteger(rate)) {
        users[0].rate = rate;
    } else { 
        users[0].rate = rate.toFixed(2);
    }
         
    setUsers(users);
    return users[0];
}

// delete a user
function deleteUser(user) {
    let users = getUsers();
    for (let u in users) {
        if (users[u].name === user) {
            users.splice(u, 1);
        }
    }
    setUsers(users);
} 

// get all highscore
function getAllHighScore(size, score) {
    let lsName = Number(size) ? 'highscore' + size : size;
    let scores = JSON.parse(localStorage.getItem(lsName)) || [];
    scores.push(score);
    scores.sort((a,b) => {
        let c = a.time.split(':');
        let d = b.time.split(':');
        return Number(a.count) < Number(b.count) ? -1 :
            Number(a.count) > Number(b.count) ? 1 : 
            Number(c[0]) <= Number(d[0]) && 
            Number(c[1]) <= Number(d[1]) ? -1 : 1;
    });
    
    if (scores.length > 5) {
        scores.splice(5);
    }
    return scores;
}

// set high score
function setAllHighScore(name, score){
    if (localStorage.getItem(name)) {
        let tempHighScore = getAllHighScore(name, score);
        localStorage.setItem(name, JSON.stringify(tempHighScore));
        if (tempHighScore.includes(score)){
            return true;
        }
    }  else {
        localStorage.setItem(name, JSON.stringify([score]));
    }
}

// add new high score
function updateHighScore(name, count, time, size) {
    let lsName = 'highscore' + size;
    let boardsize = size + ' x ' + size;
    let score = {
        "name": name,
        "count": count,
        "time": time,
        "size": boardsize
    }
   return setAllHighScore(lsName, score); 
}

export { getUser, getUsers, switchCurrentUser, addNewPlayer,
    updateCurrentUser, deleteUser, updateHighScore,
    getAllHighScore }
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
            "succes": 0
    }
    if (!users.includes(user.name)) {
        users.push(user);
    }
    localStorage.setItem('users', JSON.stringify(users));
    }
    return users[0];
}

// get all stored users
function getUsers() {
    let check = checkLocalStorage();
    if (!check) {
        return check;
    }
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user;
        
    if (users[0] == undefined) {
        user = addPlayerName(users); 
    } else {
        user = users[0];
    }
    return user;
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

export { getUsers, updateHighScore, updateCurrentUser }
// check and set localstorage for stored items
function checkLocalStorage() {
    if (!localStorage) {
        return "Acces local storage denied"
    }
    return true
}

function addPlayerName(users) {
    //let check = checkLocalStorage();
    let userName;
    /* if (!check) {
        return check;
    } */

    if (!users) {
        userName = prompt('What is your name?');
    }
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

// update localstorage
function updateLocalStorage() {

}

function updateHighScore(name, count, time) {
    //TODO: create object with unique name
    let score = {
        "name": name,
        "count": count,
        "time": time
    }
    //score.push(`{"name": ${name}, "count": ${count}, "time": ${time}`);
    console.log(score);
    if (localStorage.getItem('highscore')) {
        let tempHighScore = JSON.parse(localStorage.getItem('highscore'));
        tempHighScore.push(score);
        localStorage.setItem('highscore', JSON.stringify(tempHighScore));
    }  else {
        localStorage.setItem('highscore', JSON.stringify(score));
    }
}

export { getUsers, updateHighScore, updateLocalStorage }
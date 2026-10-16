let score = JSON.parse(localStorage.getItem('score')) || {
    win: 0,
    lose: 0,
    tie: 0
};

updateScoreElement();

function pickComputerMove() {
    let num = Math.random();
    let computerMove = '';
    if (num >= 0 && num < 1 / 3) {
        computerMove = 'rock';
    } else if (num >= 1 / 3 && num < 2 / 3) {
        computerMove = 'paper';
    } else {
        computerMove = 'scissors';
    }
    return computerMove;
}

function playGame(playerMove) {
    let result = '';
    let computerMove = pickComputerMove();

    if (playerMove === 'rock') {
        if (computerMove === 'rock') {
            result = 'Tie';
        } else if (computerMove === 'paper') {
            result = 'You lose';
        } else if (computerMove === 'scissors') {
            result = 'You win';
        }
    } else if (playerMove === 'paper') {
        if (computerMove === 'paper') {
            result = 'Tie';
        } else if (computerMove === 'rock') {
            result = 'You win';
        } else if (computerMove === 'scissors') {
            result = 'You lose';
        }
    } else if (playerMove === 'scissors') {
        if (computerMove === 'scissors') {
            result = 'Tie';
        } else if (computerMove === 'rock') {
            result = 'You lose';
        } else if (computerMove === 'paper') {
            result = 'You win';
        }
    }

    if (result === 'You win') {
        score.win++;
    } else if (result === 'You lose') {
        score.lose++;
    } else if (result === 'Tie') {
        score.tie++;
    }

    localStorage.setItem('score', JSON.stringify(score));

    document.querySelector('.js-result').innerHTML = `${result}!`;
    document.querySelector('.js-moves').innerHTML = `You <img src="image/${playerMove}-emoji.png" class="move-icon" alt="${playerMove}"> <img src="image/${computerMove}-emoji.png" class="move-icon" alt="${computerMove}"> Computer`;
    updateScoreElement();
}

function resetScore() {
    score.win = 0;
    score.lose = 0;
    score.tie = 0;
    localStorage.removeItem('score');
    updateScoreElement();
    const resultElem = document.querySelector('.js-result');
    const movesElem = document.querySelector('.js-moves');
    if (resultElem) resultElem.innerHTML = '';
    if (movesElem) movesElem.innerHTML = '';
}

function updateScoreElement() {
    const scoreElem = document.querySelector('.js-score');
    if (scoreElem) {
        scoreElem.innerHTML = `Wins: ${score.win}, Losses: ${score.lose}, Ties: ${score.tie}`;
    }
}

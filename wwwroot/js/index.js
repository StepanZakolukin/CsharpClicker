const threshold = 10;
let seconds = 0;
let clicks = 0;
const currentScoreElement = document.getElementById("current_score");
const recordScoreElement = document.getElementById("record_score");
const profitPerClickElement = document.getElementById("profit_per_click");
const profitPerSecondElement = document.getElementById("profit_per_second");
let currentScore = Number(currentScoreElement.innerText);
let recordScore = Number(recordScoreElement.innerText);
let profitPerSecond = Number(profitPerSecondElement.innerText);
let profitPerClick = Number(profitPerClickElement.innerText);


$(document).ready(function () {
    const clickitem = document.getElementById("clickitem");

    clickitem.onclick = click;
    setInterval(addSecond, 1000)

    const boosts = document.getElementsByClassName("boost");

    for (let i = 0; i < boosts.length; i++) {
        const boost = boosts[i]
        const boostButton = boost.querySelector(".boost-button");

        boostButton.onclick = () => boostButtonClick(boost);
    }

    toggleBoostsAvailability();
})

function boostButtonClick(boost) {
    if (clicks > 0 || seconds > 0) {
        addPointsToScore();
    }
    buyBoost(boost);
}

function buyBoost(boost) {
    const boostIdElement = boost.querySelector(".boost-id");
    const boostId = boostIdElement.innerText;

    $.ajax({
        url: '/boost/buy',
        method: 'post',
        dataType: 'json',
        data: { boostId: boostId },
        success: (response) => onBuyBoostSuccess(response, boost),
    });
}

function onBuyBoostSuccess(response, boost) {
    const score = response["score"];

    const boostPriceElement = boost.querySelector(".boost-price");
    const boostQuantityElement = boost.querySelector(".boost-quantity");

    const boostPrice = Number(response["price"]);
    const boostQuantity = Number(response["quantity"]);

    boostPriceElement.innerText = boostPrice;
    boostQuantityElement.innerText = boostQuantity;

    updateScoreFromApi(score);
}

function addSecond() {
    seconds++;

    if (seconds >= threshold) {
        addPointsToScore();
    }

    if (seconds > 0) {
        addPointsFromSecond();
    }
}

function click() {
    clicks++;

    if (clicks >= threshold) {
        addPointsToScore();
    }

    if (clicks > 0) {
        addPointsFromClick();
    }
}

function updateScoreFromApi(scoreData) {
    currentScore = Number(scoreData["currentScore"]);
    recordScore = Number(scoreData["recordScore"]);
    profitPerClick = Number(scoreData["profitPerClick"]);
    profitPerSecond = Number(scoreData["profitPerSecond"]);

    updateUiScore();
}

function updateUiScore() {
    currentScoreElement.innerText = currentScore;
    recordScoreElement.innerText = recordScore;
    profitPerClickElement.innerText = profitPerClick;
    profitPerSecondElement.innerText = profitPerSecond;

    toggleBoostsAvailability();
}

function addPointsFromClick() {
    currentScore += profitPerClick;
    recordScore += profitPerClick;

    updateUiScore();
}

function addPointsFromSecond() {
    currentScore += profitPerSecond;
    recordScore += profitPerSecond;

    updateUiScore();
}

function addPointsToScore() {
    $.ajax({
        url: '/score',
        method: 'post',
        dataType: 'json',
        data: { clicks: clicks, seconds: seconds },
        success: (response) => onAddPointsSuccess(response),
    });
}

function onAddPointsSuccess(response) {
    seconds = 0;
    clicks = 0;

    updateScoreFromApi(response);
}

function toggleBoostsAvailability() {
    const boosts = document.getElementsByClassName("boost");

    for (let i = 0; i < boosts.length; i++) {
        const boostButton = boosts[i].querySelector(".boost-button");
        const boostPriceElement = boosts[i].querySelector(".boost-price");
        const boostPrice = Number(boostPriceElement.innerText);

        if (boostPrice > currentScore) {
            boostButton.disabled = true;
            boostButton.classList.add("active")
            continue;
        }

        boostButton.disabled = false;
        boostButton.classList.remove("active")
    } 
}
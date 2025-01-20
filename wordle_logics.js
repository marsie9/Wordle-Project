
let getUrl = "https://words.dev-apis.com/word-of-the-day";
const postURL = "https://words.dev-apis.com/validate-word";
let toVerify = {
    word: ""
}
let currentKey = "";
let typedWord = "";
let currentLine = document.querySelector(".line");
let word;
let gameDoneState = false;
const WORDLENGTH = 5;

// gets a word from the api
async function getWord(type = "daily", wordNumber){

    if (type === "random"){ // every game is a new random word (by default it returns daily word)
        getUrl += "?random=1";
    }
    else if ((type === "certain") && (typeof wordNumber !== "undefined")){
        getUrl += `?puzzle=${wordNumber}`; // every time it returns certain word (by default it returns a daily word)
    }
    
    loadingAnimation("start");
    const promise = await fetch(getUrl);
    const processedResponse = await promise.json();
    loadingAnimation("stop");

    let word = processedResponse.word;
    return word;
}

// sends a post request to the api, to see if the typed word is a valid english word
async function validateWord(currentWord) {
    toVerify.word = currentWord;
    jsonToSend = JSON.stringify(toVerify);

    loadingAnimation("start");
    const promise = await fetch(postURL, {
        method: "POST",
        body: jsonToSend
    });
    const processedResponse = await promise.json();
    loadingAnimation("stop");

    console.log(promise);
    console.log(processedResponse);
    console.log(processedResponse.validWord);
    return processedResponse.validWord;
}

// loading when getting responses from the api
function loadingAnimation(state){
    loadingIcon = document.querySelector(".loading_icon");
    gameBody = document.querySelector(".game_body");

    if (state === "start"){
        loadingIcon.classList.remove("hidden");
        gameBody.classList.add("blurry");
    }
    else {
        loadingIcon.classList.add("hidden");
        gameBody.classList.remove("blurry");
    }
}

function acceptInput(){
    document.addEventListener('keydown', function(event){

        //if you win or lose, don't be able to type anymore
        if (gameDoneState) {
            return;
        }

        currentKey = event.key;
        handleInput();
    })
}

// checks if it's a letter
function checkInput(inputKey){
    return /^[a-zA-Z]$/.test(inputKey);
}

// backspace
function deleteInput(){
    deletedLetter = typedWord.length;
    let squareToChange = currentLine.querySelectorAll(".square")[deletedLetter - 1];
    console.log(squareToChange);
    squareToChange.innerText = "";
    typedWord = typedWord.slice(0, -1);
}

// colors the squares red when you have an invalid word
function invalidWord(){
    let squares = currentLine.querySelectorAll(".square");
    squares.forEach(square => {
        square.classList.add("red");
    });

    setTimeout(function() {
        squares.forEach(square => {
            square.classList.remove("red");
        });
    }, 500);
}

// reloads the game when called
function restartGame() {
    location.reload();
}

// displays the pop up when you win or lose
function displayEnd(state){
    gameDoneState = true;

    console.log(gameDoneState);

    let popUp = document.querySelector(".popup_end");
    let endState = document.querySelector(".popup_state");
    let displayedWord = document.querySelector(".popup_word");
    let refreshButton = document.querySelector(".refresh_button");
    let gameBody = document.querySelector(".game_body");

    if (state === "win"){
        endState.innerText = "You Won!";
        popUp.classList.add("win");
    }
    else {
        endState.innerText = "You Lost!";
        popUp.classList.add("lose");
    }

    displayedWord.innerText = `The word is ${word.toUpperCase()}`;
    popUp.classList.remove("hidden");
    endState.classList.remove("hidden");
    displayedWord.classList.remove("hidden");
    refreshButton.classList.remove("hidden");
    gameBody.classList.add("blurry");

    refreshButton.addEventListener("click", function() {
        restartGame();
    })
}

function map(array){
    let objArray = {};
    for (let i = 0; i < WORDLENGTH; i++) {
        if (objArray[array[i]]) {
            objArray[array[i]] ++;
        }
        else {
            objArray[array[i]] = 1;
        }
    }

    return objArray;
}

//colors the squares based on the word you have typed and if they match fully, you win
function validWordCheck(){
    let squares = currentLine.querySelectorAll(".square");
    let slicedWord = word.split("");
    let objWord = map(slicedWord);

    // we iterate two times because we are counting the amount of certain letters
    // first we iterate only for the correct letters and then for the others due to overwriting issues
    for (let i = 0; i < WORDLENGTH; i++){
        if (typedWord[i] === word[i]){
            squares[i].classList.add("green");
            objWord[typedWord[i]] --;
            console.log(objWord);
        }
    }

    for (let i = 0; i < WORDLENGTH; i++){
        if (typedWord[i] === word[i]){
            //do nothing
        }
        else if (word.includes(typedWord[i]) && (objWord[typedWord[i]] > 0)){   
            squares[i].classList.add("yellow");
            objWord[typedWord[i]] --;
            console.log(objWord);
        }
        else {
            squares[i].classList.add("grey");
        }
    }

    if (typedWord === word){
        displayEnd("win");
    }
    
}

async function handleInput(){
    // checks if it is a valid symbol or a letter
    let isLetter = checkInput(currentKey);
    if (isLetter){
        if (currentLine.innerText.length < 9){ //it's 9 instead of 5 because it counts every new line it has to make as a character as well
            let squares = currentLine.childNodes;
            for (const square of squares){
                if (square.innerText === ""){
                    square.innerText = currentKey.toUpperCase(); //display the letter
                    typedWord += currentKey; //append it to the typed word
                    break;
                }
            }
        }
    }
    else if ((currentLine.innerText.length === 9) && (currentKey === "Enter")){
        //validates the typed word
        let isValid = await validateWord(typedWord);

        if (isValid){
            // if the word is valid, compare it with the api word
            validWordCheck();

            if (currentLine.nextElementSibling == null){
                displayEnd("lose");
            }
            else {
                currentLine = currentLine.nextElementSibling;
                typedWord = '';
            }
            
        }
        else{
            // if the word is not valid, make the squares red
            invalidWord();
            }
        
    }
    
    else if (currentKey === "Backspace"){
        deleteInput();
    }
}


async function init(){
    word = await getWord("random");
    // word = "ivory";
    acceptInput();
}

init();
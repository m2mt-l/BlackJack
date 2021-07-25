function randomIntInRange(min, max){
    return Math.floor(Math.random()* (max-min) + min);
}

class View{
    static config = {
        gamePage: document.getElementById("gameDiv"),
        loginPage: document.getElementById("loginPage"),
        mainPage: document.getElementById("mainPage"),
        suitImgURL : {
            "S" : "https://recursionist.io/img/spade.png",
            "H" : "https://recursionist.io/img/heart.png",
            "C" : "https://recursionist.io/img/clover.png",
            "D" : "https://recursionist.io/img/diamond.png",
            "?" : "https://recursionist.io/img/questionMark.png"
        }
    }

    static displayNone(ele){
        ele.classList.remove("d-block");
        ele.classList.add("d-none");
    }

    static displayBlock(ele){
        ele.classList.remove("d-none");
        ele.classList.add("d-block");
    }

    static renderLoginPage(){
        View.config.loginPage.innerHTML = '';
        let container = document.createElement("div");
        container.innerHTML = 
        `
        <p class="text-white">Welcome to Card Game!</p>
        <div class="my-2">
            <input type="text" placeholder="name" value="">
        </div>
        <div class="my-2">
            <select class="w-100">
                <option value="blackjack">Blackjack </option>
                <option value="poker">Poker </option>
            </select>
        </div>
        <div class="my-2">
            <button type="submit" class="btn btn-success" id="startGame">Start Game</button>
        <div>
        `
        View.config.loginPage.append(container);
    }


    static renderTable(table){
        View.config.mainPage.innerHTML = '';
        let container = document.createElement("div");
        container.classList.add("col-12", "d-flex", "flex-column");
        container.innerHTML =
        `
            <div id="houesCardDiv" class="pt-5">
            </div>
    
            <!-- Players Div -->
            <div id="playersDiv" class="d-flex m-3 justify-content-center">
            </div><!-- end players -->  
            <!-- actionsAndBetsDiv -->
            <div id="actionsAndBetsDiv" class="d-flex pb-5 pt-4 d-flex flex-column align-items-center">
                <!-- betsDiv -->
                <div id="betsDiv" class="d-flex flex-column w-50 col-3">
                </div><!-- end betsDiv-->
            </div><!-- end actionsAndBetsDiv-->
            <div id="resultLogDiv" class="d-flex pb-5 pt-4 justify-content-center text-white overflow-auto" style="max-height: 120px;">
            </div>
        `
        View.config.mainPage.append(container);
        View.renderHouseStatusPage(table);
        View.renderPlayerStatusPage(table);
        let isMask;
        if(table.gamePhase != "betting") isMask = false;
        else isMask = true;
        View.renderCards(table, isMask);
        if(table.getTurnPlayer().getSplitYes) View.renderSplitStatus(table, table.getTurnPlayer());

    }


    static renderBetInfo(table){
        let betsDiv = document.getElementById("betsDiv");
        let player = table.players.filter((x)=>x.type == "user")[0];
        betsDiv.innerHTML +=
        `
        <p class="m-0 text-center text-white rem3">Bet: $${player.bet}</p>
        <p class="m-0 text-center text-white rem2">Current Money: $${player.chips}</p>
        `
    }

    static renderBetBtn(table){
        let betsDiv = document.getElementById("betsDiv");

        let betBtnDiv = document.createElement("div");
        let colerHash = View.setBtnColor(table.betDenominations)
        betBtnDiv.classList.add("py-2", "h-60", "d-flex", "justify-content-between");
        for(let i = 0; i < table.betDenominations.length; i++){
            let bet = table.betDenominations[i]
            betBtnDiv.innerHTML +=
            `
            <div>
                <div class="input-group" >
                    <span class="input-group-btn">
                        <button type="button" class="btn ${colerHash[bet]} rounded-circle p-0 btn-lg" style="width:3rem;height:3rem;" id="betValue" value=${bet}>${bet}</button>
                    </span>
                </div>
            </div>
            `
        }

        let dealResetDiv = document.createElement("div");
        dealResetDiv.classList.add("d-flex", "justify-content-between", "m-2")
        dealResetDiv.innerHTML =
        `            
        <button type="submit" class="w-30 rem5 text-center btn btn-primary" id="deal">DEAL</button>
        <button type="button" class="w-30 rem5 text-center btn btn-primary" id="reset">RESET</button>
        <button type="submit" class="w-30 rem5 text-center btn btn-primary" id="allIn">ALL IN</button>
        `
        betsDiv.append(betBtnDiv, dealResetDiv);

        let select = betsDiv.querySelectorAll("#betValue");
        let player = table.players.filter((x)=>x.type == "user")[0];

        for(let i = 0; i < select.length; i++){
            select[i].addEventListener("click", function(){
                Controller.clickBetBtn(select[i].value, player);
                View.updateBetInfo(table);
                View.renderBetBtn(table);
            })
        }

        let deal = betsDiv.querySelectorAll("#deal")[0];
        deal.addEventListener("click", function(){
            let minimumBet = table.getMinimumBet();
            if(player.bet < minimumBet) alert("Minimum bet is $" + minimumBet + '.')
            else{
                player.chips += player.bet;
                Controller.controlTable(table);
            }
        })

        let reset = betsDiv.querySelectorAll("#reset")[0];
        reset.addEventListener("click", function(){
            player.resetPlayerBet();
            View.updateBetInfo(table);
            View.renderBetBtn(table);
        })

        let allIn = betsDiv.querySelectorAll("#allIn")[0];
        allIn.addEventListener("click", function(){
            let allBet = player.chips;
            player.playerAllin(allBet);
            View.updateBetInfo(table);
            View.renderBetBtn(table);
        })

    }

    static renderHouseStatusPage(table){
        let houesCardDiv = document.getElementById("houesCardDiv");
        houesCardDiv.innerHTML = '';
        let houseCardsDiv = table.house.name + "CardsDiv"
        houesCardDiv.innerHTML +=
        `
        <p class="m-0 text-center text-white rem3">${table.house.name}</p>
        <div class="text-white d-flex m-0 p-0 flex-column justify-content-center align-items-center">
            <p class="rem1 text-left">Status:${table.house.gameStatus}&nbsp</a>
        </div>
            <!-- House Card Row -->
        <div id=${houseCardsDiv} class="d-flex justify-content-center pt-3 pb-2">   
        </div>
        `
    }

    static renderPlayerStatusPage(table){
        let playersDiv = document.getElementById("playersDiv");
        playersDiv.innerHTML = '';
        let allPlayers = table.players
        for(let i = 0; i < allPlayers.length; i++){
            let playerDiv = allPlayers[i].name + "PlayerDiv";
            let cardsDiv = allPlayers[i].name + "CardsDiv"
            playersDiv.innerHTML +=
            `
            <div id=${playerDiv} class="d-flex flex-column w-50">
                <p class="m-0 text-white text-center rem3">${allPlayers[i].name}</p>
    
                <!-- playerInfoDiv -->
                <div class="text-white d-flex m-0 p-0 flex-column justify-content-center align-items-center">
                    <p class="rem1 text-left">Status:${allPlayers[i].gameStatus}&nbsp</a>
                    <p class="rem1 text-left">Bet:${allPlayers[i].bet}&nbsp</a>
                    <p class="rem1 text-left">Chips:${allPlayers[i].chips}&nbsp</a>
                </div>
    
                <!-- cardsDiv -->
                <div id=${cardsDiv} class="d-flex justify-content-center">
                </div><!-- end Cards -->
            </div><!-- end player -->        
            `        
        }
    }

    static renderCardDiv(card, ele, isMask){
        let target = document.getElementById(ele);
        let suit = isMask ? "?" : card.suit;
        let rank = isMask ? "?" : card.rank;
        target.innerHTML +=
        `
        <div class="bg-white border rounded mx-2">
            <div class="text-center">
                <img src=${View.config.suitImgURL[suit]} alt="" width="50" height="50">
            </div>
            <div class="text-center">
                <p class="m-0 ">${rank}</p>
            </div>
        </div>
        `
    }

    static renderCards(table, flag){
        let allPlayers = table.players;
        let houseCardsDiv = table.house.name + "CardsDiv"
        let houseCards = table.house.hand
        if(table.house.gameStatus == "Waiting for actions"){
            View.renderCardDiv(houseCards[0], houseCardsDiv, false);
            View.renderCardDiv(houseCards[1], houseCardsDiv, true);
        }
        else{
            houseCards.forEach(card=>{View.renderCardDiv(card, houseCardsDiv, flag)});
        }
        for(let i = 0; i < allPlayers.length; i++){
            let cards = allPlayers[i].hand;
            let ele = allPlayers[i].name + "CardsDiv";
            cards.forEach(card=>{View.renderCardDiv(card, ele, flag)});
        }
    }

    static setBtnColor(betDenominations){ //->Array
        let hash = {};
        let color = ["btn-danger", "btn-primary", "btn-success", "btn-dark"]
        for(let i = 0; i < betDenominations.length; i++){
            let currentColor = color[i];
            if(i >= currentColor.length) currentColor = color[i-4];
            if(hash[betDenominations[i]]== undefined) hash[betDenominations[i]] = currentColor;
        }
        return hash;
    }
    
    static updateBetInfo(player){
        let betBtnDiv = document.getElementById("betsDiv");
        betBtnDiv.innerHTML = '';
        View.renderBetInfo(player)
    }

    static updateActionBetInfo(table, player){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML = '';
        View.renderActionBtn(table, player);
    }

    static renderActionBtn(table, player){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML =
        `
        <div id ="actionsDiv" class="d-flex flex-wrap w-70 p-3 justify-content-center">
            <div class="py-2 mx-2">
                <a class="text-dark btn btn-light px-5 py-1" id="surrenderBtn">Surrender</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-success px-5 py-1" id="standBtn">Stand</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-warning px-5 py-1" id="hitBtn">Hit</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-danger px-5 py-1" id="doubleBtn">Double</a>
            </div>            
        </div>
        `

        let actionList = ["surrender", "stand", "hit", "double"]
        actionList.forEach(function(action){
            let actionBtn = document.getElementById(action + "Btn");
            actionBtn.addEventListener("click", function(){
                table.haveTurn(action);
                Controller.controlTable(table, action);
            })
        })
    }

    static disableBtnAfterFirstAction(){
        let surrenderBtn = document.getElementById("surrenderBtn");
        let doubleBtn = document.getElementById("doubleBtn");
        surrenderBtn.classList.add("disabled")
        doubleBtn.classList.add("disabled")
    }

    static updatePlayerInfo(table){
        let houesCardDiv = document.getElementById("houesCardDiv")
        let playersDiv = document.getElementById("playersDiv");
        houesCardDiv.innerHTML = '';
        playersDiv.innerHTML = '';
        View.renderHouseStatusPage(table)
        View.renderPlayerStatusPage(table)    
    }

    static renderResult(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        let userData = table.players.filter(user=>user.type == "user");
        let gameResult = userData[0].gameResult.toUpperCase();
        let splitResult = userData[0].splitResult;
        let insurance = userData[0].insurance;
        let div = View.createNextGameBtnDiv();

        actionsAndBetsDiv.innerHTML = '';
        if(splitResult != 0){
            for(let i = 0; i < splitResult.length; i++){
                let p = document.createElement("p");
                p.classList.add("m-0", "text-white", "text-left", "rem3")
                p.innerText = `Split ${i+1}: ${splitResult[i].toUpperCase()}`
                div.append(p);
            }
            actionsAndBetsDiv.append(div);
        }
        else if(table.userInsurance){
            let insuranceP = document.createElement("p");
            let gameResultP = document.createElement("p");
            gameResultP.classList.add("m-0", "text-white", "text-left", "rem3")
            gameResultP.innerText = `${gameResult}`

            insuranceP.classList.add("rem1", "text-white", "text-left");
            if(table.house.isBlackJack()) insuranceP.innerText = `Insurance +${insurance * 2}`
            else insuranceP.innerText = `Insurance -${insurance}`

            div.append(gameResultP, insuranceP);
            actionsAndBetsDiv.append(div);
        }

        else{
            let p = document.createElement("p");
            p.classList.add("m-0", "text-white", "text-center", "rem3")
            p.innerText = `${gameResult}`
            div.append(p);            
            actionsAndBetsDiv.append(div);
        }
        let nextGameBtn = actionsAndBetsDiv.querySelectorAll("#nextGame")[0];
        nextGameBtn.addEventListener("click", function(){
            table.haveTurn(table)
            table.blackjackAssignPlayerHands();
            Controller.controlTable(table);
        })
    }

    static createNextGameBtnDiv(){
        let div = document.createElement("div");
        let nextGame = document.createElement("a");
        div.classList.add("d-flex", "flex-column", "justify-content-center", "align-items-center", "col-5");
        nextGame.classList.add("text-white", "btn", "btn-primary", "px-5", "py-1")
        nextGame.id = "nextGame";
        nextGame.innerText = `Next Game`;
        div.append(nextGame);
        return div;
    }

    static renderInsurancePage(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML +=

        `
        <div class="d-flex flex-column justify-content-center align-items-center col-3">
            <p class="m-0 text-white text-center rem3">Insurance?</p>
        </div>
        <div class="d-flex justify-content-around m-2 col-2">
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="insuranceYes">Yes</button>
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="insuranceNo">No</button>
        </div>
        `
        let insuranceYesBtn = actionsAndBetsDiv.querySelectorAll("#insuranceYes")[0];
        insuranceYesBtn.addEventListener("click", function(){
            Controller.clickInsuranceYes(table);
        })
        let insuranceNoBtn = actionsAndBetsDiv.querySelectorAll("#insuranceNo")[0];
        insuranceNoBtn.addEventListener("click", function(){
            Controller.clickInsuranceNo(table);
        })

    }

    static renderEvenMoneyPage(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML +=

        `
        <div class="d-flex flex-column justify-content-center align-items-center col-5">
            <p class="m-0 text-white text-center rem3">Even Money?</p>
        </div>
        <div class="d-flex justify-content-around m-2 col-2">
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="insuranceYes">Yes</button>
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="insuranceNo">No</button>
        </div>
        `
        let insuranceYesBtn = actionsAndBetsDiv.querySelectorAll("#insuranceYes")[0];
        insuranceYesBtn.addEventListener("click", function(){
            Controller.clickInsuranceYes(table);
        })
        let insuranceNoBtn = actionsAndBetsDiv.querySelectorAll("#insuranceNo")[0];
        insuranceNoBtn.addEventListener("click", function(){
            Controller.clickInsuranceNo(table);
        })
    }

    //render log result each round
    static renderLogResult(table){
        let resultLogDiv = document.getElementById("resultLogDiv");
        let div = document.createElement("div");
        div.classList.add("text-white", "w-50");
        div.innerHTML +=
        `
        <p>rounnd ${table.resultsLog.length + 1}</p>
        `
        div.append(table.blackjackEvaluateAndGetRoundResults());
        resultLogDiv.append(div);
    }

    //render all logs when gameover
    static renderAllLog(table){
        let resultLogDiv = document.getElementById("resultLogDiv");
        let div = document.createElement("div");
        div.classList.add("text-white", "w-50");
        for(let i = 0; i < table.resultsLog.length; i++){
            div.innerHTML +=
            `
            <p>rounnd ${i + 1}</p>
            `
            div.append(table.resultsLog[i]);
        }
        resultLogDiv.append(div);        
    }

    static renderGameOver(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML +=

        `
        <div class="d-flex flex-column justify-content-center align-items-center col-5">
            <p class="m-0 text-white text-center rem3">GAME OVER</p>
        </div>
        <div class="d-flex justify-content-around m-2 col-2">
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="newGame">New Game</button>
        </div>
        `
        let newGameBtn = actionsAndBetsDiv.querySelectorAll("#newGame")[0];
        newGameBtn.addEventListener("click", function(){
            View.displayNone(View.config.mainPage);
            View.displayBlock(View.config.loginPage);    
            Controller.startGame();
        });
    }

    static renderSplitPage(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML +=

        `
        <div class="d-flex flex-column justify-content-center align-items-center col-5">
            <p class="m-0 text-white text-center rem3">Split Cards?</p>
        </div>
        <div class="d-flex justify-content-around m-2 col-2">
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="splitYes">Yes</button>
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="splitNo">No</button>
        </div>
        `
        let insuranceYesBtn = actionsAndBetsDiv.querySelectorAll("#splitYes")[0];
        insuranceYesBtn.addEventListener("click", function(){
            Controller.clickSplitYes(table);
        })
        let insuranceNoBtn = actionsAndBetsDiv.querySelectorAll("#splitNo")[0];
        insuranceNoBtn.addEventListener("click", function(){
            Controller.clickSplitNo(table);
        })
    }

    static renderSplitStatus(table, player){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        let div = document.createElement("div");
        div.classList.add("d-flex", "flex-column", "justify-content-center", "text-white");
        div.innerHTML =
        `
        <p class="rem1 text-left">Split ${table.splitCounter}&nbsp</a>
        <p class="rem1 text-left">Remaining Split ${player.tempSplitCard.length}&nbsp</a>
        `
        actionsAndBetsDiv.append(div);
    }
}

class Controller{

    static startGame(){
        View.renderLoginPage();
        let startGameBtn = View.config.gamePage.querySelectorAll("#startGame")[0];
        startGameBtn.addEventListener("click", function(){
            let userName = View.config.gamePage.querySelectorAll("input")[0].value;
            let table = new Table(View.config.loginPage.querySelectorAll("select")[0].value);
            if(userName == ""){
                alert("Please put your name");
            } else{
                Controller.changePageAndSetPlayer(table, userName);
            }
        });
    }

    static changePageAndSetPlayer(table, userName){
        View.displayNone(View.config.loginPage);
        View.displayBlock(View.config.mainPage);
        table.setPlayerInfo(table, userName);
        //Comment out when testing
        table.blackjackAssignPlayerHands();
        
        //Test insurance
        //table.testInsuranceAssignPlayerHands();
        //Test even bet
        //table.testEvenMoneyAssignPlayerHands();
        //Test split
        //table.testSplitAssignPlayerHands();

        Controller.controlTable(table);
    }

    /*
        controlTable
        This is a main funcion to control the game. 
        userData will be null or user's action
    */
    static controlTable(table, userData){
        View.renderTable(table);
        let player = table.getTurnPlayer()
        if(player.type == "user" && table.gamePhase == "betting"){
            table.haveTurn(player.bet);
            View.renderBetInfo(table);
            View.renderBetBtn(table);
        }
        else if(player.type == "user" && table.gamePhase == "acting"){
            if(player.gameStatus == "bet" || player.gameStatus == "hit"){
                //If a first house card is 'A' and user cards blackjack, render even money page.
                if(table.checkEvenMoney()){
                    View.renderEvenMoneyPage(table);
                }
                //If only a first house card is 'A', render insurance page.
                else if(table.checkInsurance()){
                    View.renderInsurancePage(table);
                }
                
                //If split card is 'A', skip actions.
                else if(player.splitAce){
                    table.haveTurn("stand");
                    table.splitCounter++;
                    Controller.controlTable(table)        
                }

                //If user hand is blackjack or score is 21, skip actions.
                else if(player.isBlackJack() || player.getHandScore() == 21){
                        table.haveTurn("stand");
                        Controller.controlTable(table)
                    }
                //If both user cards are the same rank, render split page.
                else if(player.isSplit() && !player.getSplitNo){
                    View.renderSplitPage(table);
                }

                //Split second time
                else if(table.splitCounter > 0){
                    View.updatePlayerInfo(table)
                    View.updateActionBetInfo(table, player);
                    if(player.gameStatus != "hit") table.splitCounter++;
                    View.renderSplitStatus(table, player);
                    if(player.gameStatus == "hit") View.disableBtnAfterFirstAction();
                    View.renderCards(table, false);    
                }

                //Split first time
                else if(!table.playerSplitCompleted() || player.getSplitYes){
                    View.updatePlayerInfo(table)
                    View.updateActionBetInfo(table, player);
                    table.splitCounter++;
                    View.renderSplitStatus(table, player);
                    if(player.gameStatus == "hit") View.disableBtnAfterFirstAction();
                    View.renderCards(table, false);    
                }

                //If a user gameStatus is bet or hit, the user can choose actions. If the status is already "hit", only "stand" or "hit" are selectable.
                else{
                    View.updatePlayerInfo(table)
                    View.updateActionBetInfo(table, player);
                    if(player.gameStatus == "hit") View.disableBtnAfterFirstAction();
                    View.renderCards(table, false);    
                }
            }
            //If a user gameStatus is "surrender", "bust", "stand" or "double", skip actions.
            else{
                //If current split turn is finshed, move next split cards.
                if(table.checkRemainingSplit()){
                    table.fileHandCards();
                    table.pushTempSplitCardToHand();
                    Controller.controlTable(table)
                }
                else{
                table.haveTurn(player.gameStatus);
                Controller.controlTable(table)
                }
            }
            
        }
        else if(table.gamePhase == "roundOver"){
            View.renderResult(table);
            View.renderLogResult(table);
        }

        else if(table.gamePhase == "gameOver"){
            View.renderGameOver(table);
            View.renderAllLog(table);
        }
        //AI and Dealer should be hit here.
        else setTimeout(function(){
            table.haveTurn(table);
            Controller.controlTable(table)
        },1000);

    }


    
    //Change a bet value for renderBetInfo
    static clickBetBtn(betCoin, player){
        if(player.chips >= betCoin){
            player.bet += parseInt(betCoin);
            player.chips -= betCoin;
        }
    }

    static clickInsuranceYes(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        table.getTurnPlayer().insurance += Math.floor(table.getTurnPlayer().bet / 2);
        table.getTurnPlayer().isInsurance = true;
        table.getTurnPlayer().getInsuranceYes = true;
        table.userInsurance = true;
        actionsAndBetsDiv.innerHTML = '';
        Controller.controlTable(table)
    }

    static clickInsuranceNo(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        table.getTurnPlayer().isInsurance = true;
        actionsAndBetsDiv.innerHTML = '';
        Controller.controlTable(table)
    }

    static clickSplitYes(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        table.addSplitCard()
        table.getNewCardForSplit()
        table.getTurnPlayer().getSplitYes = true;
        actionsAndBetsDiv.innerHTML = '';
        Controller.controlTable(table)
    }

    static clickSplitNo(table){
        let actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        table.getTurnPlayer().getSplitNo = true;
        actionsAndBetsDiv.innerHTML = '';
        Controller.controlTable(table)
    }

}

class Card
{
    constructor(suit, rank)
    {
        this.suit = suit;
        this.rank = rank;
    }

    getRankNumber(){
        if(this.rank == "J" || this.rank == "Q" || this.rank == "K") return 10;
        else if(this.rank == "A") return 11;
        else return parseInt(this.rank);
    }

}


class Deck{
    suits = ["H", "D", "C", "S"];
    ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    constructor(gameType){
        this.gameType = gameType;
        this.cards = []
        this.pushAllcards()
    }

    pushAllcards(){
        if(this.gameType == "blackjack"){
            for (let i = 0; i < this.suits.length; i++) {
                for (let j = 0; j < this.ranks.length; j++) {       
                    this.cards.push(new Card(this.suits[i], this.ranks[j]));
                }
            }
        }
    }

    /*
        pushRemainingCards
        only push cards that are not on table.
    */
    pushRemainingCards(table){
        for (let i = 0; i < this.suits.length; i++) {
            for (let j = 0; j < this.ranks.length; j++) {       
                if(!table.cardIsOnTable(this.suits[i], this.ranks[j])){
                table.deck.cards.push(new Card(this.suits[i], this.ranks[j]));
                }    
            }
        }
    }

    shuffle(){
        let l = this.cards.length;
        for(let i = l - 1; i > 0; i--){
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }
    
    drawOne(table){
        if(this.isEmpty()){
            alert("No cards left. Shuffle the cards.")
            this.pushRemainingCards(table);
            this.shuffle();
            if(this.gamePhase != "roundOver") return this.cards.pop();
            else return null;
        }else return this.cards.pop();
    }

    isEmpty(){
        return this.cards.length == 0;
    }
}



class Player{
    constructor(name, type, gameType, chips=400)
    {
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.hand = [];
        this.chips = chips;
        this.bet = 0;
        this.winAmount = 0;
        this.playerScore = this.getHandScore();
        this.gameStatus = "betting"
        this.gameResult = '';
        this.insurance = 0;
        //Used not to repeat rendering insurane pages in controlTable
        this.isInsurance = false;
        //Used when a player gets insurance and split. The player cannot split if this is true.
        this.getInsuranceYes = false;
        //Use for storing one of the split card during actions with the other split.
        this.tempSplitCard = [];
        //Flag to show renderSplitStatus
        this.getSplitYes = false;
        //Flag NOT to show renderSplitStatus 
        this.getSplitNo = false;
        //File split cards after actions are finished and use for calculating winamount(getPlayersWinAmount) when turnover
        this.fileSplitCards = [];//Array[Object(Card)]
        //Use for split ace can only draw one card.
        this.splitAce = false;
        //Flag when fileSplitCards empty, evaluate last hand
        this.evaluateSplit = false;
        //store each split gameStatus
        this.splitGameStatus = [];
        //store each split game result to show log pages.
        this.splitResult = [];
    }


    /*
       promptPlayer
       return player's gameDecision, user can use userData to decide the decision.
    */
    promptPlayer(table, userData){
        let gameDecision = {};
        if(table.gamePhase == "betting") {
            if(this.type == "ai") gameDecision = this.getAiBetDecision(table);
            else gameDecision = new GameDecision("bet", userData);
        }
        else if(table.gamePhase == "acting"){
            if(this.type == "ai") gameDecision = this.getAiGameDecision(table);
            else if(this.type == "user") gameDecision = this.getUserGameDecision(table, userData);
            else gameDecision = this.getHouseGameDecision(table);
        }
        return gameDecision;
    }

    getHandScore(){
        let handScore = 0;
        this.hand.forEach(card=>{handScore += card.getRankNumber()})
        let ace = this.countAce()
        if(handScore > 21 && this.type != "house" && ace > 0){
            while(ace > 0 && handScore > 21){
                handScore -= 10;
                ace--;
            }
        }
        return handScore;
    }

    countAce(){
        let count = 0;
        this.hand.forEach(card=>{if(card.rank == "A") count++;});
        return count;
    }

    isBlackJack(){
        if(this.countAce() == 1 && this.getHandScore() == 21 && this.hand.length == 2) return true;
        else return false;
    }

    resetPlayerBet(){
        this.chips += this.bet;
        this.bet = 0;
    }

    playerAllin(betCoin){
        this.bet += betCoin;
        this.chips -= betCoin;
    }

    getHouseGameDecision(table){
        let gameDecision = {};
        if(table.allPlayersHitCompleted() && table.allPlayersBetCompleted()){
            if(this.isBlackJack()) return new GameDecision("blackjack", this.bet);
            else if(this.getHandScore() < 17) gameDecision = new GameDecision("hit", -1);
            else gameDecision = new GameDecision("stand", -1);
        }
        else gameDecision = new GameDecision(this.gameStatus, -1);
        
        return gameDecision;
    }

    getAiBetDecision(table){
        if(table.getTurnPlayer().gameStatus == "game over"){
            return new GameDecision("game over", 0)
        }
        else{
            let availableBet = table.betDenominations.filter(bet=>(bet <= this.chips));
            let betAmount = availableBet[randomIntInRange(0, availableBet.length)];
            table.getTurnPlayer().bet = betAmount;
            /*/Test for AI game over.--->
            table.getTurnPlayer().bet = table.getTurnPlayer().chips
            betAmount = table.getTurnPlayer().chips
            //--->*/

            return new GameDecision("bet", betAmount);
        }
    }

    getAiGameDecision(table){
        let gameDecision = {};
        if(this.isBlackJack()){
            gameDecision = new GameDecision("blackjack", this.bet);
        }
        else if(this.gameStatus == "bet"){
            let actionList = ["surrender", "stand", "hit", "double"];
            gameDecision = new GameDecision(actionList[randomIntInRange(0, actionList.length)], this.bet);
            if(gameDecision.action == "double" && table.getTurnPlayer().chips < table.getTurnPlayer().bet * 2){
                gameDecision.action = "hit";
            }
            else if(gameDecision.action == "double") table.getTurnPlayer().bet *= 2;
        }
        else if(this.gameStatus == "hit"){
            let actionList = ["stand", "hit"];
            gameDecision = new GameDecision(actionList[randomIntInRange(0, actionList.length)], this.bet);
        }
        else{
            gameDecision = new GameDecision(this.gameStatus, this.bet);
        }
        return gameDecision;
    }

    getUserGameDecision(table, userData){
        let gameDecision = {};
        if(this.isBlackJack()){
            gameDecision = new GameDecision("blackjack", this.bet);
        }
        else{
            gameDecision = new GameDecision(userData, this.bet);
        }
        return gameDecision;    
    }

    changeBustStatus(){
        this.gameStatus = "bust";
    }

    isSplit(){
        if(this.hand[0].getRankNumber() == this.hand[1].getRankNumber() && !this.getInsuranceYes){
            if(this.hand[0].rank == 'A') this.splitAce = true;
            return true;
        }
        else return false;
    }

    popSplitCard(){
        return this.hand.pop()
    }

    

}

class Table
{
    constructor(gameType, betDenominations = [5,20,50,100])
    {
        this.gameType = gameType;
        this.betDenominations = betDenominations;
        this.deck = new Deck(this.gameType);
        this.deck.shuffle();
        this.players = []
        this.house = new Player("Dealer", "house", this.gameType);
        this.gamePhase = "betting"
        this.resultsLog = []
        this.turnCounter = 0;
        this.splitCounter = 0;
        this.userInsurance = false;
    }

    setPlayerInfo(table, userName){
        this.players.push(new Player("AI1", "ai", table.gameType));
        this.players.push(new Player(userName, "user", table.gameType));
        this.players.push(new Player("AI2", "ai", table.gameType));
    }

    /*
        evaluateMove
        evaluate Action and change player's state
        hit -> Push a card. If the hand score is greater than 21, change the state to bust.
        double -> Double bet and push a card. If the hand score is greater than 21, change the state to bust. 
    */
    evaluateMove(gameDecision, player){
        //if(plyaer.gameType == "blackjack")
        player.gameStatus = gameDecision.action;
        player.bet = gameDecision.amount;
        switch(gameDecision.action){
            case "betting":
                break;
            case "hit":
                player.hand.push(this.deck.drawOne(this));
                if(player.getHandScore() > 21) player.changeBustStatus()
                break;
            case "stand":
                break;
            case "surrender":
                break;
            case "double":
                if(this.turnCounter-4 <= this.players.length){
                    player.bet *= 2;
                    player.hand.push(this.deck.drawOne(this));
                    if(player.getHandScore() > 21) player.changeBustStatus()
                    break;
                }
                else break;
            case "game over":
                break;
        }
    }

    isPlayerActionCompeted(){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus == "hit") return false;
        }
        return true;
    }

    blackjackEvaluateAndGetRoundResults()
    {
        let list = document.createElement("ul");
        for(let i = 0; i < this.players.length; i++){
            let playerListResult = document.createElement("li");
            if(this.players[i].splitResult.length != 0) playerListResult.textContent = `name: ${this.players[i].name}, action: ${this.players[i].gameStatus}, bet: ${this.players[i].bet}, won: ${this.players[i].winAmount}, result: ${this.players[i].splitResult}`
            else playerListResult.textContent = `name: ${this.players[i].name}, action: ${this.players[i].gameStatus}, bet: ${this.players[i].bet}, won: ${this.players[i].winAmount}, result: ${this.players[i].gameResult}`
            list.append(playerListResult);
        }
        this.resultsLog.push(list);
        return list;
    }

    /*
        blackjackAssignPlayerHands
        Assign first cards unless gameStatus is game over.    
    */
    blackjackAssignPlayerHands(){
        while(this.house.hand.length < 2){
            this.house.hand.push(this.deck.drawOne(this));
        }
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus != "game over"){
                while(this.players[i].hand.length < 2){
                    this.players[i].hand.push(this.deck.drawOne(this));

                }
            }
        }
    }

    //Test for insurance.
    testInsuranceAssignPlayerHands(){
        this.house.hand.push(new Card("H", "A"));
        //Case blackjack
        //this.house.hand.push(new Card("S", "K"));
        //Case NOT blackjack
        this.house.hand.push(new Card("S", "7"));
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus != "game over"){
                //Case Random
                //this.players[i].hand.push(this.deck.drawOne(this));

                //Case win, push and lose--->
                while(this.players[i].hand.length < 2){
                    if(this.players[i].type == "user"){
                        this.players[i].hand.push(new Card("C", "A"));
                        //Case win
                        //this.players[i].hand.push(new Card("D", "8"))
                        //Case push
                        //this.players[i].hand.push(new Card("D", "7"));
                        //Case lose
                        this.players[i].hand.push(new Card("D", "6"));
                        //Case bust
                        //hit on your own
                    }else{
                    this.players[i].hand.push(this.deck.drawOne(this));
                    }
                }//--->*/
            }
        }
    }

    //Test for even bet.
    testEvenMoneyAssignPlayerHands(){
        this.house.hand.push(new Card("H", "A"));
        //case blackjack
        //this.house.hand.push(new Card("S", "K"));
        //case NOT blackjack
        this.house.hand.push(new Card("S", "6"));
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus != "game over"){
                while(this.players[i].hand.length < 2){
                    if(this.players[i].type == "user"){
                        this.players[i].hand.push(new Card("C", "A"))
                        this.players[i].hand.push(new Card("D", "J"))
                    }else{
                    this.players[i].hand.push(this.deck.drawOne(this));
                    }
                }
            }
        }
    }

    //Test for split.
    testSplitAssignPlayerHands(){
        //Comment out when testing--->
        while(this.house.hand.length < 2){
            this.house.hand.push(this.deck.drawOne(this));
        }
        //--->*/
        //Case Insurance and Split
        //this.house.hand.push(new Card("H", "A"));
        //this.house.hand.push(this.deck.drawOne(this));
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus != "game over"){
                while(this.players[i].hand.length < 2){
                    if(this.players[i].type == "user"){
                        //Case 1
                        //this.players[i].hand.push(new Card("C", "K"))
                        //this.players[i].hand.push(new Card("D", "J"))
                        
                        //Case 2
                        //this.players[i].hand.push(new Card("C", "8"))
                        //this.players[i].hand.push(new Card("D", "8"))

                        //Case 3 Split 'A'
                        this.players[i].hand.push(new Card("C", "A"))
                        this.players[i].hand.push(new Card("D", "A"))
                        
                    }else{
                    this.players[i].hand.push(this.deck.drawOne(this));
                   }
                }
            }
        }
    }

    /*
        blackjackClearPlayerHandsAndBets
        Reset All players and dealer status
    */
    blackjackClearPlayerHandsAndBets()
    {
        for(let i = 0; i < this.players.length; i++){
            this.players[i].hand = []            
            this.players[i].bet = 0;
            this.players[i].winAmount = 0;
            if(this.players[i].gameStatus != "game over") this.players[i].gameStatus = "betting";
            this.players[i].gameResult = '';
            this.players[i].insurance = 0;
            this.players[i].isInsurance = false;
            this.players[i].getInsuranceYes = false;
            this.players[i].tempSplitCard = [];
            this.players[i].getSplitYes = false;
            this.players[i].getSplitNo = false;
            this.players[i].fileSplitCards = [];
            this.players[i].splitAce = false;
            this.players[i].evaluateSplit = false;
            this.players[i].splitGameStatus = [];
            this.players[i].splitResult = [];
    
        }
        this.house.hand = [];
        this.house.gameStatus = "betting";
    }
    
    /*
       getTurnPlayer
       return Player : return current turn player
    */
    getTurnPlayer(){
        let index = this.turnCounter % (this.players.length + 1);
        let turnPlayer = {};
        if(index == 0) turnPlayer = this.house;
        else turnPlayer = this.players[index - 1];
        return turnPlayer;
    }

    /*
        haveTurn
        Update gameStatus and gamePhase
        count turnCounter
    */
    haveTurn(userData){
        let turnPlayer = this.getTurnPlayer();
        if(this.gamePhase == "betting"){
            if(turnPlayer.type == "house"){
                this.house.gameStatus = "Waiting for bets"
            }
            else if(turnPlayer.type == "user" || turnPlayer.type == "ai"){
                this.evaluateMove(turnPlayer.promptPlayer(this, userData), turnPlayer);
            }
            if(this.onLastPlayer()){
                this.gamePhase = "acting";
                this.house.gameStatus = "Waiting for actions"
            }
        }

        else if(this.gamePhase == "acting"){
            if(this.allActionsCompleted()){
                this.evaluateWinners();
                if(this.gamePhase != "gameOver") this.gamePhase = "roundOver";
            }
            else{
            this.evaluateMove(turnPlayer.promptPlayer(this, userData), turnPlayer);
            }
        }
        else if(this.gamePhase == "roundOver"){
            this.gamePhase = "betting";
            this.house.gameStatus = "Waiting for bets";
            this.turnCounter = 0;    
            this.splitCounter = 0;
            this.userInsurance = false;
            this.blackjackClearPlayerHandsAndBets()
        }
        //"gameOver" will be checked after evaluate phase.
        this.turnCounter++;
    }

    onFirstPlayer(){
        return this.turnCounter % (this.players.length + 1) == 1;
    }

    onLastPlayer(){
        return this.turnCounter % (this.players.length + 1) == this.players.length;
    }
    
    allPlayerActionsResolved(){
        let gameStatusList = ["broken", "bust", "stand", "surrender"];
        for(let i = 0; i < this.players.length; i++){
            if(gameStatusList.includes(this.players[i].gameStatus)) return true;
        }
        return false;
    }

    allPlayersHitCompleted(){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus == "hit" || this.players[i].tempSplitCard.length != 0) return false;
        }
        return true;
    }

    allPlayersBetCompleted(){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus == "bet") return false;
        }
        return true;    
    }

    houseActionCompleted(){
        return this.house.gameStatus != "hit" && this.house.gameStatus != "Waiting for actions";
    }

    playerSplitCompleted(){
        return this.getTurnPlayer().tempSplitCard.length == 0;
    }

    allActionsCompleted(){
        return this.houseActionCompleted() && this.allPlayersHitCompleted();
    }

    /*
        evaluateWinners
        evaluate players and house to decide players gameresults are "win", "push", "lose", "Even Money" or "insurance".
    */
    evaluateWinners(){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus == "surrender") this.getPlayersWinAmount(this.players[i], "surrender");
            else if(this.players[i].gameStatus == "bust") this.getPlayersWinAmount(this.players[i], "bust");
            else{
                switch(this.house.gameStatus){
                    case "blackjack":
                        if(this.players[i].gameStatus == "blackjack"){
                            if(this.players[i].insurance > 0){
                                this.players[i].gameStatus = "Even Money";
                                this.getPlayersWinAmount(this.players[i], "Even Money")
                            }
                            else this.getPlayersWinAmount(this.players[i], "push")
                            
                        }
                        else{
                            if(this.players[i].insurance > 0){
                                this.players[i].gameStatus = "insurance";
                                this.getPlayersWinAmount(this.players[i], "insurance")
                            }
                            else this.getPlayersWinAmount(this.players[i], "lose")                               
                        }
                        break;
                    case "bust":
                        this.getPlayersWinAmount(this.players[i], "win")
                        break;
                    default:
                        if(this.players[i].gameStatus == "blackjack"){
                            this.getPlayersWinAmount(this.players[i], "win")
                        }
                        else if(this.players[i].getHandScore() > this.house.getHandScore()){
                            this.getPlayersWinAmount(this.players[i], "win")
                        }
                        else if(this.players[i].getHandScore() == this.house.getHandScore()){
                            this.getPlayersWinAmount(this.players[i], "push")
                        }
                        else{
                            this.getPlayersWinAmount(this.players[i], "lose")
                        }
                }
            }
        }
    }

    /*
        getPlayersWinAmount
        winAmount calcuration divided into insurance, split, and others(no insurance and no split).
    */
    getPlayersWinAmount(player, result){
        if(player.insurance > 0) this.getInsuranceWinAmount(player, result);
        else if(player.fileSplitCards.length > 0) this.getSplitWinAmount(player, result);
        else if(player.fileSplitCards.length == 0 && player.evaluateSplit) this.getSplitWinAmount(player, result);
        else this.getNormalWinAmount(player, result);
    }

    getNormalWinAmount(player, result){
        switch(player.gameStatus){
            case "blackjack":
                if(result != "push"){
                    player.winAmount = Math.floor(player.bet * 1.5);
                    break;
                }
                else break;
            case "surrender":
                player.winAmount = Math.floor(player.bet / 2);
                break;
            case "bust":
                player.winAmount = player.bet;
                break;
            default:
                if(result == "push") break;
                else player.winAmount = player.bet;                
        }
        if(result == "lose" || player.gameStatus == "bust" || player.gameStatus == "surrender") player.winAmount *= -1;
        if(result != "push" && result != "insurance") player.chips += player.winAmount;

        if(player.gameStatus != "blackjack") player.gameResult = result;
        else player.gameResult = "blackjack";
        this.checkGameOver(player);
    }

    getInsuranceWinAmount(player, result){
        switch(player.gameStatus){
            case "Even Money":
                player.winAmount = player.bet;
                break;
            case "insurance":
                break;
            case "blackjack":
                player.winAmount = Math.floor(player.bet * 1.5) - player.insurance;
                break;
            case "surrender":
                player.winAmount -= Math.floor(player.bet / 2) + player.insurance;
                break;
            case "bust":
                player.winAmount -= player.bet + player.insurance;
                break;
            default:
                if(result == "push") player.winAmount -= player.insurance;
                else if(result == "win"){
                    player.winAmount = player.bet;
                    player.winAmount -= player.insurance;
                }
                else if(result == "lose") player.winAmount -= player.bet + player.insurance;
        }
        
        player.chips += player.winAmount;
        if(player.gameStatus != "blackjack") player.gameResult = result;
        else player.gameResult = "blackjack";
        this.checkGameOver(player);
    }

    
    getSplitWinAmount(player, result){
        switch(player.gameStatus){
            case "blackjack":
                if(result != "push"){
                    player.winAmount += Math.floor(player.bet * 1.5);
                    break;
                }
                else break;
            case "surrender":
                player.winAmount += Math.floor(player.bet / 2);
                break;
            case "bust":
                player.winAmount -= player.bet;
                break;
            default:
                if(result == "push") break;
                else if(result == "lose") player.winAmount -= player.bet
                else player.winAmount += player.bet;                
        }
        if(result != "push") player.chips += player.winAmount;

        if(player.gameStatus != "blackjack") player.gameResult = result;
        else player.gameResult = "blackjack";

        //The game result will store from last split round. This needs to "unshift" to splitResult.
        if(player.fileSplitCards.length > 0){
            player.splitResult.unshift(player.gameResult);
            this.pushFileSplitCardToHand(player);
        }
        //Push the last hand result
        if(player.splitResult.length < this.splitCounter) player.splitResult.unshift(player.gameResult);

        this.checkGameOver(player);
    }

    checkGameOver(player){
        if(player.type == "user" && player.chips < this.getMinimumBet()){
            player.gameStatus = "game over";
            this.gamePhase = "gameOver";
        }
        else if(player.chips < this.getMinimumBet()) player.gameStatus = "game over";
    }

    /*
        pushFileSplitCardToHand
        take split cards from fileSplitCards and move them to hand
        fileSplitCards -> Array(Object(card))
    */
    pushFileSplitCardToHand(player){
        player.hand = [];
        if(player.fileSplitCards.length == 1){
            player.fileSplitCards[0].forEach(function(card){player.hand.push(card)})
            player.splitGameStatus.forEach(function(status){player.gameStatus = status});
            player.fileSplitCards = [];
            player.splitGameStatus = [];
        }
        else{
            player.fileSplitCards[0].forEach(function(card){player.hand.push(card)});
            player.splitGameStatus.forEach(function(status){player.gameStatus = status});
            player.fileSplitCards.shift();
            player.splitGameStatus.shift();
        }

        player.evaluateSplit = true;
        this.evaluateWinners()
    }

    resetPlayers(){
        this.players = [];
    }

    //This is for Deck.pushRemainingCards that only push cards players do not have.
    cardIsOnTable(suit, rank){
        let flag = false;
        let houseCards = this.house.hand
        for(let i = 0; i < this.players.length; i++){
            let playersCards = this.players[i].hand;
            for(let j = 0; j < playersCards.length; j++){
                if(playersCards[j].suit == suit && playersCards[j].rank == rank) return !flag;
            }
        }
        for(let k = 0; k < houseCards.length; k++){
            if(houseCards[k].suit == suit && houseCards[k].rank == rank) return !flag;
        }
        return flag;
    }

    getMinimumBet(){
        return this.betDenominations.reduce((min, curr)=>min < curr ? min : curr)
    }

    //If both player's cards are the same rank(isSplit == true), pop a card from hand and add it to splitCard list.
    addSplitCard(){
        this.getTurnPlayer().tempSplitCard.push(this.getTurnPlayer().popSplitCard())
    }
    
    getNewCardForSplit(){
        //Comment out when testing 2nd split
        this.getTurnPlayer().hand.push(this.deck.drawOne(this));

        //Test 2nd split
        //this.getTurnPlayer().hand.push(new Card("H", "8"))
    }

    /*
        checkRemainingSplit    
        Check remaining cards in splitCard.
        return true -> "controlTable" push a new split card in hand
        return false -> "controlTable" check the current actions
    */
    checkRemainingSplit(){
        return this.getTurnPlayer().tempSplitCard.length != 0;

    }

    /*
        fileHandCards
        If remaining cards is still in splitCard, file hand cards in fileSplitCards that will be used in evaluate phase. This also make hand empty.
    */
    fileHandCards(){
        this.getTurnPlayer().fileSplitCards.push(this.getTurnPlayer().hand);
        this.getTurnPlayer().splitGameStatus.push(this.getTurnPlayer().gameStatus);
        this.getTurnPlayer().hand = [];
    }

    /*
        pushTempSplitCardToHand
        push split card to hand, draw a new card and start gameStatus bet again.
    */
    pushTempSplitCardToHand(){
        this.getTurnPlayer().hand.push(this.getTurnPlayer().tempSplitCard.pop());
        this.getTurnPlayer().hand.push(this.deck.drawOne(this));
        this.getTurnPlayer().gameStatus = "bet";
    }

    /*
        checkEvenMoney
        check the player will take even money
    */
    checkEvenMoney(){
        return this.house.hand[0].rank == 'A' && this.getTurnPlayer().isBlackJack() && !this.getTurnPlayer().isInsurance;
    }
    /*
        checkInsurance
        check the player will take insurance
    */
    checkInsurance(){
        return this.house.hand[0].rank == 'A' && !this.getTurnPlayer().isInsurance;
    }

}

class GameDecision{
    constructor(action, amount)
    {
        this.action = action
        this.amount = amount
    }
}



Controller.startGame();



/*
[Test Case]
players result
    surrender
    double
    win
    bust
    blackjack    
insurance choose no
insurance choose yes
    dealer is blackjack
    dealer is not blackjack
    win, bust, lose, push
even money dealer is blackjack
even money dealer is not blackjack
split choose no
split choose yes
    split once
    split twice
    split 3 times
    split ace
split with insurance
game over user
game over AI

*/
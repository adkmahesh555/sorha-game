const initialSorhaBoard = [
    [[],[],[],[],[]],
    [[],[],[],[],[]],
    [[],[],[],[],[]],
    [[],[],[],[],[]],
    [[],[],[],[],[]]
];
const cellColors = {
    R: "#f8bbd0",
    B: '#9fa8da',
    P: '#ec94ec',
    G: '#a5d6a7',
    W: '#e8c65e',
    other: '#fff'
}
const pawnColors = {
    R: "red",
    B: 'blue',
    P: 'purple',
    G: 'green',
}
const possibilites = [1,2,3,4,16,1,4,2,2,3,3,2,1,3];
var canvas = document.getElementById("myCanvas");
var sorhaShuffler = document.getElementById("sorhaShufflebtn");
var shuffleResult = document.getElementById("shuffle-result");
var settingBtn    = document.getElementById("btnSaveSetting");
var ctx = canvas.getContext("2d"); 
canvas.width = Math.min(window.innerHeight,window.innerWidth,900) * 0.8;
canvas.height = canvas.width;
const cellSide = canvas.width / 5;
const shuffleTime = 1000; //shuffle for a second

var game = {
    gameName : 'SORHA (16)',
    players : ['R', 'G', 'P', 'B'],
    playersName: {R:'Red', G: 'Green', P: 'Purple' , B:'Blue'},
    playersType: {human:['R', 'G', 'P', 'B'], computer: [], none: []},
    isFinished: false,
    winner: '',
    secondPlace: '',
    thirdPlace: '',
    onAuto: [],
    currentTurn: 'R',
    skipTurn: [],
    resultSteps: 0,
    awaitingMove: false,
    awaitingShuffle: true,
    replayAllowedFor: [1,4,16],
    hasCut: false,
    homes: { 
        total: ['02','20','22','24','42'],
        finish: '22',
        R: '02',
        G: '20',
        P: '42',
        B: '24'
    },
    path:{
        R: ["02", "01", "00", "10", "20", "30", "40", "41", "42", "43", "44", "34", "24", "14", "04", "03", "13", "23", "33", "32", "31", "21", "11", "12", "22"],
        G: ["20", "30", "40", "41", "42", "43", "44", "34", "24", "14", "04", "03", "02", "01", "00", "10", "11", "12", "13", "23", "33", "32", "31", "21", "22"],
        P: ["42", "43", "44", "34", "24", "14", "04", "03", "02", "01", "00", "10", "20", "30", "40", "41", "31", "21", "11", "12", "13", "23", "33", "32", "22"], 
        B: ["24", "14", "04", "03", "02", "01", "00", "10", "20", "30", "40", "41", "42", "43", "44", "34", "33", "32", "31", "21", "11", "12", "13", "23", "22"],
        rotate: {
            R: ["12", "13", "23", "33", "32", "31", "21", "11"],
            G: ["21", "11", "12", "13", "23", "33", "32", "31"],
            P: ["32", "31", "21", "11", "12", "13", "23", "33"], 
            B: ["23", "33", "32", "31", "21", "11", "12", "13"] 
        }
    },
    board: [],
    init: function(){
        this.currentTurn = this.playersType.human[Math.floor(Math.random() * this.playersType.human.length)];
        this.board = JSON.parse(JSON.stringify(initialSorhaBoard));  
		this.resetWinner();
        this.checkPlayerSetting();
        this.shuffleBoardDisplay("block");
        this.clearResult();
        this.notifyTurn();
        this.drawBoard();
    },
    resetWinner: function(){
        this.winner = "";
        this.secondPlace = "";
        this.thirdPlace = "";
        document.getElementById("winner").innerText = "";
        document.getElementById("secondPlace").innerText = "";
        document.getElementById("thirdPlace").innerText = "";
    },
    checkPlayerSetting: function(){
        this.onAuto = [];
        this.skipTurn = [];
        var actualPlayers = this.playersType.human.concat(this.playersType.computer);
        if(this.playersType.computer.length){
            for(var i=0;i<this.playersType.computer.length;i++){
                this.onAuto.push(this.playersType.computer[i]);
            }
        }
        if(this.playersType.none.length){
            for(var i=0;i<this.playersType.none.length;i++){
                this.skipTurn.push(this.playersType.none[i]);
                //var cellId = this.homes[this.playersType.none[i]].split('');
                
            }
        }
        for(var i=0;i<actualPlayers.length;i++){
            var player = actualPlayers[i];
            debugger;
            var cellId = this.homes[player].split('');
            this.board[cellId[0]][cellId[1]].push(player,player,player,player);
        }
    },
    notifyTurn: function(){
        var currentTurn = this.currentTurn;
        var text = this.playersName[currentTurn] + "'s Turn";
        document.getElementById('message').innerText = text;
        document.getElementById('message').style.color = pawnColors[this.currentTurn] ;
        
        if(this.onAuto.indexOf(currentTurn) > -1){            
            setTimeout(() => {
                this.autoShuffleAndMove();
            },1500);
        }else{
            sorhaShuffler.removeAttribute("disabled");
        }
    },
    autoShuffleAndMove: function() {
        
        this.shuffleSorha();        
        
        setTimeout(() => {
            console.log('autoshuffle', this.resultSteps);
            var pawnLoc = this.pawnLocations(this.currentTurn);
            if(pawnLoc.indexOf('22') > -1)
                pawnLoc.splice(pawnLoc.indexOf('22'),1);
            var moveFrom = pawnLoc[Math.floor(Math.random() * pawnLoc.length)];
            console.log('locations:', pawnLoc, 'movefrom', moveFrom);
            var cellId = moveFrom.split('');
            this.movePawn(this.currentTurn,cellId[0], cellId[1], this.resultSteps);
        }, shuffleTime + 1000);
    },
    pawnLocations : function(pawn){
        var loc = [];
        for(var i=0;i<5;i++){
            for(var j=0;j<5;j++){
                if(this.board[i][j].indexOf(pawn) > -1)
                    loc.push(i.toString() + j.toString());
            }
            if(loc.length == 4)
                break;
        }
        return loc;
    },
    clearResult: function(){
        shuffleResult.innerHTML = "";
        this.awaitingShuffle = true;
        this.awaitingMove = false;
        this.hasCut = false;
        this.resultSteps = 0;
        this.isFinished = false;
    },
    nextTurn: function(){
        var currentIndex = this.players.indexOf(this.currentTurn);
        var nextIndex = undefined;
        var circularPlayer = [];

        if((this.replayAllowedFor.indexOf(this.resultSteps) > -1 || this.hasCut) && this.skipTurn.indexOf(this.currentTurn) === -1){
            nextIndex = currentIndex;
        }
        //if(this.replayAllowedFor.indexOf(this.resultSteps) === -1 && this.hasCut === false)
        else{
            var circularPlayer = this.players.slice(currentIndex);
            if (currentIndex > 0){
                circularPlayer = circularPlayer.concat(this.players.slice(0,currentIndex))
            }
            //console.log(circularPlayer, this.players);

            for(var k=0;k<circularPlayer.length - 1;k++){ //skip current player with k + 1
                if(this.skipTurn.indexOf(circularPlayer[k+1]) === -1){
                    this.currentTurn = circularPlayer[k+1];
                    break;
                }
            }
            /*if(currentIndex + 1 == this.players.length)
                this.currentTurn = this.players[0];
            else
                this.currentTurn = this.players[currentIndex + 1];*/
        }            
        
        this.clearResult();
        this.notifyTurn();
    },
    sendHome: function(pawn,i,j){
        var pawnIndex = this.board[i][j].indexOf(pawn);
        if(pawnIndex > -1){
            var homeId = this.homes[pawn].split('');
            this.board[i][j].splice(pawnIndex,1);        //remove from here
            this.board[homeId[0]][homeId[1]].push(pawn); //place here
        }
    },
    movePawn: function (pawn, i, j, steps){
        var pawnIndex = this.board[i][j].indexOf(pawn);
        var fromCellId = i.toString() + j.toString();
        var toCellId = "";
        var distance = this.path[pawn].indexOf(fromCellId);
        var rotateIndex = 0;
        var diff = 0;
        
        if(steps == 16 && distance > 8)
            steps = 8;       

        if(distance + steps < this.path[pawn].length){ //no need to rotate
            toCellId = this.path[pawn][this.path[pawn].indexOf(fromCellId) + steps];
        }else{ //rotate
            rotateIndex = this.path.rotate[pawn].indexOf(fromCellId);
            diff = this.path.rotate[pawn].length - rotateIndex;
            if(diff > steps)
                toCellId = this.path.rotate[pawn][ rotateIndex + steps];
            else
                toCellId = this.path.rotate[pawn][steps - diff];
        }

        if(typeof toCellId !== typeof undefined){
            this.board[i][j].splice(pawnIndex,1);
            //console.log('fromCellid:', fromCellId, 'toCell:',toCellId ,'distance:', distance, 'steps:', steps);
            //if not home and other pawn exist send them home
            var i2 = toCellId.split('')[0];
            var j2 = toCellId.split('')[1];
            var sendToHomeList = [];
            if(this.homes.total.indexOf(toCellId) == -1 && this.board[i2][j2].length > 0){
                for(var k=0;k<this.board[i2][j2].length;k++){
                    if(this.board[i2][j2][k] !== pawn){ //should not be the same color
                        this.hasCut = true;
                        sendToHomeList.push(this.board[i2][j2][k])
                        //this.sendHome(this.board[i2][j2][k],i2,j2); 
                    }                                   
                }
                for(var k =0; k<sendToHomeList.length;k++){
                    this.sendHome(sendToHomeList[k],i2,j2)
                }
                //this.board[i2][j2] = [];
                
            }
            this.board[i2][j2].push(pawn);         
            
        }
        this.drawBoard();

        if(toCellId == '22'){
           var count = 0;
           var coord = toCellId.split('');
           for(var k = 0; k< this.board[coord[0]][coord[1]].length;k++) {
               if(this.board[coord[0]][coord[1]][k] === pawn)
                    count++;
           }
           if(count === 4){
               var winnerText = "";
                if (this.winner === "" ) {
                    this.winner = this.playersName[pawn];
                    winnerText = this.winner.toUpperCase() + " won the game.";
                }
                else if (this.secondPlace === "" ) {
                    this.secondPlace = this.playersName[pawn];
                    winnerText = this.secondPlace + " secured the second place.";
                }
                else if (this.thirdPlace === "") {
                    this.thirdPlace = this.playersName[pawn];
                    winnerText = this.thirdPlace + " secured the third place.";
                    this.isFinished = true;
                }
                this.showWinner();
                if(!this.isFinished){
                    var continueGame = confirm(winnerText + "\n\nDo you want to continue the game?")
                    if(continueGame){
                        this.skipTurn.push(pawn);                   
                    } else{
                        this.isFinished = true;     
                    }
                }
                
                    
           }
        }
        if(!this.isFinished)
            this.nextTurn();
        else
            this.shuffleBoardDisplay("none");
    },
    shuffleBoardDisplay: function(dispValue){
        document.getElementById("shuffleboard-wrapper").style.display = dispValue;
    },
    showWinner: function(){        
        document.getElementById("winner").innerText = "Winner: " + this.winner;
        if(this.secondPlace !== "") 
            document.getElementById("secondPlace").innerText = "Second place: " + this.secondPlace;
        
        if(this.thirdPlace !== "") 
            document.getElementById("thirdPlace").innerText = "Third place: " + this.thirdPlace;
    },
    drawPawns: function(pawns,x,y){
        let pawnPerLine = 2;
        let lines = Math.ceil(pawns.length / pawnPerLine);
        let radius = lines <= 2 ? cellSide / 8 : cellSide / (lines * 4);
        let countThisLine = 0;
        let nextLine = 1;
        let xOffSet = cellSide / (pawnPerLine + 1);
        let yOffSet = cellSide / (lines + 1);
        //console.log(x,y,lines,radius,xOffSet,yOffSet);
        if(lines > 0){
            for (let i = 0; i< pawns.length; i++){
                countThisLine++;        
                ctx.beginPath();
                ctx.fillStyle = pawnColors[pawns[i]];
                ctx.arc(x + countThisLine * xOffSet, y + nextLine * yOffSet, radius, 0, 2 * Math.PI);
                ctx.fill();
                if(countThisLine === pawnPerLine){
                    nextLine++;
                    countThisLine = 0;
                }
            }
            
        }
    },
    crossLines: function(x,y,side,strokeStyle = "black", lineWidth = 1){
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x + side, y + side);
        ctx.moveTo(x, y + side);
        ctx.lineTo(x + side, y);
        ctx.stroke();
    },
    cellOwner: function(cellId){
        let owner = "other";
        switch(cellId){
            case '02':
                owner = 'R';
                break;
            case '20':
                owner = 'G';
                break;
            case '42':
                owner = 'P';
                break;
            case '24':
                owner = 'B';
                break;
            case '22':
                owner = 'W';
                break;
            default:
                owner = 'other';

        }
        return owner;
    },
    drawBoard: function (){
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                var x = j * cellSide;
                var y = i * cellSide;
                
                var cellId = i.toString() + j.toString();
                var owner = this.cellOwner(cellId);
        
                //decide color for player cell and others;                
                var cellColor = cellColors[owner] ;
                //draw rectangles of game board
                ctx.beginPath();
                ctx.fillStyle = cellColor;
                ctx.fillRect(x, y, cellSide, cellSide);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.rect(x, y, cellSide, cellSide);
                ctx.stroke();
        
                //print cell id
                ctx.font = "1rem Arial";
                ctx.fillStyle = "purple";
                //ctx.fillText(i + ' ' + j, x + cellSide/2 - 15, y + cellSide/2);
                if(owner !== "other")
                    this.crossLines(x,y,cellSide, "aliceblue");
                //cross line in center (winner cell)
                if (i == 2 && j == 2){                     
                    ctx.fillStyle = "#3f51b5" ;
                    ctx.fillText("दरबार", x + cellSide/3, y + cellSide/5);
                    ctx.fillText("Palace", x + cellSide/3, y + cellSide * 4/5);
                    //this.drawPawns(['R','G','R','B','R','G','R','B','R','G','R','B'], x, y, cellSide)          
                }
        
                if (this.board[i][j].length){
                   // this.crossLines(x,y,cellSide,"aliceblue", "0.5")
                    this.drawPawns(this.board[i][j],x,y);
                }
                if(['R','B','G','Y'].includes(this.board[i][j])){
                    /*crossLines(x,y,cellSide,"aliceblue",0.5)
                    
                    ctx.strokeStyle = "black";
                    ctx.fillStyle = pawnColors[this.board[i][j]];
                    ctx.beginPath();
                    ctx.arc(x + cellSide * 0.25, y + cellSide * 0.25, cellSide / 8, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();*/
                }
            }
        }
    },
    shuffleSorha: function(){        
        var result = 0;
        var sorhaInterval = setInterval(() => {
            var rand = Math.floor(Math.random() * possibilites.length);
            var temp = possibilites[rand];
            shuffleResult.innerText= temp;
        }, shuffleTime / 10);
    
        setTimeout(() => {
            clearInterval(sorhaInterval);
            result = parseInt(shuffleResult.innerText);
            //console.log(result);
            game.resultSteps = result;
            game.awaitingMove = true;
            game.awaitingShuffle = false;
            sorhaShuffler.setAttribute("disabled", "disabled")
        }, shuffleTime);
        console.log(game.resultSteps);
    },
    saveSetting: function(){
        var rbs = document.querySelectorAll(".radioPlayer");
        
        game.playersType.human = [];
        game.playersType.computer = [];
        game.playersType.none = [];
        for(var i = 0; i<rbs.length;i++){
            if(rbs[i].checked){
                var selectedValue = rbs[i].value;
                var player = rbs[i].getAttribute("data-player");
                console.log(player,selectedValue)
                game.playersType[selectedValue].push(player);
                //game.playersType[player] = selectedValue;
            }
        }
        if(game.playersType.human.length === 0 || game.playersType.none.length >= 3){
            game.playersType.human = ['R', 'G', 'P', 'B'];
            game.playersType.computer = [];
            game.playersType.none = [];
            alert("There must be at least one human and one computer player.");            
            return ;
        }else{
            document.getElementById("btnCloseSetting").click();
            game.init();
        }
        
    }
    
}


canvas.addEventListener("click", function(event){
    let rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var i = Math.floor(y/cellSide);
    var j = Math.floor(x/cellSide);
    //console.log(event.clientX, event.clientY, x, y , Math.floor(x/cellSide), Math.floor(y/cellSide));
    //console.log('CellID:', Math.floor(y/cellSide),Math.floor(x/cellSide));
    if(i == 2 && j == 2)
        return false;
    if(game.resultSteps > 0 && game.awaitingMove && game.board[i][j].indexOf(game.currentTurn) > -1){
        game.movePawn(game.currentTurn, i, j, game.resultSteps)
        game.awaitingMove = false;
        game.resultSteps = 0;
    }

})

sorhaShuffler.addEventListener("click", game.shuffleSorha);
document.onload = game.init();
document.body.onkeydown = function(e) {    
    if(e.keyCode == 32 && !sorhaShuffler.disabled) {
        game.shuffleSorha();
    }
}
document.getElementById("restart").addEventListener("click", function(){
    var allowRestart = game.isFinished;
    if(!game.isFinished)
        allowRestart = confirm("Do you want to restart the game?");
    if(allowRestart)   
        game.init();
})

document.getElementById("btnSaveSetting").addEventListener("click", game.saveSetting);
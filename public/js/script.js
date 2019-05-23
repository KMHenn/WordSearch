/**
 * Word Search
 * Kaitlyn Hennessy
 * kmh319
 */

//let HOST = "abelard.cse.lehigh.edu:3000";
let HOST = "localhost:3000";
let SERVER = "http://" + HOST + "/wordsearch/";
let myid = 0;
let myname = "";

/*
* Setup the login button
*/
function attachLogin(){
    $("#login").click(function(){
        login($("#loginname").val());
    });
}

/*
* Setup the submit button
*/
function attachSubmit(){
    $("#submitButton").click(function(){
        submitWord();
    });
}

/*
* Build the table from the server 
*/
function buildTable(row, col, grid, theme){
    let gridCount = 0;
    let div = document.getElementById("puzzle");
    let tbl = document.createElement("table");
    tbl.setAttribute("id", "puzzleTable");
    tbl.setAttribute("class", "center fixed_header_puzzle");
    let tblBody = document.createElement("tbody");
    tblBody.setAttribute("id", "activePuzzle");
    $("#puzzleName").html(theme);

    // Build the table from what was provided by the server
    for (let i = 0; i < row; i++){
        let tr = document.createElement("tr");
        for (let j = 0; j < col; j++){
            let td = document.createElement("td"); 
            td.setAttribute("id", "puzzleLetter" + i + "_" + j);
            td.setAttribute("class", "clickable");
            td.setAttribute("onClick", "toggleKey(this.id)");
            td.setAttribute("style", "font-size: 22px; width: 25px; height: 25px; background-color: #A6FACB; color: #1C546F");
            td.appendChild(document.createTextNode(grid.charAt(gridCount)));
            gridCount++;
            tr.appendChild(td);
        }
        tblBody.appendChild(tr);
    }

    let submitButton = document.createElement("input");
    submitButton.setAttribute("type", "button");
    submitButton.setAttribute("value", "Submit Word");
    submitButton.setAttribute("id", "submitButton");
    document.getElementById("submit").appendChild(submitButton);
    tbl.appendChild(tblBody);
    div.appendChild(tbl);
    attachSubmit();
}

/*
* Toggle if a key has been selected 
*/
let defaultText;
let defaultBG;
let highlightBG;
let selectedLetters = [];
function toggleKey(id){
    id = "#" + id;
    let bg = $(id).css('background-color');
    let text = $(id).css('color');
    console.log("BG: " + bg);

    if (!defaultText){
        defaultText = text;
        defaultBG = bg;
    }
    
    // Cell is part of a highlighted word
    if ((bg !== defaultBG) && (bg !== defaultText)){
        if (!highlightBG)
            highlightBG = bg;
        let temp = bg;
        bg = text;
        text = temp;
        selectedLetters.push(id);
    }

    // Cell is highlighted and clicked
    else if (text === highlightBG){
        let temp = bg;
        bg = text;
        text = temp;
        for (let i = 0; i < selectedLetters.length; i++){
            if (selectedLetters[i] === id)
                selectedLetters.splice(i, 1); 
        }
    }

    // Cell is default
    else if (text === defaultText){
        selectedLetters.push(id);
        let temp = bg;
        bg = text;
        text = temp;
    }

    // Cell is clicked
    else if (text === defaultBG){
        let temp = bg;
        bg = text;
        text = temp;
        for (let i = 0; i < selectedLetters.length; i++){
            if (selectedLetters[i] === id)
                selectedLetters.splice(i, 1); 
        }
    }
    $(id).css({"background-color": bg, "color": text});
}

/*
* Make a call to the server
*/
function doAjaxCall(method, cmd, params, fcn){
    console.log(params);
    $.ajax(
        SERVER + cmd, 
        {
            type: method,
            processData: true,
            data: params,
            dataType: "json", success: function(result){
                fcn(result)
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert("Error: " + jqXHR.responseText);
                alert("Error: " + textStatus);
                alert("Error: " + errorThrown);
            }
        }
    );
}

/*
* Handle user login
*/
function login(name){
    doAjaxCall("GET", "login", {username: name},
        function (result){
            if (result.success === true){
                //console.log(result);
                myid = result.id;
                myname = result.username;
                $("#loginname").val("");
                $("#playerName").html("Good luck, " + myname + "!");
                loadGrid();
            }
            else{
                alert("Login failed");
            }
        }
    );
}

/*
* Load the puzzle from the server
*/
function loadGrid(){
    $("#puzzle").empty();
    doAjaxCall("GET", "puzzle", {id: myid}, 
        function(result){
            if (result.success === true){
                //console.log(result);
                buildTable(result.nrows, result.ncols, result.grid, result.theme);
            }
            else{
                alert("Puzzle could not be retrieved");
            }
        }
    );
}

/*
* Submit the selected cells as a word
*/
function submitWord(){
    let lettersList = new Array();
    for (let i = 0; i < selectedLetters.length; i++){
        let idString = selectedLetters[i].slice(13);
        let rowcol = idString.split("_");
        let row = rowcol[0];
        let col = rowcol[1];
        lettersList.push({r: row, c: col});
        bg = defaultBG;
        text = defaultText;
        $(selectedLetters[i]).css({"background-color": bg, "color": text});
    }
    
    //console.log(lettersList);
    selectedLetters = [];
    doAjaxCall("GET", "submit", {id: myid, letters:lettersList}, 
        function(result){
            console.log(result);
        }
    );
}

/*
* Load the leaderboard 
*/
function loadStatus(players){
    // Clear out the old table
    if (document.getElementById("userlist"))
        document.getElementById("userlist").remove();

    // Create elements needed in the table
    let usergrid = document.createElement("tbody");
    usergrid.setAttribute("id", "userlist");
    let trHeader = document.createElement("tr");
    trHeader.setAttribute("style", "text-align: center");
    let thNameHead = document.createElement("th");
    let thScoreHead = document.createElement("th");
    thNameHead.setAttribute("id", "playerListName");
    thScoreHead.setAttribute("id", "playerListScore");
    trHeader.appendChild(thNameHead);
    thNameHead.appendChild(document.createTextNode("Name"));
    thScoreHead.appendChild(document.createTextNode("Score"));
    trHeader.appendChild(thScoreHead);
    usergrid.appendChild(trHeader);

    // Run through the list of players
    for (let i = 0; i < players.length; ++i){
        let player = players[i];
        let tr = document.createElement("tr");
        let tdName = document.createElement("td");
        let tdScore = document.createElement("td");

        tdName.setAttribute("id", "playerListName");
        tdScore.setAttribute("id", "playerListScore");

        if (player.winner === true) // Highlight winner
            tr.setAttribute("style", "background-color: #F5F9BF");
        else
            tr.setAttribute("style", "background-color: #A6FACB");

        tdName.appendChild(document.createTextNode(player.name));
        tdScore.appendChild(document.createTextNode(player.score));

        tr.appendChild(tdName);
        tr.appendChild(tdScore);
        usergrid.appendChild(tr);
    }
    document.getElementById("userlist_tbl").appendChild(usergrid);
}

/*
* Update the grid when the socket emits
*/
function updateGrid(grid){
    //console.log(grid.words);
    for (let i = 0; i < grid.words.length; ++i){
        console.log(grid.words[i].text);
        for (let j = 0; j < grid.words[i].letters.length; ++j){
            let row = grid.words[i].letters[j].r;
            let col = grid.words[i].letters[j].c;
            let id = "#puzzleLetter" + row + "_" + col;
            console.log("updateGrid on id " + id);
            $(id).css({"background-color": "#F5F9BF"});
        }
    }
}

/*
* Set up when page is loaded
*/
$( () => {
    attachLogin();
    let socket = io.connect("http://" + HOST);
    socket.on('players', function(players){
        console.log("Loading players");
        loadStatus(players);
    });

    socket.on('gridupdates', function(grid){
        console.log("Updating Grid");
        updateGrid(grid);
    });
});
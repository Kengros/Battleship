import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import $ from 'jquery';
import jQuery from 'jquery';
import {singlePlayer} from './components/SinglePlayer.js';
import App from './App';
import SinglePlayerButton from './components/SinglePlayerButton.js';
import MultiplayerButton from './components/MultiplayerButton.js';
import registerServiceWorker from './registerServiceWorker';
import ReadyButtonP1 from './components/ReadyButtonP1.js';
import ReadyButtonP2 from './components/ReadyButtonP2.js';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();


/**************************/
/* Battleship Multiplayer */
/**************************/


/*-----------------*/
// Getting Started //
/*-----------------*/

// Because I like Console Logs //
console.log("Battleship is running!");

// Set Global Variables //
var player1Fleet, player2Fleet;
var attemptedHits = [];


/*----------------------------------------------*/
//     Battleship Characteristics & Details     //
// (You Could Say This Section Is Full Of Ship) //
/*----------------------------------------------*/

// Fleet Creation & Ship Properties //
function Fleet(name) {
	this.name = name;
	// Define Ships In Fleet //
	this.shipDetails = [{ "name": "carrier", "length": 5 },
						{ "name": "battleship", "length": 4 },
						{ "name": "cruiser", "length": 3 },
						{ "name": "destroyer", "length": 3 },
						{ "name": "frigate", "length": 2 }];
	this.numOfShips = this.shipDetails.length;
	this.ships = [];
	this.currentShipSize = 0;
	this.currentShip = 0;
	this.initShips = function() {
		for(var i = 0; i < this.numOfShips; i++) {
			this.ships[i] = new Ship(this.shipDetails[i].name);
			this.ships[i].length = this.shipDetails[i].length;
		}
	};
	// Remove Ship From Gameplay When Sunk //
	this.removeShip = function(pos) {
		this.numOfShips--;
		$(".text").text(coms.sunk(this.name, this.ships[pos].name));
		if (this == player1Fleet) player2Fleet.sizeOfShipSunk = this.ships[pos].length;
		this.ships.splice(pos, 1);
		// No More Ships To Hit - Game Over :( //
		if (this.ships.length == 0) {
			$(".text").text(coms.lost(this.name));
			setTimeout(reload, 1500);
		}
		return true;
	};
	// Communication Of Result //
	this.shipHit = function(ship_name) {
		$(".text").text(coms.hit(this.name));
		return true;
	}
	// Has A Ship Been Hit? //
	this.checkIfHit = function(point) {
		for(var i = 0; i < this.numOfShips; i++) {
			if (this.ships[i].locationCheck(point)) {
				this.ships[i].getRidOf(this.ships[i].hitPoints.indexOf(point));
				if (this.ships[i].hitPoints == 0)return this.removeShip(i);
				else return this.shipHit(this.ships[i].name);
			}
		}
		return false;
	};
}

// Keeping Track Of Ships In Fleet //
function Ship(name){
	this.name = name;
	this.length = 0;
	this.hitPoints = [];
	// Hits for Horizontal Ships //
	this.populateHorzHits = function(start) {
		for (var i = 0; i < this.length; i++, start++) {
			this.hitPoints[i] = start;
		}
	};
	// Hits for Vertical Ships //
	this.populateVertHits = function(start) {
		for (var i = 0; i < this.length; i++, start += 10) {
			this.hitPoints[i] = start;
		}
	};
	// Is There A Ship In that Location? //
	this.locationCheck = function(loc) {
		for (var i = 0; i < this.length; i++) {
			if (this.hitPoints[i] == loc) return true;		
		}
		return false;
	};
	// Remove Those Hits From Total Count //
	this.getRidOf = function(pos) {
		this.hitPoints.splice(pos, 1);
	}
}


/**********************************/
/* Game Communications To Players */
/**********************************/


/*---------------------------------------------------*/
// Naval Command Keeps You Informed About The Battle //
/*---------------------------------------------------*/

// Naval Command Communications //
var coms = {
	"intro": " NAVAL COMMAND: Welcome to Battleship! Select a game mode.",
	"start": " NAVAL COMMAND: Admirals, your ships are ready for war.",
	"blank": " NAVAL COMMAND: ",
	"playermultiplayer1": " NAVAL COMMAND: Player 1, would you like us to place your fleet or place them yourself?",
	"playermultiplayer2": " NAVAL COMMAND: Player 2, would you like us to place your fleet or place them yourself?",	
	"multiplayer1":  " NAVAL COMMAND: Player 1 place your ships on the bottom grid.",
	"multiplayer2":  " NAVAL COMMAND: Player 2 place your ships on the bottom grid.",	
	"player": " NAVAL COMMAND: Would you like us to place your fleet or place them yourself?",
	"player1": " NAVAL COMMAND: Admiral place your ships on the bottom grid.",
	"error": " NAVAL COMMAND: Ships cannot overlap. Please find another location.",
	"attack": " NAVAL COMMAND: Use the top coordinates grid to fire on the enemy.",
	player1menu: function(name) { return "Player 1"; },
	player2menu: function(name) { return "Player 2"; },
	placed1: function(name) { return " NAVAL COMMAND: Player 1 your " + name + "been placed. When Player 2 is ready sleect menu option."; },
	placed: function(name) { return " NAVAL COMMAND: Player 2 your " + name + " been placed."; },
	hit: function(name, type) { return " NAVAL COMMAND: " + name + "'s ship was hit." },
	miss: function(name) { return " NAVAL COMMAND: " + name + " missed!" },
	sunk: function(user, type) { return " NAVAL COMMAND: " + user + "'s " + type + " was sunk!" },
	lost: function(name) { return " NAVAL COMMAND: " + name + " has been destroyed!  The War Is Over!" },
};


/*********************************/
/* Game Board Mechanics Function */
/*********************************/


/*---------------------*/
// Switch Turn Buttons //
/*---------------------*/

// Start Player 1 Turn //
function showBtnP2() {
	$(".four").removeClass("hide");
	$(".three").addClass("hide");
}

// Start Player 2 Turn //
function showBtnP1() {
	$(".three").removeClass("hide");
	$(".four").addClass("hide");
}

/*--------------------*/
// Top Grid Functions //
/*--------------------*/

// Top Grid Player 1 //
var topGridP1 = {
	allHits: [],
	// Highlights Grid Coordinates On Hover //
	highlight: function(square) {
		$(square).addClass("target").off("mouseleave").on("mouseleave", function() {
			$(this).removeClass("target"); 
		});
		// Hides Player 2 Board & Shows Player 1 Board //
		function gridP1Delay() {
			$(".four").removeClass("hide");
			$(".three").addClass("hide");				 
			$(".board2").addClass("hide");
			$(".board3").addClass("hide");			
			$(".board").removeClass("hide");	
		}
		// Click A Grid Coordinate & Fire A Missle //
		$(square).off("click").on("click", function() {
			if(!($(this).hasClass("used"))) {
				$(this).removeClass("target").addClass("used");
				var num = parseInt($(this).attr("class").slice(15));
				var bool = player2Fleet.checkIfHit(num);
				if (false == bool) {
					$(".text").text(coms.miss("You"));
					$(this).children().addClass("miss");
				} else $(this).children().addClass("hit");
				$(".top2").find(".points").off("mouseenter").off("mouseover").off("mouseleave").off("click");
				// Is the game over yet? //
				if (player2Fleet.ships.length == 0) {
				 }
				 // Delay Palyer 1 Turn End For Smoother User Experience //
				 setTimeout(gridP1Delay, 1400);				 
				 setTimeout(highlightBoard3, 1400);	
			}
		});
	},
}

// Top Grid Player 2 //
var topGridP2 = {
	allHits: [],
	// Highlights Grid Coordinates On Hover //
	highlight: function(square) {
		$(square).addClass("target").off("mouseleave").on("mouseleave", function() {
			$(this).removeClass("target"); 
		});
		// Hides Player 1 Board & Shows Player 2 Board //
		function gridP2Delay() {
			$(".three").removeClass("hide");
			$(".four").addClass("hide");				 
			$(".board2").addClass("hide");
			$(".board3").addClass("hide");			
			$(".board").removeClass("hide");
		}
		// Click A Grid Coordinate & Fire A Missle //			
		$(square).off("click").on("click", function() {
			if(!($(this).hasClass("used"))) {
				$(this).removeClass("target").addClass("used");
				var num = parseInt($(this).attr("class").slice(15));
				var bool = player1Fleet.checkIfHit(num);
				if (false == bool) {
					$(".text").text(coms.miss("You"));
					$(this).children().addClass("miss");
				} else $(this).children().addClass("hit");
				$(".top3").find(".points").off("mouseenter").off("mouseover").off("mouseleave").off("click");
				// Is the game over yet? //
				if (player1Fleet.ships.length == 0) {
 					$(".top3").find(".points").off("mouseenter").off("mouseover").off("mouseleave").off("click");
				 }
				 // Delay Palyer 1 Turn End For Smoother User Experience //
				 setTimeout(gridP2Delay, 1400);				 				 
				 setTimeout(highlightBoard2, 1400);
			}
		});
	},
}

// Reloads Game When War Is Over //
function reload() {
	if (player2Fleet.sizeOfShipSunk > 0)
		window.location.reload();
	if (player1Fleet.sizeOfShipSunk > 0)
		window.location.reload();
}

/*-----------------------*/
// Bottom Grid Functions //
/*-----------------------*/

// Bottom Grid Player 1 //
var bottomGridP1 = {
	currentHits: [],
	checkAttempt: function(hit) {
		if (player1Fleet.checkIfHit(hit)) {
			// Keeping Track Of Hits //
			bottomGridP1.currentHits.push(hit);
      if (this.currentHits.length > 1) player2Fleet.prev_hit = true;
			// Diaplaying Hits //
			$(".bottom2").find("." + hit).children().addClass("hit");
			if (bottomGridP1.hasShipBeenSunk()) {
			// Is the game over yet? //
			}
			return true;
		} else {
			// Diaplaying Misses //
			$(".bottom2").find("." + hit).children().addClass("miss");
			return false;
		}
	},
	// Check If Ship Is Sunk //
	hasShipBeenSunk: function() {
		if (player2Fleet.sizeOfShipSunk > 0) return true;
		else return false;
	}
}

// Bottom Grid Player 2 //
var bottomGridP2 = {
	currentHits: [],
	checkAttempt: function(hit) {
		if (player2Fleet.checkIfHit(hit)) {
			// Keeping Track Of Hits //
			bottomGridP2.currentHits.push(hit);
      if (this.currentHits.length > 1) player1Fleet.prev_hit = true;
			// Diaplaying Hits //
			$(".bottom3").find("." + hit).children().addClass("hit");
			if (bottomGridP2.hasShipBeenSunk()) {
			// Is the game over yet? //
			}
			return true;
		} else {
			// Diaplaying Misses //
			$(".bottom3").find("." + hit).children().addClass("miss");
			return false;
		}
	},
	// Check If Ship Is Sunk //
	hasShipBeenSunk: function() {
		if (player1Fleet.sizeOfShipSunk > 0) return true;
		else return false;
	}
}

/*------------------*/
// Grid Coordinates //
/*------------------*/

// Player Boards //
$(document).ready(function() {
	for (var i = 1; i <= 100; i++) {
		// X $ Y Axis //
		if (i < 11) {
			$(".top2").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
			$(".bottom2").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
			$(".grid2").append("<li class='points offset1 " + i + "'><span class='hole'></span></li>");
		} else {
			$(".grid2").append("<li class='points offset2 " + i + "'><span class='hole'></span></li>");
		}
		if (i == 11) {
			$(".top2").prepend("<span class='aTops hidezero'>" + Math.abs(i - 11) + "</span>");
			$(".bottom2").prepend("<span class='aTops hidezero'>" + Math.abs(i - 11) + "</span>");
		}
		if (i > 90) {
			$(".top2").append("<span class='aLeft'>" + 
								String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
			$(".bottom2").append("<span class='aLeft'>" + 
								String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
		}
	}
	$(".text").text(coms.attack);
})

// Next Player - Player 1 //
function startP1() {	
$(".three").off("click").on("click", function() {
	$(".board").addClass("hide");	
	$(".board3").addClass("hide");	
	$(".four").addClass("hide");			
	$(".board2").removeClass("hide");
	$(".three").removeClass("hide");	
	highlightBoard2();
});
}

// Player 2 Board //
$(document).ready(function() {
	for (var i = 1; i <= 100; i++) {
		// X $ Y Axis //
		if (i < 11) {
			$(".top3").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
			$(".bottom3").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
			$(".grid3").append("<li class='points offset1 " + i + "'><span class='hole'></span></li>");
		} else {
			$(".grid3").append("<li class='points offset2 " + i + "'><span class='hole'></span></li>");
		}
		if (i == 11) {
			$(".top3").prepend("<span class='aTops hidezero'>" + Math.abs(i - 11) + "</span>");
			$(".bottom3").prepend("<span class='aTops hidezero'>" + Math.abs(i - 11) + "</span>");
		}
		if (i > 90) {
			$(".top3").append("<span class='aLeft'>" + 
								String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
			$(".bottom3").append("<span class='aLeft'>" + 
								String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
		}
	}
	$(".text").text(coms.attack);
})

// Next Player - Player 2 //
function startP2() {	
$(".four").off("click").on("click", function() {
	$(".board").addClass("hide");	
	$(".board2").addClass("hide");	
	$(".four").addClass("hide");			
	$(".board3").removeClass("hide");
	$(".three").removeClass("hide")	
	highlightBoard3();
});
}


/****************************/
/* Game Menu and Game Setup */
/****************************/


/*-------------------------------*/
// Create Menu at Game Page Load //
/*-------------------------------*/

// Select Single or Multiplayer //
$(document).ready(function() {
	// Naval Command How To //
	$(".text").text(coms.intro);
	// Single Player Option //
	$(".one").on("click", function() {
		$(".text").text(coms.player);
		$(".board2").addClass("hide");
		$(".board3").addClass("hide");		
		singlePlayer(this);
	});
	// Multiplayer Option //
	$(".multi").on("click", function() {
		$(".text").text(coms.playermultiplayer1);
		$(".board3").addClass("hide");		
		gameSetupMultiP1(this);
	});
});

/*------------------*/
// Multiplayer Menu //
/*------------------*/

// Multiplayer Game Set Up Player 1 //
function hideBoard2() {
	$(".board2").addClass("hide");
	$(".five").removeClass("hide");
	$(".menutext").text(coms.player2menu);			
}
// Player 1 Ship Placement Options //
function gameSetupMultiP1(t) {
	$(t).off() && $(".two").off();
	$(".one").addClass("player").removeClass("one").text("Place My Own");
	$(".multi").addClass("random").removeClass("multi").text("Naval Command");
	$(".menutext").text(coms.player1menu);
	$(".board2").removeClass("hide");
	// Player 1 Places Ships //	
	$(".player").off("click").on("click", function() {
		$(".text").text(coms.multiplayer1);
		selfSetupP1(player1Fleet);
	});
	// Naval Command Places Player 1 Ships //
	$(".random").off("click").on("click", function() {
		$(".player").addClass("hide");
		$(".random").addClass("hide");
		player1Fleet = new Fleet("Player 1");
		player1Fleet.initShips();
		randomSetupMulti(player1Fleet);
		setTimeout(hideBoard2, 1000);		
	});
}

// Multiplayer Game Set Up Player 2 //
function hideBoard3() {
	$(".board3").addClass("hide");
	$(".random").addClass("four").removeClass("random").text("Player 2 Ready?");
}
// Player 2 Ship Placement Options //
function gameSetupMultiP2(t) {
	$(t).off() && $(".two").off();
	$(".board2").addClass("hide");
	// Player 2 Places Ships //	
	$(".player").off("click").on("click", function() {
		$(".text").text(coms.multiplayer1);
		selfSetupP2(player2Fleet);
	});
	// Naval Command Places Player 2 Ships //
	$(".five").off("click").on("click", function() {
		$(".board3").removeClass("hide");
		$(".player").removeClass("hide");		
		$(".five").addClass("random").removeClass("five").text("Naval Command");
		$(".random").removeClass("hide");
		$("#placeShipsP2").addClass("hide");
		$(".random").off("click").on("click", function() {
			player2Fleet = new Fleet("Player 2");
			player2Fleet.initShips();
			randomSetupMultiP2(player2Fleet);
			// Delay For Smoother User Experience //
			setTimeout(hideBoard3, 1000);
			setTimeout(startGame, 1000);			
		});	
	});
}

/*----------------------------------*/
// Multiplayer Game Setup Functions //
/*----------------------------------*/

// Player 1 Self Place Ship Function //
function selfSetupP1() {
	// Ship Orientation Player 1 //
	$(".player").addClass("horz").removeClass("player").text("Horizontal");
	$(".random").addClass("vert").removeClass("random").text("Vertical");
	// Create Player 1 Fleet //
	player1Fleet = new Fleet("Player 1");
	player1Fleet.initShips();
	placeShipP1(player1Fleet.ships[player1Fleet.currentShip], player1Fleet);
	
}

// Player 2 Self Place Ship Function //
function selfSetupP2() {
	// Ship Orientation Player 2 //
	$(".player").addClass("horz").removeClass("player").text("Horizontal");
	$(".random").addClass("vert").removeClass("random").text("Vertical");
	// Create Player 2 Fleet //
	player2Fleet = new Fleet("Player 2");
	player2Fleet.initShips();
	placeShipP2(player2Fleet.ships[player2Fleet.currentShip], player2Fleet);
}

// Naval Command Ship Placement Player 1 //
function randomSetupMulti(fleet) {
	if (fleet.currentShip >= fleet.numOfShips) return;
	var orien = Math.floor((Math.random() * 10) + 1);
	var length = fleet.ships[fleet.currentShip].length;
	// Random Ship Orientation & Placement Player 1 //
	if (orien < 6) {
		var shipOffset = 11 - fleet.ships[fleet.currentShip].length; 
		var horiz = Math.floor((Math.random() * shipOffset) + 1);
		var vert = Math.floor(Math.random() * 9);
		var randNum = parseInt(String(vert) + String(horiz));
		if (fleet == player2Fleet) checkOverlapMulti(randNum, length, "horz", fleet);
		else setShipMulti(randNum, fleet.ships[fleet.currentShip], "horz", fleet, "random");
	} else {
		var shipOffset = 110 - (fleet.ships[fleet.currentShip].length * 10);
		var randNum = Math.floor((Math.random() * shipOffset) + 1);
		// Check For Overlaping Ships Player 1 //
		if (fleet == player2Fleet) checkOverlapMulti(randNum, length, "vert", fleet); 
		else setShipMulti(randNum, fleet.ships[fleet.currentShip], "vert", fleet, "random");
	}
}

// Naval Command Ship Placement Player 2 //
function randomSetupMultiP2(fleet) {
	if (fleet.currentShip >= fleet.numOfShips) return;
	var orien = Math.floor((Math.random() * 10) + 1);
	var length = fleet.ships[fleet.currentShip].length;
	// Random Ship Orientation & Placement Player 2 //
	if (orien < 6) {
		var shipOffset = 11 - fleet.ships[fleet.currentShip].length; 
		var horiz = Math.floor((Math.random() * shipOffset) + 1);
		var vert = Math.floor(Math.random() * 9);
		var randNum = parseInt(String(vert) + String(horiz));
		if (fleet == player1Fleet) checkOverlap(randNum, length, "horz", fleet);
		else setShip(randNum, fleet.ships[fleet.currentShip], "horz", fleet, "random");
	} else {
		var shipOffset = 110 - (fleet.ships[fleet.currentShip].length * 10);
		var randNum = Math.floor((Math.random() * shipOffset) + 1);
		// Check For Overlaping Ships Player 2 //
		if (fleet == player1Fleet) checkOverlap(randNum, length, "vert", fleet); 
		else setShip(randNum, fleet.ships[fleet.currentShip], "vert", fleet, "random");
	}
}

// Player 1 Fleet Created //
function createSinglePlayerFleet() {
	// Player 1 Random Ship Placement //
	player1Fleet = new Fleet("Player 1");
	player1Fleet.initShips();
	randomSetupMulti(player1Fleet);
}

// Player 2 Fleet Created //
function createPlayer2Fleet() {
	// Player 2 Random Ship Placement //
	player2Fleet = new Fleet("Player 2");
	player2Fleet.initShips();
	randomSetupMultiP2(player2Fleet);
}

// Ship Self Placement, Maniopulation & Highlights Player 1 //
function placeShipP1(ship, fleet) {
	var orientation = "horz";
	// Player 1 Vertical Ship Button //
	$(".vert").off("click").on("click", function() {
		orientation = "vert";
	});
	// Player 1 Horizontal Ship Button //
	$(".horz").off("click").on("click", function() {
		orientation = "horz";
	});
	// Player 1 Ship Tracks Cursor //
	$(".bottom2").find(".points").off("mouseenter").on("mouseenter", function() {
		var num = $(this).attr('class').slice(15);
		// Player 1 Display Ship Orientation //
		if (orientation == "horz") displayShipHorz1(parseInt(num), ship, this, fleet);
		else displayShipVert1(parseInt(num), ship, this, fleet);
	});
}

// Horizontal Ship Placement Player 1 //
function displayShipHorz1(location, ship, point, fleet) {
	var endPoint = location + ship.length - 2;
	// Ship Turned Horizontal Player 1 //
	if (!(endPoint % 10 >= 0 && endPoint % 10 < ship.length - 1)) {
		for (var i = location; i < (location + ship.length); i++) {
			$(".bottom2 ." + i).addClass("highlight");
		}
		// Place Horizontal Ship On Board Player 1 //
		$(point).off("click").on("click", function() {
			setShipMulti(location, ship, "horz", fleet, "player");
		});
	}
	// Placed Horizontal Ship No Longer Tracks Cursor Player 1 //
	$(point).off("mouseleave").on("mouseleave", function() {
		removeShipHorz1(location, ship.length);
	});
}

// Vertical Ship Placement Player 1 //
function displayShipVert1(location, ship, point, fleet) {
	var endPoint = (ship.length * 10) - 10;
	var inc = 0; 
	// Ship Turned Vertical Player 1 //
	if (location + endPoint <= 100) {
		for (var i = location; i < (location + ship.length); i++) {
			$(".bottom2 ." + (location + inc)).addClass("highlight");
			inc = inc + 10;
		}
		// Place Vertical Ship On Board Player 1 //
		$(point).off("click").on("click", function() {
			setShipMulti(location, ship, "vert", fleet, "player");
		});
	}
	// Placed Vertical Ship No Longer Tracks Cursor Player 1 //
	$(point).off("mouseleave").on("mouseleave", function() {
		removeShipVert1(location, ship.length);
	});
}

// Remove Horizontal Orientation Player 1 //
function removeShipHorz1(location, length) {
	for (var i = location; i < location + length; i++) {
		$(".bottom2 ." + i).removeClass("highlight");
	}
}

// Remove Vertical Orientation Player 1 //
function removeShipVert1(location, length) {
	var inc = 0;
	for (var i = location; i < location + length; i++) {
		$(".bottom2 ." + (location + inc)).removeClass("highlight");
		inc = inc + 10;
	}
}


// Ship Self Placement, Maniopulation & Highlights Player 2 //
function placeShipP2(ship, fleet) {
	var orientation = "horz";
	// Player 2 Vertical Ship Button //
	$(".vert").off("click").on("click", function() {
		orientation = "vert";
	});
	// Player 2 Horizontal Ship Button //
	$(".horz").off("click").on("click", function() {
		orientation = "horz";
	});
	// Player 2 Ship Tracks Cursor //
	$(".bottom3").find(".points").off("mouseenter").on("mouseenter", function() {
		var num = $(this).attr('class').slice(15);
		// Player 2 Display Ship Orientation //
		if (orientation == "horz") displayShipHorz2(parseInt(num), ship, this, fleet);
		else displayShipVert2(parseInt(num), ship, this, fleet);
	});
}

// Horizontal Ship Placement Player 2 //
function displayShipHorz2(location, ship, point, fleet) {
	var endPoint = location + ship.length - 2;
	// Ship Turned Horizontal Player 2 //
	if (!(endPoint % 10 >= 0 && endPoint % 10 < ship.length - 1)) {
		for (var i = location; i < (location + ship.length); i++) {
			$(".bottom3 ." + i).addClass("highlight");
		}
		// Place Horizontal Ship On Board Player 2 //
		$(point).off("click").on("click", function() {
			setShip(location, ship, "horz", fleet, "player");
		});
	}
	// Placed Horizontal Ship No Longer Tracks Cursor Player 2 //
	$(point).off("mouseleave").on("mouseleave", function() {
		removeShipHorz2(location, ship.length);
	});
}

// Vertical Ship Placement Player 2 //
function displayShipVert2(location, ship, point, fleet) {
	var endPoint = (ship.length * 10) - 10;
	var inc = 0; 
	// Ship Turned Vertical Player 2 //
	if (location + endPoint <= 100) {
		for (var i = location; i < (location + ship.length); i++) {
			$(".bottom3 ." + (location + inc)).addClass("highlight");
			inc = inc + 10;
		}
		// Place Vertical Ship On Board Player 2 //
		$(point).off("click").on("click", function() {
			setShip(location, ship, "vert", fleet, "player");
		});
	}
	// Placed Vertical Ship No Longer Tracks Cursor Player 2 //
	$(point).off("mouseleave").on("mouseleave", function() {
		removeShipVert2(location, ship.length);
	});
}

// Remove Horizontal Orientation Player 2 //
function removeShipHorz2(location, length) {
	for (var i = location; i < location + length; i++) {
		$(".bottom3 ." + i).removeClass("highlight");
	}
}

// Remove Vertical Orientation Player 2 //
function removeShipVert2(location, length) {
	var inc = 0;
	for (var i = location; i < location + length; i++) {
		$(".bottom3 ." + (location + inc)).removeClass("highlight");
		inc = inc + 10;
	}
}

// Adding Ship Placement for Gameplay Player //
function setShipMulti(location, ship, orientation, genericFleet, type) {
	// Checking Ship For Overlap Player 1 //
	if (!(checkOverlapMulti(location, ship.length, orientation, genericFleet))) {
		// Player 1 Horizontal Ship Placement Details//
		if (orientation == "horz") {
			// Player 1 Horizontal Ship Hit Locations //
			genericFleet.ships[genericFleet.currentShip].populateHorzHits(location);
			$(".text").text(coms.placed1(genericFleet.ships[genericFleet.currentShip].name + " has"));
			// Adding Player 1 Horizontal Ship To Board //
			for (var i = location; i < (location + ship.length); i++) {
				$(".bottom2 ." + i).addClass(genericFleet.ships[genericFleet.currentShip].name);
				$(".bottom2 ." + i).children().removeClass("hole");
			}
			// When Player 1 Horizontal Ship Placed... //
			if (++genericFleet.currentShip == genericFleet.numOfShips) {
				// Naval Command Communicates... //
				$(".text").text(coms.placed1("ships have"));
				// & Mouse Tracking Turns Off //
				$(".bottom2").find(".points").off("mouseenter");
				// Player 2 Option Buttons Generated //
				$(".horz").addClass("player").addClass("hide").removeClass("horz").text("Place My Own");	
				$(".vert").addClass("five").removeClass("vert").text("Player 2 Place Ships");
				// Delay For Smoother User Experience //								
				setTimeout(gameSetupMultiP2, 500);
			} else {
				// Player 1 Random Ship Placement //
				if (type == "random") randomSetupMulti(genericFleet);
				// Player 1 Self Ship Placement //
				else placeShipP1(genericFleet.ships[genericFleet.currentShip], genericFleet);
			}
		} else {
			var inc = 0;
			// Player 1 Vertical Ship Hit Locations //
			genericFleet.ships[genericFleet.currentShip].populateVertHits(location);
			$(".text").text(coms.placed1(genericFleet.ships[genericFleet.currentShip].name + " has"));
			// Adding Player 1 Vertical Ship To Board //
			for (var i = location; i < (location + ship.length); i++) {
				$(".bottom2 ." + (location + inc)).addClass(genericFleet.ships[genericFleet.currentShip].name);
				$(".bottom2 ." + (location + inc)).children().removeClass("hole");
				inc = inc + 10;
			}
			// When Player 1 Vertical Ship Placed... //
			if (++genericFleet.currentShip == genericFleet.numOfShips) {
				// Naval Command Communicates... //
				$(".text").text(coms.placed1("ships have"));
				// & Mouse Tracking Turns Off //
				$(".bottom2").find(".points").off("mouseenter");
				// Delay For Smoother User Experience //
				setTimeout(gameSetupMultiP2, 100);
			} else {
				// Player 1 Random Ship Placement //
				if (type == "random") randomSetupMulti(genericFleet);
				// Player 1 Self Ship Placement //
				else placeShipP1(genericFleet.ships[genericFleet.currentShip], genericFleet);
			}
		}
	} else {
		// Player 1 Random Ship Placement //
		if (type == "random") randomSetupMulti(genericFleet);
		// Naval Command Communicates Error //
		else $(".text").text(coms.error);
	}
 } 

// Adding Ship Placement for Gameplay Player 2 //
function setShip(location, ship, orientation, genericFleet, type) {
	// Checking Ship For Overlap Player 2 //
	if (!(checkOverlap(location, ship.length, orientation, genericFleet))) {
		// Player 2 Horizontal Ship Placement Details//
		if (orientation == "horz") {
			// Player 2 Horizontal Ship Hit Locations //
			genericFleet.ships[genericFleet.currentShip].populateHorzHits(location);
			$(".text").text(coms.placed(genericFleet.ships[genericFleet.currentShip].name + " has"));
			// Adding Player 2 Horizontal Ship To Board //
			for (var i = location; i < (location + ship.length); i++) {
				$(".bottom3 ." + i).addClass(genericFleet.ships[genericFleet.currentShip].name);
				$(".bottom3 ." + i).children().removeClass("hole");
			}
			// When Player 2 Horizontal Ship Placed... //
			if (++genericFleet.currentShip == genericFleet.numOfShips) {
				// Naval Command Communicates... //
				$(".text").text(coms.placed("ships have"));
				// & Mouse Tracking Turns Off //
				$(".bottom3").find(".points").off("mouseenter");
				// Delay For Smoother User Experience //
				setTimeout(hideBoard3, 500);				
				setTimeout(startGame, 500);				
			} else {
				// Player 2 Random Ship Placement //
				if (type == "random") randomSetupMultiP2(genericFleet);
				// Player 2 Self Ship Placement //
				else placeShipP2(genericFleet.ships[genericFleet.currentShip], genericFleet);
			}
		} else {
			var inc = 0;
			// Player 2 Vertical Ship Hit Locations //
			genericFleet.ships[genericFleet.currentShip].populateVertHits(location);
			$(".text").text(coms.placed(genericFleet.ships[genericFleet.currentShip].name + " has"));
			// Adding Player 2 Vertical Ship To Board //
			for (var i = location; i < (location + ship.length); i++) {
				$(".bottom3 ." + (location + inc)).addClass(genericFleet.ships[genericFleet.currentShip].name);
				$(".bottom3 ." + (location + inc)).children().removeClass("hole");
				inc = inc + 10;
			}
			// When Player 2 Vertical Ship Placed... //
			if (++genericFleet.currentShip == genericFleet.numOfShips) {
				// Naval Command Communicates... //
				$(".text").text(coms.placed("ships have"));
				// & Mouse Tracking Turns Off //
				$(".bottom3").find(".points").off("mouseenter");
			} else {
				// Player 2 Random Ship Placement //
				if (type == "random") randomSetupMultiP2(genericFleet);
				// Player 2 Self Ship Placement //
				else placeShipP2(genericFleet.ships[genericFleet.currentShip], genericFleet);
			}
		}
	} else {
		// Player 2 Random Ship Placement //
		if (type == "random") randomSetupMultiP2(genericFleet);
		// Player 2 Self Ship Placement //
		else $(".text").text(coms.error);
	}
 } 

 // Do Ship Sections Overlap for Player 1 //
 function checkOverlapMulti(location, length, orientation, genFleet) {
	var loc = location;
	// Player 1 Overlap Horizontal Check //
	if (orientation == "horz") {
		var end = location + length;
		for (; location < end; location++) {
			for (var i = 0; i < genFleet.currentShip; i++) {
				if (genFleet.ships[i].locationCheck(location)) {
					if (genFleet == player2Fleet) randomSetupMulti(genFleet);
					else return true;
				}
			} 
		} 
	} else {
		var end = location + (10 * length);
		// Player 1 Overlap Vertical Check //
		for (; location < end; location += 10) {
			for (var i = 0; i < genFleet.currentShip; i++) {
				if (genFleet.ships[i].locationCheck(location)) {
					if (genFleet == player2Fleet) randomSetupMulti(genFleet);
					else return true;
				}
			}
		}
	} 
	// If Player 1 Ships Do not Overlap Then All Is Good & Create Hits //
   if (genFleet == player2Fleet && genFleet.currentShip < genFleet.numOfShips) {
	   if (orientation == "horz") genFleet.ships[genFleet.currentShip++].populateHorzHits(loc);
		else genFleet.ships[genFleet.currentShip++].populateVertHits(loc);
		if (genFleet.currentShip == genFleet.numOfShips) {
			// Delay For Smoother User Experience //
			setTimeout(500);
		} else randomSetupMulti(genFleet);
	}
   return false;
} 

 // Do Ship Sections Overlap for Player 2 //
 function checkOverlap(location, length, orientation, genFleet) {
	 var loc = location;
	 // Player 2 Overlap Horizontal Check //
 	if (orientation == "horz") {
 		var end = location + length;
	 	for (; location < end; location++) {
	 		for (var i = 0; i < genFleet.currentShip; i++) {
	 			if (genFleet.ships[i].locationCheck(location)) {
	 				if (genFleet == player1Fleet) randomSetupMultiP2(genFleet);
	 				else return true;
	 			}
	 		} 
	 	} 
	 } else {
		 var end = location + (10 * length);
		 // Player 2 Overlap Vertical Check //
	 	for (; location < end; location += 10) {
	 		for (var i = 0; i < genFleet.currentShip; i++) {
	 			if (genFleet.ships[i].locationCheck(location)) {
	 				if (genFleet == player1Fleet) randomSetupMultiP2(genFleet);
	 				else return true;
	 			}
	 		}
	 	}
	 } 
	 // If Player 2 Ships Do not Overlap Then All Is Good & Create Hits //
	if (genFleet == player1Fleet && genFleet.currentShip < genFleet.numOfShips) {
		if (orientation == "horz") genFleet.ships[genFleet.currentShip++].populateHorzHits(loc);
	 	else genFleet.ships[genFleet.currentShip++].populateVertHits(loc);
	 	if (genFleet.currentShip == genFleet.numOfShips) {
	 		// Delay For Smoother User Experience //
	 		setTimeout(500);
	 	} else randomSetupMultiP2(genFleet);
	 }
	return false;
 } 


/************/
/* Gameplay */
/************/


/*---------------*/
// Player 1 Turn //
/*---------------*/

// Start Game With Player 1 Turn //
function startGame() {
	// Display Gameplay Info Panels //
    $(".shipPanel").fadeIn("fast", function() {
    });
 	$(".topPanel").fadeOut("fast", function() {
 		$(".console").css( { "margin-top" : "5%" } );
	 });
	 // Naval Command Communicates //
	 $(".text").text(coms.start);
 	// Display Player 1 Board //
 	highlightBoard2();
 }

 // Highlight Player 1 Board Turn // 
 function highlightBoard2() {
	// Top Grid Coordinates Turn Off Highlight & Onclick If Selected //
 	if (player1Fleet.ships.length == 0) {
		 $(".top2").find(".points").off("mouseenter").off("mouseleave").off("click");
 	} else {
	 	$(".top2").find(".points").off("mouseenter mouseover").on("mouseenter mouseover", function() {
			 // Top Grid Coordinates Marked Hit Or Miss //
			if(!($(this).hasClass("used"))) topGridP1.highlight(this);
		});
}
// Hide Player 1 Boards & Prompt Player 2 //
$(".four").addClass("hide");
$(".board2").addClass("hide");
$(".board").removeClass("hide");
// Delay For Smoother User Experience //
setTimeout(showBtnP1, 700);	
}

// Highlight board during player 2 turn //
function highlightBoard3() {
	// Top Grid Coordinates Turn Off Highlight & Onclick If Selected //
	if (player2Fleet.ships.length == 0) {
		$(".top3").find(".points").off("mouseenter").off("mouseleave").off("click");
	} else {
		$(".top3").find(".points").off("mouseenter mouseover").on("mouseenter mouseover", function() {
			// Top Grid Coordinates Marked Hit Or Miss //
		   if(!($(this).hasClass("used"))) topGridP2.highlight(this);
	   });
}
// Hide Player 2 Boards & Prompt Player 1 //
$(".three").addClass("hide");
$(".board2").addClass("hide");
$(".board").removeClass("hide");
// Delay For Smoother User Experience //
setTimeout(showBtnP2, 700);					
}



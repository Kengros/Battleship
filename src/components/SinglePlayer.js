import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import jQuery from 'jquery';
import registerServiceWorker from '../registerServiceWorker';

export const singlePlayer = (n)=>{


/**************************/
/* Battleship Multiplayer */
/**************************/


/*-----------------*/
// Getting Started //
/*-----------------*/

// Because I like Console Logs //
console.log("Battleship is running!");

// Set Global Variables //
var playerFleet, npcFleet;
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
		if (this == playerFleet) npc.sizeOfShipSunk = this.ships[pos].length;
		this.ships.splice(pos, 1);
		// No More Ships To Hit - Game Over :( //
		if (this.ships.length == 0) {
			$(".text").text(coms.lost(this.name));
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
	"start": " NAVAL COMMAND: Admiral, your ships are ready to deploy.",
	"blank": " NAVAL COMMAND: ",
	"admiral": " NAVAL COMMAND: Would you like us to place your fleet or place them yourself?",
	"player": " NAVAL COMMAND: Place your ships on the bottom grid.",
	"error": " NAVAL COMMAND: Ships cannot overlap. Please find another location.",
	"attack": " NAVAL COMMAND: Use the top coordinates grid to fire on the enemy.",
	placed: function(name) { return " NAVAL COMMAND: Your " + name + " been placed."; },
	hit: function(name, type) { return " NAVAL COMMAND: " + name + "'s ship was hit." },
	miss: function(name) { return " NAVAL COMMAND: " + name + " missed!" },
	sunk: function(user, type) { return " NAVAL COMMAND: " + user + "'s " + type + " was sunk!" },
	lost: function(name) { return " NAVAL COMMAND: " + name + " has been destroyed!  The War Is Over!" },
};

// Game Mechanics Functions //
var topGrid = {
	allHits: [],
	highlight: function(square) {
		$(square).addClass("target").off("mouseleave").on("mouseleave", function() {
			$(this).removeClass("target"); 
		});

		$(square).off("click").on("click", function() {
			if(!($(this).hasClass("used"))) {
				$(this).removeClass("target").addClass("used");
				var num = parseInt($(this).attr("class").slice(15));
				var bool = npcFleet.checkIfHit(num);
				if (false == bool) {
					$(".text").text(coms.miss("You"));
					$(this).children().addClass("miss");
				} else $(this).children().addClass("hit");
				$(".top").find(".points").off("mouseenter").off("mouseover").off("mouseleave").off("click");
				// Is the game over yet? //
				if (npcFleet.ships.length == 0) {
 					$(".top").find(".points").off("mouseenter").off("mouseover").off("mouseleave").off("click");

 				} else setTimeout(npc.select, 800);
			}
		});
	},
}


/*********************************/
/* Game Board Mechanics Function */
/*********************************/


/*--------------------*/
// Bottom Grid Functions //
/*--------------------*/

// Bottom Grid //
var bottomGrid = {
	currentHits: [],
	checkAttempt: function(hit) {
		if (playerFleet.checkIfHit(hit)) {
			// Keeping Track Of Hits //
			bottomGrid.currentHits.push(hit);
      if (this.currentHits.length > 1) npc.prev_hit = true;
			// Diaplaying Hits //
			$(".bottom").find("." + hit).children().addClass("hit");
			if (bottomGrid.hasShipBeenSunk()) {
				// Checking NPC Hit Data //
				npc.hunting = npc.prev_hit = false;
				if (npc.sizeOfShipSunk == bottomGrid.currentHits.length) {
					npc.num_misses = npc.back_count = npc.nextMove.length = bottomGrid.currentHits.length = npc.sizeOfShipSunk = npc.currrent = 0;
				} else {
					npc.special =  npc.case1 = true;
				}
				if (npc.specialHits.length > 0) npc.special = true;
				// Is the game over yet? //
			}
			return true;
		} else {
			// Displaying Misses //
			$(".bottom").find("." + hit).children().addClass("miss");
			// Checking NPC Hit Data //
			npc.current = bottomGrid.currentHits[0];
			npc.prev_hit = false;
			if (bottomGrid.currentHits.length > 1) {
				npc.back = true;
				npc.num_misses++;
			}
			if (npc.case2) {
				npc.special = true;
				npc.case2 = false;
			}
			return false;
		}
	},
	// Check If Ship Is Sunk //
	hasShipBeenSunk: function() {
		if (npc.sizeOfShipSunk > 0) return true;
		else return false;
	}
}

// AI logic for random hits //
var npc = {
	back: false,
	hunting: false,
	prev_hit: false,
	first_hit: false,
	special: false,
	case1: false,
	case2: false,
	num_misses: 0,
	back_count: 0,
	randPool: [],
	nextMove: [],
	attempted: [],
	specialHits: [],
	direction: "",
	current: 0,
	numAttemptsAfterHit: 0,
	sizeOfShipSunk: 0,
	randomGen: function(size) {
		return Math.floor(Math.random() * size);
	},
	// NPC Attack Logic //
	select: function() {
		if (npc.hunting) {
			npc.battleLogic();
		} else if (npc.special) {
			npc.specialCase();
		} else {
			// Select Random Attack //
			npc.current = npc.randPool[npc.randomGen(npc.randPool.length)];
			npc.attempted.push(npc.current);
			npc.first_hit = true;
			// Remove guesss and check for hit //
			npc.removeGuess(npc.randPool.indexOf(npc.current));
			npc.hunting = bottomGrid.checkAttempt(npc.current);
		}
		setTimeout(highlightBoard(), 50);
	},

	removeGuess: function(index) {
		npc.randPool.splice(index, 1);
	},
	// NPC Creat Moves //
	battleLogic: function() {
		if (npc.first_hit) {
			npc.createMoves();
			npc.first_hit = false;
		}

		if (npc.num_misses > 1) {
			npc.specialCase();
		} else if (npc.back) {
			npc.back = false;
			npc.NpcBack();
			npc.deployHit(npc.current);
		} else if (npc.prev_hit) {
			npc.continueHits();
			npc.deployHit(npc.current);
			console.log(npc.prev_hit);
		} else {
			npc.direction = npc.nextMove.pop();
			console.log(npc.direction + " " + npc.current);
			npc.getNumericalDirection(npc.direction);
			npc.prev_hit = npc.deployHit(npc.current);
			console.log(npc.prev_hit);
		}
	},

	deployHit: function(hit) {
		if (npc.special) {
			npc.specialCase();
		} else {
			npc.attempted.push(hit);
			npc.removeGuess(npc.randPool.indexOf(hit));
			return bottomGrid.checkAttempt(hit);
		}
	},

	createMoves: function() {
		if(npc.current == 1) {
			npc.getRandomMoves(["right", "down"]);
		}
		else if(npc.current == 10) {
			npc.getRandomMoves(["left", "down"]);
		}
		else if(npc.current == 91) {
			npc.getRandomMoves(["up", "right"]);
		} 
		else if(npc.current == 100) {
			npc.getRandomMoves(["left", "up"]);
		}
		else if(!(npc.current % 10)){
			npc.getRandomMoves(["up", "down", "left"]);
		}
		else if(npc.current < 10) {
			npc.getRandomMoves(["right", "down", "left"]);
		}
		else if(npc.current % 10 == 1) {
			npc.getRandomMoves(["up", "right", "down"]);
		}
		else if(npc.current > 91) {
			npc.getRandomMoves(["up", "right", "left"]);
		}
		else {
			npc.getRandomMoves(["up", "right", "down", "left"]);
		}
	},

	getRandomMoves: function(possibleMoves) {
		while (possibleMoves.length != 0) {
			// Select a Random Direction //
			var dir = npc.randomGen(possibleMoves.length);
			// Up //
			if (possibleMoves[dir] == "up") {
				if (npc.randPool.some(function(x) { return x == npc.current - 10; })) {
					npc.nextMove.push("up");
				}
			}
			// Right //
			if (possibleMoves[dir] == "right") {
				if (npc.randPool.some(function(x) { return x == npc.current + 1; })) {
					npc.nextMove.push("right");
				}
			}
			// Down //
			if (possibleMoves[dir] == "down") {
				if (npc.randPool.some(function(x) { return x == npc.current + 10; })) {
					npc.nextMove.push("down");
				}
			}
			// Left //
			if (possibleMoves[dir] == "left") {
				if (npc.randPool.some(function(x) { return x == npc.current - 1; })) {
					npc.nextMove.push("left");
				}
			}
			possibleMoves.splice(dir, 1);
		}
	},

	getNumericalDirection: function(dir) {
		if (dir == "up") npc.current -= 10;
		if (dir == "right") npc.current += 1;
		if (dir == "down") npc.current += 10;
		if (dir == "left") npc.current -= 1;
		console.log(npc.current + " attempted " + npc.attempted);
		// Check for duplicate //
		if (npc.attempted.some(function(x) { return x == npc.current; }) && npc.specialHits.length == 0) {
			npc.current = bottomGrid.currentHits[0];
			if (npc.back_count > 1) npc.special = true;
			else npc.NpcBack();
		}
		return false;
	},

	continueHits: function() {
		console.log("cont " + npc.direction);
		if (npc.direction == "up") {
			if (npc.locationCheck("up")) {
				npc.direction = "down";
				return npc.getNumericalDirection(npc.direction);
			} else return npc.getNumericalDirection(npc.direction);
		}
		if (npc.direction == "right") {
			if (npc.locationCheck("right")) {
				npc.direction = "left";
				return npc.getNumericalDirection(npc.direction);
			} else return npc.getNumericalDirection(npc.direction);
		}
		if (npc.direction == "down") {
			if (npc.locationCheck("down")) {
				npc.direction = "up";
				return npc.getNumericalDirection(npc.direction);
			} else return npc.getNumericalDirection(npc.direction);
		}
		if (npc.direction == "left") {
			if (npc.locationCheck("left")) {
				npc.direction = "right";
				return npc.getNumericalDirection(npc.direction);
			} else return npc.getNumericalDirection(npc.direction);
		}
	},

	NpcBack: function() {
		npc.back_count++;
		if (npc.direction == "up") {
			npc.direction = "down";
			return npc.continueHits();
		}
		if (npc.direction == "right") {
			npc.direction = "left";
			return npc.continueHits();
		}
		if (npc.direction == "down") {
			npc.direction = "up";
			return npc.continueHits();
		}
		if (npc.direction == "left") {
			npc.direction = "right";
			return npc.continueHits();
		}
	},

	locationCheck: function(dir) {
		if (dir == "up") {
			if (npc.current < 11) return true
		}
		if (dir == "right") {
			if (npc.current % 10 == 0) return true
		}
		if (dir == "down") {
			if (npc.current > 90) return true
		}
		if (dir == "left") {
			if (npc.current % 10 == 1) return true
		}
		return false;
	},

	specialCase: function() {
		npc.num_misses = npc.back_count = npc.nextMove.length = 0;
		if (npc.case1) {
			npc.prev_hit = true;
			if (npc.getNewCurrent(npc.direction)) {
				bottomGrid.currentHits.length = 0;
				bottomGrid.currentHits.push(npc.current);
				npc.first_hit = true;
				npc.prev_hit = false;
			}
			npc.special = npc.case1 = npc.back = false;
			npc.hunting = true;
			npc.sizeOfShipSunk = 0;
			npc.battleLogic();
		} else {
			if (npc.specialHits.length == 0) {
				for(var i = 0; i < bottomGrid.currentHits.length; i++) {
					npc.specialHits.push(bottomGrid.currentHits[i]);
				}
				bottomGrid.currentHits.length = 0;
			}
			npc.current = npc.specialHits.pop();
			bottomGrid.currentHits.push(npc.current);
			npc.special = npc.back = npc.prev_hit = false;
			npc.first_hit = npc.hunting = true;
			npc.battleLogic();
		}
	},

	getNewCurrent: function(direction) {
		var difference = bottomGrid.currentHits.length - npc.sizeOfShipSunk;
		if (npc.direction == "up") {
			npc.direction = "down";
			if (difference > 1) {
				npc.current += 10 * (bottomGrid.currentHits.length - 1);
				var temp = npc.current + (10 * (difference - 1));
				bottomGrid.currentHits.length = 0;
				for (var i = 0; i < difference; i++) {
					bottomGrid.currentHits.push(temp);
					temp += 10;
				}
				npc.case2 = true;
				return false;
			}
			npc.current += 10 * npc.sizeOfShipSunk;
			return true;
		}
		if (npc.direction == "right") {
			npc.direction = "left";
			if (difference > 1) {
				npc.current -= bottomGrid.currentHits.length - 1;
				var temp = npc.current + (difference - 1);
				bottomGrid.currentHits.length = 0;
				for (var i = 0; i < difference; i++) {
					bottomGrid.currentHits.push(temp);
					temp -= 1;
				}
				npc.case2 = true;
				return false;
			}
			npc.current -= npc.sizeOfShipSunk;
			return true;
		}
		if (npc.direction == "down") {
			npc.direction = "up";
			if (difference > 1) {
				npc.current -= 10 * (bottomGrid.currentHits.length - 1);
				var temp = npc.current - (10 * (difference - 1));
				bottomGrid.currentHits.length = 0;
				for (var i = 0; i < difference; i++) {
					bottomGrid.currentHits.push(temp);
					temp -= 10;
				}
				npc.case2 = true;
				return false;
			}
			npc.current -= 10 * npc.sizeOfShipSunk;
			return true;
		}
		if (npc.direction == "left") {
			npc.direction = "right";
			if (difference > 1) {
				npc.current += bottomGrid.currentHits.length - 1;
				var temp = npc.current - (difference - 1);
				bottomGrid.currentHits.length = 0;
				for (var i = 0; i < difference; i++) {
					bottomGrid.currentHits.push(temp);
					temp += 1;
				}
				npc.case2 = true;
				return false;
			}
			npc.current += npc.sizeOfShipSunk;
			return true;
		}
	}
}

//  Coordinate Grids //
$(document).ready(function() {
	for (var i = 1; i <= 100; i++) {
		// X $ Y Axis //
		if (i < 11) {
			$(".top").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
			$(".bottom").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
			$(".grid").append("<li class='points offset1 " + i + "'><span class='hole'></span></li>");
		} else {
			$(".grid").append("<li class='points offset2 " + i + "'><span class='hole'></span></li>");
		}
		if (i == 11) {
			$(".top").prepend("<span class='aTops hidezero'>" + Math.abs(i - 11) + "</span>");
			$(".bottom").prepend("<span class='aTops hidezero'>" + Math.abs(i - 11) + "</span>");
		}
		if (i > 90) {
			$(".top").append("<span class='aLeft'>" + 
								String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
			$(".bottom").append("<span class='aLeft'>" + 
								String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
		}
	}
	$(".text").text(coms.attack);
})

// Menu //

$(document).ready(function() {
		$(".text").text(coms.admiral);
		gameSetup(this);
	});
	$(".multi").on("click", function(e) {
		e.preventDefault();
		if (!$("div").hasClass("error")) {
			$(".text").text(coms.blank);
			$(this).addClass("error");
		}
	});
	$(".options").on("click", function(e) {
		e.preventDefault();
		if (!$("div").hasClass("error")) {
			$(".text").text(coms.blank);
			$(this).addClass("error");
		}
	});

function gameSetup(t) {
	$(t).off() && $(".two").off();
	$(".one").addClass("player").removeClass("one").text("Place My Own");
	$(".multi").addClass("random").removeClass("multi").text("Naval Command ");

	$(".player").off("click").on("click", function() {
		$(".text").text(coms.player);
		selfSetup(playerFleet);
	});
	$(".random").off("click").on("click", function() {
		playerFleet = new Fleet("The Admiral");
		playerFleet.initShips();
		randomSetup(playerFleet);
	});
}


function selfSetup() {
	$(".player").addClass("horz").removeClass("player").text("Horizontal");
	$(".random").addClass("vert").removeClass("random").text("Vertical");
	
	playerFleet = new Fleet("The Admiral");
	playerFleet.initShips();
	placeShip(playerFleet.ships[playerFleet.currentShip], playerFleet);
}

// Naval Command Ship Placement //
function randomSetup(fleet) {
	if (fleet.currentShip >= fleet.numOfShips) return;
	
	var orien = Math.floor((Math.random() * 10) + 1);
	var length = fleet.ships[fleet.currentShip].length;
	
	if (orien < 6) {
		var shipOffset = 11 - fleet.ships[fleet.currentShip].length; 
		var horiz = Math.floor((Math.random() * shipOffset) + 1);
		var vert = Math.floor(Math.random() * 9);
		var randNum = parseInt(String(vert) + String(horiz));
		if (fleet == npcFleet) checkOverlap(randNum, length, "horz", fleet);
		else setShip(randNum, fleet.ships[fleet.currentShip], "horz", fleet, "random");
	} else {
		var shipOffset = 110 - (fleet.ships[fleet.currentShip].length * 10);
		var randNum = Math.floor((Math.random() * shipOffset) + 1);
	
		if (fleet == npcFleet) checkOverlap(randNum, length, "vert", fleet); 
		else setShip(randNum, fleet.ships[fleet.currentShip], "vert", fleet, "random");
	}
}

function createnpcFleet() {
	// Enemy Ship Placement //
	npcFleet = new Fleet("The enemy");
	npcFleet.initShips();
	randomSetup(npcFleet);
}

// Ship Placement Highlights //
function placeShip(ship, fleet) {
	var orientation = "horz";
	$(".vert").off("click").on("click", function() {
		orientation = "vert";
	});
	$(".horz").off("click").on("click", function() {
		orientation = "horz";
	});
	$(".bottom").find(".points").off("mouseenter").on("mouseenter", function() {
		var num = $(this).attr('class').slice(15);
		//
		if (orientation == "horz") displayShipHorz(parseInt(num), ship, this, fleet);
		else displayShipVert(parseInt(num), ship, this, fleet);
	});
}


function displayShipHorz(location, ship, point, fleet) {
	var endPoint = location + ship.length - 2;
	if (!(endPoint % 10 >= 0 && endPoint % 10 < ship.length - 1)) {
		for (var i = location; i < (location + ship.length); i++) {
			$(".bottom ." + i).addClass("highlight");
		}
		$(point).off("click").on("click", function() {
			setShip(location, ship, "horz", fleet, "player");
		});
	}
	$(point).off("mouseleave").on("mouseleave", function() {
		removeShipHorz(location, ship.length);
	});
}

function displayShipVert(location, ship, point, fleet) {
	var endPoint = (ship.length * 10) - 10;
	var inc = 0; 
	if (location + endPoint <= 100) {
		for (var i = location; i < (location + ship.length); i++) {
			$(".bottom ." + (location + inc)).addClass("highlight");
			inc = inc + 10;
		}
		$(point).off("click").on("click", function() {
			setShip(location, ship, "vert", fleet, "player");
		});
	}
	$(point).off("mouseleave").on("mouseleave", function() {
		removeShipVert(location, ship.length);
	});
}

function removeShipHorz(location, length) {
	for (var i = location; i < location + length; i++) {
		$(".bottom ." + i).removeClass("highlight");
	}
}

function removeShipVert(location, length) {
	var inc = 0;
	for (var i = location; i < location + length; i++) {
		$(".bottom ." + (location + inc)).removeClass("highlight");
		inc = inc + 10;
	}
}

function setShip(location, ship, orientation, genericFleet, type) {
	if (!(checkOverlap(location, ship.length, orientation, genericFleet))) {
		if (orientation == "horz") {
			genericFleet.ships[genericFleet.currentShip].populateHorzHits(location);
			$(".text").text(coms.placed(genericFleet.ships[genericFleet.currentShip].name + " has"));
			for (var i = location; i < (location + ship.length); i++) {
				$(".bottom ." + i).addClass(genericFleet.ships[genericFleet.currentShip].name);
				$(".bottom ." + i).children().removeClass("hole");
			}
			if (++genericFleet.currentShip == genericFleet.numOfShips) {
				$(".text").text(coms.placed("ships have"));
				$(".bottom").find(".points").off("mouseenter");
				// Cruft //
				setTimeout(createnpcFleet, 100);
			} else {
				if (type == "random") randomSetup(genericFleet);
				else placeShip(genericFleet.ships[genericFleet.currentShip], genericFleet);
			}
			
		} else {
			var inc = 0;
			genericFleet.ships[genericFleet.currentShip].populateVertHits(location);
			$(".text").text(coms.placed(genericFleet.ships[genericFleet.currentShip].name + " has"));
			for (var i = location; i < (location + ship.length); i++) {
				$(".bottom ." + (location + inc)).addClass(genericFleet.ships[genericFleet.currentShip].name);
				$(".bottom ." + (location + inc)).children().removeClass("hole");
				inc = inc + 10;
			}
			if (++genericFleet.currentShip == genericFleet.numOfShips) {
				$(".text").text(coms.placed("ships have"));
				$(".bottom").find(".points").off("mouseenter");
				// Cruft //
				setTimeout(createnpcFleet, 100);
			} else {
				if (type == "random") randomSetup(genericFleet);
				else placeShip(genericFleet.ships[genericFleet.currentShip], genericFleet);
			}
		}
	} else {
		if (type == "random") randomSetup(genericFleet);
		else $(".text").text(coms.error);
	}
 } 

 function checkOverlap(location, length, orientation, genFleet) {
 	var loc = location;
 	if (orientation == "horz") {
 		var end = location + length;
	 	for (; location < end; location++) {
	 		for (var i = 0; i < genFleet.currentShip; i++) {
	 			if (genFleet.ships[i].locationCheck(location)) {
	 				if (genFleet == npcFleet) randomSetup(genFleet);
	 				else return true;
	 			}
	 		} 
	 	} 
	 } else {
	 	var end = location + (10 * length);
	 	for (; location < end; location += 10) {
	 		for (var i = 0; i < genFleet.currentShip; i++) {
	 			if (genFleet.ships[i].locationCheck(location)) {
	 				if (genFleet == npcFleet) randomSetup(genFleet);
	 				else return true;
	 			}
	 		}
	 	}
	 } 
	if (genFleet == npcFleet && genFleet.currentShip < genFleet.numOfShips) {
		if (orientation == "horz") genFleet.ships[genFleet.currentShip++].populateHorzHits(loc);
	 	else genFleet.ships[genFleet.currentShip++].populateVertHits(loc);
	 	if (genFleet.currentShip == genFleet.numOfShips) {
	 		// Cruft //
	 		setTimeout(startGame, 500);
	 	} else randomSetup(genFleet);
	 }
	return false;
 } 


function startGame() {
    $(".shipPanel").fadeIn("fast", function() {
    });
 	$(".topPanel").fadeOut("fast", function() {
 		$(".console").css( { "margin-top" : "5%" } );
     });
 	$(".text").text(coms.start);
 	// Admiral Hits //
 	for (var i = 0; i < 100; i++) npc.randPool[i] = i + 1;
 	highlightBoard();
 }

 function highlightBoard() {
 	if (playerFleet.ships.length == 0) {
 		$(".top").find(".points").off("mouseenter").off("mouseleave").off("click");
 	} else {
	 	$(".top").find(".points").off("mouseenter mouseover").on("mouseenter mouseover", function() {
			if(!($(this).hasClass("used"))) topGrid.highlight(this);
		});
	 }
}
}
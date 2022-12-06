// Kamelenrace
// zie: https://fontawesome.com/icons

var figuurtjes = [
	{ displayName: "Ouwe rups", icon: '<i class="fas fa-kiwi-bird green"></i>', realName: "danny" },
	{ displayName: "Natte krant", icon: '<i class="fas fa-ghost"></i>', realName: "irmen" },
	{ displayName: "Manke poot", icon: '<i class="fas fa-cat"></i>', realName: "stephanie" },
	{ displayName: "Turbokameel", icon: '<i class="fas fa-blind"></i>', realName: "nick" },
	{ displayName: "Pikachooo", icon: '<img src="images/pikachu-pokemon.png">', realName: "melissa" },
	{ displayName: "Chips", icon: '<img src="images/chips.png">', realName: "joeri" },
	{ displayName: "Jerry", icon: '<i class="fas fa-hiking"></i>', realName: "tom" },
	{ displayName: "Dikkie", icon: '<i class="fas fa-sleigh"></i>', realName: "colin" },
	{ displayName: "Morty", icon: '<i class="fab fa-accessible-icon"></i>', realName: "rik" }
];

var kamelen = [];
var gameOver = false;
var superspeed = false; // voor debuggen en testen

function countDown(sec) {
	var cd = $('#countdown');
	cd.stop().fadeIn().show(); // reset
	
	cd.text(sec);
	var timer = setInterval(function () {
		sec--;
		cd.text(sec == -1 ? "" : sec == 0 ? "Go!" : sec);

		if (sec == -1) {
			clearInterval(timer);
			startGame();
		} else if (sec == 0) {
			cd.text('Go!');
		} else {
			cd.addClass('infinite animated fadeIn').html(sec);
		}
	}, superspeed ? 100 : 1000);
}

function initGame() {
	var kamelenrace = $('#kamelenrace');
	
	$('#scoreboardlijst').empty();
	$('#info').addClass("d-none").text('');
	$('#verliezerinfo').addClass("d-none");
	$('#verliezer').text('');
	
	refreshAllTimeScoreboard();
	
	kamelenrace.html('');
	kamelenrace.append("<div class='finish'>Finish</div>");
	figuurtjes.forEach(function (figuur, idx) {
		kamelenrace.append("<p id=kameel" + idx + " class=kameel>" + figuur.icon + " " + figuur.displayName + " (" + figuur.realName + ")</p>");
	});
	kamelenrace.append("<div class='finish'>Finish</div>");
	
	if (superspeed) {
		$(".kameel").css("transition", "25ms")
	}
	
	kamelen = [];
	figuurtjes.forEach(function (figuur, idx) {
		var kameel = new Kameel(figuur, idx);
		kamelen.push(kameel);
	});
}

function startGame() {
	$(".verwijder").remove();
	$('#info').addClass("d-none").text('');
	$('#verliezerinfo').addClass("d-none");
	$('#verliezer').text('');
	
	refreshAllTimeScoreboard();
	
	gameOver = false;

	kamelen.forEach(function (kameel) {
		kameel.reset();
		kameel.run();
	});
}

function refreshAllTimeScoreboard() {
	var scoreboardAllTime = JSON.parse(localStorage.getItem("scoreboardAllTime")) || [];
	$('#alltimescoreboardlijst').empty();
	scoreboardAllTime.forEach(function (item, idx) {
		$('#alltimescoreboardlijst').append(`<li data-secondes="${item.tijd}">${item.naam} <small class="text-muted">${item.tijd} sec</small></li>`);
	});
	$('#alltimescoreboardlijst li').sort(sorteerOpTijd).appendTo('#alltimescoreboardlijst');
}

function Kameel(figuur, number) {
	this.element = document.getElementById("kameel" + number);
	this.x = 0;
	this.number = number;
	this.figuur = figuur;
	this.crashed = false;
	this.iteraties = 0;

	this.moveRight = function () {
		var kameel = this;

		setTimeout(function () {
			if (gameOver || kameel.crashed)
				return;
			
			kameel.iteraties++;
			
			// 1-3 stappen
			kameel.x += Math.random() * 2 + 0;
			
			// random events
			randomBoost(kameel);
			randomCrash(kameel);
			
			// extra stats (met icoontje?)
			// nr laatst random powerup / of gewoon random items?:
			// - schiet iemand random kapot? (gun schiet 1x)
			// - lasso trek iemand stappen terug
			// - 
			
			
			if (kameel.x > 100)
				kameel.x = 101;

			$(kameel.element).css('margin-left', kameel.x + '%');

			if (kameel.x > 100) {
				kameel.arrive();
			}
			else {
				kameel.moveRight();
			}
		}, superspeed ? 25 : 100);
	}

	this.run = function () {
		this.moveRight();
	}

	this.arrive = function () {
		gameOver = true;
		
		var winnaar = this.figuur.displayName + " (" + this.figuur.realName + ")";
		
		$('#countdown').text('Game!').fadeOut("slow");
		$('#info').removeClass("d-none").text(winnaar + " heeft gewonnen!");
		
		// verwijder gewonnen kameel
		var index = kamelen.indexOf(this);
		if (index > -1) {
			kamelen.splice(index, 1);
		}
		
		// markeer kameel element
		$(this.element).addClass("verwijder");
		
		// scoreboard updaten
		var tijdInSec = this.iteraties * 100 / 1000; // iteraties * 100ms / 1000 = sec
		var nieuwRecord = updateAllTimeScoreboard(winnaar, tijdInSec);
		$('#scoreboardlijst').append(`<li data-secondes="${tijdInSec}">${winnaar} <small class="text-muted">${tijdInSec} sec </small>${nieuwRecord ? "<span class='badge badge-secondary'>Nieuw record!</span>" : ""}</li>`);
		$('#scoreboardlijst li').sort(sorteerOpTijd).appendTo('#scoreboardlijst');
		$('#scoreboard').removeClass("d-none");
		
		if (kamelen.length == 1) {
			// Race klaar
			var figuurHeeftVerloren = kamelen[0].figuur;
			$('#verliezer').text(figuurHeeftVerloren.displayName + " (" + figuurHeeftVerloren.realName + ")");
			$('#verliezerinfo').removeClass("d-none");
			$('#start').text('Restart').removeAttr("disabled");
		} else {
			// Volgende ronde!
			setTimeout(function () {
				console.log('Volgende ronde!');
				countDown(3);
			}, 500);
		}
	}

	this.crash = function () {
		// er moet altijd minimaal 1 kameel over blijven
		if (kamelen.filter(k => k.crashed == false).length > 1) {
			$(this.element).css('color', '#ff0000');
			$(this.element).find("i, img").addClass("fa-spin");
			this.crashed = true;
		}
	}

	this.reset = function () {
		this.x = 0;
		this.iteraties = 0;
		this.crashed = false;
		$(this.element).css('margin-left', this.x + '%');
		$(this.element).css('color', '#000');
		$("i, img").removeClass("fa-spin");
	}
}

function updateAllTimeScoreboard(winnaar, tijdInSec) {
	var newItem = { naam: winnaar, tijd: tijdInSec };
	var scoreboardAllTime = JSON.parse(localStorage.getItem("scoreboardAllTime")) || [];
	var nieuwRecord = false;
	
	// scoreboard all-time top 3 bijhouden
	if (scoreboardAllTime.length < 3) {
		scoreboardAllTime.push(newItem);
		localStorage.setItem("scoreboardAllTime", JSON.stringify(scoreboardAllTime));
		nieuwRecord = true;
	}
	else if (scoreboardAllTime.filter(x => x.tijd > tijdInSec).length > 1) {
		scoreboardAllTime.push(newItem);
		scoreboardAllTime.sort(function(a, b) {
			return (b.tijd < a.tijd) ? 1 : -1
		});
		scoreboardAllTime.pop();
		localStorage.setItem("scoreboardAllTime", JSON.stringify(scoreboardAllTime));
		nieuwRecord = true;
	}
	
	return nieuwRecord;
}

function sorteerOpTijd(a, b) {
	return ($(b).data('secondes')) < ($(a).data('secondes')) ? 1 : -1;
}

function randomBoost(kameel) {
	if (Math.random() * 100 > 99) {
		kameel.x += 5;
		$(kameel.element).css('color', '#ffd700');
	}
	else {
		$(kameel.element).css('color', '#000');
	}
}

function randomCrash(kameel) {
	if (Math.random() * 500 > 499) {
		kameel.crash();
	}
}

// todo: loot crates voor powerups fixen


$(document).ready(function () {
	initGame();

	$('#start').click(function () {
		console.log('start');
		this.disabled = true;
		this.blur();
		initGame();
		countDown(3);
	});
});

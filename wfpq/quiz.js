document.querySelector('#login_button').onclick = login;
document.querySelector('#register_button').onclick = register;
document.querySelector('#submit_answers').onclick = confirmAnswers;
document.querySelector('#swapToSignIn').onclick = swapToSignIn;
document.querySelector('#swapToRegister').onclick = swapToRegister;

var team;
var autoLockIntervalHandler;

checkUUID();
bindInputsToMemory();

function log(message) {
	console.log("[" + Date.now() + "] " + message);
}

function swapToRegister() {

	document.querySelector('#login').style.display = 'none';
	document.querySelector('#register').style.display = 'block';

}

function swapToSignIn() {

	document.querySelector('#register').style.display = 'none';
	document.querySelector('#login').style.display = 'block';

}

function bindInputsToMemory()
{
	// Ugly I know. Don't judge me :-(

	var question1 = document.querySelector('#question-1');
	question1.addEventListener('keyup', function() {
		window.localStorage["question-1"] = question1.value;
	});

	var question2 = document.querySelector('#question-2');
	question2.addEventListener('keyup', function() {
		window.localStorage["question-2"] = question2.value;
	});

	var question3 = document.querySelector('#question-3');
	question3.addEventListener('keyup', function() {
		window.localStorage["question-3"] = question3.value;
	});

	var question4 = document.querySelector('#question-4');
	question4.addEventListener('keyup', function() {
		window.localStorage["question-4"] = question4.value;
	});

	var question5 = document.querySelector('#question-5');
	question5.addEventListener('keyup', function() {
		window.localStorage["question-5"] = question5.value;
	});

	var question6 = document.querySelector('#question-6');
	question6.addEventListener('keyup', function() {
		window.localStorage["question-6"] = question6.value;
	});

	var question7 = document.querySelector('#question-7');
	question7.addEventListener('keyup', function() {
		window.localStorage["question-7"] = question7.value;
	});

	var question8 = document.querySelector('#question-8');
	question8.addEventListener('keyup', function() {
		window.localStorage["question-8"] = question8.value;
	});

	var question9 = document.querySelector('#question-9');
	question9.addEventListener('keyup', function() {
		window.localStorage["question-9"] = question9.value;
	});

	var question10 = document.querySelector('#question-10');
	question10.addEventListener('keyup', function() {
		window.localStorage["question-10"] = question10.value;
	});
}

function checkUUID()
{
	var uuid = window.localStorage.uuid;

	if (!uuid) {
		log('UUID does not exist - sending user to login/register');
		show('sign_up');
		return;
	}

	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function()
    {
        if (this.readyState == 4)
        {
            if (this.status == 200)
            {
            	log('Successful login - sending user to waiting screen');
            	team = JSON.parse(xhttp.responseText);

				if (team.usedFatmouse) {
					log("Team has used fatmouse, removing option");
					document.querySelector('#active_fm').style.display = 'none';
					document.querySelector('#spent_fm').style.display = 'block';
				}

            	setTeamName();
				show('waiting');
				connectToWebSocket();
            }
            else
            {
            	window.localStorage.uuid = "";
            	log('Failed login - sending user to login/register');
            	show('sign_up');
            }
        }
    }

    xhttp.open('GET', '/api/authorise/' + uuid, true);
    xhttp.send();

}

function register() {

	var username = document.querySelector('#register_username').value;
	var password = document.querySelector('#register_password').value;
	var teamname = document.querySelector('#register_teamname').value;
	var members  = document.querySelector('#register_members').value;

	if (!username || username == "") {
    	document.querySelector('#register > div > .error').innerText = "Username cannot be empty";
    	return;
	}

	if (!password || password == "") {
    	document.querySelector('#register > div > .error').innerText = "Password cannot be empty";
    	return;
	}

	if (!teamname || teamname == "") {
    	document.querySelector('#register > div > .error').innerText = "Team name cannot be empty";
    	return;
	}

	var register = {
		"username": username,
		"password": password,
		"teamName": teamname,
		"members":  members
	};

	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function()
    {
        if (this.readyState == 4)
        {
            if (this.status == 200)
            {
            	team = JSON.parse(xhttp.responseText);
				window.localStorage.uuid = team.uuid;

            	setTeamName();
            	log('Successful registration - sending user to waiting screen');
				show('waiting');
				connectToWebSocket();
            }
            else
            {
            	document.querySelector('#register > div > .error').innerText = xhttp.responseText;
            }
        }
    }

    xhttp.open('POST', '/api/users', true);
    xhttp.send(JSON.stringify(register));

}

function login() {

	var username = document.querySelector('#login_username').value;
	var password = document.querySelector('#login_password').value;

	if (!username || username == "") {
    	document.querySelector('#login > div > .error').innerText = "Username cannot be empty";
    	return;
	}

	if (!password || password == "") {
    	document.querySelector('#login > div > .error').innerText = "Password cannot be empty";
    	return;
	}

	var login = {
		"username": username,
		"password": password
	};

	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function()
	{
		if (this.readyState == 4)
		{
			if (this.status == 200)
			{
				team = JSON.parse(xhttp.responseText);
				window.localStorage.uuid = team.uuid;

				if (team.usedFatmouse) {
					document.querySelector('#active_fm').style.display = 'none';
					document.querySelector('#spent_fm').style.display = 'block';
				}

				setTeamName();
				log('Successful login - sending user to waiting screen');
				show('waiting');
				connectToWebSocket();
			}
			else
			{
				document.querySelector('#login > div > .error').innerText = xhttp.responseText;
			}
		}
	}

	xhttp.open('POST', '/api/authorise', true);
	xhttp.send(JSON.stringify(login));

}

function confirmAnswers()
{
	let confirm_answers = confirm("Are you sure you want to submit answers?");

	if (confirm_answers) {
		submitAnswers();
	}
}

function submitAnswers()
{
	clearInterval(autoLockIntervalHandler);
	document.querySelector('#submit_answers').style.display = 'none';
	document.querySelector('#submit_loading').style.display = 'block';

	var uuid = window.localStorage.uuid;

	var answer1  = document.querySelector('#question-1').value;
	var answer2  = document.querySelector('#question-2').value;
	var answer3  = document.querySelector('#question-3').value;
	var answer4  = document.querySelector('#question-4').value;
	var answer5  = document.querySelector('#question-5').value;
	var answer6  = document.querySelector('#question-6').value;
	var answer7  = document.querySelector('#question-7').value;
	var answer8  = document.querySelector('#question-8').value;
	var answer9  = document.querySelector('#question-9').value;
	var answer10 = document.querySelector('#question-10').value;
	var fatmouse = document.querySelector('#fatmouse').checked;

	var answers = {
		"1": answer1,
		"2": answer2,
		"3": answer3,
		"4": answer4,
		"5": answer5,
		"6": answer6,
		"7": answer7,
		"8": answer8,
		"9": answer9,
		"10": answer10,
		"fatmouse": fatmouse
	};

	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function()
	{
		if (this.readyState == 4)
		{
			if (this.status == 200)
			{
            	log("Submitted answers successfully, awaiting next round");
            	document.querySelector('#submit_loading').style.display = 'none';
            	document.querySelector('#submit_waiting').style.display = 'block';
				disableQuestions();

				if (fatmouse) {
					document.querySelector('#fatmouse').checked = false;
					document.querySelector('#active_fm').style.display = 'none';
					document.querySelector('#spent_fm').style.display = 'block';
				}
			}
			else
			{
        		document.querySelector('#quiz > .error').innerText = xhttp.responseText;

				if (this.status == 409) {
	            	document.querySelector('#submit_loading').style.display = 'none';
	            	document.querySelector('#submit_waiting').style.display = 'block';
					disableQuestions();
            	}
            	else {
	            	document.querySelector('#submit_loading').style.display = 'none';
	            	document.querySelector('#submit_answers').style.display = 'block';
            	}
			}
		}
	}

	xhttp.open('POST', '/api/answers/' + uuid, true);
	xhttp.send(JSON.stringify(answers));
}

function setTeamName() {

	document.querySelectorAll('.team_name').forEach(function(e) {
		e.innerHTML = team.teamName + "#" + team.id;
	});

}

var ws;
var keepAliveHandler;

function connectToWebSocket()
{
	ws = new WebSocket("wss://" + window.location.host + "/ws");

	ws.onopen = function()
	{
		log("Websocket connected");
		ws.send("register:" + team.uuid);
	}

	ws.onclose = function() {
		log("Websocket closed - reconnecting");
		connectToWebSocket();
	}

	clearInterval(keepAliveHandler);
	keepAliveHandler = setInterval(function() {
		log("Websocket - sending keep alive");
		ws.send('keep-alive');
	}, 30000);

	ws.onmessage = function(raw)
	{
		log("Websocket - received message");
		if (raw.data.indexOf("start_quiz") != -1) 		   handleStartQuiz();
		else if (raw.data.indexOf("autolock_start") != -1) handleAutoLock(raw.data.replace("autolock_start:", ""));
		else if (raw.data.indexOf("autolock_end") != -1)   handleUnlock();
		else if (raw.data.indexOf("next_round") != -1)     handleNextRound(raw.data.replace("next_round:", ""), false);
		else if (raw.data.indexOf("current_round") != -1)  handleNextRound(raw.data.replace("current_round:", ""), true);
	}
}

function handleStartQuiz()
{
	log("Starting quiz");
	show("quiz");
}


function handleUnlock()
{
	document.querySelector('#submit_answers').style.backgroundColor = 'black';
	clearInterval(autoLockIntervalHandler);
	document.querySelector('#auto_lock').innerText = '';
}

function handleAutoLock(epoch)
{
	if (epoch == 0) {
		log("Autolock not active");
		return;
	}

	if (epoch == -1) {
		log("Team already submitted answers - waiting for next round");
    	document.querySelector('#submit_answers').style.display = 'none';
    	document.querySelector('#submit_loading').style.display = 'none';
    	document.querySelector('#submit_waiting').style.display = 'block';
		disableQuestions();
		return;
	}

	if (epoch < Date.now())
	{
		log("Autolock already expired - attempting to submit answers");
		submitAnswers();
		clearInterval(autoLockIntervalHandler);
		return;
	}

	log("Autolock starting...");

	var autoLock = document.querySelector('#auto_lock');
	var count = Math.floor((epoch - Date.now()) / 1000);

	document.querySelector('#submit_answers').style.backgroundColor = 'red';

	clearInterval(autoLockIntervalHandler);
	autoLock.innerText = 'Automatically submitting answers in ' + count + 's';
	autoLockIntervalHandler = setInterval(function() {

		if (count == 0) {
			submitAnswers();
			autoLock.innerText = '';
			clearInterval(autoLockIntervalHandler);
		}
		else {
			count--;
			autoLock.innerText = 'Automatically submitting answers in ' + count + 's';
		}

	}, 1000);
}

function disableQuestions()
{
	log("Disabling questions and fatmouse");

	for (var i = 1; i <= 10; i++) {
		document.querySelector('#question-' + i).disabled = true;
	}

	document.querySelector('#auto_lock').innerText = '';
	document.querySelector('#fatmouse').disabled = true;
}

function enableQuestions()
{
	log("Enabling questions and fatmouse");

	for (var i = 1; i <= 10; i++) {
		document.querySelector('#question-' + i).disabled = false;
	}

	document.querySelector('#fatmouse').disabled = false;
}

function clearQuestions()
{
	log("Clearing questions");

	for (var i = 1; i <= 10; i++) {
		document.querySelector('#question-' + i).value = "";
	}
}

var currentRound = 0;

function handleNextRound(round, current)
{
	if (currentRound == round) {
		log("Ignoring round update");
		return;
	}

	for (var i = 1; i <= 10; i++)
	{
		var question = document.querySelector('#question-' + i);

		if (!current) {
			window.localStorage["question-" + i] = "";
		}
		else {
			if (window.localStorage["question-" + i]) {
				question.value = window.localStorage["question-" + i];
			}
		}
	}

	log("Updating page for round " + round);
	document.querySelector('#submit_answers').style.backgroundColor = 'black';

	currentRound = round;

	document.querySelector('#round').innerText = "Round " + round;
	if (!current) { clearQuestions(); }
	enableQuestions();
	show("quiz");

	document.querySelector('#submit_waiting').style.display = 'none';
	document.querySelector('#submit_answers').style.display = 'block';
	document.querySelector('#quiz > .error').innerText = "";
}

function show(id) {

	// Firstly hide all others
	document.querySelector('#loading').style.display = 'none';
	document.querySelector('#sign_up').style.display = 'none';
	document.querySelector('#waiting').style.display = 'none';
	document.querySelector('#quiz').style.display    = 'none';

	document.querySelector('#' + id).style.display = 'block';

}

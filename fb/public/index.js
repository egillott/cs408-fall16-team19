var x;
messageList = document.getElementById('messages');
globaldatabase = firebase.database();

function Whispers() {
	this.name = document.getElementById('namebox');

	this.initFirebase();
	this.loadmessages();
}

Whispers.prototype.initFirebase = function() {
 	this.auth = firebase.auth();
	this.database = firebase.database();
 	this.storage = firebase.storage();
 	this.ref = this.database.ref("messages");
};

document.getElementById('message-box').onkeydown = function(event) {
    if (event.keyCode == 13) {
    	var box = document.getElementById('message-box');
    	console.log(box.value);
    	callsendmsg("tester", box.value);
    }
}

Whispers.prototype.loadmessages = function(e) {
	var setmessage = function(data) {
		x = data.val();
		console.log(x);
		Object.keys(x).forEach(function(k) {
			displaymsg(data.key, x.name, x.text);
		});
	};
	this.ref.limitToLast(12).on('child_added', setmessage);
};

MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<span class="message"></span>' +
      '<span class="name"></span>' +
      '<br>' +
    '</div>';


displaymsg = function(key, name, text) {
	var div = document.getElementById(key);
	//if doesnt exist create it
	if (!div) {
 	   var container = document.createElement('div');
 	   container.innerHTML = MESSAGE_TEMPLATE;
 	   div = container.firstChild;
 	   div.setAttribute('id', key);
	   this.messageList.appendChild(div);
	}
    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');
    messageElement.textContent = text;
    setTimeout(function() {div.classList.add('visible')}, 1);
    messageList.scrollTop = messageList.scrollHeight;
};

callsendmsg = function(name, text) {
    globaldatabase.ref('messages/').push({
    	name: name, 
    	text: text,
    });
}

Whispers.prototype.sendmsg = function(name, text) {
    // Add a new message entry to the Firebase Database.
    this.database.ref('messages/').push({
    	name: name, 
    	text: text,
    });
};

window.onload = function() {
  window.whispers = new Whispers();
};
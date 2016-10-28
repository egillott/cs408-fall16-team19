MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<span class="name"></span>' +
      '<br>' +
      '<span class="message"></span>' +
      '<br><br>' +
    '</div>';

function Whispers() {
  //to do: actual login sequence
	this.name = "tester";
  this.password = "pw";

  //this.groupList = document.getElementById()

  this.messageList = document.getElementById('messages');
	this.initFirebase();
	this.loadmessages();
}

Whispers.prototype.initFirebase = function() {
 	this.auth = firebase.auth();
	this.database = firebase.database();
 	this.storage = firebase.storage();
 	this.msgref = this.database.ref("messages");
};

Whispers.prototype.loadmessages = function(e) {
	var setmessage = function(data) {
		var x = data.val();
		console.log(x);
		Object.keys(x).forEach(function(k) {
			window.whispers.displaymsg(data.key, x.name, x.text);
		});
	};
	this.msgref.limitToLast(12).on('child_added', setmessage);
};

Whispers.prototype.displaymsg = function(key, name, text) {
	var div = document.getElementById(key);
	//if doesnt exist create it
	if (!div) {
 	   var container = document.createElement('div');
 	   container.innerHTML = MESSAGE_TEMPLATE;
 	   div = container.firstChild;
 	   div.setAttribute('id', key);
	   window.whispers.messageList.appendChild(div);
	}
    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');
    messageElement.textContent = text;
    setTimeout(function() {div.classList.add('visible')}, 1);
    window.whispers.messageList.scrollTop = window.whispers.messageList.scrollHeight;
};

Whispers.prototype.sendmsg = function(name, text) {
    // Add a new message entry to the Firebase Database.
    this.database.ref('messages/').push({
    	name: name, 
    	text: text,
    });
};

document.getElementById('message-box').onkeydown = function(event) {
    if (event.keyCode == 13) {
      var box = document.getElementById('message-box');
      window.whispers.sendmsg(window.whispers.name, box.value);
      box.value = "";
    }
}

window.onload = function() {
  window.whispers = new Whispers();
};
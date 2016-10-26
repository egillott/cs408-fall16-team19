var x;
text = document.getElementById('coolspan');
messageList = document.getElementById('messages');

function Whispers() {
	this.name = document.getElementById('namebox');
	//message list
	

	this.initFirebase();
	this.loadmessages();
}

Whispers.prototype.initFirebase = function() {
 	this.auth = firebase.auth();
	this.database = firebase.database();
 	this.storage = firebase.storage();
 	this.ref = this.database.ref("messages/");
};

Whispers.prototype.loadmessages = function(e) {
	//todo: listen and update on change
	this.ref.on("value", function(snapshot) {
		x = snapshot.val()
		Object.keys(x).forEach(function(k) {
			var name = x[k]['name'];
			var text = x[k]['text'];
    		//console.log(string);
    		displaymsg(k, name, text);
		});
	});
};

MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
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
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
    setTimeout(function() {div.classList.add('visible')}, 1);
    messageList.scrollTop = messageList.scrollHeight;
    //this.messageInput.focus();
};

function callsendmsg() {
	whispers.sendmsg();
}

Whispers.prototype.sendmsg = function(e) {
    // Add a new message entry to the Firebase Database.
    this.database.ref('messages/').push({
    	name: this.name.value, 
    	text: this.msg.value,
    });
};

window.onload = function() {
  window.whispers = new Whispers();
};
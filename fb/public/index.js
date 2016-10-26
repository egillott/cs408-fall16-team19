var x;
text = document.getElementById('demo');

function Whispers() {
	this.name = document.getElementById('namebox');
	this.msg = document.getElementById('msgbox');

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
			var string = "Text: " + x[k]['text'] + "\nName: " + x[k]['name'] + '\n';
    		text.innerHTML += string;
		});
	});
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
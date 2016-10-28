MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<span class="name"></span>' +
      '<br>' +
      '<span class="message"></span>' +
      '<br><br>' +
    '</div>';

GROUP_TEMPLATE = 
    '<a href="#" onclick="changeGroup(this)">' + 
    '<div class="room-separator"></div>' +
    '<li class="room-select">' +
    '<div class="room-title"></div>' +
    '</li></a>';

function Whispers() {
  //to do: actual login sequence
  this.name = "tester";
  this.password = "pw";

  this.groupList = document.getElementById('groups')
  this.messageList = document.getElementById('messages');
  this.foo = this.messageList;
  this.emptymsgList = this.messageList;
  this.initFirebase();
  this.loadmessages();
  this.loadgroups();
}

Whispers.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.msgref = this.database.ref("messages");
  this.grpref = this.database.ref("groups");
};

Whispers.prototype.loadgroups = function(e) {
  var parsegroup = function(data) {
    var x = data.val();
    Object.keys(x.members).forEach(function(k) {
      //if user is in group add it to list
      var n = x.members[k];
      if (n === window.whispers.name) {
        window.whispers.displaygroup(data.key, x.groupname);
      }
    });
  };
  this.grpref.limitToLast(12).on('child_added', parsegroup);
}

Whispers.prototype.displaygroup = function(key, name) {
  var div = document.getElementById(key);
  //if doesnt exist create it
  if (!div) {
     var container = document.createElement('div');
     container.innerHTML = GROUP_TEMPLATE;
     div = container.firstChild;
     div.setAttribute('id', key);
     window.whispers.groupList.appendChild(div);
  }
    div.querySelector('.room-title').textContent = name;
    setTimeout(function() {div.classList.add('visible')}, 1);
    window.whispers.groupList.scrollTop = window.whispers.groupList.scrollHeight;
};

function changeGroup(obj) {
  var parse = function(data) {
    var x = data.val();
    Object.keys(x).forEach(function(k) {
      if (k.startsWith("-g")) {
        var s = "groups/" + k + "/messages";
        if (x[k].groupname === obj.textContent) {
          console.log(window.whispers.messageList.innerHTML);
          window.whispers.messageList.innerHTML = ' ';
          window.whispers.messageList = window.whispers.foo;
          window.whispers.loadmessages(s);
        }
      }
    });
  };
  var s = obj.textContent;
  //window.whispers.loadmessages(s);
  //goal: get group message ref
  window.whispers.database.ref('/').limitToLast(100).on('child_added', parse);
}

Whispers.prototype.loadmessages = function(ref) {
  var setmessage = function(data) {
    var x = data.val();
    Object.keys(x).forEach(function(k) {
      console.log("display", data.key, x.name, x.text);
      window.whispers.displaymsg(data.key, x.name, x.text);
    });
  };
  if (ref) {
    console.log(ref);
    var r = this.database.ref(ref);
    r.limitToLast(12).on('child_added', setmessage);
  }
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

$('#new-chat').on("click", function() {
  var popup = new Foundation.Reveal($('#new-conversation'));
  popup.open();
});

$("#login-menu").on("click", function() {
  var elem = new Foundation.Reveal($('#login-modal'));
  elem.open();
});

$("#signup-modal-button").on("click", function() {
  var modal_signup = new Foundation.Reveal($('#signup-modal'));
  var modal_login = new Foundation.Reveal($('#login-modal'));

  modal_signup.open();
})

$("#new-chat").on("click", function() {
  var new_convo_mocal = new Foundation.Reveal($("#new-convo-modal"));
  new_convo_mocal.open();
})
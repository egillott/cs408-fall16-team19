//random todo's:
//logging out / changing users needs to clear the group list
//recieve messages in correct groups
//create group functionality
//whisper functionality
//...done?

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

PEOPLE_TEMPLATE =
  '<input type="text" placeholder="person">' +
  '<a class="small button" id="more-people-btn">Add more people</a><br>';

function Whispers() {
  this.name = '';
  this.password = '';

  this.groupList = document.getElementById('groups')
  this.messageList = document.getElementById('messages');
  this.foo = this.messageList;
  this.currentGroupRef = '';
  this.emptymsgList = this.messageList;
  this.initFirebase();
}

function checkNameExists(name) {
  //load all names from db
  //return true / false;

}

function newgroup() {

}

function login() {
  tempuser = document.getElementById('loginuser').value;
  temppass = document.getElementById('loginpass').value;
  window.whispers.userref.on("value", function(snapshot) {
    var x = snapshot.val();
    Object.keys(x).forEach(function(k) {
      console.log(x[k].name, x[k].password);
      if (x[k].name === tempuser) {
        if (x[k].password === temppass) {
           console.log("login succ");
           window.whispers.name = tempuser
           window.whispers.password = temppass
           window.whispers.loadgroups();
           return;
        }
        else {
        }
      }
    });
  })
  console.log(window.whispers.name, window.whispers.password);
}

function signup() {
  tempuser = document.getElementById('signuser').value;
  temppass = document.getElementById('signpass').value;
  confirmpass = document.getElementById('signconfirmpass').value;

  var nodupe = 0;
  // confirm password
  if (temppass === confirmpass) {
    // iterate through names, check for duplicates. if so set nodupe to 1
    window.whispers.userref.on("value", function(snapshot) {
      var x = snapshot.val();
      Object.keys(x).forEach(function(k) {
        if (tempuser === x[k].name) {
          var nodupe = 1;
        }
      });
    });

    // if no duplicate name create user
    if (nodupe = 0) {
      console.log(nodupe, tempuser);
      window.whispers.userref.push( {
        name: tempuser,
        password: temppass,
      })
    }
    else {
      console.log("duplicate");
    }
  }
}

Whispers.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.msgref = this.database.ref("messages");
  this.grpref = this.database.ref("groups");
  this.userref = this.database.ref("users");
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
  var r = this.database.ref(ref);
  this.currentGroupRef = r;
  r.limitToLast(12).on('child_added', setmessage);
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
    this.currentGroupRef.push({
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


$("#login-menu").on("click", function() {
  var modal_login = new Foundation.Reveal($('#login-modal'));
  modal_login.open();
});

$("#login-button").on("click", function() {
  modal_login.close();
})

$("#signup-modal-button").on("click", function() {
  var modal_signup = new Foundation.Reveal($('#signup-modal'));
  modal_signup.open();
});

$("#new-chat").on("click", function() {
  var new_convo_mocal = new Foundation.Reveal($("#new-convo-modal"));
  new_convo_mocal.open();
});

$("#more-people-btn").on("click", function() {
  console.log("ya.");
})

$("#open-about").on("click", function() {
  var about_modal = new Foundation.Reveal($("#about-modal"));
  about_modal.open();
});
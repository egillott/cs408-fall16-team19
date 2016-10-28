//random todo's:
//logging out / changing users needs to clear the group list
//clear out message listeners when changing groups
//create group functionality
//whisper functionality
//add alert on (un)successful login / signup (replace log in button with signout / name)
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
  this.a = 0;
}

Whispers.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.msgref = this.database.ref("messages");
  this.grpref = this.database.ref("groups");
  this.userref = this.database.ref("users");
};

function login() {
  tempuser = document.getElementById('loginuser').value;
  temppass = document.getElementById('loginpass').value;
  window.whispers.userref.on("value", function(snapshot) {
    var x = snapshot.val();
    Object.keys(x).forEach(function(k) {
      if (x[k].name === tempuser) {
        if (x[k].password === temppass) {
           window.whispers.name = tempuser
           window.whispers.password = temppass


           window.whispers.loadgroups();
           return;
        }
        else {
          alert("Incorrect password");

        }
      }
    });
  })
}

var iscorrectsign = 0;

function signup() {
  console.log("try singup");
  tempuser = document.getElementById('signuser').value;
  temppass = document.getElementById('signpass').value;
  confirmpass = document.getElementById('signconfirmpass').value;

  var nodupe = 0;
  // confirm password
  if (temppass === confirmpass) {
    iscorrectsign = 1;
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
    if (nodupe === 0) {
      console.log(nodupe, tempuser);
      window.whispers.userref.push( {
        name: tempuser,
        password: temppass,
      })
      window.whispers.name = tempuser
      window.whispers.password = temppass
       
      window.whispers.loadgroups();
    }
    else {
      console.log("duplicate");
    }
  }
  else{

     alert("TWO PASSWORDS DO NOT MATCH!");
     iscorrectsign = 0;
  }
}

function creategroup() {
  var tempname = document.getElementById('groupname').value;
  var tempuser = document.getElementById('groupusers').value;
  var me = window.whispers.name;

  window.whispers.grpref.push({
    groupname: tempname,
    members: {
      "default": {
        name: "default"
      }
    },
    messages: {
      "-Aa" : {
        name: "System",
        text: me + " has created the group",
      }
    },
    whisper: "false",
  })

  //add members
  console.log("add members");
  addMembers(me, tempname);
  addMembers(tempuser, tempname);

  window.whispers.loadgroups();
}

function addMembers(name, group) {
  window.whispers.grpref.on("value", function(snapshot) {
    var x = snapshot.val();
    Object.keys(x).forEach(function(k) {
      if (group === x[k].groupname) {
        console.log("add " + x[k].groupname, name, group);
        addMembersTwo(name, k)
        return;
      }
    });
    return;
  });
  return;

}

function addMembersTwo(name, key) {
  var r = "groups/" + key + "/members";
  console.log(r);
  var ref = window.whispers.database.ref(r);
  ref.push({
    name: name,
  })
}

function changeGroup(obj) {
  var parse = function(data) {
    var x = data.val();
    Object.keys(x).forEach(function(k) {
      // check if x is a group (has members field)
      if (x[k].members) {
        // if group name is what we're requesting, clear and display the messages
        if (x[k].groupname === obj.textContent) {
          // create ref to that groups messages
          var s = "groups/" + k + "/messages";
          window.whispers.messageList.innerHTML = ' ';
          window.whispers.loadmessages(s);
        }
      }
    });
  };
  var s = obj.textContent;
  window.whispers.database.ref('/').limitToLast(100).on('child_added', parse);
}

Whispers.prototype.loadgroups = function(e) {
  var parsegroup = function(data) {
    var x = data.val();
    Object.keys(x.members).forEach(function(k) {
      //if user is in group add it to list
      var n = x.members[k].name;
      if (n === window.whispers.name) {
        // this is executed twice?
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

Whispers.prototype.sendmsg = function(name, text) {
    // Add a new message entry to the Firebase Database.
    window.whispers.currentGroupRef.push({
      name: name, 
      text: text,
    });
};

Whispers.prototype.loadmessages = function(ref) {
  var setmessage = function(data) {
    var x = data.val();
    Object.keys(x).forEach(function(k) {
      // this is executed twice for some reason
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



document.getElementById('message-box').onkeydown = function(event) {
    if (event.keyCode == 13) {
      var box = document.getElementById('message-box');
      window.whispers.sendmsg(window.whispers.name, box.value);
      box.value = "";
    }
}

window.onload = function() {
   var modal_login = new Foundation.Reveal($('#login-modal'));
  modal_login.open();
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

$("#signup-button").on("click", function() {
  //window.location.reload(true);
  if(iscorrectsign==1)
  {
    //console.log("Heuy");
     var modal_signup = new Foundation.Reveal($('#signup-modal'));
  modal_signup.close();
  }


})

$("#more-people-btn").on("click", function() {
  console.log("ya.");
})

$("#open-about").on("click", function() {
  var about_modal = new Foundation.Reveal($("#about-modal"));
  about_modal.open();
});

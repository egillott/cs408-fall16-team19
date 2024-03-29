//random todo's:
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
    //'<div class="whisper-tf"></div>' +
    '</li></a>';

PEOPLE_TEMPLATE =
  '<input type="text" placeholder="person">' +
  '<a class="small button" id="more-people-btn">Add more people</a><br>';

function Whispers() {
  this.name = '';
  this.password = '';

  this.modal_login = new Foundation.Reveal($('#login-modal'));
  this.modal_login.open();
  this.new_convo_mocal;

  this.groupList = document.getElementById('groups')
  this.messageList = document.getElementById('messages');
  this.foo = this.messageList;
  this.currentGroup;
  this.currentGroupRef = '';
  this.currentGroupKey;
  this.currentMode;
  this.emptymsgList = this.messageList;
  this.initFirebase();
  this.a = 0;
  this.loggedin = false;
  this.nodupe;
  $('#logout-menu').hide();
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
           document.getElementById('user').innerHTML = tempuser;
           window.whispers.password = temppass
           $('#login-menu').hide();
           $('#logout-menu').show(); 
           //close
           window.whispers.modal_login.close();
           window.whispers.loadgroups();
           return;
        }
        else {
          //alert("Incorrect password");
          document.getElementById('wp').style.display = "inherit";
        }
      }
    });
  })
}

function catcherror() {
  console.log("dupe");
  document.getElementById('existerr').style.display = "inherit";

}

function setUser(tempuser, temppass) {
  console.log(window.whispers.nodupe, tempuser);
  window.whispers.userref.child(tempuser).set({
   name: tempuser,
   password: temppass,
  }, function(err) {
    console.log("ERROR CAUGHT");
    window.whispers.nodupe = 0;
    //throw new UserException("dupe");
  })
}

function signup() {
  document.getElementById('existerr').style.display = "none";
  document.getElementById('nmp').style.display = "none";
  tempuser = document.getElementById('signuser').value;
  temppass = document.getElementById('signpass').value;
  confirmpass = document.getElementById('signconfirmpass').value;

  // confirm password
  if (temppass === confirmpass) {
    // if no duplicate name create user
    setUser(tempuser, temppass)
    //THE CONTROL FLOW HERE MAKES NO SENSE
    //THIS IF STATEMNET IS REACHED BEFORE ANY OF THE ERROR CHECKING ABOVE
    if (window.whispers.nodupe)      {

    }
    else {
      console.log("reload", window.whispers.nodupe);
      location.reload(true);
    }

  }
  else{
    document.getElementById('nmp').style.display = "inherit";
  }
}

function UserException(msg) {
  console.log(msg);
}


function creategroup() {
  var tempname = document.getElementById('groupname').value;
  var tempuser = document.getElementById('groupusers').value;
  var mode = document.getElementById('whisper-y').checked;
  var me = window.whispers.name;
  console.log(mode);

  if (mode == true) {
    var test = window.whispers.grpref.push({
      groupname: tempname,
      members: {

      },
      whisper: mode,
    })

    key = test.getKey();
    //add members
    console.log("add members");
    addMembers(me, key);
    addMembers(tempuser, key);

    window.whispers.loadgroups();
  }
  else {
    var test = window.whispers.grpref.push({
      groupname: tempname,
      members: {

      },
      messages: {
        "-Aa" : {
          name: "System",
          text: me + " has created the group",
        }
      },
      whisper: mode,
    })

    key = test.getKey();
    //add members
    console.log("add members");
    addMembers(me, key);
    addMembers(tempuser, key);

    window.whispers.loadgroups();
  }
  window.whispers.new_convo_mocal.close();
}

function addmemberbtn() {
  var x = document.getElementById("newmem").value;
  addMembers(x, window.whispers.currentGroupKey, window.whispers.currentMode);
}

function addMembers(name, key, mode) {
  var r = "groups/" + key + "/members";
  console.log(name, r);
  var ref = window.whispers.database.ref(r);
  if (mode = true) {
    ref.push({
      name: name,
      message: "Welcome to the chat!"
    })
  }
  else {
    ref.push({
      name: name,
    })
  }
  window.whispers.displaymembers("groups/" + key);
}

Whispers.prototype.displaymembers = function(ref) {
  document.getElementById('mem-list').innerHTML = '';
  var parsem = function(data) {
    var x = data.val();
    Object.keys(x).forEach(function(k) {
      if (k == "name") {
        console.log("member= ", x[k]);
        document.getElementById('mem-list').innerHTML += x[k] + " ";
      }
      else console.log(k);
    });
  };
  document.getElementById('mem-list').innerHTML +="Whisper is " + this.currentMode + " | ";
  console.log(ref);
  var r = this.database.ref(ref + "/members");
  r.limitToLast(100).on('child_added', parsem);
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
          var s = "groups/" + k;
          window.whispers.currentGroup = obj.textContent;
          window.whispers.currentMode = x[k].whisper;
          console.log("change mode to"+ x[k].whisper);
          window.whispers.messageList.innerHTML = ' ';
          window.whispers.currentGroupKey = k;

          window.whispers.loadmessages(s, obj.textContent);
          window.whispers.displaymembers(s );
        }
      }
    });
  };
  var s = obj.textContent;
  s = s.slice(0, s.indexOf("Whisper mode"))
  console.log("Display group", s);

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
        window.whispers.displaygroup(data.key, x.groupname, x.whisper);
      }
    });
  };
  this.grpref.limitToLast(50).on('child_added', parsegroup);
}

Whispers.prototype.displaygroup = function(key, name, whisper) {

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
    //div.querySelector('.whisper-tf').textContent = "Whisper mode: " + whisper;
    setTimeout(function() {div.classList.add('visible')}, 1);
    window.whispers.groupList.scrollTop = window.whispers.groupList.scrollHeight;
};

Whispers.prototype.sendmsg = function(name, text) {
    // Add a new message entry to the Firebase Database.
    if (window.whispers.currentMode == true) {
      var r = window.whispers.database.ref("groups/" + window.whispers.currentGroupKey + "/members");
      r.child(name).set( {
        name: name,
        message: text
      })
      window.whispers.loadmessages("groups/" + window.whispers.currentGroupKey, window.whispers.currentGroup);
    }
    else {
      window.whispers.currentGroupRef.push({
        name: name, 
        text: text,
      });
    }

};

Whispers.prototype.loadmessages = function(ref, name) {

  var setmessage = function(data) {
    var x = data.val();
    Object.keys(x).forEach(function(k) {
      // this is executed twice for some reason
      // ONLY IF IN CURRENT GROUP DO YOU DISPLAY IT
      if (name == window.whispers.currentGroup) {
        if (window.whispers.currentMode == false) {
          window.whispers.displaymsg(data.key, x.name, x.text);
        }
        else {
          console.log("display", x.name, x.message);
          window.whispers.displaymsg(x.name, x.name, x.message);
        }
      }
    });
  };
  $("#chat-name").empty();
  $("#chat-name").append(name);
  var r = this.database.ref(ref + "/messages");
  this.currentGroupRef = r;
  if (this.currentMode == true) {
    r = this.database.ref(ref + "/members");
  }
  r.limitToLast(1000).on('child_added', setmessage);
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

function submitText() {
    var box = document.getElementById('message-box');
    window.whispers.sendmsg(window.whispers.name, box.value);
    box.value = "";
}


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

})

$("#signup-modal-button").on("click", function() {
  var modal_signup = new Foundation.Reveal($('#signup-modal'));
  modal_signup.open();
});

$("#new-chat").on("click", function() {
  window.whispers.new_convo_mocal = new Foundation.Reveal($("#new-convo-modal"));
  if (window.whispers.name) window.whispers.new_convo_mocal.open();
  else {
    alert("please log in");
  }
});

$("#new-chat-mem").on("click", function() {
  var new_mem_modal = new Foundation.Reveal($("#new-mem-modal"));
  if (window.whispers.name) new_mem_modal.open();
  else {
    alert("please log in");
  }
})

$("#signup-button").on("click", function() {

})

$("#open-about").on("click", function() {
  var about_modal = new Foundation.Reveal($("#about-modal"));
  about_modal.open();
});

$("#logout-menu").on("click", function() {
  var sign_out_modal = new Foundation.Reveal($("#sign-out-modal"));
  sign_out_modal.open();
});

$("#signoutbutton").on("click", function() { 
  $('#login-menu').hide();
  $('#logout-menu').show();
  window.location.reload(true);
})

$("#fakesignoutbutton").on("click", function() {
  var sign_out_modal = new Foundation.Reveal($("#sign-out-modal"));
  sign_out_modal.close();
})

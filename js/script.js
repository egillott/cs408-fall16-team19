function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

function login() {
  // Log the user in via Twitter
  var provider = new firebase.auth.TwitterAuthProvider();
  firebase.auth().signInWithPopup(provider).catch(function(error) {
    console.log("Error authenticating user:", error);
  });
  // Log the user in via Google
  
}

firebase.auth().onAuthStateChanged(function(user) {
  // Once authenticated, instantiate Firechat with the logged in user
  if (user) {
    initChat(user);
  }
});

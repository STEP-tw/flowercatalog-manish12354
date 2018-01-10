const logOut = function(){
  var onRequest = new XMLHttpRequest();
  onRequest.open("GET", "/logout");
  onRequest.send();
  location.reload();
};

const callback = function(){
  // alert(this.responseText);
  alert(JSON.stringify(document));
}

const logOut = function(){
  var onRequest = new XMLHttpRequest();
  onRequest.open("GET", "/logout");
  onRequest.addEventListener('load',callback);
  onRequest.send();
};

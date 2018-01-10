const makeInvisible = function(){
  let gifId = document.getElementById('gif');
  gifId.style.visibility ="hidden";
  setTimeout(makeVisible,1000);
}

const makeVisible= function(){
  let gifId = document.getElementById('gif');
  gifId.style.visibility ="visible";
}

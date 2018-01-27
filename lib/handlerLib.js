const fs = require("fs");

let registeredUsers = [{
    userName: 'manish',
    name: 'manish yadav'
  },
  {
    userName: 'manoj',
    name: 'manoj kumar yadav'
  }
];

const setSessionIdAndUser = (req, res) => {
  let sessionid = req.Cookies.sessionid;
  let user = registeredUsers.find(u => u.sessionid == sessionid);
  if (sessionid && user) {
    req.user = user;
  }
};

const contentType = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".jpg": "img/jpg",
  ".pdf": "text/pdf",
  ".gif": "img/gif",
  ".jpeg": "img/jpeg",
  ".ico": "img/ico"
};

const getExtension = (fileName) => {
  let indexOfExtension = fileName.lastIndexOf(".");
  return fileName.slice(indexOfExtension);
};

const setContentType = function(fileName) {
  let fileExtension = getExtension(fileName);
  let header = contentType[fileExtension];
  if (header) {
    this.setHeader("content-type", header);
  }
};

const setCookie = function(name, cookieValue) {
  this.setHeader('Set-Cookie', `${name}=${cookieValue}`);
}

const logRequest = (req, res) => {
  console.log(`${req.method} ${req.url}`);
};

const getHome = (req, res) => {
  let url = "/index.html";
  res.redirect(url);
};

const tagify = function(tag, attributes, text) {
  let attributeStrings = Object.keys(attributes).map((attribute) => {
    return `${attribute}="${attributes[attribute]}"`
  });
  return `<${tag} ${attributeStrings.join(" ")}>${text}</${tag}>`
};

const getForm = () => {
  let userNameInput = tagify("input", {
    name: "userName"
  }, "");
  let placeInput = tagify("input", {
    name: "place"
  }, "");
  let submitInput = tagify("input", {
    type: "submit"
  }, "");
  let allInputs = userNameInput + placeInput + submitInput;
  return tagify("form", {
    method: "POST"
  }, allInputs);
};


const handleGetLogin = (req, res) => {
  if (!req.user) {
    res.setHeader('Content-type', 'text/html');
    res.write(getForm());
    res.end();
    return;
  }
  res.redirect('/guestBook.html');
};

const insertResUtils = function(req, res) {
  res.setContentType = setContentType;
  res.setCookie = setCookie;
};

const handlePostLogin = function(req, res) {
  let user = registeredUsers.find(u => u.userName == req.body.userName);
  if (!user) {
    res.redirect('/login');
    return;
  }
  let sessionid = new Date().getTime();
  res.setCookie("sessionid", sessionid);
  user.sessionid = sessionid;
  res.redirect('/guestBook.html');
};

const logSessionIdAndUser = function(req, res) {
  console.log(JSON.stringify(req.body, null, 2));
  console.log(`sessionid is ${req.Cookies.sessionid}`);
};

const handlePostLogOut = function(req,res){
  res.setHeader('Set-Cookie', '');
  delete req.user.sessionid;
  getHome(req,res);
};

const handleGetHome = function(req, res) {
  res.setContentType('something.html');
  let content = fs.readFileSync("./public/index.html");
  res.write(content);
  res.end();
};

const generateCommentString = function(comment) {
  let timeAndDate = new Date();
  let commentInfo = {
    "Date": timeAndDate.toLocaleDateString(),
    "Time": timeAndDate.toLocaleTimeString(),
    "Name": comment.Name,
    "Comment": comment.Comment
  };
  return commentInfo;
};


const makeBackupOfNewComments = function(req) {
  let newComment = req.body;
  newComment.Name = req.user.userName;
  fs.readFile("./data/comments.json", "utf8", function(err, PrevComments) {
    addComment(PrevComments, newComment);
  });
};

const addComment = function(PrevComments, newComment) {
  let commentsData = JSON.parse(PrevComments);
  commentsData.unshift(generateCommentString(newComment));
  let contents = JSON.stringify(commentsData, null, 2);
  fs.writeFileSync("./data/comments.json", contents);
  console.log('comments saved');
};


const handleComments = function(req, res) {
  if (!req.user) {
    res.redirect('/login');
    return;
  }
  makeBackupOfNewComments(req);
  res.redirect('./guestBook.html');
};

const serveGuestBook = function(req, res) {
  if (!req.user) {
    res.redirect('/login');
    return;
  }
  let path = "./public/guestBook.html";
  let guestBookContent = fs.readFileSync(path, "utf8");
  let allComments = fs.readFileSync("./data/comments.json", "utf8");
  let contentToSend = addGuestBookAndComment(guestBookContent, allComments);
  res.setContentType(path);
  res.write(contentToSend);
  res.end();

};

const addGuestBookAndComment = function(guestBookContent, allComments) {
  commentToShow = [];
  JSON.parse(allComments).forEach(parseFn);
  allComments = commentToShow.join("<br/><br/>------------------------------------------------<br/>");
  let contentToSend = guestBookContent.replace("commentInfos", allComments);
  return contentToSend;
};

const parseFn = function(comment) {
  let commentDetails = [
    "<b>Date :</b> " + comment["Date"],
    "<b>Time :</b> " + comment["Time"] + "<br/>",
    "<b>name :</b> " + comment["Name"],
    "<b>comment :</b> " + comment["Comment"]
  ].join("<br/>");
  commentToShow.push(commentDetails);
};

const serveSpecificFile = function(req, res) {
  let url = req.url;
  res.setContentType(req.url);
  try {
    let content = fs.readFileSync("./public" + req.url);
    res.write(content);
    res.end();
  } catch (e) {
    missingResourceHandler(req, res);
  }
};

const missingResourceHandler = (req, res) => {
  res.statusCode = 404;
  res.write('File not found!');
  res.end();
  return;
};

exports.insertResUtils = insertResUtils;
exports.logRequest = logRequest;
exports.setSessionIdAndUser = setSessionIdAndUser;
exports.getHome = getHome;
exports.handleGetLogin = handleGetLogin;
exports.handleGetHome = handleGetHome;
exports.handlePostLogOut = handlePostLogOut;
exports.serveGuestBook = serveGuestBook;
exports.handlePostLogin = handlePostLogin;
exports.handleComments = handleComments;
exports.serveSpecificFile = serveSpecificFile;
exports.missingResourceHandler = missingResourceHandler;

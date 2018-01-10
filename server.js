const http = require('http');
const WebApp = require('./lib/webapp');
const PORT = 8000;
let app = new WebApp();
const lib = require("./lib/handlerLib.js");

app.use(lib.insertResUtils);
app.use(lib.logRequest);
app.use(lib.setSessionIdAndUser);

app.get('/', lib.getHome);
app.get('/login', lib.handleGetLogin);
app.get('/index.html', lib.handleGetHome);
app.get('/logout', lib.handleGetLogOut);
app.get('/guestBook.html', lib.serveGuestBook);
app.post('/login', lib.handlePostLogin);
app.post('/addComment', lib.handleComments);

app.postProcess(lib.serveSpecificFile);
app.postProcess(lib.missingResourceHandler);

const requestHandler = function(req, res) {
  app.main(req, res);
};

let server = http.createServer(requestHandler);
server.listen(PORT);

console.log(`server is listening to ${PORT}`);

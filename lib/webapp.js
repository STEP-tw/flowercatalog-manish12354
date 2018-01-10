const fs = require("fs");
const {
  parse
} = require('querystring');

const splitKeyVal = (keyValues, pair) => {
  let parts = pair.split('=');
  keyValues[parts[0]] = parts[1];
  return keyValues;
};

const parseBody = (commentsInfo) => {
  let parsedBody = parse(commentsInfo);
  return parsedBody;
};

const redirect = function(path) {
  console.log("redirecting....");
  this.statusCode = 302;
  this.setHeader('location', path);
  this.end();
};

const parseCookies = text => text.split(';').reduce(splitKeyVal, {});

let invoke = function(req, res) {
  let handler = this._handlers[req.method][req.url];
  if (handler)
    handler(req, res);
}

const WebApp = function() {
  this._handlers = {
    GET: {},
    POST: {}
  };
  this.preprocessors = [];
  this.postProcessors = [];
};

WebApp.prototype = {
  get: function(url, handler) {
    this._handlers.GET[url] = handler;
  },
  post: function(url, handler) {
    this._handlers.POST[url] = handler;
  },
  use: function(handler) {
    this.preprocessors.push(handler);
  },
  postProcess: function(handler) {
    this.postProcessors.push(handler);
  },
  main: function(req, res) {
    res.redirect = redirect;
    req.Cookies = parseCookies(req.headers.cookie || '');
    let content = "";
    req.on('data', data => content += data.toString())
    req.on('end', () => {
      req.body = parseBody(content);
      this.preprocessors.forEach(middleware => {
        if (res.finished) return;
        middleware(req, res);
      });
      if (res.finished) return;
      invoke.call(this, req, res);
      this.postProcessors.forEach(middleware => {
        if (!res.finished)
          middleware(req, res);
      });
    });
  }
};
module.exports = WebApp;

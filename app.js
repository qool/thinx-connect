var Rollbar = require('rollbar');

var rollbar = new Rollbar({
  accessToken: 'e9375504ce274dce84bfc905ce6e6893',
  handleUncaughtExceptions: true,
  handleUnhandledRejections: true
});

var ThinxProxy = function() {

  var https = require('https');
  var http = require('http');
  var util = require('util');
  var path = require('path');
  var fs = require('fs');
  var colors = require('colors');
  var httpProxy = require('http-proxy');

  var rootCas = require('ssl-root-cas/latest').create();
  require('https').globalAgent.options.ca = rootCas;
  require('ssl-root-cas').inject();

  console.log("Starting MQTT listener on port 1883...");

  /* MQTT HTTPS <*/
  httpProxy.createProxyServer({
    target: 'https://thinx.cloud:1883',
    agent: http.globalAgent,
    headers: {
      host: 'thinx.cloud'
    }
  }).listen(1883);

  console.log("Starting MQTTS listener on port 8883...");

  /* MQTTHTTP */
  httpProxy.createProxyServer({
    target: 'http://thinx.cloud:8883',
    agent: https.globalAgent,
    headers: {
      host: 'thinx.cloud'
    }
  }).listen(8883);

  var use_https = false; // disable for testing

  if (use_https) {

    console.log("Starting HTTP->HTTPS listener on port 7442->7443...");

    /* HTTP to HTTPS proxy */
    httpProxy.createProxyServer({
      target: 'https://thinx.cloud:7443',
      agent: https.globalAgent,
      headers: {
        host: 'thinx.cloud'
      }
    }).listen(7442);

  } else {

    console.log("Starting HTTP listener on port 7442...");

    /* HTTP to HTTP for testing */
    httpProxy.createProxyServer({
      target: 'http://thinx.cloud:7442',
      agent: http.globalAgent,
      headers: {
        host: 'thinx.cloud'
      }
    }).listen(7442);
  }

  console.log("Starting HTTPS listener o port 7443...");

  /* HTTPS to HTTPS fall-trough */
  httpProxy.createProxyServer({
    target: 'https://thinx.cloud:7443',
    agent: https.globalAgent,
    headers: {
      host: 'thinx.cloud'
    }
  }).listen(7443);

  var package_info = require("./package.json");
  var name = package_info.name;

  var exec = require("sync-exec");
  CMD = "git rev-list HEAD --count";
  var temp = exec(CMD).stdout.replace("\n", "");
  var version = "" + parseInt(temp);

  console.log("");
  console.log("-=[".red + " ☢ " + name.white + " v".red.bold + version.red.bold +
    " rev. ".red + version.red +
    " ☢ " + " ]=-".red);
  console.log("");

  // Prevent crashes on uncaught exceptions

  process.on("uncaughtException", function(err) {
    console.log("Caught exception: " + err);
  });


};

var proxy = new ThinxProxy();

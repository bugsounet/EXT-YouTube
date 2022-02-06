'use strict';

/** YouTube Token Creator **/

const EventEmitter = require('events');
const util = require('util');
const open = require('open');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const {OAuth2Client} = require('google-auth-library');

let CREDENTIALS= null;

console.log("[YT] Check credentials.json...")
if (fs.existsSync(path.resolve(__dirname + "/../credentials.json"))) {
  CREDENTIALS = path.resolve(__dirname + "/../credentials.json")
} else {
  if(fs.existsSync(path.resolve(__dirname + "/../../MMM-GoogleAssistant/credentials.json"))) {
    CREDENTIALS = path.resolve(__dirname + "/../../MMM-GoogleAssistant/credentials.json")
  }
}

if (!CREDENTIALS) return console.log("[YT] credentials.json file not found !")
else console.log("[YT] credentials.json found in", CREDENTIALS)

const config = {
    keyFilePath: CREDENTIALS,
    savedTokensPath: path.resolve(__dirname, '../tokenYT.json'), // where you want the tokens to be saved
};

function Auth(config) {
  if (config === undefined) config = {};

  // make sure we have a key file to read from
  if (config.keyFilePath === undefined) {
    throw new Error('[YT] Missing "keyFilePath" from config (should be where your JSON file is)');
  }

  if (config.savedTokensPath === undefined) {
    throw new Error('[YT] Missing "savedTokensPath" from config (this is where your OAuth2 access tokens will be saved)');
    return;
  }

  const keyData = require(config.keyFilePath);
  const key = keyData.installed || keyData.web;
  const oauthClient = new OAuth2Client(key.client_id, key.client_secret, key.redirect_uris[0]);
  let tokens;

  const saveTokens = () => {
    oauthClient.setCredentials(tokens);

    // save them for later
    mkdirp(path.dirname(config.savedTokensPath), () => {
      fs.writeFile(config.savedTokensPath, JSON.stringify(tokens), () => {
        console.log("[YT] tokenYT.json saved !")
        process.exit(0)
      });
    });
  };

  const getTokens = () => {
    const url = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube'],
    });

    // open the URL
    console.log('[YT] Opening OAuth URL. Return here with your code.');
    open(url).catch(() => {
      console.log('[YT] Failed to automatically open the URL. Copy/paste this in your browser:\n', url);
    });

    // if tokenInput is configured
    // run the tokenInput function to accept the token code
    if (typeof config.tokenInput === 'function') {
      config.tokenInput(processTokens);
      return;
    }

    // create the interface to accept the code
    const reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    reader.question('[YT] Paste your code: ', processTokens);
  };

  const processTokens = (oauthCode) => {
    if (!oauthCode) process.exit(-1);

    // get our tokens to save
    oauthClient.getToken(oauthCode, (error, tkns) => {
      // if we didn't have an error, save the tokens
      if (error) throw new Error('[YT] Error getting tokens:', error);

      tokens = tkns;
      saveTokens();
    });
  };

  // if the tokens are already saved, we can skip having to get the code for now
  process.nextTick(() => {
    if (config.savedTokensPath) {
      try {
        const tokensFile = fs.readFileSync(config.savedTokensPath);
        tokens = JSON.parse(tokensFile);
      } catch(error) {
        // we need to get the tokens
        getTokens();
      } finally {
        if (tokens !== undefined) saveTokens();
      }
    }
  });
};

Auth(config)

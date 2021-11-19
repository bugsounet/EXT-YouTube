/** MMM-Porcupine helper **/

"use strict"
var NodeHelper = require("node_helper")

let log = (...args) => { console.log("[YT]", ...args) }

module.exports = NodeHelper.create({
  start: function () {
    console.log("[YT] " + require('./package.json').name + " Version:", require('./package.json').version , "rev:", require('./package.json').rev)
    this.config = {}
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        this.initialize()
        break
    }
  },

  initialize: async function() {
    var debug = (this.config.debug) ? this.config.debug : false
    if (!this.config.debug) log = () => { /* do nothing */ }
    log("Config:", this.config)
  }

})

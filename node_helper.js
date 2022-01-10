/** MMM-YouTube helper **/

"use strict"
var NodeHelper = require("node_helper")
const fs = require("fs")
const path = require("path")
let log = () => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    console.log("[YT] " + require('./package.json').name + " Version:", require('./package.json').version , "rev:", require('./package.json').rev)
    this.config = {}
    this.Lib = []
    this.searchInit = false
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        this.initialize()
        break
      case "YT_SEARCH":
        this.YoutubeSearch(payload)
        break
    }
  },

  initialize: async function() {
    var debug = (this.config.debug) ? this.config.debug : false
    if (this.config.debug) log = (...args) => { console.log("[YT]", ...args) }
    log("Starting YouTube module...")
    log("Config:", this.config)
    if (this.config.useSearch) {
      log("Check credentials.json...")
      if (fs.existsSync(__dirname + "/credentials.json")) {
        this.config.CREDENTIALS = __dirname + "/credentials.json"
      } else {
        if(fs.existsSync(path.resolve(__dirname + "/../MMM-GoogleAssistant/credentials.json"))) {
         this.config.CREDENTIALS = path.resolve(__dirname + "/../MMM-GoogleAssistant/credentials.json")
        }
      }
      if (!this.config.CREDENTIALS) return console.log("[PHOTOS] credentials.json file not found !")
      else log("credentials.json found in", this.config.CREDENTIALS)

      let bugsounet = await this.loadBugsounetLibrary()
      if (bugsounet) {
        console.error("[YT] Warning:", bugsounet, "library not loaded !")
        console.error("[YT] Try to solve it with `npm install` in EXT-YouTube directory")
        return
      }
      else {
        console.log("[YT] All needed library loaded !")
      }
      try {
        const CREDENTIALS = this.Lib.readJson(this.config.CREDENTIALS)
        const TOKEN = this.Lib.readJson(__dirname + "/tokenYT.json")
        let oauth = this.Lib.YouTubeAPI.authenticate({
          type: "oauth",
          client_id: CREDENTIALS.installed.client_id,
          client_secret: CREDENTIALS.installed.client_secret,
          redirect_url: CREDENTIALS.installed.redirect_uris,
          access_token: TOKEN.access_token,
          refresh_token: TOKEN.refresh_token,
        })
        console.log("[YT] YouTube Search Function initilized.")
        this.searchInit = true
        this.sendSocketNotification("YT_SEARCH_INITIALIZED")
      } catch (e) {
        console.error("[FATAL] YouTube: tokenYT.json file not found !")
        console.error("[YT] " + e)
        return
      }
    }
    console.log("[YT] EXT-YouTube is Ready.")
  },

  /** Load require @busgounet library **/
  /** It will not crash MM (black screen) **/
  loadBugsounetLibrary: function() {
    let libraries= [
      // { "library to load" : [ "store library name", "path to check" ] }
      { "youtube-api": [ "YouTubeAPI", "useSearch"] },
      { "he": [ "he", "useSearch" ] },
      { "r-json": [ "readJson","useSearch" ] }
    ]

    let errors = 0
    return new Promise(resolve => {
      libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name,
              libraryName = configValues[0],
              libraryPath = configValues[1],
              index = (obj,i) => { return obj[i] }

          // libraryActivate: verify if the needed path of config is activated (result of reading config value: true/false) **/
          let libraryActivate = libraryPath.split(".").reduce(index,this.config) 
          if (libraryActivate) {
            try {
              if (!this.Lib[libraryName]) {
                this.Lib[libraryName] = require(libraryToLoad)
                log("Loaded " + libraryToLoad)
              }
            } catch (e) {
              console.error("[GA]", libraryToLoad, "Loading error!" , e)
              errors++
            }
          }
        }
      })
      resolve(errors)
    })
  },

  /** YouTube Search **/
  YoutubeSearch: async function (query) {
    log("Search for:", query)
    try {
      var results = await this.Lib.YouTubeAPI.search.list({q: query, part: 'snippet', maxResults: 1, type: "video"})
      var item = results.data.items[0]
      var title = this.Lib.he.decode(item.snippet.title)
      console.log('[YT] Found YouTube Title: %s - videoId: %s', title, item.id.videoId)
      if (this.config.debug) this.sendSocketNotification("Informations", { message: "[Debug] Found YouTube Title: " + title, timer: 2000 })
      this.sendSocketNotification("YT_RESULT", item.id.videoId)
    } catch (e) {
      console.error("[YT] YouTube Search error: ", e.toString())
    }
  },
})

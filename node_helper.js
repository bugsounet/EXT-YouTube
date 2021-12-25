/** MMM-YouTube helper **/

"use strict"
var NodeHelper = require("node_helper")
const fs = require("fs")
let log = (...args) => { console.log("[YT]", ...args) }

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
    if (!this.config.debug) log = () => { /* do nothing */ }
    log("Config:", this.config)
    if (this.config.useSearch) {
      if (!fs.existsSync(__dirname + "/credentials.json")) {
        console.error("[YT] credentials.json file not found !")
        this.sendSocketNotification("Informations", { message: "Warning: credentials.json file not found !", timer: 8000})
        this.sendSocketNotification("Informations", { message: "Warning: Search function is disabled!"})
        return
      }
      let bugsounet = await this.loadBugsounetLibrary()
      if (bugsounet) {
        console.error("[YT] Warning:", bugsounet, "library not loaded !")
        console.error("[YT] Try to solve it with `npm install` in EXT-YouTube directory")
        this.sendSocketNotification("Informations", { message: "Warning: " + bugsounet + " librar" + (bugsounet == 1 ? "y" : "ies") + " not loaded !", timer: 5000})
        this.sendSocketNotification("Informations", { message: "Try to solve it with `npm install` in EXT-YouTube directory", timer: 5000})
        this.sendSocketNotification("Informations", { message: "Warning: Search function is disabled!"})
        return
      }
      else {
        console.log("[YT] All needed library loaded !")
      }
      try {
        const CREDENTIALS = this.Lib.readJson(__dirname + "/credentials.json")
        const TOKEN = this.Lib.readJson(__dirname + "/YT.json")
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
        console.error("[FATAL] YouTube: YT.json file not found !")
        console.error("[YT] " + e)
        this.sendSocketNotification("Informations", { message: "Warning: YT.json file not found !", timer: 8000})
        this.sendSocketNotification("Informations", { message: "Warning: Search function is disabled!"})
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
              this.sendSocketNotification("Informations", { message: "Warning: Library loading error: " + libraryToLoad})
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
      console.log("[YT] YouTube Search error: ", e.toString())
      this.sendSocketNotification("Informations", { message: "YouTube Search Error: " + e.toString(), timer: 5000 })
    }
  },
})

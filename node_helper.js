/** MMM-YouTube helper **/

"use strict"
var NodeHelper = require("node_helper")
let log = () => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    this.config = {}
    this.lib = { error: 0 }
    this.session = null
    this.body = null
    this.request = {
      url: "https://youtube.bugsounet.fr/volumeControl",
      method: "POST",
      data: null
    }
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
      case "Session":
        this.session = payload
        if (payload == null) log("Reset Session")
        else log("Received session:", payload)
        break
      case "Volume-Min":
        if (!this.session) return
        this.body = new URLSearchParams({session: this.session, username: this.config.username, volume: 10})
        this.request.data = this.body.toString()
        this.lib.axios(this.request)
          .then(response => {
            if (response.data.error) console.error("|YT] Volume Min: " + response.data.error)
            else log("Volume Min:", response.data.volume)
          })
          .catch(err => {
            console.error("[YT] " + err)
          })
        break
      case "Volume-Max":
        if (!this.session) return
        this.body = new URLSearchParams({session: this.session, username: this.config.username, volume: 100})
        this.request.data = this.body.toString()
        this.lib.axios(this.request)
          .then(response => {
            if (response.data.error) console.error("|YT] Volume Max: " + response.data.error)
            else log("Volume Max:", response.data.volume)
          })
          .catch(err => {
            console.error("[YT] " + err)
          })
        break
    }
  },

  initialize: async function() {
    console.log("[YT] " + require('./package.json').name + " Version:", require('./package.json').version , "rev:", require('./package.json').rev)
    if (this.config.debug) log = (...args) => { console.log("[YT]", ...args) }
    if (this.config.token) console.warn("[YT] WARN: token is deprecated, please use password")
    let bugsounet = await this.loadBugsounetLibrary()
    if (bugsounet) {
      console.error("[YT] Warning:", bugsounet, "library not loaded !")
      console.error("[YT] Try to solve it with `npm install` in EXT-YouTube directory")
      return
    }
    console.log("[YT] YouTube Search Function initilized.")
    this.sendSocketNotification("YT_INITIALIZED")

    console.log("[YT] EXT-YouTube is Ready.")
  },

  /** Load require @busgounet library **/
  /** It will not crash MM (black screen) **/
  loadBugsounetLibrary: function() {
    let libraries= [
      // { "library to load" : "store library name" }
      { "./components/youtube-search.js": "YouTubeSearch" },
      { "axios": "axios" }
    ]
    let errors = 0
    return new Promise(resolve => {
      libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name
          let libraryName = configValues

          try {
            if (!this.lib[libraryName]) {
              this.lib[libraryName] = require(libraryToLoad)
              log("Loaded:", libraryToLoad, "->", "this.lib."+libraryName)
            }
          } catch (e) {
            console.error("[YT]", libraryToLoad, "Loading error!" , e.toString())
            this.sendSocketNotification("YT_LIBRARY_ERROR", libraryToLoad)
            errors++
            this.lib.error = errors
          }
        }
      })
      resolve(errors)
      if (!errors) console.log("[YT] All libraries loaded!")
    }) 
  },

  /** YouTube Search **/
  YoutubeSearch: async function (query) {
    log("Search for:", query)
    try {
      let results = await this.lib.YouTubeSearch.search(query, 1, this.lib)
      let item = results.items[0]
      //log("Results:", item)
      let title = item.title
      let thumbnail = item.thumbnail
      let videoID = item.id
      log("Found YouTube Title:", title, "videoID:", videoID)
      this.sendSocketNotification("YT_FOUND", { title: title, thumbnail: thumbnail })
      this.sendSocketNotification("YT_RESULT", videoID)
    } catch (e) {
      console.error("[YT] YouTube Search error: ", e.toString())
      this.sendSocketNotification("YT_SEARCH_ERROR")
    }
  }
})

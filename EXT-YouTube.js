//
// Module : EXT-YouTube
// @bugsounet 01/2022
// @Todo VLC support

logYT = (...args) => { /* do nothing */ }

Module.register("EXT-YouTube", {
  defaults: {
    debug: true,
    videoID: "sOnqjkJTMaA", //"Zi_XLOBDo_Y",
    fullscreen: false,
    width: "30vw", //"800px",
    height: "17vw", //"600px"
    autoStart: true,
    autoStartTimeout: 2000,
    useSearch: false,
    displayHeader: true,
    username: null,
    token: null
  },

  start: function() {
    //override user set !
    if (this.data.position== "fullscreen_above" || this.data.position== "fullscreen_below") this.config.fullscreen = true
    if (this.config.fullscreen) {
      this.data.header = undefined
      this.data.position= "fullscreen_above"
    } else {
      if (this.config.displayHeader) this.data.header = "~@bugsounet~ EXT-YouTube"
      if (!this.data.position) this.data.position= "top_center"
    }
    if (this.config.debug) logYT = (...args) => { console.log("[YT]", ...args) }
    this.sendSocketNotification('INIT', this.config)
    this.YT = {
      status: false,
      ended: false,
      title: null,
      running: false
    }
    this.searchInit= false
    this.Infos= {
      displayed: false,
      buffer: []
    }
  },

  notificationReceived: function(notification, payload) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        logYT("Go YouTube!")
        this.YouTube = document.getElementById("EXT-YT")
        if (!this.config.token) console.error("Warning: Token of @bugsounet forum missing!")
        this.sendNotification("EXT_HELLO", this.name)
        if (this.config.autoStart) setTimeout(() => {
          this.YouTube.src= "http://youtube.bugsounet.fr/?id="+this.config.videoID + "&username="+ this.config.username + "&token="+this.config.token + "&seed="+Date.now()
        }, this.config.autoStartTimeout)
        console.log("http://youtube.bugsounet.fr/?id="+this.config.videoID + "&username="+ this.config.username + "&token="+this.config.token + "&seed="+Date.now())
        break
      case "EXT_YOUTUBE-START":
        this.YouTube.src= "http://youtube.bugsounet.fr/?id="+this.config.videoID+ "&username="+ this.config.username + "&token="+this.config.token+ "&seed=" + Date.now()
        break
      case "EXT_YOUTUBE-PLAY":
        this.YT.title = null
        this.YouTube.src= "http://youtube.bugsounet.fr/?id="+payload+ "&username="+ this.config.username + "&token="+this.config.token + "&seed="+Date.now()
        break
      case "EXT_YOUTUBE-STOP":
        this.Ended()
        break
      case "EXT_YOUTUBE-SEARCH":
        if (!this.searchInit) return console.error("Search function is disabled!")
        if (payload) this.sendSocketNotification("YT_SEARCH", payload)
        break
    }
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "YT_SEARCH_INITIALIZED":
        this.searchInit= true
        break
      case "YT_RESULT":
        this.notificationReceived("YT_PLAY", payload)
        break
    }
  },

  getDom: function() {
    var wrapper = document.createElement('div')
    wrapper.id = "EXT-YT_WINDOW"
    this.hide(0, {lockString: "EXT-YT_LOCKED"})
    wrapper.className = "hidden"
    if (!this.config.fullscreen) {
      wrapper.style.width = this.config.width
      wrapper.style.height = this.config.height
    }
    var YT = document.createElement('webview')
    YT.id = "EXT-YT"

    YT.addEventListener("did-stop-loading", () => {
      if (YT.getURL().includes("about:blank")) logYT("Video Ended")
      else logYT("Video Started")
    })
    YT.addEventListener("console-message", (event) => {
      if (YT.getURL().includes("about:blank")) return
      this.Rules(event.message)
    })
    YT.addEventListener("did-fail-load", (message) => {
      console.error("[YT][Error]", message.errorDescription)
      this.Ended()
    })
    wrapper.appendChild(YT)
    return wrapper
  },

  getStyles: function(){
    return [
      this.file('EXT-YouTube.css'),
      "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
    ]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json"
    }
  },

  Rules: function (payload) {
    logYT("Received:", payload)
    const tag = payload.split(" ")
    if (tag[0] == "[YT]") {
      switch (tag[1]) {
        case "Status:":
          this.YT.status= tag[2] === "true" ? true : false
          if (this.YT.status && !this.YT.ended) {
            if (this.YT.running) return
            this.Started()
          }
        break
        case "Ended:":
          this.YT.ended= tag[2] === "true" ? true: false
          if (this.YT.ended) this.Ended()
          if (this.YT.running) this.YT.running = false
        break
        case "Title:":
          this.YT.title = tag.slice(2).join(" ")
          if (this.config.fullscreen && this.config.displayHeader) console.log(this.translate("YouTubeIsPlaying") + this.YT.title)
          if (this.YT.title && !this.config.fullscreen && this.config.displayHeader) {
            let YTHeader = document.getElementById(this.identifier).getElementsByClassName("module-header")[0]
            YTHeader.innerText= this.YT.title
          }
        break
      }
    }
  },

  Ended: function() {
    var YTWindow = document.getElementById("EXT-YT_WINDOW")
    var YTPlayer = document.getElementById("EXT-YT")
    if (!this.config.fullscreen && this.config.displayHeader) {
      let YTHeader = document.getElementById(this.identifier).getElementsByClassName("module-header")[0]
      YTHeader.innerHTML= this.data.header
    }
    this.hide(1000, {lockString: "EXT-YT_LOCKED"})
    YTWindow.className = "hidden"
    YTPlayer.src= "about:blank?&seed="+Date.now()
    this.broadcastStatus("END")
    // reset YT rules
    this.YT = {
      status: false,
      ended: false,
      title: null,
      running: false
    }
    if (this.config.fullscreen) this.Showing()
  },

  Started: function() {
    if (this.config.fullscreen) this.Hiding()
    var YTWindow = document.getElementById("EXT-YT_WINDOW")
    this.show(1000, {lockString: "EXT-YT_LOCKED"})
    YTWindow.classList.remove("hidden")
    this.broadcastStatus("START")
    this.YT.running = true
  },

  Hiding: function() {
    logYT("Hiding all modules")
    MM.getModules().exceptModule(this).enumerate((module) => {
      module.hide(1000, {lockString: "EXT-YT_LOCKED"})
    })
  },

  Showing: function() {
    logYT("Showing all modules")
    MM.getModules().exceptModule(this).enumerate((module) => {
      module.show(1000, {lockString: "EXT-YT_LOCKED"})
    })
  },

  broadcastStatus: function(status) {
    if (status == "START") this.sendNotification("EXT_YOUTUBE-CONNECTED")
    else if (status == "END") this.sendNotification("EXT_YOUTUBE-DISCONNECTED")
  },

  /****************************/
  /*** TelegramBot Commands ***/
  /****************************/
  getCommands: function(commander) {
    commander.add({
      command: "youtube",
      description: this.translate("YouTubeDescription"),
      callback: "tbYoutube"
    })
  },

  tbYoutube: function(command, handler) {
    var query = handler.args
    if (query) {
      var args = query.toLowerCase().split(" ")
      var params = query.split(" ").slice(1).join(" ")
      switch (args[0]) {
        case "start":
          this.notificationReceived("EXT_YOUTUBE-START")
          handler.reply("TEXT", this.translate("YouTubeStart"))
          break
        case "play":
          if (params) {
            params = params.split(" ")
            this.notificationReceived("EXT_YOUTUBE-PLAY", params[0])
            handler.reply("TEXT", this.translate("YouTubePlay", { VALUES: params[0] }))
          } else handler.reply("TEXT", "/youtube play <video ID>")
          break
        case "stop":
          this.notificationReceived("EXT_YOUTUBE-STOP")
          handler.reply("TEXT", this.translate("YouTubeStop"))
          break
        case "search":
          if (!this.config.useSearch || !this.searchInit) return handler.reply("TEXT", this.translate("YouTubeSearchDisabled"))
          if (params) {
            this.notificationReceived("EXT_YOUTUBE-SEARCH", params)
            handler.reply("TEXT", this.translate("YouTubeSearch", { VALUES: params }))
          }
          else handler.reply("TEXT", "/youtube search <youtube title/artist>")
          break
        default:
          handler.reply("TEXT", this.translate("YouTubeCmdNotFound"))
          break
      }
    } else {
      if (!this.config.token) handler.reply("TEXT", "This module is reserved to Donators/Helpers/BetaTesters of @bugsounet's forum\nIf you need token: Ask to @bugsounet to create it\nFreeDays youtube playing is every month from 01 to 07.", {parse_mode:'Markdown'})
      handler.reply("TEXT", this.translate("YouTubeHelp") + (this.config.useSearch ? this.translate("YouTubeSearchHelp") : ""), {parse_mode:'Markdown'})
    }
  }
})

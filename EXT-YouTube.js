//
// Module : EXT-YouTube
// @bugsounet 01/2022

logYT = (...args) => { /* do nothing */ }

Module.register("EXT-YouTube", {
  defaults: {
    debug: false,
    fullscreen: true,
    width: "30vw",
    height: "17vw",
    useSearch: true,
    displayHeader: true,
    username: null,
    token: null
  },

  start: function() {
    //override user set !
    if (this.data.position== "fullscreen_above" || this.data.position== "fullscreen_below") this.config.fullscreen = true
    if (this.config.fullscreen) {
      this.data.header = undefined
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
        if (this.config.fullscreen) this.preparePopup()
        this.YouTube = document.getElementById("EXT-YT")
        this.sendNotification("EXT_HELLO", this.name)
        if (!this.config.token) {
          console.error("Warning: Token of @bugsounet forum missing!")
          this.sendNotification("EXT_ALERT", {
            type: "warning",
            message: this.translate("YouTubeTokenMissing"),
            icon: "modules/EXT-YouTube/resources/YT.png"
          })
        }
        break
      case "EXT_YOUTUBE-PLAY":
        this.YT.title = null
        this.YouTube.src= "http://youtube.bugsounet.fr/?id="+payload+ "&username="+ this.config.username + "&token="+this.config.token + "&seed="+Date.now()
        break
      case "EXT_STOP":
      case "EXT_YOUTUBE-STOP":
        if (this.YT.running) this.Ended()
        break
      case "EXT_YOUTUBE-SEARCH":
        if (!this.searchInit) {
          this.sendNotification("EXT_ALERT", {
            type: "error",
            message: this.translate("YouTubeSearchDisabled"),
            icon: "modules/EXT-YouTube/resources/YT.png"
          })
          return console.error("Search function is disabled!")
        }
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
        this.notificationReceived("EXT_YOUTUBE-PLAY", payload)
        break
      case "YT_FOUND":
        if (this.config.fullscreen && this.config.displayHeader) {
          this.sendNotification("EXT_ALERT", {
            type: "information",
            message: this.translate("YouTubeIsPlaying", { VALUES: payload }),
            icon: "modules/EXT-YouTube/resources/YT.png",
            timer: 6000,
            sound: "modules/EXT-YouTube/resources/YT-Launch.mp3"
          })
        }
        break
      case "YT_TOKEN_MISSING":
        this.sendNotification("EXT_ALERT", {
          type: "error",
          message: this.translate("YouTubeTokenError"),
          icon: "modules/EXT-YouTube/resources/YT.png",
          timer: 10000,
        })
        break
      case "YT_LIBRARY_ERROR":
        this.sendNotification("EXT_ALERT", {
          type: "error",
          message: this.translate("YouTubeLibraryError", { VALUES: payload }),
          icon: "modules/EXT-YouTube/resources/YT.png",
          timer: 10000,
        })
        break
      case "YT_SEARCH_ERROR":
        this.sendNotification("EXT_ALERT", {
          type: "error",
          message: this.translate("YouTubeFoundError"),
          icon: "modules/EXT-YouTube/resources/YT.png",
          timer: 5000,
        })
        break
      case "YT_CREDENTIALS_MISSING":
        this.sendNotification("EXT_ALERT", {
          type: "error",
          message: this.translate("YouTubeCredentialsError"),
          icon: "modules/EXT-YouTube/resources/YT.png",
          timer: 10000,
        })
        break
    }
  },

  getDom: function() {
    var wrapper = document.createElement('div')
    wrapper.id = "EXT-YT_WINDOW"
    if (this.config.fullscreen) {
      wrapper.className = "hidden"
      return wrapper
    }

    wrapper.style.width = this.config.width
    wrapper.style.height = this.config.height
    var YTLogo= document.createElement('img')
    YTLogo.id = "EXT-YT_LOGO"
    YTLogo.src = "modules/EXT-YouTube/resources/YouTube-Logo.png"
    wrapper.appendChild(YTLogo)

    var YTPlayer = document.createElement('webview')
    YTPlayer.id = "EXT-YT"
    YTPlayer.className = "hidden"

    YTPlayer.addEventListener("did-stop-loading", () => {
      if (YTPlayer.getURL().includes("about:blank")) logYT("Video Ended")
      else logYT("Video Started")
    })
    YTPlayer.addEventListener("console-message", (event) => {
      if (YTPlayer.getURL().includes("about:blank")) return
      this.Rules(event.message)
    })
    YTPlayer.addEventListener("did-fail-load", (message) => {
      console.error("[YT][Error]", message.errorDescription)
      this.sendNotification("EXT_ALERT", { type: "error", message: "Youtube Error: " + message.errorDescription }) 
      this.Ended()
    })

    wrapper.appendChild(YTPlayer)
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
    var YTPlayer = document.getElementById("EXT-YT")
    var YTLogo = document.getElementById("EXT-YT_LOGO")
    if (!this.config.fullscreen && this.config.displayHeader) {
      let YTHeader = document.getElementById(this.identifier).getElementsByClassName("module-header")[0]
      YTHeader.innerHTML= this.data.header
    }

    YTPlayer.classList.add("hidden")
    YTPlayer.src= "about:blank?&seed="+Date.now()
    if (!this.config.fullscreen) YTLogo.classList.remove("hidden")

    this.broadcastStatus("END")

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
    var YTPlayer = document.getElementById("EXT-YT")
    var YTLogo = document.getElementById("EXT-YT_LOGO")

    if (!this.config.fullscreen) YTLogo.className= "hidden"
    YTPlayer.classList.remove("hidden")
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


  preparePopup: function() {
    var YTPlayer = document.createElement('webview')
    YTPlayer.id = "EXT-YT"
    YTPlayer.classList.add("fullscreen", "hidden")

    YTPlayer.addEventListener("did-stop-loading", () => {
      if (YTPlayer.getURL().includes("about:blank")) logYT("Video Ended")
      else logYT("Video Started")
    })
    YTPlayer.addEventListener("console-message", (event) => {
      if (YTPlayer.getURL().includes("about:blank")) return
      this.Rules(event.message)
    })
    YTPlayer.addEventListener("did-fail-load", (message) => {
      console.error("[YT][Error]", message.errorDescription)
      this.sendNotification("EXT_ALERT", { type: "error", message: "Youtube Error: " + message.errorDescription }) 
      this.Ended()
    })
    document.body.appendChild(YTPlayer)
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
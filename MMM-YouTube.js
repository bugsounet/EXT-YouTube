//
// Module : MMM-YouTube
// @bugsounet 26/11/2021
//

logYT = (...args) => { /* do nothing */ }

Module.register("MMM-YouTube", {
  defaults: {
    debug: false,
    videoID: "sOnqjkJTMaA", //"Zi_XLOBDo_Y",
    fullscreen: false,
    width: "30vw", //"800px",
    height: "17vw", //"600px"
    autoStart: true,
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
    }
    else {
      if (this.config.displayHeader) this.data.header = "~@bugsounet~ MMM-YouTube"
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
        this.prepareInfoDisplayer()
        logYT("Go YouTube!")
        this.YouTube = document.getElementById("YT")
        if (!this.config.token) this.Informations({message: "Warning: This module is locked: Token forum missing", timer: 10000})
        break
      case "YT_START":
        if (!this.config.token) return
        this.YouTube.src= "http://youtube.bugsounet.fr/?id="+this.config.videoID+ "&username="+ this.config.username + "&token="+this.config.token+ "&seed=" + Date.now()
        break
      case "YT_PLAY":
        if (!this.config.token) return
        this.YT.title = null
        this.YouTube.src= "http://youtube.bugsounet.fr/?id="+payload+ "&username="+ this.config.username + "&token="+this.config.token + "&seed="+Date.now()
        break
      case "YT_STOP":
        if (!this.config.token) return
        this.Ended()
        break
      case "YT_SEARCH":
        if (!this.config.token) return
        if (!this.searchInit) return this.Informations({ message: "Search function is disabled!" })
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
      case "Informations":
        this.Informations(payload)
        break
    }
  },

  getDom: function() {
    var wrapper = document.createElement('div')
    wrapper.id = "YT_WINDOW"
    this.hide(0, {lockString: "YT_LOCKED"})
    wrapper.className = "hidden"
    if (!this.config.fullscreen) {
      wrapper.style.width = this.config.width
      wrapper.style.height = this.config.height
    }
    var YT = document.createElement('webview')
    YT.id = "YT"
    if (this.config.autoStart) YT.src= "http://youtube.bugsounet.fr/?id="+this.config.videoID + "&username="+ this.config.username + "&token="+this.config.token + "&seed="+Date.now()
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
      this.file('MMM-YouTube.css'),
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
          if (this.config.fullscreen && this.config.displayHeader) this.Informations({message: this.translate("YouTubeIsPlaying") + this.YT.title})
          if (this.YT.title && !this.config.fullscreen && this.config.displayHeader) {
            let YTHeader = document.getElementById(this.identifier).getElementsByClassName("module-header")[0]
            YTHeader.innerText= this.YT.title
          }
        break
      }
    }
  },

  Ended: function() {
    var YTWindow = document.getElementById("YT_WINDOW")
    var YTPlayer = document.getElementById("YT")
    if (!this.config.fullscreen && this.config.displayHeader) {
      let YTHeader = document.getElementById(this.identifier).getElementsByClassName("module-header")[0]
      YTHeader.innerHTML= this.data.header
    }
    this.hide(1000, {lockString: "YT_LOCKED"})
    YTWindow.className = "hidden"
    YTPlayer.src= "about:blank?&seed="+Date.now()
    this.broadcastForPir("END")
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
    var YTWindow = document.getElementById("YT_WINDOW")
    this.show(1000, {lockString: "YT_LOCKED"})
    YTWindow.classList.remove("hidden")
    this.broadcastForPir("START")
    this.YT.running = true
  },

  Hiding: function() {
    logYT("Hiding all modules")
    MM.getModules().exceptModule(this).enumerate((module) => {
      module.hide(1000, {lockString: "YT_LOCKED"})
    })
  },

  Showing: function() {
    logYT("Showing all modules")
    MM.getModules().exceptModule(this).enumerate((module) => {
      module.show(1000, {lockString: "YT_LOCKED"})
    })
  },

  broadcastForPir: function(status) {
    if (status == "START") {
      this.sendNotification("USER_PRESENCE", true)
      this.sendNotification("SCREEN_LOCK")
    }
    else if (status == "END") {
      this.sendNotification("SCREEN_UNLOCK")
    }
  },

  /****************************/
  /*** TelegramBot Commands ***/
  /****************************/
  getCommands: function(commander) {
    commander.add({
      command: "youtube",
      description: this.translate("YouTubeDescription"),
      callback: (!this.config.token) ? "tbToken" : "tbYoutube"
    })
  },

  tbToken: function(command, handler) {
    handler.reply("TEXT", "This module is reserved to Donators/Helpers/BetaTesters of @bugsounet's forum")
    handler.reply("TEXT", "If you need token: Ask to @bugsounet to unlock it")
  },

  tbYoutube: function(command, handler) {
    var query = handler.args
    if (query) {
      var args = query.toLowerCase().split(" ")
      var params = query.split(" ").slice(1).join(" ")
      switch (args[0]) {
        case "start":
          this.notificationReceived("YT_START")
          handler.reply("TEXT", this.translate("YouTubeStart"))
          break
        case "play":
          if (params) {
            params = params.split(" ")
            this.notificationReceived("YT_PLAY", params[0])
            handler.reply("TEXT", this.translate("YouTubePlay", { VALUES: params[0] }))
          } else handler.reply("TEXT", "/youtube play <video ID>")
          break
        case "stop":
          this.notificationReceived("YT_STOP")
          handler.reply("TEXT", this.translate("YouTubeStop"))
          break
        case "search":
          if (!this.config.useSearch || !this.searchInit) return handler.reply("TEXT", this.translate("YouTubeSearchDisabled"))
          if (params) {
            this.notificationReceived("YT_SEARCH", params)
            handler.reply("TEXT", this.translate("YouTubeSearch", { VALUES: params }))
          }
          else handler.reply("TEXT", "/youtube search <youtube title/artist>")
          break
        default:
          handler.reply("TEXT", this.translate("YouTubeCmdNotFound"))
          break
      }
    } else {
      handler.reply("TEXT", this.translate("YouTubeHelp") + (this.config.useSearch ? this.translate("YouTubeSearchHelp") : ""), {parse_mode:'Markdown'})
    }
  },

  /***************************/
  /** Information Displayer **/
  /***************************/

  prepareInfoDisplayer: function() {
    var YT_Infos = document.createElement("div")
    YT_Infos.id = "YT_Infos"
    YT_Infos.style.zoom = "80%"
    YT_Infos.className= "hidden animate__animated"
    YT_Infos.style.setProperty('--animate-duration', '1s')

    var YT_InfosBar = document.createElement("div")
    YT_InfosBar.id = "YT_Infos-bar"
    YT_InfosBar.tabindex = -1
    YT_Infos.appendChild(YT_InfosBar)

    //informations image
    var YT_InfosIcon = document.createElement("img")
    YT_InfosIcon.id= "YT_Infos-Icon"
    YT_InfosIcon.className="YT_Infos-icon"
    YT_InfosIcon.src = "/modules/MMM-YouTube/resources/YT.png"
    YT_InfosBar.appendChild(YT_InfosIcon)

    //transcription informations text
    var YT_InfosResponse = document.createElement("span")
    YT_InfosResponse.id= "YT_Infos-Transcription"
    YT_InfosResponse.className="YT_Infos-response"
    YT_InfosResponse.textContent= "~MMM-YouTube displayer~"
    YT_InfosBar.appendChild(YT_InfosResponse)

    document.body.appendChild(YT_Infos)
  },

  /** Information buffer to array **/
  Informations(info) {
    if (!info.message) { // should not happen
      logYT("debug information:", info)
      return this.Informations({ message: "Core Information: no message!" })
    }

    let infoObject = {
      info: info
    }
    this.Infos.buffer.push(infoObject)
    logYT("Informations Buffer Add:", this.Infos)
    this.InformationsBuffer(this.Infos.buffer[0].info)
  },

  /** Informations Display with translate from buffer **/
  InformationsBuffer: function(info) {
    if (this.Infos.displayed || !this.Infos.buffer.length) return
    this.showInformations(info)
    this.InformationShow()

    this.warningTimeout = setTimeout(() => {
      this.InformationHidden()
    }, info.timer ? info.timer : 3000)
  },

  showInformations: function (info) {
    var tr = document.getElementById("YT_Infos-Transcription")
    tr.textContent = this.translate(info.message, { VALUES: info.values })
  },

  InformationHidden: function () {
    var infosDiv = document.getElementById("YT_Infos")
    infosDiv.classList.remove('animate__bounceInDown')
    infosDiv.classList.add("animate__bounceOutUp")
    infosDiv.addEventListener('animationend', (e) => {
      if (e.animationName == "bounceOutUp" && e.path[0].id == "YT_Infos") {
        infosDiv.classList.add("hidden")
        this.showInformations("")
        this.Infos.buffer.shift()
        this.Infos.displayed=false
        logYT("Informations Buffer deleted", this.Infos)
        if(this.Infos.buffer.length) this.InformationsBuffer(this.Infos.buffer[0].info)
      }
    }, {once: true})
  },

  InformationShow: function () {
    var infosDiv = document.getElementById("YT_Infos")
    this.Infos.displayed=true
    infosDiv.classList.remove("hidden", "animate__bounceOutUp")
    infosDiv.classList.add('animate__bounceInDown')
  }
})

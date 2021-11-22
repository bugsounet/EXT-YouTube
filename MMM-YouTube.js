//
// Module : MMM-YouTube
// @bugsounet 19/11/2021
//


// testing sample
// @todo, make callback and remote controling

logYT = (...args) => { /* do nothing */ }

Module.register("MMM-YouTube", {
  defaults: {
    debug: false,
    videoID: "sOnqjkJTMaA", //"Zi_XLOBDo_Y",
    fullscreen: false,
    width: "800px",
    height: "600px",
    autoStart: true,
    useSearch: false,
  },

  start: function() {
    //override user set !
    if (this.config.fullscreen) {
      this.data.header = undefined
      this.data.position= "fullscreen_above" // really a good solution? maybe popup is better ?
    }
    else {
      this.data.header = "~@bugsounet~ MMM-YouTube"
      if (!this.data.position) this.data.position= "top_center"
    }
    if (this.config.debug) logYT = (...args) => { console.log("[YT]", ...args) }
    this.sendSocketNotification('INIT', this.config)
    this.YT = {
      status: false,
      ended: false,
      title: null
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
        break
      case "YT_START":
        let YTWindow = document.getElementById("YT")
        YT.src= "http://youtube.bugsounet.fr/?id="+this.config.videoID+"&origin="+ this.name + "&seed="+Date.now()
        break
      case "YT_PLAY":
        YT.src= "http://youtube.bugsounet.fr/?id="+payload+"&origin="+ this.name + "&seed="+Date.now()
        break
      case "YT_STOP":
        this.Ended()
        break
      case "YT_SEARCH":
        if (!this.searchInit) return
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
    wrapper.id = "YT_WINDOW"
    this.hide(0, {lockString: "YT_LOCKED"})
    wrapper.className = "hidden"
    if (!this.config.fullscreen) {
      wrapper.style.width = this.config.width
      wrapper.style.height = this.config.height
    }
    var YT = document.createElement('webview')
    YT.id = "YT"
    if (this.config.autoStart) YT.src= "http://youtube.bugsounet.fr/?id="+this.config.videoID+"&origin="+ this.name + "&seed="+Date.now()
    YT.addEventListener("did-stop-loading", () => {
      if (YT.getURL() == "about:blank") {
        logYT("Video Ended")
        this.broadcastForPir("END")
      }
      else {
        logYT("Video Started")
        this.broadcastForPir("START")
      }
    })
    YT.addEventListener("console-message", (event) => {
      if (YT.getURL() == "about:blank") return
      this.Rules(event.message)
    })
    YT.addEventListener("did-fail-load", (message) => {
      console.error("[YT][Error]", message.errorDescription)
    })

    wrapper.appendChild(YT)
    return wrapper
  },

  getStyles: function(){
    return [
      this.file('MMM-YouTube.css')
    ]
  },

  Rules: function (payload) {
    logYT("Received:", payload)
    const tag = payload.split(" ")
    if (tag[0] == "[YT]") {
      switch (tag[1]) {
        case "Status:":
          this.YT.status= tag[2] === "true" ? true : false
        break
        case "Ended:":
          this.YT.ended= tag[2] === "true" ? true: false
        break
        case "Title:":
          this.YT.title = tag.slice(2).join(" ")
        break
      }
    }

    var YTWindow = document.getElementById("YT_WINDOW")

    if (this.YT.ended && !this.YT.status) this.Ended()
    
    if (this.YT.status) {
      this.show(1000, {lockString: "YT_LOCKED"})
      YTWindow.classList.remove("hidden")
    }
    
    if (this.YT.status && this.YT.title && !this.config.fullscreen) {
      let YTHeader = document.getElementById(this.identifier).getElementsByClassName("module-header")[0]
      YTHeader.innerText= this.YT.title
    }
  },

  Ended: function() {
    var YTWindow = document.getElementById("YT_WINDOW")
    var YTPlayer = document.getElementById("YT")
    if (!this.config.fullscreen) {
      let YTHeader = document.getElementById(this.identifier).getElementsByClassName("module-header")[0]
      YTHeader.innerHTML= this.data.header
    }
    this.hide(1000, {lockString: "YT_LOCKED"})
    YTWindow.className = "hidden"
    YTPlayer.src= "about:blank"
  },

  broadcastForPir: function(status) {
    if (status == "START") {
      this.sendNotification("USER_PRESENCE", true)
      this.sendNotification("SCREEN_LOCK")
    }
    else if (status == "END") {
      this.sendNotification("SCREEN_UNLOCK")
    }
  }
})

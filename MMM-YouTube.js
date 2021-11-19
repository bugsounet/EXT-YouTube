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
  },

  start: function() {
    if (this.config.fullscreen) this.data.position= "fullscreen_above"
    else {
      this.data.header = "\/!\\ @bugsounet YouTube Sub-Module Testing \/!\\"
      this.data.position= "top_center"
    }
    if (this.config.debug) logYT = (...args) => { console.log("[YT]", ...args) }
    this.sendSocketNotification('INIT', this.config)
  },

  notificationReceived: function(notification, payload) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        logYT("go")
        break
    }
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      // this
    }
  },

  getDom: function() {
    var wrapper = document.createElement('div')
    wrapper.id = "YT_WINDOW"
    if (!this.config.fullscreen) {
      wrapper.style.width = this.config.width
      wrapper.style.height = this.config.height
    }
    var YT = document.createElement('webview')
    YT.id = "YT"
    YT.src= "http://youtube.bugsounet.fr/?id="+this.config.videoID+"&origin="+ this.name + "&seed="+Date.now()
    YT.addEventListener("did-stop-loading", () => {
      logYT("Video Loaded", YT.getURL())
    })
    YT.addEventListener("console-message", (message) => {
      logYT(message)
    })
    YT.addEventListener("message", (message) => {
      logYT("[Message]", message)
    })
    wrapper.appendChild(YT)
    return wrapper
  },

  getStyles: function(){
    return [
      this.file('MMM-YouTube.css')
    ]
  },

  test: function () {
    logYT("execute")
  }

})

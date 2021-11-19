//
// Module : MMM-YouTube
// @bugsounet 19/11/2021
//


// testing sample
// @todo, make callback and remote controling

Module.register("MMM-YouTube", {
  defaults: {
    debug: false,
    videoID: "Zi_XLOBDo_Y",
    width: "800px",
    height: "600px",
  },

  start: function() {
    console.log(this)
    this.data.header = "\/!\\ @bugsounet YouTube Sub-Module Testing \/!\\",
    this.data.position= "top_center"
    this.sendSocketNotification('INIT', this.config)
  },

  notificationReceived: function(notification, payload) {
    switch (notification) {
      // this
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
    wrapper.style.width = this.config.width
    wrapper.style.height = this.config.height
    var YT = document.createElement('iframe')
    YT.id = "YT"
    YT.src= "http://alexa.bugsounet.fr/test/test3.html?id="+this.config.videoID+"&origin="+ this.name + "&seed="+Date.now()
    console.log(this.config.videoID+"&origin="+ this.name + "&seed="+Date.now())
    wrapper.appendChild(YT)
    return wrapper
  },

  getStyles: function(){
    return [
      this.file('MMM-YouTube.css')
    ]
  }
})

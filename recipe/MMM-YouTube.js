/** Vocal control for MMM-YouTube **/
/**  @bugsounet  **/
/** 24/11/2021 **/

var recipe = {
  transcriptionHooks: {
    "YouTube": {
      pattern: "youtube (.*)",
      command: "YouTube_SEARCH"
    },
    "YouTube_STOP": {
      pattern: "stop",
      command: "YouTube_STOP"
    },   
  },

  commands: {
    "YouTube_SEARCH": {
      functionExec: {
        exec: (params) => {
          this.sendNotification("YT_SEARCH", params[1])
        }
      },
      soundExec: {
        chime: "open",
      },
      displayResponse: true
    },
    "YouTube_STOP": {
      notificationExec: {
        notification: "YT_STOP"
      },
      soundExec: {
        chime: "close"
      }
    }
  }
}
exports.recipe = recipe

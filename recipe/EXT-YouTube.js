/** Vocal control for EXT-YouTube **/
/**  @bugsounet  **/
/** 06/02/2022 **/

var recipe = {
  transcriptionHooks: {
    "YouTube": {
      pattern: "youtube (.*)",
      command: "YouTube_SEARCH"
    }
  },

  commands: {
    "YouTube_SEARCH": {
      functionExec: {
        exec: (params) => {
          this.sendNotification("EXT_YOUTUBE-SEARCH", params[1])
        }
      },
      soundExec: {
        chime: "open",
      },
      displayResponse: true
    }
  }
}
exports.recipe = recipe

# MMM-YouTube

Hi, I'm writing a new MMM-YouTube module (version 2022 ?)<br>
I now able to play any YT video without VLC program<br>

# Why refact a Youtube module ?
I see to many issue with VLC program and i don't like that ...<br>
I search to make simple things ... plug and play<br>
I want a natural player without problem<br>
So... Go back to the source !<br>
We use the real YouTube API in Javascript<br>
I see some user that think... `we can't play © video with it...`<br>
Effectively, we can't read directly © video in embed iframe with full JS Code for MagicMirror !<br>

So... I think to another method... we have an dedicated server... and why not create a YT server on it ?<br>
Right! I Code it !<br>

# Screenshoot: (the © Thriller video from M. Jackson)
![](https://raw.githubusercontent.com/bugsounet/MMM-YouTube/dev/MMM-Youtube.png)

# Require:
This module is Reserved to **Donators/Helpers/BetaTester Groups**

But there is some FreeDays for testing this module<br>
FreeDays days is defined every month from 01 to 07<br>
In other case/day, you can't use this module


# Installing:

```sh
cd ~/MagicMirror/modules/
git clone https://github.com/bugsounet/MMM-YouTube
cd MMM-YouTube
npm install
```

# Updating:

```sh
cd ~/MagicMirror/modules/MMM-YouTube
git pull
```

# MagicMirror  `electronOptions`

a new part of config is needed (like GoogleAssistant module) for displaying this module.

on the begining of MagicMirror config.js, modify with `electronOptions`
```js
var config = {
  address: "localhost",
  electronOptions: {
    webPreferences: {
      webviewTag: true
    }
  },
  port: 8080,
...
```

# Configuration Sample
```js
{
  module: "MMM-YouTube",
  config: {
    username: "username", // your username in the forum
    token: "Token sended by @bugsounet" // the token sended by @bugsounet
  }
},
```

# Configuration for Tunning: (same configuration like sample and coded in main core)

```js
{
  module: "MMM-YouTube",
  position: "top_center", // optional (can be deleted if using fullscreen)
  config: {
    fullscreen: false, // fullscreen or not ?
    videoID: "RBSZH42a-Kw", // [Big Wild - Joypunks], // "sOnqjkJTMaA", [thriller ... for testing] or your own youtube VideoID
    autoStart: true, // autostart prefered video on start 
    width: "30vw", // can be in px "800px",
    height: "17vw", // can be in px "600px"
    useSearch: false, // activate YT search functionality (need YT.json token)
    displayHeader: true, // display name of the video
    username: "username", // your username of the support forum
    token: "Token sended by @bugsounet" // the token sended by @bugsounet
  }
},
```

# Incoming notification:
 * `YT_START`: Start your prefered video (videoID)
 * `YT_PLAY <video ID>`: Start a wanted video ID
 * `YT_STOP`: Stop the video
 * `YT_SEARCH <Artist / Title>`: for search after a title artist video

# Outgoing notification:
 When video start:
  * `USER_PRESENCE` with payload : `true`
  * `SCREEN_LOCK` lock the screen for no powersaving (NewPIR)
 When Video end:
  * `SCREEN_UNLOCK` : unlock the screen (NewPIR)

# Notes:
 * The module is hidden when no video playing
 * The module display the title in the Header of the module
 * This module Should be ready for rpi3b+
 * This module will hide all modules on fullscreen playing (optimize video playback)
 * This module is linked to @bugsounet support forum
 * From @bugsounet forum: You need to have a username and your proper token associed
 * This module have a FreePlay days: every month from 01 to 07, for testing
 * In othercase, The new @bugsounet YouTube server check your access group with this forum
 * YouTube Access: Only Helpers/Moderators/BetaTester/Donators can have a access
 * Just ask me to generate your token associed to your username of the forum and place it in config field
 * *** /!\ If your username don't match with the token, you can't read the YouTube video (error 403) [Except FreePlay days] /!\ ***

# How to create credentials (`cretentials.json`) and YouTube Token (`YT.json`) for youtube search functionality
  * if you have already credentials.json file (used for GA for exemple), just copy it inside MMM-YouTube folder
  * in other case: follow [this page](http://wiki.bugsounet.fr/en/MMM-GoogleAssistant/GoogleAssistantSetup) for create it
  * You have to activate the YouTube Data API v3
 [there](https://console.developers.google.com/apis/library/youtube.googleapis.com?q=youtube) [Not needed if already activated]
  * Generate the YouTube token:
```
cd ~/MagicMirror/modules/MMM-YouTube
npm run token
```

# recipe for MMM-GoogleAssistantLight for vocal control
A prepared recipe is inclued and waiting for your use
Just add it in the config of MMM-GoogleAssistant

 * sample:
`recipes: ["../../MMM-YouTube/recipe/MMM-YouTube.js"]`
 * if you have other recipe, just a it like this:
`recipes: ["my_recipe.js", "../../MMM-YouTube/recipe/MMM-YouTube.js"]`

## Commands:
 * `youtube <artist/Title>`: for search and display a video
   * Sample: `youtube Michael jackson thriller`
 * `stop`: will stop any video


----------
# Added / Fix

## Update of 01/12/2021
  * FIX: FreeDays Playing 
     * Server Fix FreeDays: ALL months from 01 to 07
  * ADD: New @bugsounet YT Server
  * ADD: User Token of the forum is now need (security)
  * ADD: Error 403, if user credentials failed

## Update of 26/11/2021
 * ADD: Catch all errors and display it in popup bar (no black screen is now possible)
 * ADD: Popup display bar
 * ADD: Catch error on start (credentials.json / YT.token missing)
 * ADD: ads on start for donate (because MMM-Youtube use bugsounet's servers for displaying video)

## Update of 25/11/2021
 * ADD: Read config before starting (position module) and apply or change display rules
 * ADD: module position is unset when using fullscreen mode
 * ADD: TelegramBot `/youtube` fonction with translations
 * FIX: Search display in search Display again (chained) (Rules function)
 * FIX: Callbacks to other modules
 * ADD: Recipe for GoogleAssistant Light
 * ADD: Feature `displayHeader` [Boolean] for displaying title of video or not
 * ADD: RPI Optimization (full screen only)
## Update of 22/11/2021
 * ADD: Search internal coding (desactived by default [under Coding])
 * ADD: Incoming notification YT_SEARCH "Title Artist" (desactived by default [under coding])
 * ADD: Outgoing notification on Start video : `USER_PRESENCE` / `SCREEN_LOCK`
 * ADD: Outgoing notification on Stop/Finish video : `SCREEN_UNLOCK`
## Update of 20/11/2021
 * Fix: `autoStart` feature

# TODO
 * volume callback
 * catch error callback ? [under test and need to be +/- Fixed (wrong ID for example)]
 * write wiki !

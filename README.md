# MMM-YouTube

For testing... no position is needed (forced on center or fullscreen)

# Screenshoot: (Thriller from M. Jackson)
![](https://raw.githubusercontent.com/bugsounet/MMM-YouTube/dev/MMM-Youtube.png)

# Installing:

```sh
cd ~/MagicMirror/modules/
git clone -b dev https://github.com/bugsounet/MMM-YouTube
```
(npm install is not needed at this day !)

# Configuration Sample (Yes, only one line !)
```js
{
  module: "MMM-YouTube"
},
```


# Configuration for Tunning: (same configuration and coded in main core)
```js
{
  module: "MMM-YouTube",
  config: {
    fullscreen: false, // fullscreen or not ?
    videoID: "RBSZH42a-Kw", // [Big Wild - Joypunks], // "sOnqjkJTMaA", [thriller ... for testing] or your own youtube VideoID
    autoStart: true, // autostart prefered video on start 
    width: "800px",
    height: "600px",
  }
},
```

# Incoming notification:
 * `YT_START`: Start your prefered video (videoID)
 * `YT_PLAY`: Start a wanted video ID
 * `YT_STOP`: Stop the video

# Outgoing notification:
(not yet coded)

# Notes:
 * The module is undercoding
 * The module is hidden when no video playing
 * The module display the title in the Header of the module (not in fullscreen)
 * Should be compatible with rpi3b+ ?
 * hide all modules on fullscreen playing ? (optimize video playback)
 * You can use TelegramBot for send notification
   * `/notification YT_PLAY sOnqjkJTMaA` will play M. Jackson triller for example
   * `/notification YT_START` will start the defined video in config
   * `/notification YT_STOP` will stop the player
   * 
# TODO
 * volume callback
 * catch error callback
 * playlist support ? really needed ??
 * Make some dev testing with GA (notification with `YT_PLAY`)
 * Broadcast: `USER_PRESENCE`, `WAKEUP`, `EXT_LOCK`, ... for other modules

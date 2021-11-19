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


# Configuration:
```js
{
  module: "MMM-YouTube",
  config: {
    fullscreen: false, // fullscreen or not ?
    videoID: "RBSZH42a-Kw", // [Big Wild - Joypunks], // "sOnqjkJTMaA", [thriller ... for testing] or your own youtube VideoID
  }
},
```

/!\ it's the begining of coding
  * can't stop video
  * can't have any callbacks
  * can't stop module

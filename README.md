# chistr

[![Build status](https://ci.appveyor.com/api/projects/status/8iulnpq4sldtekeo?svg=true)](https://ci.appveyor.com/project/patmanteau/chistr)

A player statistics viewer for World of Warships. At the start of a match, it pulls each player's personal and ship statistics - if available - from Wargaming's API and displays them.

If anything breaks, feel free to [raise an issue](https://github.com/patmanteau/chistr/issues) here on Github.

## Installation

1. Make sure your World of Warships client has replays enabled. Follow the instructions in this [Wargaming KB article](https://na.wargaming.net/support/kb/articles/517) or let [Aslain's Modpack](http://aslain.com/index.php?/topic/2020-0671-aslains-wows-modpack-installer-wpicture-preview/) do it for you.
1. Head over to the [Releases page](https://github.com/patmanteau/chistr/releases/latest) and download the latest release
1. Run the installer
1. Go to 'Settings'
   1. Get a Wargaming.net API key at [Wargaming's developer room](https://developers.wargaming.net/applications/)
      1. Login
      1. Go to 'My Applications'
      1. 'Add application'
      1. Choose a name
      1. Set 'Type' to 'Mobile'
      1. Paste the generated Application ID (easy to miss, the text is rather small) into your settings
   1. Select your server
   1. Enter the path to your World of Warships installation (e.g. 'C:\Games\World_of_Warships')
1. Hit 'Back' - you should be good to go now!

## Code of Conduct

To experienced players, statistics are useful when making tactical decisions. They are not a measure of a player's worth as a person. By using this tool, you agree NOT to use it to create a toxic environment in World of Warships or to belittle, bully, or harass other players. If you do not agree, you may not use the tool.

tl:dr; Use Chistr to improve and augment your own play, not to "prove" to other players that they suck and you don't.

#### Build Setup

In case you want to use the development version, clone this repo, cd into it, then:

``` bash
# install dependencies
yarn install

# serve electron application with hot reload
yarn electron:serve

# build electron application for production
yarn electron:build

# lint all JS/Vue component files in `src/`
yarn run lint

```

---


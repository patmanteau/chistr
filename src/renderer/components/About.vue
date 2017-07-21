<template>
  <div class="">
    <div class="head ui">
      <router-link class="text link" :to="{ name: 'statistics', params: {} }">
        <span><i class="fa fa-chevron-left" aria-hidden="true"></i> Back</span>
      </router-link>

    </div>
    <div class="container">
      <div class="centered">
        <span class="standout ui">Chistr <small>{{ version }}</small></span>
        <span class="author">Copyright &copy; 2017 Patrick Haas &lt;<a href="mailto:patmanteau@posteo.de" class="external-link" target="_blank">patmanteau@posteo.de</a>&gt;.</span>
        <span class="text ui"> Distributed under The MIT License.</span>
        <span class="text ui">Inspired by <a class="external-link text" href="https://github.com/tianweiliu/wows-stats" target="_blank">wows-stats</a>. PR courtesy of <a class="external-link text" href="http://wows-numbers.com" target="_blank">WoWS Stats &amp; Numbers</a>.</span>
        <span class="text ui">&lsquo;World of Warships&rsquo; is a registered trademark of <a href="https://eu.wargaming.net/" target="_blank" class="external-link text">Wargaming</a>.</span>
        <span class="github ui"><a href="https://github.com/patmanteau/chistr" class="external-link github" target="_blank"><i class="fa fa-github" aria-hidden="true"></i></a></span>
      </div>
    </div>
  </div>

</template>

<script type="text/javascript">
import { remote } from 'electron'

export default {
  name: 'about',
  data () {
    return {
      version: remote.app.getVersion()
    }
  }
}
</script>

<style scoped>
.standout {
  color: #555;
  font-size: 48px;
  font-weight: 100;
  font-family: 'Roboto Slab', serif;
  /*margin: 5px;*/
  text-align: center;
}

.standout small {
  color: #e73;
  font-size: 32px;
}

.author {
  color: #777;
  font-size: 16px;
  font-weight: 100;
  font-family: 'Roboto Slab', serif;
  margin: 0px 0px 30px 0;
  text-align: center;
}

.external-link {
  color: #777;
}

.heart {
  color: #f54;
  font-size: 14px;
  text-align: center;
}

.text {
  color: #777;
  font-size: 14px;
  /*font-family: 'Roboto Slab', serif;*/
}

.github {
  color: #333;
  font-size: 16px;
  margin: 10px 0px 0px 0px;
  /*font-family: 'Roboto Slab', serif;*/
}

.about-text {
  color: #777;
  font-size: 16px;
  font-weight: 100;
  font-family: 'Roboto Slab', serif;
  margin: 10px;
  text-align: center;
}

.head {
  height: 5vh;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh;
}

.centered {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;
  align-items: center;
  justify-content: center;
}
</style>

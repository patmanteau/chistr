<template>
  <div id="view">

    <template v-if="!hasData">
    <!-- <div id="header" class="ui">
      <router-link class="text link" :to="{ name: 'statistics', params: {} }">
        <span class="savebutton"><i class="fa fa-check-circle-o" aria-hidden="true"></i> Close</span>
      </router-link>
    </div> -->
    <div class="container" key="statsDisplay">
      <div class="centered">
        <h1 class="ui">Ahoy captain!</h1>
        <h2 class="ui">Waiting for your next battle to start.</h2>
        <!-- <span class="standout ui">Chistr <small>{{ version }}</small></span>
        <span class="author">Copyright &copy; 2017 Patrick Haas &lt;<a href="mailto:patmanteau@posteo.de" class="external-link" target="_blank">patmanteau@posteo.de</a>&gt;.</span>
        <span class="text ui"> Distributed under The MIT License.</span>
        <span class="text ui">Inspired by <a class="external-link text" href="https://github.com/tianweiliu/wows-stats" target="_blank">wows-stats</a>. PR courtesy of <a class="external-link text" href="http://wows-numbers.com" target="_blank">WoWS Stats &amp; Numbers</a>.</span>
        <span class="text ui">&lsquo;World of Warships&rsquo; is a registered trademark of <a href="https://eu.wargaming.net/" target="_blank" class="external-link text">Wargaming</a>.</span>
        <span class="text ui"><a class="external-link text" href="http://fontawesome.io" target="_blank">Font Awesome</a> icons by Dave Gandy.</span>
        <span class="github ui"><a href="https://github.com/patmanteau/chistr" class="external-link github" target="_blank"><i class="fa fa-github" aria-hidden="true"></i></a></span> -->
      </div>
    </div>
    </template>
    <template v-else>
    <div id="header">
      <span>
      <arena-info
        :active="active"
        :arena="arena">
      </arena-info>
      </span>
    </div>
    <div v-if="updateAvailable" class="ui update-warning"><a target="_blank" href="https://github.com/patmanteau/chistr/releases/latest">Update available. Click here to download.</a></div>
    <transition name="fade" mode="out-in">
      <div v-if="finishedLoading" id="maingrid" key="statsDisplay">
        <div class="gridcontainer">
        <player-list
          title="Foes"
          bordercolor="#f77"
          :finishedLoading="finishedLoading"
          :players="foes">
        </player-list>
        <p></p>
        <player-list
          title="Friends"
          bordercolor="#8f8"
          noheader="true"
          :finishedLoading="finishedLoading"
          :players="friends">
        </player-list>
        </div>
      </div>
      <div v-else-if="hasData" key="loadingScreen">
        <!-- <bar-spinner></bar-spinner> -->
        <circle-progress></circle-progress>
      </div>
    </transition>
    </template>
    <!-- <div v-if="finishedLoading">Finished Loading</div> -->
  </div>

</template>

<script type="text/javascript">
import { mapState, mapGetters } from 'vuex'
import { remote } from 'electron'
import ArenaInfo from './Statistics/ArenaInfo'
import PlayerList from './Statistics/PlayerList'
// import BarSpinner from './Statistics/Spinners/BarSpinner'
import CircleProgress from './Statistics/Spinners/CircleProgress'
import semver from 'semver'

export default {
  name: 'statistics',
  // components: { ArenaInfo, PlayerList, BarSpinner },
  components: { ArenaInfo, PlayerList, CircleProgress },

  computed: {
    ...mapState({
      arena: state => state.Arena.arena,
      hasData: state => state.Arena.hasData,
      active: state => state.Arena.active
      // players: state => state.Arena.players
    }),

    ...mapGetters([
      'friends',
      'foes',
      // 'players',
      'finishedLoading'
    ])
  },

  data () {
    return {
      updateAvailable: false
    }
  },

  mounted () {
    setInterval(() => {
      this.$store.dispatch('readArenaData')
    }, 1000)

    this.$http.get('https://api.github.com/repos/patmanteau/chistr/releases/latest')
      .then(response => {
        this.updateAvailable = semver.lt(remote.app.getVersion(), semver.clean(response.data.name))
      })
      .catch(error => {
        console.log(error)
        this.updateAvailable = false
      })
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.centered {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;
  align-items: center;
  justify-content: center;
}

h1 {
  color: #777;
  font-size: 40px;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  margin: 0px 10px 0px 10px;
  /*text-align: center;*/
}

h2 {
  color: #999;
  font-size: 20px;
  font-family: 'Archivo Narrow', sans-serif;
  font-weight: 500;
  margin: 0px 0px 0px 2px;
  /*text-align: center;*/
}


.update-warning {
  color: #c33;
  font-size: 13px;
  font-family: 'Archivo Narrow', sans-serif;
  font-weight: 500;
  margin: 0px;
  margin-bottom: 5px;
  text-align: center;
  border-top: 1px solid #c33;
  /* border-bottom: 1px solid #c33; */
}

.update-warning a {
  color: #c33;
  text-decoration: none;
}
</style>

<template>
  <div id="view">
    <template v-if="!hasData">
      <div
        key="statsDisplay"
        class="container"
      >
        <div class="centered">
          <h1 class="ui">
            Ahoy captain!
          </h1>
          <h2 class="ui">
            Waiting for your next battle to start.
          </h2>
        </div>
      </div>
    </template>
    <template v-else>
      <div id="header">
        <span>
          <arena-info
            :active="active"
            :arena="arena"
          />
        </span>
      </div>
      <div
        v-if="updateAvailable"
        class="ui update-warning"
      >
        <a
          target="_blank"
          href="https://github.com/patmanteau/chistr/releases/latest"
        >Update available. Click here to download.</a>
      </div>
      <transition
        name="fade"
        mode="out-in"
      >
        <div
          v-if="finishedLoading"
          id="maingrid"
          key="statsDisplay"
        >
          <div class="gridcontainer">
            <player-list
              title="Foes"
              bordercolor="#f77"
              :finished-loading="finishedLoading"
              :players="foes"
            />
            <div class="vspace" />
            <player-list
              title="Friends"
              bordercolor="#8f8"
              noheader="true"
              :finished-loading="finishedLoading"
              :players="friends"
            />
          </div>
        </div>
        <div
          v-else-if="hasData"
          key="loadingScreen"
        >
          <!-- <bar-spinner></bar-spinner> -->
          <circle-progress />
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
  name: 'Statistics',
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

.vspace {
  margin-bottom: 1em;
}
</style>

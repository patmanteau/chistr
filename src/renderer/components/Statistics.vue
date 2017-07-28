<template>
  <div id="view">
    <div id="header">
      <span>
      <arena-info
        :active="active"
        :arena="arena">
      </arena-info>
      </span>
    </div>
    <div v-if="updateAvailable" class="ui update-warning"><a target="_blank" href="https://github.com/patmanteau/chistr/releases/latest">Update available. Click here to download.</a></div>
    <transition appear name="fade">
      <div v-if="hasData" id="maingrid">
        <div class="gridcontainer">
        <player-list
          title="Foes"
          bordercolor="#f77"
          :players="foes"
          :filterby="filterstring">
        </player-list>
        <p></p>
        <player-list
          title="Friends"
          bordercolor="#8f8"
          noheader="true"
          :players="friends"
          :filterby="filterstring">
        </player-list>
        </div>
      </div>
    </transition>
    <!-- <div v-if="finishedLoading">Finished Loading</div> -->
  </div>
</template>

<script type="text/javascript">
import { mapState, mapGetters } from 'vuex'
import { remote } from 'electron'
import ArenaInfo from './Statistics/ArenaInfo'
import PlayerList from './Statistics/PlayerList'

export default {
  name: 'statistics',
  components: { ArenaInfo, PlayerList },

  computed: {
    ...mapState({
      arena: state => state.Arena.arena,
      hasData: state => state.Arena.hasData,
      active: state => state.Arena.active
    }),

    ...mapGetters([
      'friends',
      'foes',
      'finishedLoading'
    ])
  },

  data () {
    return {
      gridColumns: ['playerName', 'shipName', 'playerBattles', 'playerWinrate', 'playerAvgExp', 'playerAvgDmg', 'playerKdRatio'],
      filterstring: '',
      updateAvailable: false
    }
  },

  mounted () {
    setInterval(() => {
      this.$store.dispatch('readArenaData')
    }, 1000)

    this.$http.get('https://api.github.com/repos/patmanteau/chistr/releases/latest')
      .then(response => {
        this.updateAvailable = remote.app.getVersion() !== response.data.name
      })
      .catch(error => {
        console.log(error)
        this.updateAvailable = false
      })
  }
}
</script>

<style scoped>
.update-warning {
  color: #c33;
  font-size: 12px;
  font-weight: 100;
  font-family: 'Roboto Slab', serif;
  margin: 0px;
  margin-bottom: 5px;
  text-align: center;
  /* border-top: 1px solid #c33; */
  /*border-bottom: 1px solid #c33;*/
}

.update-warning a {
  color: #c33;
  text-decoration: none;
}
</style>

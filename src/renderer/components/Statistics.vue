<template>
  <div class="content colflexed">
    <div class="headgrid">
      <span>
      <arena-info
        :active="active"
        :arena="arena">
      </arena-info>
      </span>
      <span class="searchbox">
        <input v-model="filterstring" placeholder="Filter...">
      </span>
      <span><router-link :to="{ name: 'settings', params: {} }"><span class="text link">Settings</span></router-link> | <router-link :to="{ name: 'about', params: {} }"><span class="text link">About</span></router-link></span>
    </div>
    <transition appear name="fade">
      <div v-if="hasData" class="maingrid">
        <player-list
          title="Foes"
          bordercolor="#f77"
          :players="foes"
          :filterby="filterstring">
        </player-list>
        <p v-if="filterstring ===''"></p>
        <player-list
          title="Friends"
          bordercolor="#8f8"
          noheader="true"
          :players="friends"
          :filterby="filterstring">
        </player-list>
      </div>
    </transition>
    <!-- <div>
      <p class="footer">
        Inspired by <a href="https://github.com/tianweiliu/wows-stats">wows-stats</a> | PR courtesy of <a href="http://wows-numbers.com">WoWS Stats &amp; Numbers</a>
      </p>
    </div> -->
  </div>
</template>

<script type="text/javascript">
import { mapState, mapGetters } from 'vuex'
import ArenaInfo from './Statistics/ArenaInfo'
import PlayerList from './Statistics/PlayerList'

export default {
  name: 'statistics',
  components: { ArenaInfo, PlayerList },

  computed: {
    ...mapState({
      arena: state => state.Arena.arena,
      hasData: state => state.Arena.hasData,
      active: state => state.Arena.active,
      finishedLoading: state => state.Arena.finishedLoading
    }),

    ...mapGetters([
      'friends',
      'foes'
    ])
  },

  data () {
    return {
      gridColumns: ['playerName', 'shipName', 'playerBattles', 'playerWinrate', 'playerAvgExp', 'playerAvgDmg', 'playerKdRatio'],
      filterstring: ''
    }
  },

  mounted () {
    setInterval(() => {
      this.$store.dispatch('readArenaData')
    }, 1000)
  }
}
</script>

<style media="screen">
</style>

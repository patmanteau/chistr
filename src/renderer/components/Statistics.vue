<template>
  <div class="content colflexed">
    <div v-if="updateAvailable" class="update-warning"><a target="_blank" href="https://cloud.radaubox.de/s/Tdcqdsj60FFR5o1">Update available. Click here to download.</a></div>
    <div class="headgrid">
      <span>
      <arena-info
        :active="active"
        :arena="arena">
      </arena-info>
      </span>
      <span>
        <input v-model="filterstring" class="searchbox" placeholder="Filter...">
      </span>
      <span><router-link class="text link" :to="{ name: 'settings', params: {} }"><span>Settings</span></router-link> | <router-link class="text link" :to="{ name: 'about', params: {} }"><span>About</span></router-link></span>
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

      </p>
    </div> -->
  </div>
</template>

<script type="text/javascript">
import { mapState, mapGetters } from 'vuex'
import { remote } from 'electron'
import * as yaml from 'js-yaml'
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
      filterstring: '',
      updateAvailable: false
    }
  },

  mounted () {
    setInterval(() => {
      this.$store.dispatch('readArenaData')
    }, 1000)

    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV !== 'development') {
      this.$http.get('https://t.radaubox.de/chistr/latest.yml')
        .then(response => {
          const doc = yaml.safeLoad(response.data)
          this.updateAvailable = remote.app.getVersion() < doc.version
          console.log(remote.app.getVersion())
          console.log(doc.version)
        })
        .catch(error => {
          console.log(error)
          this.updateAvailable = false
        })
    }
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
  text-align: center;
  border-top: 1px solid #c33;
  /*border-bottom: 1px solid #c33;*/
}

.update-warning a {
  color: #c33;
  text-decoration: none;
}


.searchbox {
  /*box-sizing: border-box;
  justify-content: center;
  flex-grow: 1;*/
  /*flex: 1;*/
  /*width: 5%;
  padding: 3px 2px 3px 2px;
  overflow: hidden;
  list-style: none;*/
  width: 100%;
  padding: 4px 4px;
  margin: 8px 0;
  border: 1px solid #ddd;
  /*box-sizing: border-box;*/
}


</style>

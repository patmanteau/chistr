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
@import url(https://fonts.googleapis.com/css?family=Roboto+Condensed:400|Roboto:400|Roboto+Slab:400);

body {
  background-color: #f7f7f7;
  color: #333;
}

.maingrid {
  /*position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);*/
}

.digit {
  color: #ecf0f1;
  font-size: 150px;
  font-weight: 100;
  font-family: 'Roboto', serif;
  margin: 10px;
  text-align: center;
}

.footer {
  color: #333;
  font-size: 10px;
  font-weight: 400;
  font-family: 'Roboto', serif;
  margin: 10px;
  text-align: center;
}

.colflexed {
  display: flex;
  flex-direction: column;
  align-items: center;
  /*flex-grow: 1;*/
  /*flex-shrink: 1;*/
  /*flex-basis: auto;*/
  /*height: 100%;*/
  justify-content: center;
}

.rowflexed {
  display: flex;
  align-items: center;
}

.headgrid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 90%;
}

.maingrid {
  width: 100%;
  /*justify-content: center;*/
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
}
</style>

/*<style media="screen">
/*a {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}*/

.wrapper {
  margin: 0 auto;
}

/*h1, h2, h3 {
  text-align: center;
}*/

ul {
  list-style: none;
  padding-left: 5px;
}

.hint {
  font-size: 20pt;
}

.team {
  float: left;
  width: 50%;
}

.team .name {
  font-weight: bold;
}

.team li {
  float: left;
}

.player:hover {
  box-shadow: 0px 0px 5px 0px #222831;
}

.player {
  padding: 10px;
  background-color: #222831;
  margin: 5px;
  width: 225px;
  height: 260px;
}

.player .value{
  font-weight: bold;
}

.player .ship {
  margin-top: 5px;
  margin-bottom: 10px;
}

.player .key {
  color: #FBB040;
}

.player .small {
  font-size: 6pt;
}

.player .ship img {
  max-width: 100px;
}

.footer {
  clear: both;
  padding: 20px;
  text-align: center;
  width: 100%;
}
</style>*/

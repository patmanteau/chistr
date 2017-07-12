<template>
  <div class="colflexed">
    <arena-info
      :active="active"
      :arena="arena">
    </arena-info>
    <div class="colflexed" v-if="hasData">
      <player-list
        title="Friends"
        bordercolor="#00ff00"
        :players="friends">
      </player-list>
      <p></p>
      <player-list
        title="Foes"
        bordercolor="#ff0000"
        noheader="true"
        :players="foes">
      </player-list>
    </div>
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
      active: state => state.Arena.active
    }),

    ...mapGetters([
      'friends',
      'foes'
    ])
  },

  data () {
    return {
      gridColumns: ['playerName', 'shipName', 'playerBattles', 'playerWinrate', 'playerAvgExp', 'playerAvgDmg', 'playerKdRatio']
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
@import url(https://fonts.googleapis.com/css?family=Roboto+Condensed:400|Roboto:400);

body {
  background-color: #f7f7f7;
  color: #333;
}

table caption {
  font-family: 'Roboto', serif;
  font-weight: 400;
}

th {
  font-family: 'Roboto', serif;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
}

td {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
}

.text {
  color: #1abc9c;
  font-size: 40px;
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  margin-top:10px;
  margin-bottom: 10px;
  text-align: center;
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
}

.rowflexed {
  display: flex;
  flex-direction: row;
}

</style>

/*<style media="screen">
a {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}

.wrapper {
  margin: 0 auto;
}

h1, h2, h3 {
  text-align: center;
}

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

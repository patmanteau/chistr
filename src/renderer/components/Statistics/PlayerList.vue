<template>
  <div class="gridcontainer">
    <icon-row v-if="!noheader"></icon-row>
    <div v-for="(player, index) in filteredPlayers"
         :class="{'Rgrid--stripe': index % 2 === 0}"
         class="Rgrid grey-right-border">

      <!-- Player and ship name -->
      <div class="Rcell Rcell-1of3 grey-right-border" :style="trstyle">
          <span class="Rcontent text"><a v-if="player.accountId !== undefined"
             :href="wowsNumbersLink(player)"
             :title="wowsNumbersLink(player)"
             class="external-link"
             target="_blank">{{ player.playerName }}</a>
            <span v-else title="Can't visit this player, his profile is hidden" class="external-link disabled">{{ player.playerName }}</span>
          </span>
        <transition name="fade">
          <span class="Rcontent text" v-if="player.shipName"><i>{{ player.shipName }}</i></span>
        </transition>
      </div>

      <!-- Player stats -->
      <transition name="fade" mode="out-in">
        <div class="Rcell Rcell-1of3 grey-right-border" v-if="player.playerHasRecord" key="with-player-stats">
          <div class="Rcontent number">{{ player.playerBattles }}</div>
          <div class="Rcontent number text-centered" v-bind:class="winrateclass(player.playerBattles, player.playerWinrate)">{{ player.playerWinrate }}%</div>
          <div class="Rcontent number text-centered">{{ player.playerKdRatio | denan }}</div>
          <div class="Rcontent number text-subdued">{{ player.playerAvgDmg }}</div>
          <div class="Rcontent number text-subdued">{{ player.playerAvgExp }}</div>
        </div>
        <!-- No player stats -->
        <div class="Rcell Rcell-2of3 no-data" v-else key="without-player-stats">
          <span class="Rcontent text text-centered">This profile is hidden</span>
        </div>
      </transition>

      <!-- Ship stats -->
      <transition name="fade" mode="out-in">
        <div class="Rcell Rcell-1of3" v-if="player.shipHasRecord && player.shipBattles > 0" key="with-ship-stats">
          <div class="Rcontent number">{{ player.shipBattles }}</div>
          <div class="Rcontent number text-centered" :class="winrateclass(player.shipBattles, player.shipWinrate)">{{ player.shipWinrate }}%</div>
          <div class="Rcontent number" :class="prclass(player.shipBattles, personalrating(player))">{{ personalrating(player) | denan }}</div>
          <div class="Rcontent number text-centered">{{ player.shipKdRatio | denan }}</div>
          <div class="Rcontent number text-subdued">{{ player.shipAvgDmg}}</div>
          <div class="Rcontent number text-subdued">{{ player.shipAvgExp }}</div>
        </div>
        <!-- No ship stats -->
        <div class="Rcell Rcell-1of3" v-else-if="player.playerHasRecord" key="without-ship-stats">
          <span class="Rcontent text text-centered">First match with this ship</span>
        </div>
      </transition>
    </div>
    <icon-row v-if="noheader && filterby===''"></icon-row>
  </div>
</template>

<script type="text/javascript">
import { shell } from 'electron'
import IconRow from './PlayerList/IconRow'

export default {
  name: 'player-list',
  props: ['title', 'bordercolor', 'players', 'noheader', 'filterby'],
  components: { IconRow },

  filters: {
    denan (number) {
      if (isNaN(number) || !isFinite(number)) return '-'
      else if (!isFinite(number)) return '∞'
      else return number
    }
  },

  computed: {
    filteredPlayers () {
      let sorted = this.players.sort((a, b) => {
        if (a.playerWinrate < b.playerWinrate) return 1
        else if (a.playerWinrate > b.playerWinrate) return -1
        else return 0
      })

      if (this.filterby !== '') {
        return sorted.filter((element, index, array) => {
          for (let p in element) {
            let s = element[p].toString().toLowerCase()
            if (element.hasOwnProperty(p) && s.includes(this.filterby.toLowerCase())) {
              return true
            }
          }
          return false
        })
      } else {
        return sorted
      }
    }
  },

  methods: {
    wowsNumbersLink (player) {
      return `https://wows-numbers.com/player/${player.accountId},${player.playerName}`
    },

    personalrating (player) {
      console.log(this.expected)
      if (player.playerHasRecord && player.shipHasRecord && this.expected.data.hasOwnProperty(player.shipId)) {
        let exp = this.expected.data[player.shipId]

        // Calculation courtesy of http://wows-numbers.com/de/personal/rating
        let rDmg = player.shipAvgDmg / exp.average_damage_dealt
        let rWins = player.shipWinrate / exp.win_rate
        let rFrags = player.shipFrags / (exp.average_frags * player.shipBattles)

        let nDmg = Math.max(0, (rDmg - 0.4) / (1 - 0.4))
        let nWins = Math.max(0, (rWins - 0.7) / (1 - 0.7))
        let nFrags = Math.max(0, (rFrags - 0.1) / (1 - 0.1))

        let pr = (700 * nDmg + 300 * nFrags + 150 * nWins)
        return pr.toFixed()
      } else {
        return 0
      }
    },

    prclass (matches, pr) {
      if (matches < 10) return 'rating-nonsensical'
      else if (pr < 750) return 'rating-bad'
      else if (pr < 1100) return 'rating-subpar'
      else if (pr < 1350) return 'rating-par'
      else if (pr < 1550) return 'rating-good'
      else if (pr < 1750) return 'rating-verygood'
      else if (pr < 2100) return 'rating-great'
      else if (pr < 2450) return 'rating-unicum'
      else return 'rating-superunicum'
    },

    winrateclass (matches, rate) {
      if (matches < 10) return 'rating-nonsensical'
      else if (rate < 47) return 'rating-bad'
      else if (rate < 49) return 'rating-subpar'
      else if (rate < 52) return 'rating-par'
      else if (rate < 54) return 'rating-good'
      else if (rate < 56) return 'rating-verygood'
      else if (rate < 60) return 'rating-great'
      else if (rate < 65) return 'rating-unicum'
      else return 'rating-superunicum'
    },

    openInBrowser (url) {
      shell.openExternal(url)
    }
  },

  data () {
    return {
      expected: require('./expected'),
      names: {},
      trstyle: {
        'border-left-style': 'solid',
        'border-left-width': '2px',
        'border-left-color': this.bordercolor
      }
    }
  }
}
</script>

<style media="screen">
.Rgrid, .Rgrid--head {
  display: flex;
  /*flex-wrap: wrap;*/
  align-items: center;
  /*box-sizing: border-box;*/
  /*justify-content: center;*/
  margin: 0 5% 0 5%;
}

.grey-top-border {
  border-top-style: solid;
  border-top-width: 2px;
  border-top-color: #ddd;
}

.grey-bottom-border {
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-bottom-color: #ddd;
}

.grey-left-border {
  border-left-style: solid;
  border-left-width: 2px;
  border-left-color: #ddd;
}

.grey-right-border {
  border-right-style: solid;
  border-right-width: 2px;
  border-right-color: #ddd;
}

.white-left-border {
  border-left-style: solid;
  border-left-width: 2px;
  border-left-color: #f7f7f7;
}

.white-right-border {
  border-right-style: solid;
  border-right-width: 2px;
  border-right-color: #f7f7f7;
}

.Rgrid--stripe {
  background: #eee;
}

.Rgrid:hover {
  /*background-color: #ddd;*/
  box-shadow: inset 0 0 2px #777;
}

.Rcell, .Rcell-1of3, .Rcell-2of3, .Rcell-2of3 {
  display: flex;
  /*flex-grow: 1;*/
  /*justify-content: space-between;*/
  /*box-sizing: border-box;*/
  overflow: hidden;
}

.Rcell-1of3 { flex: 0 0 33.33%;}
.Rcell-2of3 { flex: 0 0 66.66%;}
.Rcell-3of3 { flex: 0 0 100%;}

.Rcontent {
  flex: 1;
  box-sizing: border-box;
  /*align-items: center;*/
  /*justify-content: center;*/
  padding: 3px 2px 3px 2px;
  align-self: center;
}

.text {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
  /*color: #1abc9c;
  font-size: 40px;
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  margin-top:10px;
  margin-bottom: 10px;
  text-align: center;*/
}

.number {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
}

.no-data {
  /*background: #ddd;*/
}

.text-subdued {
  color: #aaa;
  font-size: x-small;
}

.grey-background {
  background: #ddd;
}

.text-centered {
  text-align: center;
}

.text-align-right {
  text-align: right;
}

.text-align-left {
  text-align: left;
}

.external-link {
  color: #555;
  text-decoration: none;
  font-weight: bold;
}

.disabled {
  cursor: not-allowed;
}

.rating-nonsensical {
  color: #777;
}

.rating-bad {
  color: #fe0e00;
}

.rating-subpar {
  color: #fe7903;
}

.rating-par {
  color: #ffc71f;
}

.rating-good {
  color: #44b300;
}

.rating-verygood {
  color: #318000;
}

.rating-great {
  color: #02c9b3;
}

.rating-unicum {
  color: #d042f3;
}

.rating-superunicum {
  color: #a00dc5;
}
</style>

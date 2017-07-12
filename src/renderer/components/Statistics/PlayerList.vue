<template>
  <table class="player-table">
    <colgroup>
      <col class="col-player-name"><col class="col-ship-name">
      <col><col><col>
      <col class="col-avg-dmg"><col class="col-avg-exp">
      <col><col><col><col>
      <col class="col-avg-dmg"><col class="col-avg-exp">
    </colgroup>
    <thead>
      <tr v-if="!noheader">
        <th></th>
        <th></th>
        <th colspan="5" class="grey-bottom-border"><i class="fa fa-user" aria-hidden="true"></i></th>
        <th colspan="6" class="grey-bottom-border"><i class="fa fa-ship" aria-hidden="true"></i></th>
      </tr>
      <tr class="grey-bottom-border">
        <template v-if="!noheader">
        <!-- <th title="Player"><i class="fa fa-user" aria-hidden="true"></i></th>
        <th title="Ship"><i class="fa fa-ship" aria-hidden="true"></i></th> -->
        <th title="Player"></th>
        <th title="Ship"></th>
        <th title="# of battles for player"><i class="fa fa-repeat" aria-hidden="true"></i></th>
        <th title="Winrate"><i class="fa fa-pie-chart" aria-hidden="true"></i></th>
        <th title="Kill/Death ratio"><i class="fa fa-bullseye" aria-hidden="true"></i></th>
        <th title="Average damage"><i class="fa fa-rocket" aria-hidden="true"></i></th>
        <th title="Average experience"><i class="fa fa-line-chart" aria-hidden="true"></i></th>
        <th title="# of battles for player" class="td-grey-left-border"><i class="fa fa-repeat" aria-hidden="true"></i></th>
        <th title="Winrate"><i class="fa fa-pie-chart" aria-hidden="true"></i></th>
        <th title="Personal Rating for this ship">PR</th>
        <th title="Kill/Death ratio"><i class="fa fa-bullseye" aria-hidden="true"></i></th>
        <th title="Average damage"><i class="fa fa-rocket" aria-hidden="true"></i></th>
        <th title="Average experience"><i class="fa fa-line-chart" aria-hidden="true"></i></th>
        </template>
        <template v-else>
          <th colspan="13"></th>
        </template>
      </tr>
    </thead>
    <tbody>
      <template v-for="player in sortedPlayers" v-if="player.playerHasRecord">
      <tr :style="trstyle">
        <td>{{ player.playerName }}</td>
        <td>{{ player.shipName }}</td>
        <td class="td-number">{{ player.playerBattles }}</td>
        <td class="td-number" :class="winrateclass(player.playerBattles, player.playerWinrate)">{{ player.playerWinrate }}%</td>
        <td class="td-number">{{ player.playerKdRatio | denan }}</td>
        <td class="td-number text-subdued">{{ player.playerAvgDmg }}</td>
        <td class="td-number text-subdued">{{ player.playerAvgExp }}</td>
        <template v-if="player.shipHasRecord && player.shipBattles > 0">
          <td class="td-number grey-left-border">{{ player.shipBattles }}</td>
          <td class="td-number" :class="winrateclass(player.shipBattles, player.shipWinrate)">{{ player.shipWinrate }}%</td>
          <td class="td-number" :class="prclass(player.shipBattles, personalrating(player))">{{ personalrating(player) | denan }}</td>
          <td class="td-number">{{ player.shipKdRatio | denan }}</td>
          <td class="td-number text-subdued">{{ player.shipAvgDmg}}</td>
          <td class="td-number text-subdued">{{ player.shipAvgExp }}</td>
        </template>
        <template v-else>
          <td class="text-centered td-no-data" colspan="6">First match with this ship</td>
        </template>
      </tr>
      </template>
      <template v-else>
        <tr :style="trstyle">
          <td>{{ player.playerName }}</td>
          <td>{{ player.shipName }}</td>
          <td class="text-centered td-no-data" colspan="11">This profile is hidden</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script type="text/javascript">
// const jsonfile = require('jsonfile')

export default {
  name: 'player-list',
  props: ['title', 'bordercolor', 'players', 'noheader'],

  filters: {
    denan (number) {
      if (isNaN(number) || !isFinite(number)) return '-'
      else if (!isFinite(number)) return '∞'
      else return number
    }
  },

  computed: {
    sortedPlayers () {
      return this.players.sort((a, b) => {
        if (a.playerWinrate < b.playerWinrate) return 1
        else if (a.playerWinrate > b.playerWinrate) return -1
        else return 0
      })
    }
  },

  methods: {
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

<style scoped media="screen">
table tbody tr:nth-child(odd) {
  background: #eee;
}

table th, table td {
  padding: 2px;
}

table {
  border-collapse: collapse;
}

.player-table {
  width: 90%;
  table-layout: fixed;
}

.col-player-name {
  width: 20%;
}

.col-ship-name {
  width: 15%;
}

.col-avg-dmg {
  width: 4%;
}

.col-avg-exp {
  width: 4%;
}

.text-subdued {
  color: #aaa;
  font-size: x-small;
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

.text-centered {
  text-align: center;
}

.text-align-right {
  text-align: right;
}

.td-number {
  text-align: right;
}

.td-no-data {
  background: #ddd;
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

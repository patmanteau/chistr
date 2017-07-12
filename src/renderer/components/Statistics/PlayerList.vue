<template>
  <table class="player-table">
    <colgroup>
      <col class="col-player-name"><col class="col-ship-name"><col class="col-icon">
      <col class="col-battle-count"><col class="col-winrate"><col class="col-kd">
      <col class="col-avg-dmg"><col class="col-avg-exp"><col class="col-icon">
      <col class="col-battle-count"><col class="col-winrate"><col class="col-pr"><col class="col-kd">
      <col class="col-avg-dmg"><col class="col-avg-exp">
    </colgroup>
    <thead v-if="!noheader">
      <tr>
        <th title="Player"></th>
        <th title="Ship"></th>
        <th title="Player statistics" class="grey-left-border grey-top-border grey-background"><i class="fa fa-user text-centered" aria-hidden="true"></i></th>
        <th title="# of battles overall" class="grey-top-border"><i class="fa fa-repeat" aria-hidden="true"></i></th>
        <th title="Winrate" class="grey-top-border"><i class="fa fa-pie-chart" aria-hidden="true"></i></th>
        <th title="Kill/Death ratio" class="grey-top-border"><i class="fa fa-bullseye" aria-hidden="true"></i></th>
        <th title="Average damage" class="grey-top-border"><i class="fa fa-rocket" aria-hidden="true"></i></th>
        <th title="Average experience" class="grey-top-border"><i class="fa fa-line-chart" aria-hidden="true"></i></th>
        <th title="Ship statistics" class="grey-left-border grey-top-border grey-background"><i class="fa fa-ship text-centered" aria-hidden="true"></i></th>
        <th title="# of battles in this ship" class="grey-top-border"><i class="fa fa-repeat" aria-hidden="true"></i></th>
        <th title="Winrate" class="grey-top-border"><i class="fa fa-pie-chart" aria-hidden="true"></i></th>
        <th title="Personal Rating for this ship" class="grey-top-border">PR</th>
        <th title="Kill/Death ratio" class="grey-top-border text-centered"><i class="fa fa-bullseye" aria-hidden="true"></i></th>
        <th title="Average damage" class="grey-top-border"><i class="fa fa-rocket" aria-hidden="true"></i></th>
        <th title="Average experience" class="grey-top-border grey-right-border"><i class="fa fa-line-chart" aria-hidden="true"></i></th>
      </tr>
    </thead>
    <tfoot v-if="noheader">
      <tr>
        <th title="Player"></th>
        <th title="Ship"></th>
        <th title="Player statistics" class="grey-left-border grey-top-border grey-bottom-border grey-background"><i class="fa fa-user text-centered" aria-hidden="true"></i></th>
        <th title="# of battles overall" class="grey-top-border grey-bottom-border"><i class="fa fa-repeat" aria-hidden="true"></i></th>
        <th title="Winrate" class="grey-top-border grey-bottom-border"><i class="fa fa-pie-chart" aria-hidden="true"></i></th>
        <th title="Kill/Death ratio" class="grey-top-border grey-bottom-border"><i class="fa fa-bullseye" aria-hidden="true"></i></th>
        <th title="Average damage" class="grey-top-border grey-bottom-border"><i class="fa fa-rocket" aria-hidden="true"></i></th>
        <th title="Average experience" class="grey-top-border grey-bottom-border"><i class="fa fa-line-chart" aria-hidden="true"></i></th>
        <th title="Ship statistics" class="grey-top-border grey-left-border grey-bottom-border grey-background"><i class="fa fa-ship text-centered" aria-hidden="true"></i></th>
        <th title="# of battles in this ship" class="grey-top-border grey-bottom-border"><i class="fa fa-repeat" aria-hidden="true"></i></th>
        <th title="Winrate" class="grey-top-border grey-bottom-border"><i class="fa fa-pie-chart" aria-hidden="true"></i></th>
        <th title="Personal Rating for this ship" class="grey-top-border grey-bottom-border">PR</th>
        <th title="Kill/Death ratio" class="grey-top-border grey-bottom-border td-centered"><i class="fa fa-bullseye" aria-hidden="true"></i></th>
        <th title="Average damage" class="grey-top-border grey-bottom-border"><i class="fa fa-rocket" aria-hidden="true"></i></th>
        <th title="Average experience" class="grey-top-border grey-bottom-border grey-right-border"><i class="fa fa-line-chart" aria-hidden="true"></i></th>
      </tr>
    </tfoot>
    <tbody>
      <template v-for="player in sortedPlayers">
      <tr :style="trstyle">
        <td v-if="player.accountId !== undefined">
          <a :href="wowsNumbersLink(player)" :title="wowsNumbersLink(player)" class="external-link" target="_blank">{{ player.playerName }}</a>
        </td>
        <td v-else><span title="Can't visit this player, his profile is hidden" class="external-link disabled">{{ player.playerName }}</span></td>
        <td><i>{{ player.shipName }}</i></td>
        <template v-if="player.playerHasRecord">
          <td class="td-number grey-left-border" colspan="2">{{ player.playerBattles }}</td>
          <td class="td-number" v-bind:class="winrateclass(player.playerBattles, player.playerWinrate)">{{ player.playerWinrate }}%</td>
          <td class="td-number">{{ player.playerKdRatio | denan }}</td>
          <td class="td-number text-subdued">{{ player.playerAvgDmg }}</td>
          <td class="td-number text-subdued">{{ player.playerAvgExp }}</td>
          <template v-if="player.shipHasRecord && player.shipBattles > 0">
            <td class="td-number grey-left-border" colspan="2">{{ player.shipBattles }}</td>
            <td class="td-number" :class="winrateclass(player.shipBattles, player.shipWinrate)">{{ player.shipWinrate }}%</td>
            <td class="td-number" :class="prclass(player.shipBattles, personalrating(player))">{{ personalrating(player) | denan }}</td>
            <td class="text-centered">{{ player.shipKdRatio | denan }}</td>
            <td class="td-number text-subdued">{{ player.shipAvgDmg}}</td>
            <td class="td-number text-subdued grey-right-border">{{ player.shipAvgExp }}</td>
          </template>
          <template v-else>
            <td class="text-centered td-no-data" colspan="7">First match with this ship</td>
          </template>
        </template>
        <template v-else>
          <td class="text-centered td-no-data" colspan="13">This profile is hidden</td>
        </template>
      </tr>
      </template>
    </tbody>
  </table>
</template>

<script type="text/javascript">
// const jsonfile = require('jsonfile')
import { shell } from 'electron'

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

<style scoped media="screen">
table tbody tr:nth-child(odd) {
  background: #eee;
}

table tbody tr:hover {
  background-color: #ddd;
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
  width: 20%;
}

.col-icon {
  width: 3%;
}

.col-battle-count {
  width: 3.5%;
}

.col-winrate {
  width: 5%;
}

.col-kd {
  width: 4%;
}

.col-avg-dmg {
  width: 3%;
}

.col-avg-exp {
  width: 3%;
}

.col-pr {
  width: 4%;
}

.text-subdued {
  color: #aaa;
  font-size: x-small;
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

.td-number {
  text-align: right;
}

.td-no-data {
  background: #ddd;
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

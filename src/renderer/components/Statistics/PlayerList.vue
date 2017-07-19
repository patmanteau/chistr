<template>
  <!-- <div class="gridcontainer"> -->
  <transition-group name="flip-list" tag="div" class="gridcontainer">
    <icon-row v-if="!noheader" @set-sort="key => setSort(key)" key="header"></icon-row>
    <div v-for="(player, index) in filteredPlayers"
      :key="player.playerName"
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
        <transition name="fade" mode="out-in">
          <span class="Rcontent text" v-if="player.shipName">
            <a v-if="player.shipName !== ''"
              :href="wikiLink(player)"
              :title="wikiLink(player)"
              class="external-link"
              target="_blank"><i>{{ player.shipName }}</i>
            </a>
          </span>
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
        <!-- No player stats, not yet loaded -->
        <div class="Rcell Rcell-2of3 no-data" v-else-if="!player.playerFinishedLoading" key="without-player-stats-not-loaded">
          <span class="Rcontent text text-centered">Loading player</span>
        </div>
        <!-- No player stats at all -->
        <div class="Rcell Rcell-2of3 no-data" v-else key="without-player-stats">
          <span class="Rcontent text text-centered">This profile is hidden</span>
        </div>
      </transition>

      <!-- Ship stats -->
      <transition name="fade" mode="out-in">
        <div class="Rcell Rcell-1of3" v-if="player.shipHasRecord && player.shipBattles > 0" key="with-ship-stats">
          <div class="Rcontent number">{{ player.shipBattles }}</div>
          <div class="Rcontent number text-centered" :class="winrateclass(player.shipBattles, player.shipWinrate)">{{ player.shipWinrate }}%</div>
          <div class="Rcontent number" :class="prclass(player.shipBattles, player.shipPR)">{{ player.shipPR | denan }}</div>
          <div class="Rcontent number text-centered">{{ player.shipKdRatio | denan }}</div>
          <div class="Rcontent number text-subdued">{{ player.shipAvgDmg}}</div>
          <div class="Rcontent number text-subdued">{{ player.shipAvgExp }}</div>
        </div>
        <!-- No ship stats, not yet loaded -->
        <div class="Rcell Rcell-1of3 no-data" v-else-if="!player.shipFinishedLoading" key="without-ship-stats-not-loaded">
          <span class="Rcontent text text-centered">Loading ship</span>
        </div>
        <!-- No ship stats at all -->
        <div class="Rcell Rcell-1of3" v-else-if="player.playerHasRecord" key="without-ship-stats">
          <span class="Rcontent text text-centered">First match with this ship</span>
        </div>
      </transition>
    </div>
    <icon-row v-if="noheader && filterby===''" @set-sort="key => setSort(key)" key="footer"></icon-row>
  </transition-group>
  <!-- </div> -->
</template>

<script type="text/javascript">
import { shell } from 'electron'
import IconRow from './PlayerList/IconRow'
import { mapState } from 'vuex'

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
    ...mapState({
      sort: state => state.Interface.playerListSort
    }),

    filteredPlayers () {
      let sorted = this.players.sort((a, b) => {
        if (parseFloat(a[this.sort.key]) < parseFloat(b[this.sort.key])) return this.sort.order
        else if (parseFloat(a[this.sort.key]) > parseFloat(b[this.sort.key])) return this.sort.order * -1
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

    wikiLink (player) {
      return `http://wiki.wargaming.net/en/Ship:${player.shipName.replace(/\s/g, '_')}`
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

<template>
  <!-- <div class="gridcontainer"> -->
  <transition-group name="flip-list" tag="div">
    <icon-row v-if="!noheader" @set-sort="key => setSort(key)" key="header"></icon-row>
    <div v-for="(player, index) in filteredPlayers"
      :key="player.name"
      :class="{'dg-row--stripe': index % 2 === 0}"
      class="dg-row grey-right-border">

      <!-- Player and ship name -->
      <div class="dg-cellgroup dg-cellgroup-1of3 grey-right-border" :style="trstyle">
        <span class="dg-cell text">
          <a v-if="player.accountId !== undefined"
            :href="wowsNumbersLink(player)"
            :title="wowsNumbersLink(player)"
            class="external-link"
            target="_blank">{{ player.name }}</a>
            <span v-else title="Can't visit this player, his profile is hidden" class="external-link disabled">{{ player.name }}</span>
            <transition name="fade">
              <popper v-if="player.clan.hasRecord" trigger="hover" :options="{ placement: 'bottom' }">
                <div class="popper">
                  <div>{{ player.clan.name }}</div>
                  <div>Created {{ new Date(player.clan.createdAt * 1000).toLocaleString() }}</div>
                  <div>{{ player.clan.membersCount }} members</div>
                </div>
                <span slot="reference" class="popover ui text text-subdued">[{{ player.clan.tag }}]</span>
              </popper>

            </transition>
        </span>
        <transition name="fade" mode="out-in">
          <span class="dg-cell text" v-if="player.ship.name">
            <a v-if="player.ship.name !== ''"
              :href="wikiLink(player)"
              :title="wikiLink(player)"
              class="external-link"
              target="_blank"><i>{{ player.ship.name }}</i>
            </a>
          </span>
        </transition>
      </div>

      <!-- Player stats -->
      <!-- No player stats, not yet loaded -->
      <!-- <transition name="fade" mode="out-in"> -->
      <div class="dg-cellgroup dg-cellgroup-2of3 no-data" v-if="!player.personal.finishedLoading && !player.ship.finishedLoading" key="without-player-stats-not-loaded">
        <span class="dg-cell text text-centered ui">Loading player</span>
      </div>
      <!-- No player stats at all -->
      <div class="dg-cellgroup dg-cellgroup-2of3 no-data" v-else-if="!player.personal.hasRecord" key="without-player-stats">
        <span class="dg-cell text text-centered ui">This profile is hidden</span>
      </div>
      <div class="dg-cellgroup dg-cellgroup-1of3 grey-right-border ui" v-else key="with-player-stats">
        <div class="dg-cell number">{{ player.personal.battles }}</div>
        <div class="dg-cell number text-centered" v-bind:class="winrateclass(player.personal.battles, player.personal.winrate)">{{ player.personal.winrate.toFixed(2) }}%</div>
        <div class="dg-cell number text-centered">{{ player.personal.kdRatio | denan }}</div>
        <div class="dg-cell number text-subdued">{{ player.personal.avgDmg.toFixed(0) }}</div>
      </div>
      <!-- </transition> -->
      <!-- Ship stats -->
      <transition name="fade" mode="out-in">
      <div class="dg-cellgroup dg-cellgroup-1of3 ui" v-if="player.personal.finishedLoading && player.ship.finishedLoading && player.personal.hasRecord && player.ship.hasRecord && player.ship.battles" key="with-ship-stats">
        <div class="dg-cell number">{{ player.ship.battles }}</div>
        <div class="dg-cell number text-centered" :class="winrateclass(player.ship.battles, player.ship.winrate)">{{ player.ship.winrate.toFixed(2) }}%</div>
        <div class="dg-cell number" :class="prclass(player.ship.battles, player.ship.pr)">{{ player.ship.pr | denan(0) }}</div>
        <div class="dg-cell number text-centered">{{ player.ship.kdRatio | denan }}</div>
        <div class="dg-cell number text-subdued">{{ player.ship.avgDmg.toFixed(0) }}</div>
      </div>
      <!-- No ship stats at all -->
      <div class="dg-cellgroup dg-cellgroup-1of3 no-data" v-else-if="player.personal.finishedLoading && player.personal.hasRecord" key="without-ship-stats">
        <span class="dg-cell text text-centered">First battle in this ship</span>
      </div>
      </transition>
    </div>
    <icon-row v-if="noheader" @set-sort="key => setSort(key)" key="footer"></icon-row>
  </transition-group>
  <!-- </div> -->
</template>

<script type="text/javascript">
import _ from 'lodash/fp'
import { shell } from 'electron'
import IconRow from './PlayerList/IconRow'
import { mapState } from 'vuex'
import Popper from 'vue-popperjs'
import 'vue-popperjs/dist/css/vue-popper.css'

export default {
  name: 'player-list',
  props: ['title', 'bordercolor', 'players', 'noheader', 'filterby'],
  components: { IconRow, 'popper': Popper },

  filters: {
    denan (number, decimals = 2) {
      if (isNaN(number)) return '-'
      else if (!isFinite(number)) return '∞'
      else return number.toFixed(decimals)
    }
  },

  computed: {
    ...mapState({
      sort: state => state.Interface.playerListSort
    }),

    filteredPlayers () {
      return this.players.sort((a, b) => {
        if (parseFloat(_.get(this.sort.key, a)) < parseFloat(_.get(this.sort.key, b))) return this.sort.order
        else if (parseFloat(_.get(this.sort.key, a)) > parseFloat(_.get(this.sort.key, b))) return this.sort.order * -1
        else return 0
      })
      // if (this.filterby !== '') {
      //   return sorted.filter((element, index, array) => {
      //     for (let p in element) {
      //       let s = element[p].toString().toLowerCase()
      //       if (element.hasOwnProperty(p) && s.includes(this.filterby.toLowerCase())) {
      //         return true
      //       }
      //     }
      //     return false
      //   })
      // } else {
      //   return sorted
      // }
    }
  },

  methods: {
    wowsNumbersLink (player) {
      return `https://wows-numbers.com/player/${player.accountId},${player.name}`
    },

    wikiLink (player) {
      return `http://wiki.wargaming.net/en/Ship:${player.ship.name.replace(/\s/g, '_')}`
    },

    prclass (matches, pr) {
      return (matches < 10 || !pr || pr.isNaN)
        ? 'rating-nonsensical'
        : _.find(p => pr < p.r)([
          { r: 750, c: 'rating-bad' },
          { r: 1100, c: 'rating-subpar' },
          { r: 1350, c: 'rating-par' },
          { r: 1550, c: 'rating-good' },
          { r: 1750, c: 'rating-verygood' },
          { r: 2100, c: 'rating-great' },
          { r: 2450, c: 'rating-unicum' },
          { r: Infinity, c: 'rating-superunicum' }
        ]).c
    },

    winrateclass (matches, rate) {
      return (matches < 10 || !rate)
        ? 'rating-nonsensical'
        : _.find(p => rate < p.r)([
          { r: 47, c: 'rating-bad' },
          { r: 49, c: 'rating-subpar' },
          { r: 52, c: 'rating-par' },
          { r: 54, c: 'rating-good' },
          { r: 56, c: 'rating-verygood' },
          { r: 60, c: 'rating-great' },
          { r: 65, c: 'rating-unicum' },
          { r: Infinity, c: 'rating-superunicum' }
        ]).c
    },

    openInBrowser (url) {
      shell.openExternal(url)
    },

    maxLen (propname) {
      _.reduce((biggest, cur) => {
        return _.max([biggest, cur.length])
      }, 0)(this.players[propname])
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
.dg-row, .dg-row--head {
  display: flex;
}

.dg-row--stripe {
  background: #eee;
}

.dg-row:hover {
  box-shadow: inset 0 0 2px #777;
}

.dg-cellgroup, .dg-cellgroup-1of3, .dg-cellgroup-2of3, .dg-cellgroup-3of3, .dg-cellgroup-1of2, .dg-cellgroup-2of2 {
  display: flex;
  overflow: visible;
}

.dg-cellgroup-1of3 { flex: 1 1 33.33%;}
.dg-cellgroup-2of3 { flex: 1 1 66.66%;}
.dg-cellgroup-3of3 { flex: 1 1 100%;}

.dg-cellgroup-1of2 { flex: 1 1 50%;}
.dg-cellgroup-2of2 { flex: 1 1 100%;}

.dg-cell {
  flex: 1;
  padding: 3px 2px 3px 2px;
  align-self: center;
}

.dg-cell-small {
  flex: 0;
  padding: 3px 2px 3px 2px;
  align-self: center;
}

/* .popover {
  cursor: pointer;
}

.popover-body {
  background-color: #f7f7f7;
}

.popover-text {
  color: #aaa;
  font-size: x-small;
} */

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

<template>
  <div class="Rgrid--head white-left-border">
    <div class="Rcell Rcell-1of3 white-right-border">
      <div title="Player" class="Rcontent icon">&nbsp;</div>
      <div title="Ship" class="Rcontent icon">&nbsp;</div>
    </div>
    <div class="Rcell Rcell-1of3 grey-right-border">

      <div title="# of battles overall" class="Rcontent icon"
          :class="{ active: sort.key === 'playerBattles'}"
          @click="setSort('playerBattles')">
        <i class="fa fa-repeat" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerBattles' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerBattles' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Player winrate" class="Rcontent icon"
          :class="{ active: sort.key === 'playerWinrate'}"
          @click="setSort('playerWinrate')">
        <i class="fa fa-pie-chart" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerWinrate' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerWinrate' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Player Kill/Death ratio" class="Rcontent icon"
          :class="{ active: sort.key === 'playerKdRatio'}"
          @click="setSort('playerKdRatio')">
        <i class="fa fa-bullseye" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerKdRatio' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerKdRatio' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Player average damage" class="Rcontent icon"
          :class="{ active: sort.key === 'playerAvgDmg'}"
          @click="setSort('playerAvgDmg')">
        <i class="fa fa-rocket" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerAvgDmg' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerAvgDmg' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Player average experience" class="Rcontent icon"
          :class="{ active: sort.key === 'playerAvgExp'}"
          @click="setSort('playerAvgExp')">
        <i class="fa fa-line-chart" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerAvgExp' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'playerAvgExp' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>
    </div>
    <div class="Rcell Rcell-1of3 white-right-border">

      <div title="# of battles in this ship" class="Rcontent icon"
          :class="{ active: sort.key === 'shipBattles'}"
          @click="setSort('shipBattles')">
        <i class="fa fa-repeat" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipBattles' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipBattles' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Ship winrate" class="Rcontent icon"
          :class="{ active: sort.key === 'shipWinrate'}"
          @click="setSort('shipWinrate')">
        <i class="fa fa-pie-chart" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipWinrate' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipWinrate' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Player's Personal Rating for this ship" class="Rcontent icon"
          :class="{ active: sort.key === 'shipPR'}"
          @click="setSort('shipPR')">
        <span>PR</span>
        <i v-if="sort.key === 'shipPR' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipPR' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Ship Kill/Death ratio" class="Rcontent icon"
          :class="{ active: sort.key === 'shipKdRatio'}"
          @click="setSort('shipKdRatio')">
        <i class="fa fa-bullseye" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipKdRatio' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipKdRatio' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Ship average damage" class="Rcontent icon"
          :class="{ active: sort.key === 'shipAvgDmg'}"
          @click="setSort('shipAvgDmg')">
        <i class="fa fa-rocket" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipAvgDmg' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipAvgDmg' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>

      <div title="Ship average experience" class="Rcontent icon"
          :class="{ active: sort.key === 'shipAvgExp'}"
          @click="setSort('shipAvgExp')">
        <i class="fa fa-line-chart" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipAvgExp' && sort.order === 1" class="fa fa-sort-desc" aria-hidden="true"></i>
        <i v-if="sort.key === 'shipAvgExp' && sort.order === -1" class="fa fa-sort-asc" aria-hidden="true"></i>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { mapState } from 'vuex'

export default {
  name: 'icon-row',

  computed: {
    ...mapState({
      sort: state => state.Interface.playerListSort
    })
  },

  methods: {
    setSort (key) {
      this.$store.dispatch('setPlayerListSortKey', key)
    }
  }
}

</script>
<style media="screen">
.icon {
  color: #777;
  text-align: center;
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
}
</style>

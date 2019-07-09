<template>
  <div class="dg-row--head white-left-border">
    <!-- <div class="dg-cellgroup dg-cellgroup-1of3 white-right-border"> -->
    <div class="dg-cellgroup dg-cellgroup-5of20">
      <div title="Player" class="dg-cell icon ui">
        &nbsp;
      </div>
    </div>
    <div class="dg-cellgroup dg-cellgroup-4of20 white-right-border">
      <div title="Ship" class="dg-cell icon ui">
        &nbsp;
      </div>
    </div>
    <!-- <div class="dg-cellgroup dg-cellgroup-1of3 grey-right-border"> -->
    <div class="dg-cellgroup dg-cellgroup-5of20 grey-right-border">
      <div
        title="# of battles overall"
        class="dg-cell icon"
        :class="{ active: sort.key === 'personal.battles' }"
        @click="setSort('personal.battles')"
      >
        <i class="fa fa-redo" aria-hidden="true" />
        <i
          v-if="sort.key === 'personal.battles' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'personal.battles' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>

      <div
        title="Player winrate"
        class="dg-cell icon ui"
        :class="{ active: sort.key === 'personal.winrate' }"
        @click="setSort('personal.winrate')"
      >
        <i class="fa fa-chart-pie" aria-hidden="true" />
        <i
          v-if="sort.key === 'personal.winrate' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'personal.winrate' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>

      <div
        title="Player Kill/Death ratio"
        class="dg-cell icon"
        :class="{ active: sort.key === 'personal.kdRatio' }"
        @click="setSort('personal.kdRatio')"
      >
        <i class="fa fa-bullseye" aria-hidden="true" />
        <i
          v-if="sort.key === 'personal.kdRatio' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'personal.kdRatio' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>

      <div
        title="Player average damage"
        class="dg-cell icon"
        :class="{ active: sort.key === 'personal.avgDmg' }"
        @click="setSort('personal.avgDmg')"
      >
        <i class="fa fa-rocket" aria-hidden="true" />
        <i
          v-if="sort.key === 'personal.avgDmg' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'personal.avgDmg' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>
    </div>

    <div class="dg-cellgroup dg-cellgroup-6of20 white-right-border">
      <div
        title="# of battles in this ship"
        class="dg-cell icon"
        :class="{ active: sort.key === 'ship.battles' }"
        @click="setSort('ship.battles')"
      >
        <i class="fa fa-redo" aria-hidden="true" />
        <i
          v-if="sort.key === 'ship.battles' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'ship.battles' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>

      <div
        title="Ship winrate"
        class="dg-cell icon"
        :class="{ active: sort.key === 'ship.winrate' }"
        @click="setSort('ship.winrate')"
      >
        <i class="fa fa-chart-pie" aria-hidden="true" />
        <i
          v-if="sort.key === 'ship.winrate' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'ship.winrate' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>

      <div
        title="Player's Personal Rating for this ship"
        class="dg-cell icon ui"
        :class="{ active: sort.key === 'ship.pr' }"
        @click="setSort('ship.pr')"
      >
        <span>PR</span>
        <i
          v-if="sort.key === 'ship.pr' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'ship.pr' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>

      <div
        title="Ship Kill/Death ratio"
        class="dg-cell icon"
        :class="{ active: sort.key === 'ship.kdRatio' }"
        @click="setSort('ship.kdRatio')"
      >
        <i class="fa fa-bullseye" aria-hidden="true" />
        <i
          v-if="sort.key === 'ship.kdRatio' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'ship.kdRatio' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>

      <div
        title="Ship average damage"
        class="dg-cell icon"
        :class="{ active: sort.key === 'ship.avgDmg' }"
        @click="setSort('ship.avgDmg')"
      >
        <i class="fa fa-rocket" aria-hidden="true" />
        <i
          v-if="sort.key === 'ship.avgDmg' && sort.order === 1"
          class="fa fa-sort-down"
          aria-hidden="true"
        />
        <i
          v-if="sort.key === 'ship.avgDmg' && sort.order === -1"
          class="fa fa-sort-up"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { mapState } from "vuex";

export default {
  name: "IconRow",

  computed: {
    ...mapState({
      sort: state => state.Interface.playerListSort
    })
  },

  methods: {
    setSort(key) {
      this.$store.dispatch("setPlayerListSortKey", key);
    }
  }
};
</script>
<style media="screen">
.icon {
  color: #777;
  text-align: center;
  font-family: "Archivo Narrow", serif;
  font-weight: 400;
  font-size: 14px;
}
</style>

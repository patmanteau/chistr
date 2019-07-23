<template>
  <div>
    <icon-row v-if="!noheader" key="header" @set-sort="key => setSort(key)" />
    <div
      v-for="(player, index) in filteredPlayers()"
      :key="player.name"
      :class="{ 'dg-row--stripe': index % 2 === 0 }"
      class="dg-row grey-right-border"
    >
      <!-- Player name -->
      <div class="dg-cellgroup dg-cellgroup-5of20 ui" :style="trstyle">
        <div class="dg-cell text">
          <span
            v-if="player.clan.hasData"
            :title="player.clan.name"
            class="popover ui text text-small text-gray clan-tag"
          >
            [{{ player.clan.tag }}]
          </span>
          <a
            v-if="!player.profileHidden"
            :href="wowsNumbersLink(player)"
            :title="wowsNumbersLink(player)"
            class="external-link"
            target="_blank"
            >{{ player.name }}
          </a>
          <span
            v-else
            title="This player has hidden their profile"
            class="external-link disabled"
            >{{ player.name }}</span
          >
        </div>
      </div>

      <!-- Ship name -->
      <div class="dg-cellgroup dg-cellgroup-4of20 grey-right-border ui">
        <div class="dg-cell text">
          <div v-if="player.ship">
            <a
              v-if="player.ship.name !== ''"
              :href="wikiLink(player)"
              :title="wikiLink(player)"
              class="external-link"
              target="_blank"
              ><i>{{ player.ship.name }}</i>
              <font-awesome-icon
                v-if="player.ship.isPremium"
                title="Premium Ship"
                class="special-ship premium-ship"
                icon="star"
              />
              <font-awesome-icon
                v-if="player.ship.isTest"
                title="Ship is being tested"
                class="special-ship test-ship"
                icon="vial"
              />
            </a>
          </div>
        </div>
      </div>
      <!-- Player stats -->

      <!-- No player stats, not yet loaded -->
      <div
        v-if="!finishedLoading"
        key="without-player-stats-not-loaded"
        class="dg-cellgroup dg-cellgroup-11of20 no-data ui"
      >
        <span class="dg-cell text text-centered ui dg-loading"
          >Loading player</span
        >
      </div>

      <!-- Got no player stats at all -->
      <div
        v-else-if="
          player.personalStats.finishedLoading && !player.personalStats.hasData
        "
        key="without-player-stats"
        class="dg-cellgroup dg-cellgroup-11of20 no-data invisible-right-border ui"
      >
        <div
          class="dg-cell text text-centered ui"
          title="This player has hidden their profile"
        >
          <hr class="grey" />
        </div>
      </div>

      <!-- Got player stats -->
      <div
        v-else
        key="with-player-stats"
        class="dg-cellgroup dg-cellgroup-5of20 grey-right-border ui"
      >
        <div class="dg-cell number">
          {{ player.personalStats.battles }}
        </div>
        <div
          class="dg-cell number text-centered"
          :class="
            winrateclass(
              player.personalStats.battles,
              player.personalStats.winrate
            )
          "
        >
          {{ player.personalStats.winrate.toFixed(2) }}%
        </div>
        <div class="dg-cell number text-centered">
          {{ player.personalStats.kdRatio | denan }}
        </div>
        <div class="dg-cell number text-subdued">
          {{ player.personalStats.avgDmg.toFixed(0) }}
        </div>
      </div>

      <!-- Ship stats -->
      <div
        v-if="finishedLoading && player.shipStats.battles"
        key="with-ship-stats"
        class="dg-cellgroup dg-cellgroup-6of20 ui"
      >
        <div class="dg-cell number">
          {{ player.shipStats.battles }}
        </div>
        <div
          class="dg-cell number text-centered"
          :class="
            winrateclass(player.shipStats.battles, player.shipStats.winrate)
          "
        >
          {{ player.shipStats.winrate.toFixed(2) }}%
        </div>
        <div
          class="dg-cell number"
          :class="prclass(player.shipStats.battles, player.shipStats.pr)"
        >
          {{ player.shipStats.pr | denan(0) }}
        </div>
        <div class="dg-cell number text-centered">
          {{ player.shipStats.kdRatio | denan }}
        </div>
        <div class="dg-cell number text-subdued">
          {{ player.shipStats.avgDmg.toFixed(0) }}
        </div>
      </div>

      <!-- Got no ship stats at all -->
      <div
        v-else-if="
          player.personalStats.hasData &&
            player.shipStats.finishedLoading &&
            (!player.shipStats.hasData || !player.shipStats.battles)
        "
        key="without-ship-stats"
        class="dg-cellgroup dg-cellgroup-6of20 ui"
      >
        <div
          class="dg-cell text text-centered"
          title="This player fights his first battle in this ship"
        >
          <hr />
        </div>
      </div>
    </div>
    <icon-row v-if="noheader" key="footer" @set-sort="key => setSort(key)" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import _ from "lodash/fp";
import { shell } from "electron";
import IconRow from "./PlayerList/IconRow.vue";
// import { mapState } from "vuex";
import { State, Getter, Action, Mutation, namespace } from "vuex-class";
import Popper from "vue-popperjs";
// import 'vue-popperjs/dist/css/vue-popper.css'

@Component({
  name: "PlayerList",
  components: { IconRow, popper: Popper },

  filters: {
    denan(num: number, decimals: number = 2) {
      if (isNaN(num)) return "-";
      else if (!isFinite(num)) return "∞";
      else return num.toFixed(decimals);
    }
  },

  computed: {
    filteredPlayers() {
      const getter = _.get(this.sort.key);
      const orderFunc = _.orderBy(
        [p => getter(p)],
        this.sort.order > 0 ? ["desc"] : ["asc"]
      );

      const [withStats, woStats] = _.partition(p => getter(p), this.players);

      return _.concat(orderFunc(withStats), woStats);
    }
  },

  methods: {
    wowsNumbersLink(player) {
      return `https://wows-numbers.com/player/${player.accountId},${player.name}`;
    },

    wikiLink(player) {
      return `http://wiki.wargaming.net/en/Ship:${player.ship.name.replace(
        /\s/g,
        "_"
      )}`;
    },

    prclass(matches, pr) {
      return matches < 10 || !pr || pr.isNaN
        ? "rating-nonsensical"
        : _.find(p => pr < p.r)([
            { r: 750, c: "rating-bad" },
            { r: 1100, c: "rating-subpar" },
            { r: 1350, c: "rating-par" },
            { r: 1550, c: "rating-good" },
            { r: 1750, c: "rating-verygood" },
            { r: 2100, c: "rating-great" },
            { r: 2450, c: "rating-unicum" },
            { r: Infinity, c: "rating-superunicum" }
          ]).c;
    },

    winrateclass(matches, rate) {
      return matches < 10 || !rate
        ? "rating-nonsensical"
        : _.find(p => rate < p.r)([
            { r: 47, c: "rating-bad" },
            { r: 49, c: "rating-subpar" },
            { r: 52, c: "rating-par" },
            { r: 54, c: "rating-good" },
            { r: 56, c: "rating-verygood" },
            { r: 60, c: "rating-great" },
            { r: 65, c: "rating-unicum" },
            { r: Infinity, c: "rating-superunicum" }
          ]).c;
    },

    openInBrowser(url) {
      shell.openExternal(url);
    },

    maxLen(propname) {
      _.reduce((biggest, cur) => {
        return _.max([biggest, cur.length]);
      }, 0)(this.players[propname]);
    }
  }
})
export default class PlayerList extends Vue {
  @Prop({ default: "" }) private title!: string;
  @Prop({ default: "" }) private bordercolor!: string;
  @Prop() private players!: any;
  @Prop({ default: false }) private noheader!: boolean;
  @Prop({ default: false }) private finishedLoading!: boolean;

  @State(state => state.Interface.playerListSort) sort;

  data() {
    return {
      names: {},
      trstyle: {
        "border-left-style": "solid",
        "border-left-width": "2px",
        "border-left-color": this.bordercolor
      }
    };
  }
}
</script>

<style media="screen">
.dg-row,
.dg-row--head {
  display: flex;
}

.dg-row--stripe {
  background: #eee;
}

.dg-loading {
  /* margin: 2px; */
  background: #eee;
}

.dg-row:hover {
  box-shadow: inset 0 0 2px #777;
}

.dg-cellgroup,
.dg-cellgroup-1of3,
.dg-cellgroup-2of3,
.dg-cellgroup-3of3,
.dg-cellgroup-1of2,
.dg-cellgroup-2of2,
.dg-cellgroup-1of10,
.dg-cellgroup-2of10,
.dg-cellgroup-3of10,
.dg-cellgroup-4of10,
.dg-cellgroup-5of10,
.dg-cellgroup-6of10,
.dg-cellgroup-7of10,
.dg-cellgroup-8of10,
.dg-cellgroup-9of10,
.dg-cellgroup-10of10,
.dg-cellgroup-1of20,
.dg-cellgroup-2of20,
.dg-cellgroup-3of20,
.dg-cellgroup-4of20,
.dg-cellgroup-5of20,
.dg-cellgroup-6of20,
.dg-cellgroup-7of20,
.dg-cellgroup-8of20,
.dg-cellgroup-9of20,
.dg-cellgroup-10of20,
.dg-cellgroup-11of20,
.dg-cellgroup-12of20,
.dg-cellgroup-13of20,
.dg-cellgroup-14of20,
.dg-cellgroup-15of20,
.dg-cellgroup-16of20,
.dg-cellgroup-17of20,
.dg-cellgroup-18of20,
.dg-cellgroup-19of20,
.dg-cellgroup-20of20 {
  display: flex;
  overflow: visible;
}

.dg-cellgroup-1of3 {
  flex: 1 1 33.33%;
}
.dg-cellgroup-2of3 {
  flex: 1 1 66.66%;
}
.dg-cellgroup-3of3 {
  flex: 1 1 100%;
}

.dg-cellgroup-1of2 {
  flex: 1 1 50%;
}
.dg-cellgroup-2of2 {
  flex: 1 1 100%;
}

.dg-cellgroup-1of10 {
  flex: 1 1 10%;
}
.dg-cellgroup-2of10 {
  flex: 1 1 20%;
}
.dg-cellgroup-3of10 {
  flex: 1 1 30%;
}
.dg-cellgroup-4of10 {
  flex: 1 1 40%;
}
.dg-cellgroup-5of10 {
  flex: 1 1 50%;
}
.dg-cellgroup-6of10 {
  flex: 1 1 60%;
}
.dg-cellgroup-7of10 {
  flex: 1 1 70%;
}
.dg-cellgroup-8of10 {
  flex: 1 1 80%;
}
.dg-cellgroup-9of10 {
  flex: 1 1 90%;
}
.dg-cellgroup-10of10 {
  flex: 1 1 100%;
}

.dg-cellgroup-1of20 {
  flex: 1 1 5%;
}
.dg-cellgroup-2of20 {
  flex: 1 1 10%;
}
.dg-cellgroup-3of20 {
  flex: 1 1 15%;
}
.dg-cellgroup-4of20 {
  flex: 1 1 20%;
}
.dg-cellgroup-5of20 {
  flex: 1 1 25%;
}
.dg-cellgroup-6of20 {
  flex: 1 1 30%;
}
.dg-cellgroup-7of20 {
  flex: 1 1 35%;
}
.dg-cellgroup-8of20 {
  flex: 1 1 40%;
}
.dg-cellgroup-9of20 {
  flex: 1 1 45%;
}
.dg-cellgroup-10of20 {
  flex: 1 1 50%;
}
.dg-cellgroup-11of20 {
  flex: 1 1 55%;
}
.dg-cellgroup-12of20 {
  flex: 1 1 60%;
}
.dg-cellgroup-13of20 {
  flex: 1 1 65%;
}
.dg-cellgroup-14of20 {
  flex: 1 1 70%;
}
.dg-cellgroup-15of20 {
  flex: 1 1 75%;
}
.dg-cellgroup-16of20 {
  flex: 1 1 80%;
}
.dg-cellgroup-17of20 {
  flex: 1 1 85%;
}
.dg-cellgroup-18of20 {
  flex: 1 1 90%;
}
.dg-cellgroup-19of20 {
  flex: 1 1 95%;
}
.dg-cellgroup-20of20 {
  flex: 1 1 100%;
}

.dg-cell {
  flex: 1;
  padding: 2px 2px;
  align-self: center;
}

.dg-cell-small {
  flex: 1;
  flex-grow: 0;
  /* flex-shrink: 10; */
  padding: 2px 2px;
  align-self: center;
}

/* .hidden {
  margin: 2px 20px 2px 22px;
  color: #ddd;
  background-color: #dadada;
} */

hr {
  display: block;
  width: 60%;
  height: 1px;
  border: 0;
  border-top: 1px solid #ccc;
  /* border-bottom: 1px solid #ccc; */
  padding: 0;
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

.invisible-left-border {
  border-left-style: solid;
  border-left-width: 2px;
  border-left-color: #f2f2f2;
}

.invisible-right-border {
  border-right-style: solid;
  border-right-width: 2px;
  border-right-color: #f2f2f2;
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

.special-ship {
  font-size: 10pt;
  vertical-align: baseline;
  margin-left: 4px;
}

.premium-ship {
  color: #ffc71f;
}

.test-ship {
  color: #3686fd;
}
</style>

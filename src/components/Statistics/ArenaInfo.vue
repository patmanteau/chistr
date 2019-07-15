<template>
  <div class="rowflexed">
    <transition name="fade" mode="out-in">
      <div v-if="active" class="ui">
        <img
          :src="matchInfo.matchGroup | matchGroupImg"
          class="type-image ui"
          height="40"
        />
      </div>
    </transition>
    <div class="ui">
      <transition name="fade" mode="out-in">
        <h1 v-if="active" :title="matchInfo.mapDescription">
          <!-- {{ arena.mapName | translateMapName }} -->
          {{ matchInfo.mapName | uppercase }}
        </h1>
        <h1 v-else>
          No active match
        </h1>
      </transition>
    </div>
    <div class="header-item ui">
      <transition name="fade" mode="out-in">
        <h2 class="header-item">
          {{ matchInfo.matchGroup | translateMatchGroup }}<br />
          {{ matchInfo.lastMatchDate }}
        </h2>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
// import _ from "lodash/fp";

const battleTypes = require("./../../data/battle-types.json");
const mapNames = require("./../../data/map-names.json");

const ArenaInfoProps = Vue.extend({
  props: ["active", "arena"]
});

@Component({
  name: "ArenaInfo",
  filters: {
    translateMapName(name: string) {
      return name ? mapNames[name].toUpperCase() : "";
    },

    translateMatchGroup(name: string) {
      return name ? battleTypes[name.toUpperCase()]["name"] : "";
    },

    uppercase(name: string) {
      return name.toUpperCase();
    },

    matchGroupImg(name: string) {
      return name ? battleTypes[name.toUpperCase()].image : "";
    }
  }
  // props: ["active", "arena"]
})
export default class ArenaInfo extends Vue {
  @Prop({ default: false }) active: boolean;
  @Prop() matchInfo;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

h1 {
  color: #777;
  font-size: 40px;
  font-family: "Oswald", sans-serif;
  font-weight: 500;
  margin: 0px 10px 0px 10px;
  /*text-align: center;*/
}

h2 {
  color: #999;
  font-size: 18px;
  font-family: "Archivo Narrow", sans-serif;
  line-height: 1.1;
  font-weight: 500;
  margin: 0px 0px -1px 2px;
  /*text-align: center;*/
}

.type-image {
  margin-top: 8px;
}
</style>

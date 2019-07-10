<template>
  <div class="rowflexed">
    <transition name="fade" mode="out-in">
      <div v-if="active" class="ui">
        <img
          :src="arena.matchGroup | matchGroupImg"
          class="type-image ui"
          height="40"
        />
      </div>
    </transition>
    <div class="ui">
      <transition name="fade" mode="out-in">
        <h1 v-if="active" :title="arena.mapDescription">
          <!-- {{ arena.mapName | translateMapName }} -->
          {{ arena.mapName | uppercase }}
        </h1>
        <h1 v-else>
          No active match
        </h1>
      </transition>
    </div>
    <div class="header-item ui">
      <transition name="fade" mode="out-in">
        <h2 class="header-item">
          {{ arena.matchGroup | translateMatchGroup }}<br />
          {{ arena.lastMatchDate }}
        </h2>
      </transition>
    </div>
  </div>
</template>

<script>
import _ from "lodash/fp";
import battleTypes from "./../../data/battle-types.json";
import mapNames from "./../../data/map-names.json";

export default {
  filters: {
    translateMapName(name) {
      return name ? mapNames[name].toUpperCase() : "";
    },

    translateMatchGroup(name) {
      return name ? battleTypes[name.toUpperCase()]["name"] : "";
    },

    uppercase(name) {
      return name.toUpperCase();
    },

    matchGroupImg(name) {
      return name ? battleTypes[_.upperCase(name)].image : "";
    }
  },
  props: ["active", "arena"]
};
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

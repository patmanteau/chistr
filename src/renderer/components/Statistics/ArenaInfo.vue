<template>
  <div class="rowflexed">
    <div>
      <transition name="fade" mode="out-in">
        <h1 v-if="active">{{ arena.mapName | translateMapName }}</h1>
        <h1 v-else>No active match</h1>
      </transition>
    </div>
    <transition name="fade" mode="out-in">
      <div v-if="active">
        <img :src="arena.matchGroup | matchGroupImg" class="type-image" height="40"></img>
      </div>
    </transition>
    <div class="header-item">
      <transition name="fade" mode="out-in">
        <h2 class="header-item">
          {{ arena.matchGroup | translateMatchGroup }}<br>
          {{ arena.lastMatchDate }}
        </h2>
      </transition>
    </div>
  </div>
</template>

<script>
import _ from 'lodash/fp'
import battleTypes from './../../../data/battle-types.json'
import mapNames from './../../../data/map-names.json'

export default {
  props: ['active', 'arena'],
  filters: {
    translateMapName (name) {
      return name
        ? mapNames[name]
        : ''
    },

    translateMatchGroup (name) {
      return name
        ? battleTypes[name.toUpperCase()]['name']
        : ''
    },

    matchGroupImg (name) {
      return name
        ? battleTypes[_.upperCase(name)].image
        : ''
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0
}

h1 {
  color: #777;
  font-size: 40px;
  font-family: 'Roboto Slab', serif;
  font-weight: 400;
  margin: 0px 40px 0px 0px;
  /*text-align: center;*/
}

h2 {
  color: #999;
  font-size: 15px;
  font-family: 'Roboto Slab', serif;
  font-weight: 400;
  margin: 0px 0px 0px 2px;
  /*text-align: center;*/
}

.type-image {
  margin-top: 4px;
}
</style>

<template>
  <div class="rowflexed">
    <div>
      <transition name="fade" mode="out-in">
        <h1 v-if="active">{{ arena.mapname | getmapname }}</h1>
        <h1 v-else>No active match</h1>
      </transition>
    </div>
    <div>
      <transition name="fade" mode="out-in">
        <h2 v-if="active">
          {{ arena.matchGroup | getmatchgroup }}<br>
          {{ arena.lastMatchDate }}
        </h2>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  props: ['active', 'arena'],
  filters: {
    getmapname (name) {
      const names = {
        'i01_tutorial': 'Tutorial',
        'r01_military_navigation': 'Riposte',
        '00_CO_ocean': 'Ocean',
        '01_solomon_islands': 'Solomon Islands',
        '04_Archipelago': 'Archipelago',
        '05_Ring': 'Ring',
        '08_NE_passage': 'Passage',
        '10_NE_big_race': 'Big Race',
        '13_OC_new_dawn': 'New Dawn',
        '14_Atlantic': 'Atlantic',
        '15_NE_north': 'North',
        '16_OC_bees_to_honey': 'Bees to Honey',
        '17_NA_fault_line': 'Fault Line',
        '18_NE_ice_islands': 'Ice Islands',
        '19_OC_prey': 'Prey',
        '20_NE_two_brothers': 'Two Brothers',
        '22_tierra_del_fuego': 'Tierra del Fuego',
        '23_Shards': 'Shards',
        '25_sea_hope': 'Sea Hope',
        '28_naval_mission': 'Naval Mission',
        '33_new_tierra': 'New Tierra',
        '34_OC_islands': 'Islands',
        '35_NE_north_winter': 'North Winter',
        '37_Ridge': 'Ridge',
        '38_Canada': 'Canada',
        '40_Okinawa': 'Okinawa',
        '41_Conquest': 'Conquest',
        '42_Neighbors': 'Neighbors',
        '44_Path_warrior': 'Path Warrior',
        '45_Zigzag': 'Zigzag',
        '46_Estuary': 'Estuary',
        '50_Gold_harbor': 'Gold Harbor'
      }
      return names[name]
    },

    getmatchgroup (name) {
      const names = {
        'ranked': 'Ranked match',
        'pvp': 'Random match',
        'pve': 'PvE match'
      }
      return names[name]
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
  margin: 4px 4px 0px 0px;
  /*text-align: center;*/
}

h2 {
  color: #999;
  font-size: 14px;
  font-family: 'Roboto Slab', serif;
  font-weight: 400;
  margin: 4px 4px 0px 20px;
  /*text-align: center;*/
}
</style>

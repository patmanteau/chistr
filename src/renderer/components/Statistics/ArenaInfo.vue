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
        's01_NavalBase': 'Killer Whale',
        's02_Naval_Defense': 'Naval Station Newport',
        's03_Labyrinth': 'Labyrinth',
        's05_Dunkirk': 'Dynamo',
        '00_CO_ocean': 'Ocean',
        '01_solomon_islands': 'Solomon Islands',
        '04_Archipelago': 'Archipelago',
        '05_Ring': 'Ring',
        '08_NE_passage': 'Strait',
        '10_NE_big_race': 'Big Race',
        '13_OC_new_dawn': 'New Dawn',
        '14_Atlantic': 'The Atlantic',
        '15_NE_north': 'North',
        '16_OC_bees_to_honey': 'Hotspot',
        '17_NA_fault_line': 'Fault Line',
        '18_NE_ice_islands': 'Islands of Ice',
        '19_OC_prey': 'Trap',
        '20_NE_two_brothers': 'Two Brothers',
        '22_tierra_del_fuego': 'Land of Fire',
        '23_Shards': 'Shards',
        '25_sea_hope': 'Sea of Fortune',
        '28_naval_mission': 'Tears of the Desert',
        '33_new_tierra': 'Polar',
        '34_OC_islands': 'Islands',
        '35_NE_north_winter': 'Northern Lights',
        '37_Ridge': 'Mountain Range',
        '38_Canada': 'Shatter',
        '40_Okinawa': 'Okinawa',
        '41_Conquest': 'Trident',
        '42_Neighbors': 'Neighbors',
        '44_Path_warrior': 'Warrior\'s Path',
        '45_Zigzag': 'Loop',
        '46_Estuary': 'Estuary',
        '50_Gold_harbor': 'Haven'
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
  margin: 0px 4px 0px 0px;
  /*text-align: center;*/
}

h2 {
  color: #999;
  font-size: 14px;
  font-family: 'Roboto Slab', serif;
  font-weight: 400;
  margin: 0px 4px 0px 20px;
  /*text-align: center;*/
}
</style>

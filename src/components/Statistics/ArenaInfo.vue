<template>
  <div class="rowflexed">
    <div class="ui">
      <img :src="type | typeImg" class="type-image" height="50" />
    </div>
    <div class="ui">
      <h1 :title="description">{{ name | uppercase }}</h1>
    </div>
    <div class="header-item ui">
      <h2>
        {{ type | translateType }}<br />
        {{ timestamp }}
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

const battleTypes = require("@/data/battle-types.json");
const mapNames = require("@/data/map-names.json");

@Component({
  name: "ArenaInfo",
  filters: {
    translateName(name: string) {
      return name ? mapNames[name].toUpperCase() : "";
    },

    translateType(name: string) {
      return name ? battleTypes[name.toUpperCase()]["name"] : "";
    },

    uppercase(name: string) {
      return name.toUpperCase();
    },

    typeImg(name: string) {
      return name ? battleTypes[name.toUpperCase()].image : "";
    }
  }
})
export default class ArenaInfo extends Vue {
  @Prop({ default: false }) active: boolean;
  @Prop({ default: "" }) description;
  @Prop({ default: "" }) type;
  @Prop({ default: "" }) name;
  @Prop({ default: "" }) timestamp;
}
</script>

<style scoped>
h1 {
  color: #777;
  font-size: 40px;
  font-family: "Oswald", sans-serif;
  font-weight: 500;
  margin: 0px 10px 0px 10px;
}

h2 {
  color: #999;
  font-size: 18px;
  font-family: "Archivo Narrow", sans-serif;
  line-height: 1.1;
  font-weight: 500;
  margin: 0px 0px -1px 2px;
}

.type-image {
  margin-top: 8px;
}
</style>

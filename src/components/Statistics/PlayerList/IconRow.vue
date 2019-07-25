<template>
  <div class="dg-row--head white-left-border ui">
    <!-- <div class="dg-cellgroup dg-cellgroup-1of3 white-right-border"> -->
    <div class="dg-cellgroup dg-cellgroup-5of20">
      <div title="Player" class="dg-cell">
        &nbsp;
      </div>
    </div>
    <div class="dg-cellgroup dg-cellgroup-4of20 white-right-border">
      <div title="Ship" class="dg-cell">
        &nbsp;
      </div>
    </div>
    <!-- <div class="dg-cellgroup dg-cellgroup-1of3 grey-right-border"> -->
    <div class="dg-cellgroup dg-cellgroup-5of20 grey-right-border">
      <sortable-icon
        title="# of battles overall"
        class="dg-cell icon"
        sort-field="personalStats.battles"
        icon="redo"
      />
      <sortable-icon
        title="Player winrate"
        class="dg-cell icon"
        sort-field="personalStats.winrate"
        icon="chart-pie"
      />
      <sortable-icon
        title="Player Kill/Death ratio"
        class="dg-cell icon"
        sort-field="personalStats.kdRatio"
        icon="bullseye"
      />
      <sortable-icon
        title="Player average damage"
        class="dg-cell icon"
        sort-field="personalStats.avgDmg"
        icon="rocket"
      />
    </div>

    <div class="dg-cellgroup dg-cellgroup-6of20 white-right-border">
      <sortable-icon
        title="# of battles in this ship"
        class="dg-cell icon"
        sort-field="shipStats.battles"
        icon="redo"
      />
      <sortable-icon
        title="Ship winrate"
        class="dg-cell icon"
        sort-field="shipStats.winrate"
        icon="chart-pie"
      />
      <sortable-icon
        title="Player's Personal Rating for this ship"
        class="dg-cell icon"
        sort-field="shipStats.pr"
        text="PR"
      />
      <sortable-icon
        title="Ship Kill/Death ratio"
        class="dg-cell icon"
        sort-field="shipStats.kdRatio"
        icon="bullseye"
      />
      <sortable-icon
        title="Ship average damage"
        class="dg-cell icon"
        sort-field="shipStats.avgDmg"
        icon="rocket"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { State } from "vuex-class";
import SortableIcon from "./SortableIcon.vue";

@Component({
  name: "IconRow",
  components: { SortableIcon }
})
export default class IconRow extends Vue {}
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

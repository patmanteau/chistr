<template>
  <div
    :title="title"
    :class="{ active: sort.key === sortField }"
    @click="setSort(sortField)"
  >
    <font-awesome-icon v-if="icon" :icon="icon" />
    <span v-else-if="text">{{ text }}</span>
    <font-awesome-icon
      icon="sort-down"
      v-if="sort.key === sortField && sort.order === 1"
      aria-hidden="true"
    />
    <font-awesome-icon
      icon="sort-up"
      v-if="sort.key === sortField && sort.order === -1"
      aria-hidden="true"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { State } from "vuex-class";

@Component({
  name: "SortableIcon"
})
export default class Statistics extends Vue {
  @Prop() private title!: string;
  @Prop() private sortField!: string;
  @Prop() private icon!: string;
  @Prop() private text!: string;
  @State(state => state.Interface.playerListSort) sort: any;

  setSort(key: string) {
    this.$store.dispatch("setPlayerListSortKey", key);
  }
}
</script>
<style scoped media="screen">
/* .icon {
  color: #777;
  text-align: center;
  font-family: "Archivo Narrow", serif;
  font-weight: 400;
  font-size: 14px;
} */
</style>

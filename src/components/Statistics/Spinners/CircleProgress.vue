<template>
  <div class="spinnercontainer">
    <div id="progressbar" />
    <random-sentence />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import RandomSentence from "./RandomSentence.vue";
import { mapGetters } from "vuex";
import ProgressBar from "progressbar.js";
// const ProgressBar = import("progressbar.js");
import { Getter } from "vuex-class";

@Component({
  name: "CircleProgress",
  components: { RandomSentence }
})
export default class CircleProgress extends Vue {
  options = {
    color: "#777",
    strokeWidth: 8,
    trailWidth: 4,
    easing: "linear",
    duration: 100,
    className: "progressbar-text",
    warnings: false
  };
  bar!: ProgressBar.Circle;

  @Getter private progress!: number;

  @Watch("progress")
  onProgressChanged(newValue: number, _oldValue: number) {
    this.bar.animate(newValue);
    this.bar.setText(`${(newValue * 100).toFixed()}%`);
  }

  mounted() {
    this.bar = new ProgressBar.Circle("#progressbar", this.options);
  }
}
</script>

<style scoped>
.spinnercontainer {
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#progressbar {
  color: #777;
  margin: 20px;
  width: 120px;
  height: 120px;
  text-align: center;
  font-family: "Archivo Narrow";
  font-size: 24px;
}
</style>

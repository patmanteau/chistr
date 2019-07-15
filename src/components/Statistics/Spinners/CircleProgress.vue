<template>
  <div class="spinnercontainer">
    <!-- <progress-bar class="progressbar" type="circle" ref="circle" :options="options"></progress-bar> -->
    <div id="progressbar" />
    <random-sentence />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import RandomSentence from "./RandomSentence.vue";
import { mapGetters } from "vuex";
import ProgressBar from "progressbar.js";

const CircleProgressProps = Vue.extend({
  props: ["bar", "options"]
});

@Component({
  name: "CircleProgress",
  components: { RandomSentence },

  computed: {
    ...mapGetters(["progress"])
  },

  watch: {
    progress(newValue, _oldValue) {
      this.bar.animate(newValue);
      this.bar.setText(`${(newValue * 100).toFixed()}%`);
    }
  }
})
export default class CircleProgress extends CircleProgressProps {
  data() {
    return {
      options: {
        color: "#777",
        strokeWidth: 8,
        trailWidth: 4,
        easing: "linear",
        duration: 100,
        className: "progressbar-text",
        warnings: false
      }
    };
  }

  // progress!: (newValue, _oldValue) => number;

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

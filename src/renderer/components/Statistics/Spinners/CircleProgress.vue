<template>
  <div class="spinnercontainer">
    <!-- <progress-bar class="progressbar" type="circle" ref="circle" :options="options"></progress-bar> -->
    <div id="progressbar"></div>
    <random-sentence></random-sentence>
  </div>
</template>

<script type="text/javascript">
import RandomSentence from './RandomSentence'
import { mapGetters } from 'vuex'
import ProgressBar from 'progressbar.js'
export default {
  name: 'circle-progress',
  components: { RandomSentence },

  computed: {
    ...mapGetters([
      'progress'
    ])
  },

  watch: {
    progress (newValue, oldValue) {
      this.bar.animate(newValue)
      this.bar.setText(`${(newValue * 100).toFixed()}%`)
    }
  },

  data () {
    return {
      options: {
        color: '#777',
        strokeWidth: 8,
        trailWidth: 2,
        easing: 'linear',
        duration: 100,
        className: 'progressbar-text',
        warnings: false
      }
    }
  },

  mounted () {
    this.bar = new ProgressBar.Circle('#progressbar', this.options)
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
  font-family: 'Roboto Slab';
  font-size: 24px;
}

</style>

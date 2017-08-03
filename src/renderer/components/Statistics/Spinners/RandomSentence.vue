<template>
  <p class="text">{{ sentence }}</p>
</template>

<script type="text/javascript">
import _ from 'lodash'
export default {
  name: 'random-sentence',

  methods: {
    getSentence () {
      const sentences = _.shuffle([
        'Polishing torpedoes',
        'Pre-heating smoke generators',
        'Buffing Battleships',
        'Teaching German gun crews trigonometry',
        'Warshipping RNGesus',
        'Patrolling map border',
        'Capturing ‘D’',
        'Calculating optimal snipe distance',
        'Reinforcing British cruiser armour',
        'Humming ‘La Marseillaise’'
      ])
      return sentences[this.sentenceIdx++ % sentences.length]
    }
  },

  mounted () {
    this.sentence = this.getSentence()
    setInterval(() => {
      this.sentence = this.getSentence()
    }, 1500)
  },

  data () {
    return {
      sentence: '',
      sentenceIdx: 0
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}
</style>

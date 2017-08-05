<template>
  <transition name="fade" mode="out-in">
  <p class="text" :key="sentence">{{ sentence }}</p>
  </transition>
</template>

<script type="text/javascript">
import _ from 'lodash'
export default {
  name: 'random-sentence',

  methods: {
    getSentence () {
      return this.sentences[this.sentenceIdx++ % this.sentences.length]
    }
  },

  created () {
    this.sentence = this.getSentence()
    setInterval(() => {
      this.sentence = this.getSentence()
    }, 2000)
  },

  data () {
    return {
      sentences: _.shuffle([
        'Polishing torpedoes',
        'Pre-heating smoke generators',
        'Buffing Battleships',
        'Giving trigonometry lessons to German gun crews',
        'Thanking RNGesus',
        'Patrolling map border',
        'Flattening broadsides',
        'Capturing D',
        'Counting stars',
        'Calculating optimal snipe distance',
        'Reinforcing British cruiser armour',
        'Humming ‘La Marseillaise’',
        'Shooting some poor mountain',
        'Flipping some birds',
        'Requesting support',
        'Looking for intelligence data',
        'Nerfing IJN destroyers',
        'Deliberately colliding with an island',
        'Entering the Channel of Shattered Dreams on Two Brothers',
        'Pinging like a madman',
        'Impersonating Leeroy Jenkins',
        'Lighting a pipe like Douglas MacArthur',
        'Opening a supercontainer',
        'Clubbing seals',
        'Scratching and sniffing',
        'Letting the dogs out'
      ]),
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

.slide-fade-enter-active {
  transition: all .2s cubic-bezier(0.445, 0.05, 0.55, 0.95);
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(0.445, 0.05, 0.55, 0.95);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(10px);
  opacity: 0;
}
</style>

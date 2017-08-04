<template>
  <div class="spinnercontainer">
    <progress-bar id="progress" type="circle" ref="circle" :options="options"></progress-bar>
    <!-- <p>{{ (progress * 100).toFixed() }}%</p> -->
    <random-sentence></random-sentence>
  </div>
</template>

<script type="text/javascript">
import RandomSentence from './RandomSentence'
import { mapGetters } from 'vuex'
export default {
  name: 'circle-progress',
  components: { RandomSentence },

  computed: {
    ...mapGetters([
      'progress'
    ])
  },

  data () {
    return {
      options: {
        color: '#aaa',
        // This has to be the same size as the maximum width to
        // prevent clipping
        strokeWidth: 4,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        text: {
          fontFamily: 'Roboto Slab',
          fontSize: '14px',
          autoStyleContainer: false
        },
        from: { color: '#aaa', width: 1 },
        to: { color: '#333', width: 4 },
        // Set default step function for all animate calls
        step: function (state, circle) {
          circle.path.setAttribute('stroke', state.color)
          circle.path.setAttribute('stroke-width', state.width)

          var value = Math.round(circle.value() * 100)
          if (value === 0) {
            circle.setText('')
          } else {
            circle.setText(value)
          }
        }
      }
    }
  },

  updated: function () {
    this.$refs.circle.animate(this.progress)
  }
}
</script>

<style scoped>
.spinnercontainer {
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#progress {
  margin: 20px;
  width: 200px;
  height: 200px;
  text-align: center;
  font-size: 10px;
}

/* .spinner>div {
  background-color: #ccc;
  height: 100%;
  width: 6px;
  display: inline-block;

  -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
  animation: sk-stretchdelay 1.2s infinite ease-in-out;
}

.spinner>p {
  font-family: 'Roboto Slab', sans-serif;
  font-weight: 400;
  font-size: 14px;
}

.spinner .rect2 {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}

.spinner .rect3 {
  -webkit-animation-delay: -1.0s;
  animation-delay: -1.0s;
}

.spinner .rect4 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

.spinner .rect5 {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}

@-webkit-keyframes sk-stretchdelay {
  0%,
  40%,
  100% {
    -webkit-transform: scaleY(0.4)
  }
  20% {
    -webkit-transform: scaleY(1.0)
  }
}

@keyframes sk-stretchdelay {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
    -webkit-transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1.0);
    -webkit-transform: scaleY(1.0);
  }
} */
</style>

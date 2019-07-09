<template>
  <div class="spinnercontainer">
    <div class="spinner">
      <p class="percentage">
        {{ (progress * 100).toFixed() }}%
      </p>
      <div class="rect1" />
      <div class="rect2" />
      <div class="rect3" />
      <div class="rect4" />
      <div class="rect5" />
      <random-sentence />
    </div>
  </div>
</template>

<script type="text/javascript">
import RandomSentence from './RandomSentence'
import { mapGetters } from 'vuex'
export default {
  name: 'BarSpinner',
  components: { RandomSentence },

  computed: {
    ...mapGetters([
      'progress'
    ])
  },

  data () {
    return {

    }
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

.spinner {
  margin: 100px auto;
  width: 400px;
  height: 40px;
  text-align: center;
  font-size: 10px;
}

.spinner > .percentage {
  color: #777;
  font-size: 16px;
}
.spinner > div {
  background-color: #ccc;
  height: 100%;
  width: 6px;
  display: inline-block;

  -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
  animation: sk-stretchdelay 1.2s infinite ease-in-out;
}

.spinner > p {
  font-family: 'Archivo Narrow', sans-serif;
  color: #aaa;
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
  0%, 40%, 100% { -webkit-transform: scaleY(0.4) }
  20% { -webkit-transform: scaleY(1.0) }
}

@keyframes sk-stretchdelay {
  0%, 40%, 100% {
    transform: scaleY(0.4);
    -webkit-transform: scaleY(0.4);
  }  20% {
    transform: scaleY(1.0);
    -webkit-transform: scaleY(1.0);
  }
}
</style>

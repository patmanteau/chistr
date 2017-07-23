<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'chistr'
  }
</script>

<style>
@import url(https://fonts.googleapis.com/css?family=Roboto+Condensed:400|Roboto:400|Roboto+Slab:400);

body {
  background-color: #f7f7f7;
  color: #333;
}

.ui {
  -moz-user-select: none;
  -webkit-user-select:none;
  user-select: none;
}

.ui .number {
  cursor: default;
}

.ui .no-data {
  cursor: default;
}

.colflexed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.rowflexed {
  display: flex;
  align-items: center;
}

.headgrid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 90%;
}

.maingrid {
  width: 100%;
  /*justify-content: center;*/
}

.link {
  color: #555;
  text-decoration: none;
  font-weight: bold;
}

.wrapper {
  margin: 0 auto;
}

.flip-list-move {
  transition: transform .2s;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}

.list-enter-active, .list-leave-active {
  transition: none;
}
.list-enter, .list-leave-to /* .list-leave-active for <2.1.8 */ {
  opacity: 0;
  /*transform: translateY(30px);*/
}

.text {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
  }

.number {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
}

.icon {
  color: #777;
  text-align: center;
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
}

/*.no-data {
  background: #ddd;
}*/

.text-subdued {
  color: #aaa;
  font-size: x-small;
}

.text-centered {
  text-align: center;
}

.text-align-right {
  text-align: right;
}

.text-align-left {
  text-align: left;
}

.external-link {
  color: #555;
  text-decoration: none;
  font-weight: bold;
}
</style>

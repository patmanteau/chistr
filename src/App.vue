<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  name: "Chistr"
};
</script>

<style>
/* @import url(https://fonts.googleapis.com/css?family=Archivo+Narrow:400,400i,700,700i|Roboto+Condensed:400,400i,700,700i|Roboto+Slab:400,700|Roboto:400,400i,700,700i&subset=latin-ext); */
@import url(./assets/fonts/oswald.css);
@import url(./assets/fonts/archivo.css);
@import url(./assets/fonts/archivo-narrow.css);

body {
  background-color: #f7f7f7;
  color: #333;
  margin: 0;
  box-sizing: border-box;

  font-size: 18px;
  line-height: 1.3;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.ui {
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
}

.colflexed {
  /* justify-content: space-around; */
}

.rowflexed {
  display: flex;
  align-items: center;
}

#view {
  /* height: 85vh; */
  padding-top: 61px;
}

#header {
  position: fixed;
  top: 0;
  height: 40px;
  padding: 10px 30px;
  /* box-shadow: 0 0 2px rgba(0,0,0,0.25); */
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

#maingrid {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  /* width: 100%; */
  /* height: 90vh; */
  justify-content: center;
  align-items: center;
  /*justify-content: center;*/
}

.gridcontainer {
  width: 95%;
  margin: 20px 10px;
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
  transition: transform 0.2s;
}

.flip-list-enter-active,
.list-leave-active {
  transition: none;
}
.flip-list-enter, .list-leave-to /* .list-leave-active for <2.1.8 */ {
  opacity: 0;
  /*transform: translateY(30px);*/
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: none;
}
.list-enter, .list-leave-to /* .list-leave-active for <2.1.8 */ {
  opacity: 0;
  /*transform: translateY(30px);*/
}

.text {
  font-family: "Archivo Narrow", sans-serif;
  /* font-weight: 400; */
  font-size: 18px;
}

.number {
  font-family: "Archivo Narrow", sans-serif;
  /* font-weight: 400; */
  /* font-size: 14px; */
  text-align: center;
}

.icon {
  color: #777;
  text-align: center;
  font-family: "Archivo Narrow", sans-serif;
  /* font-weight: 400; */
  /* font-size: 14px; */
}

/*.no-data {
  background: #ddd;
}*/

.text-small {
  font-size: small;
}

.text-smallcaps {
  font-variant: small-caps;
}

.text-gray {
  color: #999;
}

.text-subdued {
  color: #aaa;
  font-family: "Archivo", sans-serif;
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
  color: #333;
  text-decoration: none;
  /* font-weight: bold; */
}

.external-link-bold {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}

.savebutton {
  font-family: "Archivo Narrow", sans-serif;
  font-size: 16px;
  color: #555;
  text-decoration: none;
  font-weight: 400;
  /* box-shadow: 0 0 2px rgba(0,0,0,0.25); */
  border: 1px solid rgba(0, 0, 0, 0.25);
  padding: 2px 4px;
}
</style>

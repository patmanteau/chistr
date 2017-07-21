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
  -webkit-user-select:none;
}

.ui .number {
  cursor: default;
}

.ui .no-data {
  cursor: default;
}

.digit {
  color: #ecf0f1;
  font-size: 150px;
  font-weight: 100;
  font-family: 'Roboto', serif;
  margin: 10px;
  text-align: center;
}

.footer {
  color: #333;
  font-size: 10px;
  font-weight: 400;
  font-family: 'Roboto', serif;
  margin: 10px;
  text-align: center;
}

.colflexed {
  display: flex;
  flex-direction: column;
  align-items: center;
  /*flex-grow: 1;*/
  /*flex-shrink: 1;*/
  /*flex-basis: auto;*/
  /*height: 100%;*/
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

/*a {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}*/

.link {
  color: #555;
  text-decoration: none;
  font-weight: bold;
}

.wrapper {
  margin: 0 auto;
}

.footer {
  clear: both;
  padding: 20px;
  text-align: center;
  width: 100%;
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

.grey-top-border {
  border-top-style: solid;
  border-top-width: 2px;
  border-top-color: #ddd;
}

.grey-bottom-border {
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-bottom-color: #ddd;
}

.grey-left-border {
  border-left-style: solid;
  border-left-width: 2px;
  border-left-color: #ddd;
}

.grey-right-border {
  border-right-style: solid;
  border-right-width: 2px;
  border-right-color: #ddd;
}

.white-left-border {
  border-left-style: solid;
  border-left-width: 2px;
  border-left-color: #f7f7f7;
}

.white-right-border {
  border-right-style: solid;
  border-right-width: 2px;
  border-right-color: #f7f7f7;
}

.Rgrid, .Rgrid--head {
  display: flex;
  /*flex-direction: column;*/
  /*flex-wrap: wrap;*/
  align-items: center;
  /*box-sizing: border-box;*/
  /*justify-content: center;*/
  margin: 0 5% 0 5%;
}

.Rgrid--stripe {
  background: #eee;
}

.Rgrid:hover {
  /*background-color: #ddd;*/
  box-shadow: inset 0 0 2px #777;
}

.Rcell, .Rcell-1of3, .Rcell-2of3, .Rcell-3of3, .Rcell-1of2, .Rcell-2of2 {
  display: flex;
  /*flex-grow: 1;*/
  justify-content: space-between;
  /*box-sizing: border-box;*/
  overflow: hidden;
}

.Rcell-1of3 { flex: 0 0 33.33%;}
.Rcell-2of3 { flex: 0 0 66.66%;}
.Rcell-3of3 { flex: 0 0 100%;}

.Rcell-1of2 { flex: 0 0 50%;}
.Rcell-2of2 { flex: 0 0 100%;}

.Rcontent {
  flex: 1;
  box-sizing: border-box;
  /*align-items: center;*/
  /*justify-content: center;*/
  padding: 3px 2px 3px 2px;
  align-self: center;
}

.text {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
  /*color: #1abc9c;
  font-size: 40px;
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  margin-top:10px;
  margin-bottom: 10px;
  text-align: center;*/
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

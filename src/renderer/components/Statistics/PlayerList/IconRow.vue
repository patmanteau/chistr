<template>
  <div class="Rgrid--head white-left-border">
    <div class="Rcell Rcell-1of3 white-right-border">
      <div title="Player" class="Rcontent icon">&nbsp;</div>
      <div title="Ship" class="Rcontent icon">&nbsp;</div>
    </div>
    <div class="Rcell Rcell-1of3 grey-right-border">
      <div title="# of battles overall" class="Rcontent icon"><i class="fa fa-repeat" aria-hidden="true"></i></div>
      <div title="Player winrate" class="Rcontent icon"><i class="fa fa-pie-chart" aria-hidden="true"></i><i class="fa fa-sort-desc" aria-hidden="true"></i></div>
      <div title="Player Kill/Death ratio" class="Rcontent icon"><i class="fa fa-bullseye" aria-hidden="true"></i></div>
      <div title="Player average damage" class="Rcontent icon"><i class="fa fa-rocket" aria-hidden="true"></i></div>
      <div title="Player average experience" class="Rcontent icon"><i class="fa fa-line-chart" aria-hidden="true"></i></div>
    </div>
    <div class="Rcell Rcell-1of3 white-right-border">
      <div title="# of battles in this ship" class="Rcontent icon"><i class="fa fa-repeat" aria-hidden="true"></i></div>
      <div title="Ship winrate" class="Rcontent icon"><i class="fa fa-pie-chart" aria-hidden="true"></i></div>
      <div title="Player's Personal Rating for this ship" class="Rcontent icon">PR</div>
      <div title="Ship Kill/Death ratio" class="Rcontent icon"><i class="fa fa-bullseye" aria-hidden="true"></i></div>
      <div title="Ship average damage" class="Rcontent icon"><i class="fa fa-rocket" aria-hidden="true"></i></div>
      <div title="Ship average experience" class="Rcontent icon"><i class="fa fa-line-chart" aria-hidden="true"></i></div>
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'icon-row'
}
</script>
<style media="screen">
.icon {
  color: #777;
  text-align: center;
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
}
</style>

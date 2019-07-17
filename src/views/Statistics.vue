<template>
  <div id="view">
    <template v-if="!hasData">
      <!-- <template v-if="arenaState === 0"> -->
      <div key="statsDisplay" class="container">
        <div class="centered">
          <h1 class="ui">Ahoy captain!</h1>
          <h2 class="ui">Looking forward to your next battle.</h2>
        </div>
      </div>
    </template>
    <template v-else>
      <div id="header">
        <span>
          <arena-info
            :matchInfo="matchInfo"
            :active="arena.active"
            :matchGroup="arena.matchInfo.matchGroup"
            :mapName="arena.matchInfo.mapName"
            :lastMatchDate="arena.matchInfo.lastMatchDate"
          />
        </span>
      </div>
      <div v-if="updateAvailable" class="ui update-warning">
        <a
          target="_blank"
          href="https://github.com/patmanteau/chistr/releases/latest"
          >Update available. Click here to download.</a
        >
      </div>
      <transition name="fade" mode="out-in">
        <div v-if="finishedLoading" id="maingrid" key="statsDisplay">
        <!-- <div v-if="arenaState === 2" id="maingrid" key="statsDisplay"> -->
          <div class="gridcontainer">
            <player-list
              title="Foes"
              bordercolor="#f77"
              :finished-loading="finishedLoading"
              :players="foes"
            />
            <div class="vspace" />
            <player-list
              title="Friends"
              bordercolor="#8f8"
              noheader="true"
              :finished-loading="finishedLoading"
              :players="friends"
            />
          </div>
        </div>
        <div v-else-if="hasData" key="loadingScreen">
        <!-- <div v-else-if="arenaState === 1" key="loadingScreen"> -->
          <!-- <bar-spinner></bar-spinner> -->
          <circle-progress />
        </div>
      </transition>
    </template>
    <!-- <div v-if="finishedLoading">Finished Loading</div> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { State, Getter, Action, Mutation, namespace } from "vuex-class";
import { remote } from "electron";
import ArenaInfo from "@/components/Statistics/ArenaInfo.vue";
import PlayerList from "@/components/Statistics/PlayerList.vue";
import CircleProgress from "@/components/Statistics/Spinners/CircleProgress.vue";
import semver from "semver";
import Arena, { ArenaState } from "@/store/modules/Arena";
import { mapGetters } from 'vuex';

@Component({
  components: {
    ArenaInfo,
    PlayerList,
    CircleProgress
  },
})
export default class Statistics extends Vue {
  // @State("arena") arena;
  // @State("hasData") hasData;

  @Prop({ default: false }) updateAvailable: boolean;
  // @Getter friends;
  // @Getter foes;
  @Getter finishedLoading;
  @State(state => state.Arena.hasData) hasData: boolean;
  @State(state => state.Arena) arena;
  @State(state => state.Arena.matchInfo) matchInfo;
  @State(state => state.Arena.active) active: boolean;
  @State(state => state.Arena.players.filter(p => p.relation <= 1)) friends;
  @State(state => state.Arena.players.filter(p => p.relation > 1)) foes;
  @State(state => state.Arena.arenaState) arenaState;

  // arena!: any;
  $http!: any;

  mounted() {
    setInterval(() => {
      this.$store.dispatch("readArenaData");
    }, 1000);

    this.$http
      .get("https://api.github.com/repos/patmanteau/chistr/releases/latest")
      .then((response: any) => {
        const latest = semver.clean(response.data.name);

        if (latest) {
          this.updateAvailable = semver.lt(remote.app.getVersion(), latest);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.updateAvailable = false;
      });
  }

}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.centered {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;
  align-items: center;
  justify-content: center;
}

h1 {
  color: #777;
  font-size: 40px;
  font-family: "Oswald", sans-serif;
  font-weight: 500;
  margin: 0px 10px 0px 10px;
  /*text-align: center;*/
}

h2 {
  color: #999;
  font-size: 20px;
  font-family: "Archivo Narrow", sans-serif;
  font-weight: 500;
  margin: 0px 0px 0px 2px;
  /*text-align: center;*/
}

.update-warning {
  color: #c33;
  font-size: 16px;
  font-family: "Archivo Narrow", sans-serif;
  font-weight: 500;
  margin: 0px;
  margin-bottom: 5px;
  text-align: center;
  border-top: 1px solid #c33;
  /* border-bottom: 1px solid #c33; */
}

.update-warning a {
  color: #c33;
  text-decoration: none;
}

.vspace {
  margin-bottom: 1em;
}
</style>

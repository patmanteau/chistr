<template>
  <div id="view">
    <div id="header" class="ui">
      <router-link class="text link" :to="{ name: 'statistics', params: {} }">
        <!-- <button class="text" >Save &amp; close</button> -->
        <span class="savebutton"
          ><font-awesome-icon icon="check-circle" /> Close</span
        >
      </router-link>
    </div>
    <!-- <div id="header">
    <div class="rowflexed">
    <h1><font-awesome-icon icon="cog" /> Settings</h1>
    </div>
  </div> -->
    <div class="gridcontainer">
      <div class="config-item" />
      <!-- <div class="Rcell Rcell-2of2"> -->
      <div class="config-item ui">
        <!-- <div class="Rcontent"> -->

        <!-- </div> -->
      </div>
      <div class="config-item">
        <div class="title ui">
          Your Wargaming Application ID
        </div>
        <div class="explanation ui">
          You need a valid Wargaming.net Mobile Application ID. Get yours
          <a
            href="https://developers.wargaming.net/applications/"
            target="_blank"
            class="text link"
            >here</a
          >
          (Login <font-awesome-icon icon="angle-right" /> Add application
          <font-awesome-icon icon="angle-right" /> Choose a name
          <font-awesome-icon icon="angle-right" /> Set type to Mobile
          <font-awesome-icon icon="angle-right" /> Add).
        </div>
        <div v-if="!wowsApiKeyValid" class="error">
          Please enter a valid Application ID.
        </div>
        <input
          v-model.trim="wowsApiKey"
          class="text"
          type="text"
          placeholder="API key"
          @input="validateApiKey"
        />
        <font-awesome-icon
          :icon="wowsApiKeyValid ? 'check' : 'times'"
          class="inline-icon"
        />
      </div>
      <div class="config-item">
        <div class="title ui">
          World of Warships path
        </div>
        <div class="explanation ui">
          Enter the folder your World of Warships installation lives in.
        </div>
        <div v-if="!wowsPathValid" class="error">
          Couldn't find WorldOfWarships.exe. The path you entered seems to be
          incorrect.
        </div>
        <input
          v-model="wowsPath"
          class="text"
          placeholder="Path to WoWS"
          @input="validatePath"
        />
        <font-awesome-icon
          :icon="wowsPathValid ? 'check' : 'times'"
          class="inline-icon"
        />
      </div>
      <div class="config-item ui">
        <!-- <input v-model="wowsApiUrl" size="40" placeholder="API URL"> -->
        <div class="title">
          World of Warships server
        </div>
        <div class="explanation">
          Select the server you play on.
        </div>
        <select v-model="wowsApiUrl" class="text" name="apiUrl">
          <option
            v-for="realm in realms"
            :value="realm.url"
            :selected="realm.url === wowsApiUrl"
          >
            {{ realm.name }} ({{ realm.url }})
          </option>
        </select>
      </div>
      <div class="config-item ui">
        <!-- <input v-model="wowsApiUrl" size="40" placeholder="API URL"> -->
        <div class="title">
          Match group
        </div>
        <div class="explanation">
          Choose the kind of statistics you want to see.
        </div>
        <select v-model="wowsMatchgroup" class="text" name="matchgroup">
          <option
            v-for="group in matchgroups"
            :value="group.val"
            :selected="group.val === wowsMatchgroup"
          >
            {{ group.name }} ({{ group.desc }})
          </option>
        </select>
      </div>
      <div class="config-item ui">
        <!-- <input v-model="wowsApiUrl" size="40" placeholder="API URL"> -->
        <div class="title">
          Cache settings
        </div>
        <div class="explanation">
          Chistr caches ship data to reduce loading times. If ship names are
          wrong or missing or some PRs are equal to 0, try clearing the cache.
        </div>
        <button class="text" @click="clearShipCache">
          Clear ship cache
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as types from "../store/mutation-types";
import * as fs from "fs";
import * as path from "path";

export default {
  name: "Settings",

  data() {
    return {
      realms: [
        { name: "EU", url: "http://api.worldofwarships.eu" },
        { name: "NA", url: "http://api.worldofwarships.com" },
        { name: "RU", url: "http://api.worldofwarships.ru" },
        { name: "ASIA", url: "http://api.worldofwarships.asia" }
      ],
      matchgroups: [
        {
          name: "Automatic",
          desc: "Auto-select based on current match",
          val: "auto"
        },
        { name: "Random", desc: "Display Random match statistics", val: "pvp" },
        {
          name: "Ranked",
          desc: "Display Ranked match statistics",
          val: "ranked"
        }
      ],
      wowsApiKeyValid: false,
      wowsPathValid: false
    };
  },

  computed: {
    wowsApiKey: {
      get() {
        return this.$store.state.Settings.wows.api.key;
      },
      set(value) {
        this.$store.commit(types.SET_WOWS_API_KEY, value);
      }
    },

    wowsApiUrl: {
      get() {
        return this.$store.state.Settings.wows.api.url;
      },
      set(value) {
        this.$store.commit(types.SET_WOWS_API_URL, value);
      }
    },

    wowsPath: {
      get() {
        return this.$store.state.Settings.wows.path;
      },
      set(value) {
        this.$store.commit(types.SET_WOWS_PATH, value);
      }
    },

    wowsMatchgroup: {
      get() {
        return this.$store.state.Settings.wows.matchgroup;
      },
      set(value) {
        this.$store.commit(types.SET_WOWS_MATCHGROUP, value);
      }
    }
  },

  mounted() {
    this.validatePath();
    this.validateApiKey();
  },

  methods: {
    validateApiKey() {
      this.$http
        .get(
          `${this.wowsApiUrl}/wows/encyclopedia/info/?application_id=${this.wowsApiKey}`
        )
        .then(response => {
          this.wowsApiKeyValid = response.data.status === "ok";
        })
        .catch(() => {
          this.wowsApiKeyValid = false;
        });
    },

    validatePath() {
      fs.access(
        path.resolve(this.wowsPath, "WorldOfWarships.exe"),
        fs.constants.F_OK,
        err => {
          // eslint-disable-next-line no-unneeded-ternary
          this.wowsPathValid = err ? false : true;
        }
      );
    },

    clearShipCache() {
      this.$store.dispatch("clearApiCache");
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.config-item {
  font-family: "Archivo Narrow", sans-serif;
  font-weight: 500;
  align-items: left;
  margin: 10px;
  position: relative;
}

.config-item .inline-icon {
  position: absolute;
  bottom: 13px;
  right: 0px;
}

.config-item .title {
  font-size: 18px;
  margin: 2px 0 2px 0;
}

.config-item .explanation {
  font-size: 16px;
  color: #777;
  margin: 2px 0 2px 0;
}

.config-item .error {
  font-size: 14px;
  color: #f33;
  margin: 2px 0 2px 0;
}

input,
select {
  width: 100%;
  padding: 4px 4px;
  margin: 8px 0;
  border: 1px solid #ddd;
}

h1 {
  color: #777;
  font-size: 28px;
  font-family: "Oswald", sans-serif;
  font-weight: 500;
  margin: 4px 4px 0px 0px;
  text-align: left;
}

h2 {
  color: #999;
  font-size: 16px;
  font-family: "Oswald", sans-serif;
  font-weight: 500;
  margin: 4px 4px 0px 20px;
}
</style>
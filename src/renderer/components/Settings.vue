<template>
  <div class="container">
    <div class="config-item">
      <router-link class="text link" :to="{ name: 'statistics', params: {} }">
        <span><i class="fa fa-chevron-left" aria-hidden="true"></i> Back</span>
      </router-link>
    </div>
    <!-- <div class="Rcell Rcell-2of2"> -->
    <div class="config-item">
        <!-- <div class="Rcontent"> -->
          <h1><i class="fa fa-cog" aria-hidden="true"></i> Settings</h1>
        <!-- </div> -->
      </div>
      <div class="config-item">
        <div class="title">Your Wargaming Application ID</div>
        <div class="explanation">
          You need a valid Wargaming.net Mobile Application ID. Get yours <a href="https://developers.wargaming.net/applications/" target="_blank" class="text link">here</a> (Login <i class="fa fa-angle-right" aria-hidden="true"></i> Add application <i class="fa fa-angle-right" aria-hidden="true"></i> Choose a name <i class="fa fa-angle-right" aria-hidden="true"></i> Set type to Mobile <i class="fa fa-angle-right" aria-hidden="true"></i> Add).
        </div>
        <div v-if="!wowsApiKeyValid" class="error">Please enter a valid Application ID.</div>
        <input class="text" type="text" placeholder="API key" v-model.trim="wowsApiKey" @input="validateApiKey"> <i class="inp fa fa-check" :class="wowsApiKeyValid ? 'fa-check' : 'fa-times'" aria-hidden="true"></i>

      </div>
      <div class="config-item">
        <div class="title">World of Warships path</div>
        <div class="explanation">
          Enter the folder your World of Warships installation lives in.
        </div>
        <div v-if="!wowsPathValid" class="error">Couldn't find WorldOfWarships.exe. The path you entered seems to be incorrect.</div>
        <input v-model="wowsPath" @input="validatePath" class="text" placeholder="Path to WoWS"> <i class="inp fa fa-check" :class="wowsPathValid ? 'fa-check' : 'fa-times'" aria-hidden="true"></i>
      </div>
      <div class="config-item">
        <!-- <input v-model="wowsApiUrl" size="40" placeholder="API URL"> -->
        <div class="title">World of Warships server</div>
        <div class="explanation">
          Select the server you play on.
        </div>
        <select class="text" v-model="wowsApiUrl" name="apiUrl">
          <option v-for="realm in realms"
                  :value="realm.url"
                  :selected="realm.url === wowsApiUrl">{{ realm.name }} ({{ realm.url }})</option>
        </select>
      </div>
  </div>
</template>

<script type="text/javascript">
import * as types from '../store/mutation-types'
import * as fs from 'fs'
import * as path from 'path'

export default {
  name: 'settings',

  computed: {
    wowsApiKey: {
      get () {
        return this.$store.state.Settings.wows.api.key
      },
      set (value) {
        this.$store.commit(types.SET_WOWS_API_KEY, value)
      }
    },

    wowsApiUrl: {
      get () {
        return this.$store.state.Settings.wows.api.url
      },
      set (value) {
        this.$store.commit(types.SET_WOWS_API_URL, value)
      }
    },

    wowsPath: {
      get () {
        return this.$store.state.Settings.wows.path
      },
      set (value) {
        this.$store.commit(types.SET_WOWS_PATH, value)
      }
    }
  },

  methods: {
    validateApiKey () {
      this.$http.get(this.wowsApiUrl + '/wows/encyclopedia/info/?application_id=' + this.wowsApiKey)
        .then((response) => {
          this.wowsApiKeyValid = response.data.status === 'ok'
        })
        .catch(() => {
          this.wowsApiKeyValid = false
        })
    },

    validatePath () {
      fs.access(path.resolve(this.wowsPath, 'WorldOfWarships.exe'), fs.constants.F_OK, (err) => {
        // eslint-disable-next-line no-unneeded-ternary
        this.wowsPathValid = err ? false : true
      })
    }
  },

  mounted () {
    this.validatePath()
    this.validateApiKey()
  },

  data () {
    return {
      realms: [
        { name: 'EU', url: 'http://api.worldofwarships.eu' },
        { name: 'NA', url: 'http://api.worldofwarships.com' },
        { name: 'RU', url: 'http://api.worldofwarships.ru' },
        { name: 'ASIA', url: 'http://api.worldofwarships.asia' }
      ],
      wowsApiKeyValid: false,
      wowsPathValid: false
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  /*align-items: center;*/
  /*height: 90vh;*/
}

.config-item {
  /*display: flex;*/
  /*flex-direction: column;*/
  /*width: 50%;*/
  align-items: left;
  margin: 10px;
  position: relative;
  /*justify-content: center;*/
}

.config-item .inp {
  position: absolute;
  bottom: 13px;
  right: 0px;
}

.config-item .title {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 16px;
  margin: 2px 0 2px 0;
}

.config-item .explanation {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
  color: #777;
  margin: 2px 0 2px 0;
}

.config-item .error {
  font-family: 'Roboto Condensed', serif;
  font-weight: 400;
  font-size: 14px;
  color: #f77;
  margin: 2px 0 2px 0;
}

input, select {
  width: 100%;
  /*padding: 2px;
  margin: 2px 0 2px 0;*/
  padding: 4px 4px;
  margin: 8px 0;
  border: 1px solid #ddd;
  /*border-radius: 2px;*/
}

h1 {
  color: #777;
  font-size: 28px;
  font-family: 'Roboto Slab', serif;
  font-weight: 400;
  margin: 4px 4px 0px 0px;
  text-align: left;
  /*align-self: left;*/
}

h2 {
  color: #999;
  font-size: 14px;
  font-family: 'Roboto Slab', serif;
  font-weight: 400;
  margin: 4px 4px 0px 20px;
  /*text-align: center;*/
}

</style>

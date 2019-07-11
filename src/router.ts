import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "statistics",
      component: require("@/views/Statistics").default
    },
    {
      path: "/settings",
      name: "settings",
      component: require("@/views/Settings").default
    },
    {
      path: "/about",
      name: "about",
      component: require("@/views/About").default
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'statistics',
      component: require('@/components/Statistics')
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/Settings')
    },
    {
      path: '/about',
      name: 'about',
      component: require('@/components/about')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: 'login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue')
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('@/views/menu/index.vue'),
      children: [{
        name: 'home',
        path: '/home',
        component: () => import('@/views/home/index.vue'),
      },
      {
        name: 'personal',
        path: '/personal',
        component: () => import('@/views/personal/index.vue'),
      }
    ]
    },
  ]
})

router.beforeEach(({name}, from, next) => {
  if (localStorage.getItem('token')) {
    if (name === 'login') {
      next('/')
    } else {
      next()
    }
  } else {
    if (name === 'login') {
      next()
    }else {
      next({name: 'login'})
    }
  }
})

export default router

import { createRouter, createWebHistory, type Router } from 'vue-router'

const modules: Record<string, any> = import.meta.glob(["./modules/**/*.ts", "!./modules/**/remaining.ts"], {
  eager: true
})

const children: any[] = []

Object.keys(modules).forEach(key => {
  children.push(modules[key].default)
})

const routes: any[] = [
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
    redirect: '/home',
    component: () => import('@/views/menu/index.vue'),
    children
  }]

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// router.beforeEach(({name}, from, next) => {
//   if (localStorage.getItem('token')) {
//     if (name === 'login') {
//       next('/')
//     } else {
//       next()
//     }
//   } else {
//     if (name === 'login') {
//       next()
//     }else {
//       next({name: 'login'})
//     }
//   }
// })

export default router

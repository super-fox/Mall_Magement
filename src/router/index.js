import Vue from 'vue'
// import VueRouter from 'vue-router'


const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/login/Login')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome')

// const Users = () => import('../components/user/Users')
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Roles')

// const Cate = () => import('../components/goods/Cate')
// const Params = () => import('../components/goods/Params')
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate')
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Params')

// const List = () => import('../components/goods/List')
// const Add = () => import('../components/goods/Add')
const List = () => import(/* webpackChunkName: "list_add" */ '../components/goods/List')
const Add = () => import(/* webpackChunkName: "list_add" */ '../components/goods/Add')
//
// const Order = ()=>import('../components/order/Order')
// const Report =()=> import('../components/report/Report')
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/Order')
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/Report')

Vue.use(VueRouter)

const routes = [
  //路由重定向
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      {path: '/params', component:Params},
      {path: '/goods', component:List},
      {path: '/goods/add', component:Add},
      {path: '/orders', component:Order},
      {path: '/reports', component:Report}
    ]
  },

]

const router = new VueRouter({
  routes
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('./login')
  next()
})

export default router

<template>
  <el-container class="home-container">
    <!--    头部区域-->
    <el-header>
      <div>
        <img src=".././assets/image/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--    页面主体区域-->
    <el-container>
      <!--      侧边栏-->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff"
                 active-text-color="#409EFF" unique-opened
                 :collapse="isCollapse" :collapse-transition="false"
                 :router="true" default-active="/users">
          <!--          一级菜单-->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!--            一级菜单模板区-->
            <template slot="title">
              <!--              图标-->
              <i :class="iconObj[item.id]"></i>
              <!--              文本-->
              <span>{{item.authName}}</span>
            </template>

            <!--            二级菜单-->
            <el-menu-item :index="'/'+ subItem.path + ''"
                          v-for="subItem in item.children" :key="subItem.id"
                          @click="saveNavState('/'+ subItem.path + '')"
                          :default-active="activePath">
              <template slot="title">
                <!--              图标-->
                <i class="el-icon-menu"></i>
                <!--              文本-->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--      右侧主体区-->
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'Home',
    data () {
      return {
        //左侧菜单数据
        menuList: [],
        iconObj: {
          '125': 'iconfont iconduoren',
          '103': 'iconfont icontijikongjian',
          '101': 'iconfont iconshangpin',
          '102': 'iconfont icondanju',
          '145': 'iconfont iconbaobiao'
        },
        //判断折叠
        isCollapse: false,
        //被激活的路由地址
        activePath: ''
      }
    },
    created () {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      logout () {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      async getMenuList () {
        const { data: res } = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
        console.log(res)
      },
      //菜单的折叠与展开
      toggleCollapse () {
        this.isCollapse = !this.isCollapse
      },
      //保存链接的激活状态
      saveNavState (activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100vh;
  }

  .el-header {
    display: flex;
    background-color: #373d41;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }

      img {
        width: 60px;
        height: 60px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #FFF;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>

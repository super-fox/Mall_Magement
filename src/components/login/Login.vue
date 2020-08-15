<template>
  <div class="login_container">
    <back-ground/>
    <!--    登录模块-->
    <el-button @click="showLogin" type="primary" class="show-login" round>{{text}}</el-button>
      <div class="login_box" v-show="show">
        <!--      头像区域-->
        <div class="avatar_box">
          <img src="../../assets/image/login/cat1.jpg" alt="">
        </div>
        <!--      登陆表单区域-->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
          <!--          用户名-->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont iconren"></el-input>
          </el-form-item>
          <!--        密码-->
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" prefix-icon="iconfont iconmima" show-password></el-input>
          </el-form-item>
          <!--        按钮区域-->
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
  </div>
</template>

<script>
  import BackGround from './BackGround'

  export default {
    name: 'Login',
    components:{
      BackGround
    },
    data () {
      return {
        //登录表单的数据验证
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        //登录表单的验证
        loginFormRules: {
          username: [
            {
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '长度在 3 到 10 个字符',
              trigger: 'blur'
            }
          ],
          password: [
            {
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 15,
              message: '长度在 6 到 15 个字符',
              trigger: 'blur'
            }
          ]
        },
        show: false,
        text: '显示'
      }
    },
    methods: {
      //点击重置表单
      resetLoginForm () {
        this.$refs.loginFormRef.resetFields()
      },
      login () {
        this.$refs.loginFormRef.validate(valid => {
          if (!valid) return
          this.$http.post('login', this.loginForm).then(res => {
            if (res.data.meta.status !== 200) return this.$message.error('登录失败')
            this.$message.success('登录成功')
            console.log(res)
            //将token保存在sessionStorage中
            window.sessionStorage.setItem('token', res.data.data.token)
            //跳转到后台主页, 路由地址/home
            this.$router.push('/home')
          })
        })
      },
      //点击登录
      showLogin () {
        this.show = !this.show
        this.text = this.text === '显示' ? '隐藏' : '显示'
      },
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    position: relative;
    background: url("../../assets/image/login/login.jpg") no-repeat;
    background-size: 100% 100%;
    height: 100vh;
  }

  .login_box {
    position: absolute;
    width: 450px;
    height: 300px;
    background: rgba(255, 255, 255,.4);
    border-radius: 5px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      position: absolute;
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    justify-content: center;
  }

  .show-login {
    position: absolute;
    top: 80%;
    left: 50%;
    transform: translate(-50%, 50%);
    width: 100px;
    height: 50px;
    background: rgba(64, 158, 255, .4);
  }
</style>

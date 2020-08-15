<template>
  <div>
    <!--  面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片区域-->
    <el-card class="box-card">

      <!--     搜索-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = !addDialogVisible">添加用户</el-button>
        </el-col>
      </el-row>

      <!--      用户列表区域-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!--            修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--            删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)"></el-button>
            <!--            分配角色按钮-->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--      分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

    </el-card>

    <!--    添加用户的对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!--      对话框的表单-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--      对话框的两个按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改用户对话框-->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!--      对话框的表单-->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--      对话框的两个按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible= false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>
    <!--    分配角色对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRolesDialogVisible"
      width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRolesDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Users',
    data () {
      //校验邮箱的规则
      var checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的邮箱'))
      }
      //校验手机号的规则
      var checkMobile = (rule, value, callback) => {
        const regMobile = /^[1][3,4,5,7,8,9][0-9]{9}$/
        if (regMobile.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的手机号码'))
      }
      return {
        //分页数据
        queryInfo: {
          query: '',
          //当前的页数
          pagenum: 1,
          //每页展示的数据
          pagesize: 2
        },
        userList: [],
        total: 0,
        //添加用户的对话框
        addDialogVisible: false,
        //添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        //添加用户的表单的验证规则
        addFormRules: {
          username: [
            {
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '请控制用户名长度在3~10个字符之间',
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
              message: '请控制密码长度在6~15个字符之间',
              trigger: 'blur'
            }
          ],
          email: [
            {
              required: true,
              message: '请输入邮箱',
              trigger: 'blur'
            },
            {
              validator: checkEmail,
              trigger: 'blur'
            }
          ],
          mobile: [
            {
              required: true,
              message: '请输入手机号码',
              trigger: 'blur'
            },
            {
              validator: checkMobile,
              trigger: 'blur'
            }
          ]
        },
        //修改用户的对话框
        editDialogVisible: false,
        //修改用户的查询到的用户信息
        editForm: {},
        //分配角色对话框显示与隐藏
        setRolesDialogVisible: false,
        //需要被分配角色的用户
        userInfo: {},
        //所有角色的数据列表
        rolesList: [],
        //已选中的角色ID值
        selectRoleId: []
      }
    },
    created () {
      this.getUserList()
    },
    methods: {
      //获取用户列表
      async getUserList () {
        const { data: res } = await this.$http.get('users', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
        this.userList = res.data.users
        this.total = res.data.total
        console.log(res)
      },
      //监听 每页展示 的数据
      handleSizeChange (newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //监听 页码值 的改变
      handleCurrentChange (newPage) {
        // console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //监听状态开关
      async userStateChanged (userInfo) {
        console.log(userInfo)
        const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
      },
      //监听添加用户对话框的关闭重置
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      //点击添加按钮，添加新用户的预校验
      addUser () {
        this.$refs.addFormRef.validate(async valid => {
          // console.log(valid)
          if (!valid) return
          //发起添加用户的网络请求
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          //隐藏 添加用户 的对话框
          this.addDialogVisible = false
          //刷新用户列表
          this.getUserList()
        })
      },
      //修改用户信息
      async showEditDialog (id) {
        console.log(id)
        const { data: res } = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询数据失败')
        }
        //保存查询到的信息
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //监听修改用户信息的关闭重置
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },
      //点击确定按钮 修改用户信息并提交
      editUserInfo () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          //发起修改用户信息的数据请求
          const { data: res } = await this.$http.put('users/' + this.editForm.id,
            {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            })
          if (res.meta.status !== 200) return this.$message.error('用户信息修改失败')
          //关闭对话框
          this.editDialogVisible = false
          //刷新数据列表
          this.getUserList()
          //提示修改成功
          this.$message.success('修改用户信息成功')
        })
      },
      //点击删除按钮 根据id信息删除对应的用户
      async removeUserById (id) {
        //确认是否删除用户信息
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //如果用户确认删除 返回值为字符串 confirm
        //如果用户取消删除 返回值为字符串 cancel
        if (confirmResult !== 'confirm') {
          return this.$message.error('已取消删除')
        }
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getUserList()
      },
      //点击分配角色 弹出对话框
      async setRole (userInfo) {
        //获取所有的角色列表
        this.userInfo = userInfo
        //请求所有的角色列表
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        //保存所有的角色数据列表
        this.rolesList = res.data
        this.setRolesDialogVisible = true
      },
      //点击确定更改新角色
      async saveRoleInfo () {
        //如果没有选择新角色，直接返回
        if (!this.selectRoleId) {
          return this.$message.error('请选择要分配的角色！')
        }
        //选择新角色 发起网络请求保存这次操作
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`,
          { rid: this.selectRoleId })
        if (res.meta.status !== 200) {
          this.$message.error('更新用户角色失败')
        }
        this.getUserList()
        this.$message.success('更新用户角色成功')
        this.setRolesDialogVisible = false
      },
      //监听分配角色对话框关闭事件 重置对话框
      setRoleDialogClosed(){
        this.selectRoleId = '';
        this.userInfo = ''
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-pagination {
    margin-top: 15px;
    text-align: center;
  }
</style>

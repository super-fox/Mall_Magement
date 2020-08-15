<template>
  <div>
    <!--  面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片试图-->
    <el-card>
      <!--      添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = !addDialogVisible">添加角色</el-button>
        </el-col>
      </el-row>

      <!--      角色列表区域-->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bdbottom',index1===0?'bdtop':'','vcenter']" v-for="(item1,index1) in scope.row.children"
                    :key="item1.id">
              <!--   渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--      渲染二级和三级权限-->
              <el-col :span="19">
                <el-row :class="[index2 === 0?'':'bdtop','vcenter']" v-for="(item2,index2) in item1.children"
                        :key="index2">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3,index3) in item2.children"
                            :key="index3" closable @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色面试" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <!--            修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRolesById(scope.row.id)">删除
            </el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <!--    添加角色对话框-->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!--      对话框的表单-->
      <el-form :model="addRoles" :rules="addRolesRules" ref="addRolesRef" label-width="90px" @close="addDialogClosed">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--      对话框的两个按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!--    修改角色对话框-->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!--      对话框的表单-->
      <el-form :model="editRoles" :rules="editRolesRules" ref="editRolesRef" label-width="80px"
               @close="addDialogClosed">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--      对话框的两个按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRolesInfo">确 定</el-button>
  </span>
    </el-dialog>

    <!--    分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%">
      <!--      树形结构图-->
      <el-tree :data="rightsList" :props="treeProps"
               show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data () {
      return {
        //所有角色列表数据
        rolesList: [],
        //添加用户的对话框
        addDialogVisible: false,
        //添加角色的表单数据
        addRoles: {
          roleName: '',
          roleDesc: ''
        },
        //添加角色的表单验证
        addRolesRules: {
          roleName: [
            {
              required: true,
              message: '请输入角色名',
              trigger: 'blur'
            },
          ],
        },
        //修改角色的对话框
        editDialogVisible: false,
        //修改角色信息查询到的角色信息
        editRoles: {},
        //修改角色的表单验证
        editRolesRules: {
          roleName: [
            {
              required: true,
              message: '请输入角色名',
              trigger: 'blur'
            },
          ],
        },
        //分配权限的对话框显示与隐藏
        setRightDialogVisible: false,
        //所有的权限数据
        rightsList: [],
        //树形控件的属性绑定
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        //默认选中的树形节点id值
        defKeys: [],
        //角色权限的id值
        roleId: ''
      }
    },
    created () {
      this.getRolesList()
    },
    methods: {
      //获取所有角色列表
      async getRolesList () {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.rolesList = res.data
      },
      //监听添加用户对话框的关闭重置
      addDialogClosed () {
        this.$refs.addRolesRef.resetFields()
      },
      //点击添加按钮 添加新角色的预校验
      addUser () {
        this.$refs.addRolesRef.validate(async valid => {
          if (!valid) return
          //发起添加角色的网络的请求
          const { data: res } = await this.$http.post('roles', this.addRoles)
          if (res.meta.status !== 201) {
            return this.$message.error('添加角色失败')
          }
          this.$message.success('添加角色成功')
          //隐藏 添加用户 的对话框
          this.addDialogVisible = false
          //刷新用户列表
          this.getRolesList()
        })
      },
      //修改用户信息
      async showEditDialog (id) {
        const { data: res } = await this.$http.get('roles/' + id)
        console.log(id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询角色信息失败')
        }
        //保存查询到的信息
        this.editRoles = res.data
        this.editDialogVisible = true
      },
      //监听修改角色的关闭重置
      editDialogClosed () {
        this.$refs.editRolesRef.resetFields()
      },
      //点击确定按钮,修改角色信息并提交
      editRolesInfo () {
        this.$refs.editRolesRef.validate(async valid => {
          if (!valid) return
          //发起修改角色信息的数据请求
          const { data: res } = await this.$http.put('roles/' + this.editRoles.roleId,
            {
              roleName: this.editRoles.roleName,
              roleDesc: this.editRoles.roleDesc
            })
          if (res.meta.status !== 200) return this.$message.error('角色信息修改失败')
          //关闭对话框
          this.editDialogVisible = false
          //刷新数据列表
          this.getRolesList()
          //提示修改成功
          this.$message.success('修改角色信息成功')
        })
      },
      //删除角色信息
      async removeRolesById (id) {
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //如果用户确认删除,返回值为字符串confirm
        //如果用户取消删除,返回值为字符串 cancel
        if (confirmResult !== 'confirm') {
          return this.$message.error('已取消删除')
        }
        //发送删除角色请求
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败!')
        }
        this.$message.success('删除用户成功')
        //刷新列表
        this.getRolesList()
      },
      //分页 监听每页展示的数据
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getRolesList()
      },
      //监听 页码值 的改变
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getRolesList()
      },
      //权限展开的删除功能 根据id删除
      async removeRightById (role, rightId) {
        //弹窗提示是否删除
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if (confirmResult !== 'confirm') {
          return this.$message.info('取消了删除')
        }
        //确认删除请求数据
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        }
        // this.getRolesList()
        role.children = res.data
      },
      //分配权限对话框
      async showSetRightDialog (role) {
        //拿到对应的id为请求添加权限做准备
        this.roleId = role.id
        //请求所有权限数据
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限列表失败')
        }
        //获取到的权限数据保存
        this.rightsList = res.data

        //在调用递归函数前对数据进行清空
        this.defKeys = []
        //调用递归函数
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      //通过递归的方式，获取角色下所有三级权限的id，并保存到defKeys数组中
      getLeafKeys (node, arr) {
        //如果当前node节点不包含children属性 那就是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      },
      //点击确定为角色分配角色
      async allotRights () {
        //获取所有选中和半选中的角色权限
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('分配角色失败')
        }
        this.$message.success('分配角色成功')
        //刷新列表
        this.getRolesList()
        //关闭分配权限对话框
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>

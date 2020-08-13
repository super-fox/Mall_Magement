<template>
  <div>
    <!--  面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片视图区域-->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数!" type="warning" show-icon :closable="false">
      </el-alert>
      <!--        选择商品分类区域-->
      <el-row class="cat_opt">
        <span>选择商品分类：</span>

        <!--           商品选择级联框-->
        <el-cascader v-model="selectedCateKeys" :options="cateList"
                     :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children' }"
                     @change="handleChange"></el-cascader>

      </el-row>

      <!--      tab页标签-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addMany">添加参数</el-button>
          <!--          动态参数表格-->
          <el-table :data="manyTabData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addOnly">添加属性</el-button>
          <!--          静态属性表格-->
          <el-table :data="onlyTabData" border stripe>
            <el-table-column type="expand">
              <!--              展开小标签-->
              <template v-slot="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                        @close="handleClose(index,scope.row)">{{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!--    添加属性的对话框-->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!--      添加表单-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>

    <!--    修改参数对话框-->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!--      添加表单-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Params',
    data () {
      return {
        //获取所有商品分类数据
        cateList: [],
        //默认tab选中的
        activeName: 'many',
        //级联选择框双向绑定的数据
        selectedCateKeys: [],
        //动态属性的数据
        manyTabData: [],
        // 添加静态属性
        onlyTabData: [],
        //添加属性对话框的显示有否
        addDialogVisible: false,
        //添加表单的数据对象
        addForm: {},
        //添加表单的验证对象
        addFormRules: {
          attr_name: [
            {
              required: true,
              message: '请输入参数名称',
              trigger: 'blur'
            },
          ]
        },
        //修改对话框的显示与否
        editDialogVisible: false,
        //修改的表单对象
        editForm: {},
        //编辑对话框的验证
        editFormRules: {
          attr_name: [
            {
              required: true,
              message: '请输入参数名称',
              trigger: 'blur'
            },
          ]
        },
        // //展开小标签的显示与否
        // inputVisible: false,
        // //展开小标签中文本框输入的内容
        // inputValue:''
      }
    },
    created () {
      //获取所有商品分类参数
      this.getCateList()
    },
    computed: {
      //判断添加属性是否禁用
      isBtnDisabled () {
        return this.selectedCateKeys.length !== 3
      },
      //获取当前选中的分类的id
      cateId () {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      //动态计算添加属性的标题是动态参数还是静态属性
      titleText () {
        return this.activeName === 'many' ? '动态参数' : '静态属性'
      }
    },
    methods: {
      //获取所有商品分类参数
      async getCateList () {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          this.$message.error('获取商品分类失败')
        }
        this.cateList = res.data
        console.log(this.cateList)
      },
      //级联选择器框中发生变化，会触发这个方法
      async handleChange () {
        this.getParamsData()
      },
      //tab 点击事件
      handleTabClick () {
        this.getParamsData()
      },
      //获取参数的列表数据 当级联选择器和tab改变的时候调用
      async getParamsData () {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTabData = []
          this.onlyTabData = []
          return
        }
        //根据所选分类的id 和当前所处的面板，获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        //给展开项的小标签添加属性
        res.data.forEach(item => {
          //控制文本的显示与隐藏
          item.inputVisible = false
          //文本框中输入的值
          item.inputValue = ''
          //把接收到的数据变为数组
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []

        })
        console.log(res.data)
        //判断是动态参数还是静态属性
        if (this.activeName === 'many') {
          this.manyTabData = res.data
        } else {
          this.onlyTabData = res.data
        }
      },
      //动态添加参数
      addMany () {
        this.addDialogVisible = true
      },
      //静态添加属性
      addOnly () {
        this.addDialogVisible = true
      },
      //取消对话框的关闭
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮添加参数
      addParams () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 201) {
            return this.$message.error('获取参数失败')
          }
          this.addDialogVisible = false
          this.getParamsData()
          // return this.$message.success('获取参数成功')
        })
      },
      //编辑对话框
      async showEditDialog (id) {
        //查询当前参数的信息
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,
          { params: { attr_sel: this.activeName } })
        if (res.meta.status !== 200) {
          this.$message.error('获取参数信息失败')
        }
        this.editForm = res.data
        // this.$message.success('获取参数信息成功')
        this.editDialogVisible = true
      },
      //关闭编辑对话框
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },
      //修改表单提交
      editParams () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败')
          }
          this.getParamsData()
          this.editDialogVisible = false
          return this.$message.success('修改参数成功')
        })
      },
      //删除对应的属性
      async removeParams (attr_id) {
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消这次删除')
        }
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除属性失败')
        }
        this.getParamsData()
        return this.$message.success('成功删除属性')
      },
      //展开小标签的文本框失去焦点或点击回车会触发
      async handleInputConfirm (row) {
        //判断输入的是否是空格
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        //输入真实的内容
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        //将页面上展示的数据发送到数据库中
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(',')
          })
        if (res.meta.status !== 200) {
          return this.$message.error('添加属性失败')
        }
        this.$message.success('添加属性成功')
      },
      //展开小标签的按钮 点击之后出现文本框
      showInput (row) {
        row.inputVisible = true
        //让文本框自动获得焦点
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      //删除展开小标签
      async handleClose (index, row) {
        //将页面上展示的数据发送到数据库中
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(',')
          })
        if (res.meta.status !== 200) {
          return this.$message.error('删除属性失败')
        }
        row.attr_vals.splice(index, 1)
        this.$message.success('删除属性成功')
      },

    }
  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 6px;
  }

  .input-new-tag {
    width: 100px;
  }
</style>

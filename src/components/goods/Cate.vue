<template>
  <div>

    <!--  面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--      表格区域-->
      <tree-table class="tree-table" :data="cateList"
                  :columns="columns" :selection-type="false" :expand-type="false"
                  show-index index-text border>
        <!--        是否有效-->
        <template slot-scope="scope" slot="isok">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!--        排序-->
        <template slot-scope="scope" slot="order">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!--        操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除
          </el-button>
        </template>
      </tree-table>

      <!--      分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[3, 5, 10,20]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--    添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClosed">
      <!--      对话框里面添加分类的表单-->
      <el-form :model="addCateForm" :rules="addCateFormRules"
               ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!--        对话框里面的添加父级-->
        <el-form-item label="父级分类:">
          <!--          options指定数据源-->
          <!--props指定配置对象-->
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="{ checkStrictly: 'true',value:'cat_id',label:'cat_name',children:'children'}"
            @change="parentCateChanged" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>

    <!--    编辑对话框-->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!--      对话框表单-->
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCateInfo">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: 'Cate',
    data () {
      return {
        //保存分页数据
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        //商品列表的所有数据
        cateList: [],
        //商品列表条数总数
        total: 0,
        //为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            //插件定义，表示将当前列定义为模板列
            type: 'template',
            //插件定义，表示当前这一列使用模板名称
            template: 'isok'
          },
          {
            label: '排序',
            //插件定义，表示将当前列定义为模板列
            type: 'template',
            //插件定义，表示当前这一列使用模板名称
            template: 'order'
          },
          {
            label: '操作',
            //插件定义，表示将当前列定义为模板列
            type: 'template',
            //插件定义，表示当前这一列使用模板名称
            template: 'opt'
          }
        ],
        //添加分类对话框显示与否
        addCateDialogVisible: false,
        //添加分类的表单数据对象
        addCateForm: {
          //父级分类的id
          cat_pid: 0,
          //将要添加的分类的名称
          cat_name: '',
          //添加分类的等级
          cat_level: 1,
        },
        //添加分类名称的验证规则
        addCateFormRules: {
          cat_name: [
            {
              required: true,
              message: '请输入分类名称',
              trigger: 'blur'
            }
          ]
        },
        //父级分类数据
        parentCateList: [],
        //选中的父级分类的id数组
        selectKeys: [],
        //编辑对话框的显示与否
        editDialogVisible: false,
        //编辑分类的表单验证
        editCateRules: {
          cat_name: [
            {
              required: true,
              message: '请输入分类名',
              trigger: 'blur'
            }
          ]
        },
        //修改分类查询到的分类信息
        editCateForm: {}
      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      async getCateList () {
        //发起网络请求获取所有商品列表信息
        const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        //将获取的数据保存到商品列表
        console.log(res.data)
        this.cateList = res.data.result
        //获取数据列表条数
        this.total = res.data.total
      },
      //每页展示多少条
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      //当前所在页
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      //点击添加分类展示对话框
      showAddCateDialog () {
        //先获取父级分类的数据列表
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      //获取父级分类的数据列表
      async getParentCateList () {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类数据失败')
        }
        this.parentCateList = res.data
      },
      //父级分类选择项发生触发这个方法
      parentCateChanged () {
        console.log(this.selectKeys)
        //如果selectKeys数组中length的长度大于0，证明选择了父级分类
        //反之，则没有选择父级分类
        if (this.selectKeys.length > 0) {
          //将父级分类的最后一个id值赋值给父级表单id
          this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
          //为当前分类的等级赋值
          this.addCateForm.cat_level = this.selectKeys.length
          return
        } else {
          //反之
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }

      },
      //点击确认按钮，添加新分类
      addCate () {
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加分类失败')
          }
          //重新获取所有商品分类
          this.getCateList()
          this.$message.success('添加分类成功')
          this.addCateDialogVisible = false
        })
      },
      //添加分类对话框的重置
      addCateDialogClosed () {
        //清空分类名称
        this.$refs.addCateFormRef.resetFields()
        //清空级联选择器
        this.selectKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      //点击编辑功能弹出对话框 修改分类信息
      async showEditDialog (id) {
        const { data: res } = await this.$http.get('categories/' + id)
        console.log(id)
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类失败！')
        }
        // this.$message.success('获取分类成功')
        //将查询到的数据赋值给对话框表单
        this.editCateForm = res.data
        this.editDialogVisible = true
      },
      //修改分类对话框重置
      editDialogClosed () {
        this.$refs.editCateRef.resetFields()
      },
      //修改分类信息并提交
      editCateInfo () {
        this.$refs.editCateRef.validate(async valid => {
          console.log(valid)
          if (!valid) return
          //发起修改分类的数据请求
          const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id,
            { cat_name: this.editCateForm.cat_name })
          if (res.meta.status !== 200) {
            return this.$message.error('分类信息修改失败')
          }
          //关闭对话框
          this.editDialogVisible = false
          //刷新数据
          this.getCateList()
          this.$message.success('分类信息修改成功')
        })
      },
      //删除分类信息
      async removeCateById (id) {
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
        //发送删除分类的网络请求
        const { data: res } = await this.$http.delete('categories/' + id)
        if(res.meta.status !== 200){
          return this.$message.error('删除商品分类失败')
        }
        this.$message.success('删除商品分类成功')
        this.getCateList()
      }
    }
  }
</script>

<style lang="less" scoped>
  .tree-table {
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .el-pagination {
    text-align: center;
  }

</style>

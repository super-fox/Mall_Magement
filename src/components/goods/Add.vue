<template>
  <div>
    <!--  面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片视图区域-->
    <el-card>
      <!--    提示警告-->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!--      进度条-->
      <el-steps :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--      左侧tab栏-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave"
                 @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',children:'children' }"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTabData"
                          :key="item.attr_id">
              <!--              具体展示复选框组-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--            富文本编辑器-->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>


    <!--    图片预览对话框-->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'Add',
    data () {
      return {
        //获取商品列表信息
        cateList: [],
        activeIndex: '0',
        //添加表单的数据
        addForm: {
          goods_name: '',
          goods_price: '',
          goods_weight: '',
          goods_number: '',
          //商品所处分类数组
          goods_cat: [],
          //保存图片数组
          pics: [],
          //富文本编辑器内容，商品介绍
          goods_introduce: '',
          attrs: []
        },
        //添加表单的数据验证
        addFormRules: {
          goods_name: [
            {
              required: true,
              message: '请输入商品名称',
              trigger: 'change'
            }
          ],
          goods_price: [
            {
              required: true,
              message: '请输入商品价格',
              trigger: 'change'
            }
          ],
          goods_weight: [
            {
              required: true,
              message: '请输入商品重量 ',
              trigger: 'change'
            }
          ],
          goods_number: [
            {
              required: true,
              message: '请输入商品数量 ',
              trigger: 'change'
            }
          ],
          goods_cat: [
            {
              required: true,
              message: '请选择商品分类 ',
              trigger: 'change'
            }
          ]
        },
        //动态参数列表数据
        manyTabData: [],
        //静态属性列表
        onlyTabData: [],
        //上传图片的地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        //图片上传请求头
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        //图片的预览
        previewPath: '',
        //图片预览显示与否
        previewVisible: false
      }
    },
    created () {
      this.getCateList()
    },
    computed: {
      cateId () {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    },
    methods: {
      //获取所有商品列表
      async getCateList () {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        this.cateList = res.data
      },
      handleChange () {
        console.log(this.addForm.goods_cat)
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },
      //验证即将离开和进入
      beforeTabLeave (activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先填写基本信息')
          return false
        }
      },
      async tabClicked () {
        //动态获取参数信息
        var indexId = this.activeIndex
        switch (indexId) {
          case '1':
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
              params: { sel: 'many' }
            })
            if (res.meta.status !== 200) {
              return this.$message.error('获取动态参数列表失败')
            }
            console.log(res.data)
            res.data.forEach(item => {
              item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
            })
            this.manyTabData = res.data
            break
          case '2':
            const { data: res1 } = await this.$http.get(`categories/${this.cateId}/attributes`, {
              params: { sel: 'only' }
            })
            if (res1.meta.status !== 200) {
              return this.$message.error('获取静态属性失败!')
            }
            this.onlyTabData = res1.data
            console.log(this.onlyTabData)
            break
        }
      },
      //图片预览
      handlePreview (file) {
        //获取图片的完整路径
        this.previewPath = file.response.data.url
        //展示预览图片
        this.previewVisible = true
      },
      //移出图片
      handleRemove (file) {
        console.log(file)
        //获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        //从pics数组中找到图片路径所在的索引值
        const i = this.addForm.pics.findIndex(x => x.pic === filePath)
        console.log(i)
        //删除图片信息
        this.addForm.pics.splice(i, 1)
        console.log(this.addForm.pics)
      },
      //监听图片上传成功事件
      handleSuccess (response) {
        //拼接得到一个图片信息对象
        const picInfo = { pic: response.data.tmp_path}
        //将图片信息push到pics数组中
        this.addForm.pics.push(picInfo)
        console.log(this.addForm)
      },
      //添加商品
      add () {
        console.log(this.addForm)
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项')
          }
          //执行添加 深拷贝
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
          console.log(form)
          //处理动态参数
          this.manyTabData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(',')
            }
            this.addForm.attrs.push(newInfo)
          })
          //处理静态参数
          this.onlyTabData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs

          //发起网络请求
          const {data:res} = await this.$http.post('goods',form)
          if(res.meta.status !== 201){
            return this.$message.error('添加商品失败')
          }
          this.$router.push('/goods')
          this.$message.success('添加商品成功')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-steps {
    margin: 20px 0;
  }

  .el-step__title {
    font-size: 10px;
  }

  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>

<template>
  <div>
    <!--  面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片试图-->
    <el-card>
      <!--      搜索框和添加按钮-->
      <el-row :gutter="20">
        <el-col :span="8">
          <!--          搜索框-->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsListSearch">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsListSearch"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!--          添加商品-->
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!--      展示数据的table-->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="500px"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="80px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--      分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'List',
    data () {
      return {
        //查询参数列表
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5
        },
        //获取商品列表
        goodsList: [],
        //商品列表总数
        total: 0
      }
    },
    created () {
      this.getGoodsList()
    },
    methods: {
      //获取商品所有列表
      async getGoodsList () {
        const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        console.log(res.data)
        this.goodsList = res.data.goods
        this.total = res.data.total
        // return this.$message.success('获取商品列表成功')
      },
      //获取分页页数改变
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      //获取分页页数改变
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      //搜索关键字
      getGoodsListSearch () {
        this.queryInfo.pagenum = 1
        this.getGoodsList()
      },
      //删除对应商品
      async removeById (id) {
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }

        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败')
        }
        this.$message.success('删除商品成功')
        this.getGoodsList()
      },
      //添加商品跳转页面
      goAddPage(){
        this.$router.push('/goods/add')
      }
    }
  }
</script>

<style lang="less" scoped>

</style>

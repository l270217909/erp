<template>
  <div class="warpper">
    <div class="toolbar">
      <el-button type="primary" plain @click='handleNew'>添加种类</el-button>
      <el-button type="primary" plain @click='handleUpload'>数据导入</el-button>
    </div>
      <el-table :data="tableData" stripe size='small' border style="width: 100%">
    <el-table-column prop="id" label="标识" width="50" align="cneter"></el-table-column>
    <el-table-column prop="name" label="名称" width="150" align="center"></el-table-column>
    <el-table-column prop="remark" label="备注" min-width="200"></el-table-column>
    <el-table-column label="操作" width="200">
      <template slot-scope="scope">
        <el-button size="mini" plain icon='el-icon-edit-outline' @click="handleEdit(scope.row.id)">编辑</el-button>
        <el-button size="mini" plain  icon='el-icon-delete' type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  
   <div class="page">
   <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page.current_page"
      :page-sizes="page.sizes"
      :page-size="page.per_page"
      layout="total, sizes, prev, pager, next, jumper"
      :total="page.total">
    </el-pagination>
  </div>
  <div class="form">
<el-dialog :title="title" :visible.sync="dialogFormVisible">
  <el-form :model="formData" :rules="rules" ref='ruleForm'>
    <el-form-item label="种类名称" prop='name'>
      <el-input v-model="formData.name" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="种类说明" >
      <el-input v-model="formData.remark" autocomplete="off"></el-input>
    </el-form-item>
   
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="dialogFormVisible = false">取 消</el-button>
    <el-button type="primary" @click="submitForm('ruleForm')">{{cmdTitle}}</el-button>
  </div>
</el-dialog>
<el-dialog title="数据导入" :visible.sync="UploadVisible">
  <p><a href="http://erp.ouenyione.com/xls/cate.xlsx">模板下载</a></p>
  <el-upload
  class="upload-demo"
  ref="upload"
  action="http://erp.ouenyione.com/api/cates/upload"
  :auto-upload="false"
  :headers="uploadHeaders"
  :with-credentials='true'
  :on-success="handleUploadSuccess"
  >
  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
  <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
  <div slot="tip" class="el-upload__tip">只能上传xlsx文件</div>
</el-upload>
</el-dialog>
  </div>
  </div>
  
</template>

<script>
import { index,show, store,update,destroy,upload } from "@/api/category";
import { getToken } from "@/utils/auth";
export default {
  name: "category_index",
  data() {
    return {
      tableData: [],
      page:{
          total:null,
          per_page:10,
          sizes:[10,20,25,50],
          current_page:1
      },
formData:{},
dialogFormVisible:false,
rules:{
name:[
  {required:true,message:'请输入物品种类',trigger:'blur'},
  {type: 'string',pattern: /^[\u4e00-\u9fa5]{2,5}$/,message: '请输入中文内容，长度在2-5个字符之间',trigger: 'blur'}
  ]
},
isNew:false,
isEdit:false,
title:'',
cmdTitle:'',
UploadVisible:false,
uploadHeaders:{
  Authorization: 'Bearer '+ getToken()
}
    };
  },
  created() {
    this.fetchData();
},
methods:{
  handleUploadSuccess(){
    this.$message.success('导入文件成功')
    this.fetchData()
    this.UploadVisible=false
  },
   submitUpload() {
        this.$refs.upload.submit();
      }
  ,
  handleUpload(){
this.UploadVisible=true
  },
  setTitle(){
this.title= this.isNew ===true?'新建物品种类':'编辑物品种类'
this.cmdTitle= this.isNew ===true?'保存':'修改'
  },
  handleNew(){
    this.formData=Object.assign({},{
      name:'',
      remark:'',
      pid:0,
    })
    this.isNew=true
    this.isEdit=false
    this.setTitle()
    this.dialogFormVisible=true
    
  }, 
  parseErrors(errors){
let info=''
let name=errors.name
if (Array.isArray(name)){
  name.forEach(item=> {
    info +=item + ','
  })
}
  info = info.substring(0,info.length-1)
  return info
  },
  async submitForm(form){
  this.$refs[form].validate(async (valid) => {
          if (valid) {
            try{
              if(this.isEdit){
              await update(this.formData)
            this.$message.success('数据修改成功')
              }
              if(this.isNew){
                console.log(this.formData)
                await store(this.formData)
            this.$message.success('种类添加成功')
              }
            this.fetchData()
            this.isNew=false
            this.isEdit=false
            this.dialogFormVisible=false
            }
            catch(error){
            let {errors}=error.response.data
            let info=this.parseErrors(errors);
            this.$message.error(info)
            }    
          } else {
            this.$message.error('数据校验出错，请按照指定的规则输入')
            return false;
          }
    });
    
  },
   async handleEdit(id){
      let { data } = await show(id);
      this.formData=data;
      this.isNew=false
      this.isEdit=true
      this.setTitle()
      this.dialogFormVisible=true
    },
   async handleDelete(id){
     try{
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await destroy(id)
          this.$message({
            type: 'success',
            message: '数据删除成功!'
          });
          this.fetchData();
     }catch(error) {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        };
    },
    handleSizeChange(val){
        this.page.per_page=val;
        this.fetchData();
    },
    handleCurrentChange(val){
        this.page.current_page=val;
        this.fetchData();
    },
  async  fetchData(){
     const { data,meta } = await index(this.page.current_page,this.page.per_page)
            meta.per_page=parseInt(meta.per_page);
            this.page=Object.assign(this.page,meta);
            this.tableData=data
    }
}
}
</script>

<style>
.warpper,.page,.tooblar{
    margin:20px
}
.toolbar{border:1px solid #ccc;margin-top:10px;padding:5px}
.warpper{
    margin-bottom: 10px
}
.page{
    margin-top:10px;
    text-align: center
}

</style>
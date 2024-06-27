<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange, getStatusIcon } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import {  Edit } from '@element-plus/icons-vue'
  import { dayjs } from "@/utils/common-dayjs"
  import { changeStatus, pageList, addLabel, checkLabelKey, queryLabelDetail, removeLabel} from "@/api/ssh/label"

  const queryFormRef = ref(null);
  const pluginCode = "jsch";
  const labelKey = ref(null)

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    labelKey: undefined,
    labelName: undefined
  })

  const validKey = (rule:any,value:any, callback:any)=>{
    if(value == labelKey.value){
      callback();
    }

    checkLabelKey(value).then((res)=>{
        if(res.code == 200){
          if(!res.data){
            callback()
          }else{
            callback(new Error('标签key已存在，请确认后修改'));
          }
        }
    })
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
      'labelKey' : [
        { required: true, message: "标签key不能为空", trigger: "blur" },
        { min: 2, max: 20, message: '标签key长度必须介于 2 和 20 之间', trigger: 'blur' },
        { pattern: /^[-_a-zA-Z0-9]*$/, message: '标签key只可以输入字母、数字、下划线及中划线', trigger: 'blur' },
        { validator: validKey , trigger: 'blur' }
      ],
      'labelName': [
        { required: true, message: "标签名不能为空", trigger: "blur" },
        { min: 2, max: 20, message: '标签名长度必须介于 2 和 20 之间', trigger: 'blur' }
      ]
  })


  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])


  const total= ref(0)
  const projectList = reactive([])

  // 详情
  const detail = ref(false);
  // 新增表单
  const addDialog = ref(false);
  // 更新表单
  const updateDialog = ref(false);
  const formRef = ref<FormInstance>();

  const title = ref(null)
  const pluginInstance = reactive([]);

  const formInstance = reactive([]);

  const form = reactive({
    id:undefined,
    labelKey:undefined,
    labelName:undefined,
    hosts:[]
  })

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    pageList(addDateRange(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            projectList.splice(0,projectList.length);
            Object.assign(projectList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            projectList.splice(0,projectList.length);
            total.value = 0;
          }
        }
    );
  }

  // 处理搜索按钮
  const handleQuery = function(){
    getList()
  }

  // 处理查询按钮
  const resetQuery = function(){

    dateRange.value = [];
    queryParams.labelKey = undefined;
    queryParams.labelName = undefined;
    queryFormRef.value.resetFields();
    handleQuery();
  }


  // 多选框选中数据
  const handleSelectionChange = function(selection){

  }

  const handleStatusChange = (row)=>{
    const id = row.id
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否禁用"' + row.labelKey + '"的数据项？'
    }else{
      msg = '是否启用"' + row.labelKey + '"的数据项？'
    }

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
        let tmpStatus;
        if(status == 0){
          tmpStatus = 1
        }else{
          tmpStatus = 0
        }
        changeStatus(id,tmpStatus).then((res)=>{
            if(res.code == 200){
                getList()
                ElMessage({
                  type: 'success',
                  message: '操作成功',
                })
            }
        })
    })
    .catch(() => { })
  }

  // 重置表单
  const reset = ()=> {
    labelKey.value = null
    formRef.value?.clearValidate()
    formInstance.splice(0,formInstance.length);
    form.hosts.splice(0,form.hosts.length)
    Object.assign(form,{
      id:undefined,
      labelKey:undefined,
      labelName:undefined
    })
  }

  // 更新表单提交处理
  // const updateForm = async ()=>{
  //   loading.value = true;

  //   updateLabel(form).then(res =>{
  //       if(res?.code == 200){
  //         ElMessage({
  //             showClose: true,
  //             message: '修改成功',
  //             type: 'success',
  //         });
  //       }else{
  //         ElMessage.error('更新出现异常');
  //         loading.value = false;
  //         throw response?.msg;
  //       }

  //       updateDialog.value = false;
  //       getList();
  //   })
  // }

  // 新增表单提交处理
  const submitForm = async ()=>{
    loading.value = true;
    //todo 这里校验全部失败，需要改
    await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage.error('表单验证失败');
            loading.value = false;
            throw err;
        });

    if(form.id == undefined){
      addLabel(form).then(response => {
        if(response?.code == 200){
          ElMessage({
                showClose: true,
                message: '新增成功',
                type: 'success',
          });
        }else{
          ElMessage.error('新增出现异常');
          loading.value = false;
          throw response?.msg;
        }

        addDialog.value = false;
        getList();
      });
    }else{
      addLabel(form).then(res =>{
        if(res?.code == 200){
          ElMessage({
              showClose: true,
              message: '修改成功',
              type: 'success',
          });
        }else{
          ElMessage.error('更新出现异常');
          loading.value = false;
          throw response?.msg;
        }

        addDialog.value = false;
        getList();
      })
    }
  }

// 处理删除按钮
const handleDelete = function(row){
    const labelKey = row.labelKey
    let msg = ""
    msg = '是否删除标签【"' + labelKey + '"】的数据项？'

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      removeLabel(row.id).then((res)=>{
          if(res.code == 200){
              // 重置查询表单,并进行查询
              queryParams.pageNum=1
              getList()
              ElMessage({
                type: 'success',
                message: '删除成功',
              })
          }else{
              ElMessage({
                type: 'error',
                message: '删除失败:'+res.msg,
              })
          }
      })
    })
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset()
    const id = row.id
    labelKey.value = row.labelKey
    form.labelKey = row.labelKey
    form.labelName = row.labelName

    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
        if(res.code == 200){
          const data = res.data;
          data.forEach((v) =>{
              formInstance.push({
                label:v.instanceName,
                key:v.instanceCode
              })
          })

        }
    });

    queryLabelDetail(id).then((res)=>{
      console.log(res)
          if(res.code == 200){
                form.hosts = res.data
                form.id = id
          }
    })


    addDialog.value = true
    title.value = "更新ssh标签实例信息"
  }

  // 处理新增按钮
  const handleAdd = function(){
    reset()
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
        if(res.code == 200){
          const data = res.data;
          data.forEach((v) =>{

            formInstance.push({
              label:v.instanceName,
              key:v.instanceCode
            })
          })
        }
    });

    addDialog.value = true
    title.value = "添加ssh标签信息"
  }

  // 取消添加表单处理
  const cancelAdd = ()=>{
    addDialog.value = false;
    reset();
  }

  // 取消更新表单处理
  // const cancelUpdate = ()=>{
  //   updateDialog.value = false;
  //   reset();
  // }

  // 触发查询
  getList();
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
            <el-form-item label="标签key" prop="queryParams.labelKey">
              <el-input v-model="queryParams.labelKey" placeholder="请输入标签key" clearable style="width: 240px"/>
            </el-form-item>
            <el-form-item label="标签名" prop="queryParams.labelName">
              <el-input v-model="queryParams.labelName" placeholder="请输入标签名" clearable style="width: 240px"/>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                class="search-select"
                v-model="queryParams.status"
                placeholder="项目状态"
                clearable
                style="width: 240px"
              >
                <el-option v-for="dict in status"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="dateRange"
                style="width: 240px"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
            </el-form-item>
      </el-form>
    </yt-card>
    <yt-card>
      <!--  option-->
      <div class="option-wrap">
        <el-button
          type="primary"
          plain
          size="default"
          @click="handleAdd" v-hasPerms="['/ssh/label/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="编号" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="标签key" align="left" key="labelKey" prop="labelKey"  :show-overflow-tooltip="true"  />
          <el-table-column label="标签名" align="left" key="labelName" prop="labelName"  :show-overflow-tooltip="true"  />
          <el-table-column label="状态" align="center" key="status" prop="status"  >
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="left" prop="createTime"  width="200">
            <template #default="scope">
              {{
                   scope.row.createTime ? dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") : ''
              }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" align="left" prop="updateTime"  width="200">
            <template #default="scope">
              {{ scope.row.updateTime ? dayjs(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss") : ''  }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="220"
            align="center"
          >
            <template #default="scope">
              <div class="action-btn">
                <el-button
                  size="small"
                  @click="handleStatusChange(scope.row)"
                  v-hasPerms="['/ssh/label/changeStatus/**']"
                >{{ showStatusOperateFun(scope.row.status)  }}</el-button>
                <el-button
                  size="small"
                  @click="handleUpdate(scope.row)"
                  v-hasPerms="['/ssh/label/add']"
                >修改</el-button>
                <el-button
                  size="small"
                  @click="handleDelete(scope.row)"
                  v-hasPerms="['/ssh/label/del/*']"
                >删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-wrap">
        <yt-page :total="total" v-model="queryParams" @change="getList"></yt-page>
      </div>
    </yt-card>

    <!-- 新增/更新对话框 -->
    <el-dialog :title="title" v-model="addDialog" width="720px" append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="标签key" prop="labelKey">
                <el-input v-model="form.labelKey" placeholder="请输入标签key" maxlength="20" :disabled="form.id != undefined" style="width: 300px"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="标签名" prop="labelName">
                <el-input v-model="form.labelName" placeholder="请输入标签名" maxlength="20" style="width: 300px"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col>
              <el-form-item label="SSH实例" >
                <el-transfer v-model="form.hosts" :data="formInstance"  :titles="[ '未关联' , '已关联']"/>
              </el-form-item>
            </el-col>
          </el-row>

        </el-form>
      </yt-card>
      <template #footer>
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="submitForm(false)">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 更新对话框
    <el-dialog :title="title" v-model="updateDialog" width="600px" append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="标签key" prop="labelKey">
                <el-input v-model="form.labelKey" placeholder="请输入标签key" maxlength="20" disabled="true"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="标签名" prop="labelName">
                <el-input v-model="form.labelName" placeholder="请输入标签名" maxlength="20" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-input v-model="form.id" v-if="false" />
            <el-col>
              <el-transfer v-model="form.hosts" :data="formInstance"
              :titles="[ '未关联' , '已关联']"/>
            </el-col>
          </el-row>

        </el-form>
      </yt-card>
      <template #footer>
        <el-button type="primary" @click="updateForm">确 定</el-button>
        <el-button @click="cancelUpdate">取 消</el-button>
      </template>
    </el-dialog> -->

  </div>
</template>

<style lang="scss" scoped>

</style>

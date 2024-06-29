<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange, getStatusIcon } from "@/utils/common"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit } from '@element-plus/icons-vue'
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { changeStatus, pageList,  addHost, queryDetail, checkServerName, checkInstanceCode, removeServer} from "@/api/ansible/host"

  const queryFormRef = ref(null);
  const sshInstanceCodes = reactive([])
  const curServerName = ref(null)
  const curInstanceCode = ref(null)


  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    sshInstanceCode:undefined,
    serverName: undefined
  })

  const validServerName = (rule:any,value:any, callback:any)=>{
    if(form.sshInstanceCode == undefined){
      callback(new Error('请先选择实例'));
    }
    if(value == curServerName.value){
      callback();
    }

    checkServerName(value,form.sshInstanceCode).then((res)=>{
        if(res.code == 200){
          if(res.data){
            callback(new Error('主机名称已存在，请确认后修改'));
          }else{
            callback()
          }
        }
    })
  }

  const validInstanceCode = (rule:any,value:any, callback:any)=>{
    if(value == curInstanceCode.value){
      callback();
    }

    checkInstanceCode(value).then((res) =>{
        if(res.code == 200){
          if(res.data){
            callback(new Error('实例已存在，请确认后修改'));
          }else{
            callback()
          }
        }
    })
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
      'sshInstanceCode' : [
        { required: true, message: "实例编码不能为空", trigger: "blur" },
        { pattern: /^[-_a-zA-Z0-9]*$/, message: '实例编码只可以输入字母、数字、下划线及中划线', trigger: 'blur' },
        { validator: validInstanceCode , trigger: 'blur' }
      ],
      'serverName': [
        { required: true, message: "主机名称不能为空", trigger: "blur" },
        { min: 2, max: 20, message: '主机名称长度必须介于 2 和 20 之间', trigger: 'blur' },
        { validator: validServerName , trigger: 'blur' }
      ],
      'ansibleInventoryDir': [
        { required: true, message: "目录不能为空", trigger: "blur" }
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
  const formRef = ref<FormInstance>();
  const pluginCode = "jsch"

  const title = ref(null)
  const pluginInstance = reactive([]);

  const formInstance = reactive([]);

  const form = reactive({
    serverName:undefined,
    sshInstanceCode:undefined,
    ansibleInventoryDir:undefined
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

    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
          if(res.code == 200){
            Object.assign(sshInstanceCodes,res?.data)
            console.log(sshInstanceCodes)
          }
    })

  }

  // 处理搜索按钮
  const handleQuery = function(){
    getList()
  }

  // 处理查询按钮
  const resetQuery = function(){

    queryParams.serverName = undefined
    dateRange.value = [];
    queryFormRef.value.resetFields();
    queryParams.instanceCode = defaultInstanceCode.value;
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
      msg = '是否禁用"' + row.serverName + '"的数据项？'
    }else{
      msg = '是否启用"' + row.serverName + '"的数据项？'
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
                  message: '操作成功'
                })
            }
        })
    })
    .catch(() => { })
  }

  // 重置表单
  const reset = ()=> {
    formRef.value?.clearValidate()
    curServerName.value = null
    curInstanceCode.value = null
    Object.assign(form,{
      serverName:undefined,
      sshInstanceCode:undefined,
      ansibleInventoryDir:undefined
    })
  }

  // 表单提交处理
  const submitForm = async ()=>{
    loading.value = true;
    //todo 这里校验全部失败，需要改
    await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage.error('表单验证失败');
            loading.value = false;
            throw err;
        });

    addHost(form).then(response => {
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

  }

  const handleDelete = function(row){
    const serverName = row.serverName
    let msg = ""
    msg = '是否删除主机名为【"' + serverName + '"】的数据项？'

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      removeServer(row.id).then((res)=>{
        if(res.code == 200){
          getList();
          ElMessage({
              showClose: true,
              message: '删除成功',
              type: 'success',
          });
        }else{
          ElMessage({
              showClose: true,
              message: '删除出现异常,请联系管理员',
              type: 'error',
          });
        }
      })
    })
  }

  // 处理修改按钮
  const handleUpdate = function(row){
    reset()
    curServerName.value = row.serverName
    curInstanceCode.value = row.sshInstanceCode
    queryDetail(row.id).then((res) =>{
        if(res.code == 200){
            Object.assign(form,res.data)
        }
    })
    addDialog.value = true
    title.value = "修改 "+row.serverName+" 主机配置信息"
  }

  // 处理新增按钮
  const handleAdd = function(){
    reset()
    addDialog.value = true
    title.value = "添加ansible主机配置信息"
  }

  // 表单取消处理
  const cancelDetail = ()=>{
    detail.value = false;
    reset();
  }
  // 表单取消处理
  const cancelAdd = ()=>{
    addDialog.value = false;
    reset();
  }

  // 触发查询
  getList();

</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form class="form-wrap"  :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="插件实例" prop="sshInstanceCode">
              <el-select
                class="search-select"
                v-model="queryParams.sshInstanceCode"
                @keyup.enter.native="handleQuery"
                placeholder="请选择实例"
                clearable
              >
                <el-option v-for="item in sshInstanceCodes"
                           :key="item.instanceCode"
                           :label="item.instanceName"
                           :value="item.instanceCode"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="主机名" prop="queryParams.serverName">
              <el-input v-model="queryParams.serverName" placeholder="请输入主机名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select
                class="search-select"
                v-model="queryParams.status"
                placeholder="项目状态"
                clearable
              >
                <el-option v-for="dict in status"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </yt-card>

    <yt-card>
      <!--  option-->
      <div class="option-wrap">
        <el-button
          type="primary"
          plain
          size="default"
          @click="handleAdd" v-hasPerms="['/ansible/host/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="编号" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="实例编码" align="left" key="sshInstanceCode" prop="sshInstanceCode"  v-if="false"/>
          <el-table-column label="主机名称" align="left" key="serverName" prop="serverName"  :show-overflow-tooltip="true"  />
          <el-table-column label="目录" align="left" key="ansibleInventoryDir" prop="ansibleInventoryDir"  :show-overflow-tooltip="true"  />
          <el-table-column label="状态" align="center" key="status"  width="100">
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
          <el-table-column label="修改时间" align="left" prop="updateTime"  width="200">
            <template #default="scope">
              {{ scope.row.updateTime ? dayjs(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss") : ''  }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="220"
          >
            <template v-slot="scope">
              <div class="action-btn">
                <el-button
                  size="small"
                  @click="handleStatusChange(scope.row)"
                  v-hasPerms="['/ansible/host/changeStatus/**']"
                >{{ showStatusOperateFun(scope.row.status)  }}</el-button>


                <el-button
                  size="small"
                  @click="handleUpdate(scope.row)"
                  v-hasPerms="['/ansible/host/add']"
                >修改</el-button>

                <el-button
                  size="small"
                  @click="handleDelete(scope.row)"
                  v-hasPerms="['/ansible/host/del/*']"
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

    <!-- 新增对话框 -->
    <el-dialog :title="title" v-model="addDialog" width="var(--dialog-lg-w)"  append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
          <el-row>
            <el-col :span="15">
              <el-form-item label="插件实例" prop="sshInstanceCode">
                <el-select
                  class="search-select"
                  v-model="form.sshInstanceCode"
                  placeholder="请选择插件实例"
                  @change="switchInstance"
                  clearable
                  style="width: 240px"
                >
                  <el-option v-for="item in sshInstanceCodes"
                             :key="item.instanceCode"
                             :label="item.instanceName"
                             :value="item.instanceCode"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="15">
              <el-form-item label="主机名称" prop="serverName">
                <el-input v-model="form.serverName" placeholder="请输入主机名称" maxlength="20" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="15">
              <el-form-item label="inventory目录" prop="ansibleInventoryDir">
                <el-input v-model="form.ansibleInventoryDir" placeholder="请输入目录路径"  />
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

  </div>
</template>

<style lang="scss" scoped>

</style>

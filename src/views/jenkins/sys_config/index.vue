<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange, getStatusIcon } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import {  Edit } from '@element-plus/icons-vue'
  import { dayjs } from "@/utils/common-dayjs"
  import {sysConfigList,addConfig,queryConfigInfoById,changeConfigStatus,sysConfigSelectOption,
    checkHome,checkName,toolsSelectOption,tools,pluginTypeSelectOption} from "@/api/jenkins/sys_config"

  const queryFormRef = ref(null);
  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    instanceCode:undefined,
    name: undefined
  })



  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])


  const total= ref(0)
  const sysConfigPageList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();

  const validHome = (rule:any,value:any, callback:any)=>{
      const checkValue = reactive({
        jenkinsManageToolsModule:undefined,
        homePath:undefined,
        instanceCode:undefined
      })
      if(form.pluginType == undefined || form.pluginType == ''){
        callback(new Error('请选择插件类型后再次编辑'));
      }
      checkValue.jenkinsManageToolsModule = form.pluginType
      checkValue.homePath = value
      checkValue.instanceCode = form.instanceCode

      checkHome(checkValue).then((res)=>{
        if(res?.data){
          callback();
        }else{
          callback(new Error('路径不存在:'+value));
        }
      })
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
      pluginType: [
        { required: true, message: "插件类型不能为空", trigger: "blur" }
      ],
      name : [
        { required: true,  message: "插件名称不能为空", trigger: "blur" },
        { min: 2, max: 200, message: '插件名称长度必须介于 2 和 200 之间', trigger: 'blur' }
      ],
      value : [
        { required: true, message: "插件路径不能为空", trigger: "blur" },
        { required: true, validator: validHome,  trigger: "blur" },
        { min: 2, max: 200, message: '插件路径长度必须介于 2 和 200 之间', trigger: 'blur' }
      ],
  })

  const form = reactive({
        id: undefined,
        name: undefined,
        pluginType: undefined,
        value: undefined,
        status: undefined,
        instanceCode: undefined
  })
  const title = ref("")
  const pluginInstance = reactive([]);
  const pluginCode = "jenkins"

  // 重置表单
  const reset = ()=> {
    formRef.value?.clearValidate()
      Object.assign(form,{
        id: undefined,
        name: undefined,
        pluginType: undefined,
        value: undefined,
        status: undefined,
        instanceCode: undefined
      })
  }

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    sysConfigList(addDateRange(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            sysConfigPageList.splice(0,sysConfigPageList.length);
            Object.assign(sysConfigPageList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            sysConfigPageList.splice(0,sysConfigPageList.length);
            total.value = 0;
          }
        }
    );
  }

  // 处理搜索按钮
  const handleQuery = function(){
    getList()
  }

  // 处理重置按钮
  const resetQuery = function(){
    dateRange.value = [];
    queryFormRef.value.resetFields();
    queryParams.instanceCode = pluginInstance[0].instanceCode
    handleQuery();
  }

  // 处理新增按钮
  const handleAdd = function(){
    reset()
    let instanceCode = queryParams.instanceCode
    if(instanceCode == undefined){
      instanceCode = pluginInstance[0].instanceCode
    }
    form.instanceCode = instanceCode
    form.status = 1
    open.value = true
    title.value = "添加插件工具信息"
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset();
    queryConfigInfoById(row.id).then(response => {
      if(response?.code == 200){
        Object.assign(form,response?.data)
        open.value = true;
        title.value = "修改插件工具信息";
      }
    });
  }


  // 多选框选中数据
  const handleSelectionChange = function(selection){

  }

  // 表单提交处理
  const submitForm = async ()=>{
    loading.value = true;
    await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage.error('表单验证失败');
            loading.value = false;
            throw err;
        });

    if (form.groupId != undefined) {
      addConfig(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '修改成功',
                  type: 'success',
            });
          }else{
            ElMessage.error('修改出现异常');
            loading.value = false;
            throw response?.msg;
          }
          open.value = false;
          getList();
        });
      } else {
        addConfig(form).then(response => {
          if(response?.code == 200 ){
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
          open.value = false;
          getList();
        });
      }


  }

  const handleStatusChange = (row)=>{
    const id = row.id
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否禁用名称为"' + row.name + '"的数据项？'
    }else{
      msg = '是否启用名称为"' + row.name + '"的数据项？'
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
        changeConfigStatus(id,tmpStatus).then((res)=>{
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


  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
    reset();
  }



  // 进入页面时,就初始化实例列表
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
    if(res.code == 200){
      Object.assign(pluginInstance,res?.data)
      queryParams.instanceCode = pluginInstance[0].instanceCode

      // 触发查询
      getList();

    }
  });
</script>

<template>
  <div class="main-wrapp">
    <yt-card>

      <!--sousuo  -->
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" >
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
                class="search-select"
                v-model="queryParams.instanceCode"
                @keyup.enter.native="handleQuery"
                placeholder="请选择实例"
                style="width: 240px"
              >
                <el-option v-for="item in pluginInstance"
                           :key="item.pluginCode"
                           :label="item.instanceName"
                           :value="item.instanceCode"/>
              </el-select>
            </el-form-item>
            <el-form-item label="名称" prop="name">
              <el-input
                v-model="queryParams.name"
                placeholder="请输入名称"
                clearable
                style="width: 240px"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item label="插件类型" prop="pluginType">
              <el-select
                class="search-select"
                v-model="queryParams.pluginType"
                @keyup.enter.native="handleQuery"
                placeholder="请选择插件类型"
                clearable
                style="width: 240px"
              >
                <el-option v-for="item in tools"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                class="search-select"
                v-model="queryParams.status"
                placeholder="工具状态"
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
          @click="handleAdd" v-hasPerms="['/jenkins/systemConfig/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="sysConfigPageList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="编号" key="id" prop="id" v-if="false"/>
          <el-table-column label="别名" key="name" prop="name"  :show-overflow-tooltip="true"  />
          <el-table-column label="Path" key="value" prop="value"  :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center" key="status"  >
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime"  >
            <template #default="scope">
              {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="220"
          >
            <template #default="scope">
              <div class="action-btn">
                <el-button
                  size="small"
                  icon="Edit"
                  @click="handleUpdate(scope.row)"
                  v-hasPerms="['/jenkins/systemConfig/add']"
                >修改</el-button>
                <el-button
                  size="small"
                  :icon="getStatusIcon(scope.row)"
                  @click="handleStatusChange(scope.row)"
                  v-hasPerms="['/jenkins/systemConfig/changeStatus/**']"
                >{{ showStatusOperateFun(scope.row.status)  }}</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-wrap">
        <el-pagination
          v-show="total>0"
          :total="total"
          :page-sizes=[10,20]
          background layout="prev, pager, next"
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          @current-change="getList"
        />
      </div>

    </yt-card>


    <!-- 添加或修改工具配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <yt-card>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="插件实例" prop="instanceCode">
                <el-select
                  class="search-select2"
                  v-model="form.instanceCode"
                  placeholder="请选择插件实例"
                  style="width: 240px"
                >
                  <el-option v-for="item in pluginInstance"
                             :key="item.pluginCode"
                             :label="item.instanceName"
                             :value="item.instanceCode"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="插件类型" prop="pluginType">
                <el-select
                  class="search-select"
                  v-model="form.pluginType"
                  placeholder="请选择插件类型"
                  style="width: 240px"
                >
                  <el-option v-for="item in tools"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="别名" prop="name">
                <el-input v-model="form.name" placeholder="请输入别名" maxlength="200" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="PATH" prop="value">
                <el-input v-model="form.value" placeholder="请输入Path路径" maxlength="200" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in status"
                    :key="dict.value"
                    :label="dict.value"
                  >{{dict.label}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </yt-card>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>

</style>

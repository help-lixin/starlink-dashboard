<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange, getStatusIcon  } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit ,SwitchButton} from '@element-plus/icons-vue'
  import { credentialOption } from "@/api/sys_credential/credential"
  import {toolsSelectOption , jdkSelectOption} from "@/api/jenkins/sys_config"
  import {addJob, changeStatus, pageList, tools ,scmType, queryJobDetail, paramTypes, jobSelectOption,  buildJob , jobNameIsExist} from "@/api/jenkins/job"
  import type { pushScopeId } from "vue"

  const queryFormRef = ref(null);

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    instanceCode:undefined,
    tools: undefined,
    jobName: undefined
  })

  const validJobName = (rule:any,value:any, callback:any)=>{
    if(value == curJobName.jobName){
      callback()
    }

    jobNameIsExist(value,form.instanceCode).then((res)=>{
        if(res.code == 200){
          if(res.data){
            callback()
          }else{
            callback(new Error('任务名称已存在，请确认后修改'));
          }
        }
    })
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
      'instanceCode' : [
        { required: true, message: "实例编码不能为空", trigger: "blur" },
      ],
      'jobName': [
        { required: true, message: "任务名称不能为空", trigger: "blur" },
        { min: 2, max: 20, message: '任务名称长度必须介于 2 和 20 之间', trigger: 'blur' },
        { validator: validJobName , trigger: 'blur' }
      ],
      'scmType': [
        { required: true, message: "仓库类型不能为空", trigger: "blur" },
        { min: 2, max: 20, message: '任务名称长度必须介于 2 和 20 之间', trigger: 'blur' }
      ],
      'toolsType': [
        { required: true, message: "语言不能为空", trigger: "blur" },
      ],
      'jdkId' :[
        { required: true, message: "jdk不能为空", trigger: "blur" },
      ],

      'scm':{
        'url': [
          { required: true, message: "url不能为空", trigger: "blur" },
          { min: 2, max: 200, message: 'url长度必须介于 2 和 200 之间', trigger: 'blur' }
        ],
        'branch': [
          { required: true, message: "分支不能为空", trigger: "blur" },
          { min: 2, max: 200, message: '分支长度必须介于 2 和 200 之间', trigger: 'blur' }
        ],
        'credentialsId': [
          { required: true, message: "凭证不能为空", trigger: "blur" }
        ]
      }
  })

  const loading = ref(false)
  //隐藏id列
  const isVisible = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])


  const total= ref(0)
  const jobList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();

  const formDefault = reactive({
      id: undefined,
      scmType: "GIT",
      toolsType: undefined,
      jdkId: undefined,
      scm:{
        url:undefined,
        credentialsId:undefined,
        branch:undefined
      },
      buildDependencys: [],
      setups: [{
        id:undefined,
        instanceCode:undefined,
        status:undefined,
        setupType:undefined,
        sequence:undefined,
        type:undefined,
        targets:undefined,
        antId:undefined,
        goId:undefined,
        script:undefined,
        gradleId:undefined,
        task:undefined,
        mavenId:undefined,
        goals:undefined,
        nodejsId:undefined,
        cacheLocation:undefined,
        pythonId:undefined,
        shellScript:undefined
      }],
      jobName: undefined,
      remark: undefined,
      status:undefined,
      instanceCode: undefined
  });

  const form = reactive(formDefault)
  const title = ref(null)
  const pluginInstance = reactive([]);
  const pluginCode = "jenkins"

  // 重置表单
  const reset = ()=> {
      formRef.value?.clearValidate()
      // 清空当前列表中的数据
      credentials.splice(0, credentials.length)
      jobs.splice(0, jobs.length)
      jdkList.splice(0, jdkList.length)

      Object.assign(form,{
      id: undefined,
      scmType: "GIT",
      toolsType: undefined,
      jdkId: undefined,
      scm:{
        url:undefined,
        credentialsId:undefined,
        branch:undefined
      },
      buildDependencys: [],
      setups: [{
        id:undefined,
        instanceCode:form.instanceCode,
        status:form.status,
        setupType:undefined,
        sequence:undefined,
        type:undefined,
        targets:undefined,
        antId:undefined,
        goId:undefined,
        script:undefined,
        gradleId:undefined,
        task:undefined,
        mavenId:undefined,
        goals:undefined,
        nodejsId:undefined,
        cacheLocation:undefined,
        pythonId:undefined,
        shellScript:undefined
      }],
      jobName: undefined,
      remark: undefined,
      status:1,
      instanceCode: undefined
  })
}

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    pageList(addDateRange(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            jobList.splice(0,jobList.length);
            Object.assign(jobList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            jobList.splice(0,jobList.length);
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
    queryParams.jobName = undefined
    dateRange.value = [];
    queryFormRef.value.resetFields();
    handleQuery();
  }

  //处理工具变更时的type
  const handleToolChange = (item,type)=>{
    item.setupType = type
    item.instanceCode = form.instanceCode
  }

  // 下拉选择添加标签
  const handleSelectChange = (value) =>{
      if(value == ""){ return }

      if (!form.buildDependencys.includes(value)) {
        if(form.buildDependencys.length = 0){
          form.buildDependencys.push(value);
        }else{
          form.buildDependencys.unshift(value)
        }

      }
  }

  const handleTagClose = (index)=>{
    form.buildDependencys.splice(index, 1); // 移除标签
  }

  // 凭证列表
  const credentials = reactive([])
  const formInstance = reactive([])
  // 构建依赖任务下拉列表
  const jobs = reactive([])
  const jdkList = reactive([])
  // 处理新增按钮
  const handleAdd = function(){
    reset()
    // 查询实例编码下拉列表
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(formInstance,res?.data)
        let instanceCode = queryParams.instanceCode;
        if(instanceCode == undefined){
          instanceCode = formInstance[0].instanceCode;
        }
        form.instanceCode = instanceCode

        // 查询凭证下拉列表
        credentialList(instanceCode)

        // 查询依赖构建下拉列表
        dependencyList(instanceCode);

        // 查询jdk下拉列表
        jdkOptionList(instanceCode)
      }
    });

    open.value = true
    title.value = "添加jenkins配置信息"
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset();
    // 查询实例编码下拉列表
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
          Object.assign(formInstance,res?.data)
          detail(row.id)
      }

    })

    open.value = true;
    title.value = "修改jenkins配置信息";
  }

  // 保存当前查询详情的任务名称（主要用于校验）
  const curJobName = reactive({})

  // 查询jdk下拉列表
  const jdkOptionList = (instanceCode) => {
    jdkSelectOption(instanceCode).then((response)=>{
        if(response?.code == 200){
          Object.assign(jdkList,response?.data)
        }
    })
  }

  // 查询凭证下拉列表
  const credentialList = (instanceCode) =>{
    credentialOption(instanceCode).then(response => {
      if(response?.code == 200){
        Object.assign(credentials,response?.data)
      }
    })
  }

  // 查询依赖构建下拉列表
  const dependencyList = (instanceCode) =>{
    jobSelectOption(instanceCode).then(response =>{
          if(response?.code == 200){
            Object.assign(jobs,response?.data)
          }
    })
  }

  // 查询任务详情
  const detail = (id)=>{
    queryJobDetail(id).then(jobRes => {
          if(jobRes?.code != 200){
            ElMessage.error('查询出现异常');
            loading.value = false;
            throw response?.msg;
          }

          let instanceCode = jobRes?.data.instanceCode

          toolsSelectOption(jobRes?.data.toolsType,instanceCode).then(response => {
            if(response?.code == 200){
              Object.assign(languages,response?.data)
              Object.assign(form,jobRes?.data)
              Object.assign(curJobName,jobRes?.data)

              form.setups.forEach((setup)=>{
                setup.type = setup.setupType
              });

            }
          })

          // 查询凭证下拉列表
          credentialList(instanceCode)

          // 查询依赖构建下拉列表
          dependencyList(instanceCode);

          // 查询jdk下拉列表
          jdkOptionList(instanceCode)


    });
  }

  // 更换实例时会修改凭证下拉列表信息
  const switchInstance = (instanceCode)=>{
    // 清空当前列表中的数据
    credentials.splice(0, credentials.length)
    jobs.splice(0, jobs.length)
    jdkList.splice(0, jdkList.length)

    // 查询凭证下拉列表
    credentialList(instanceCode)
    // 查询依赖构建下拉列表
    dependencyList(instanceCode)
    // 查询jdk下拉列表
    jdkOptionList(instanceCode)
  }

  // 工具版本对象
  const languages = reactive([]);
  // 工具版本名称选择
  const switchLanguage = (item)=>{
    languages.splice(0, languages.length)
    // 根据工具类型,查询出所有的工具信息
    // 例如: MAVEN --> { label: "maven-3.6.3" , "value" : "/home/app/maven-3.6.3" }
    toolsSelectOption(form.toolsType,form.instanceCode).then(response => {
      if(response?.code == 200){
        Object.assign(languages,response?.data)
      }
    })
  }


  // 多选框选中数据
  const handleSelectionChange = function(selection){

  }
  // 表单提交处理
  const submitForm = async (isBuild)=>{
    loading.value = true;
    //todo 这里校验全部失败，需要改
    await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage.error('表单验证失败');
            loading.value = false;
            throw err;
        });

    if (form.id != undefined) {
      addJob(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '修改成功',
                  type: 'success',
            });
            build(form,isBuild)
          }else{
            ElMessage.error('修改出现异常');
            loading.value = false;
            throw response?.msg;
          }
          open.value = false;
          getList();
        });
      } else {
        addJob(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '新增成功',
                  type: 'success',
            });
            build(form,isBuild)
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

  const build = (form,isBuild)=>{
    if(isBuild){
      const buildParams = reactive({});
      buildParams.instanceCode = form.instanceCode
      buildParams.jobId = form.id
      buildJob(buildParams).then(response => {
        ElMessage({
            showClose: true,
            message: '已开启构建，请等待构建...',
            type: 'success',
        });
        getList();
      })
    }
  }

  const handleStatusChange = (row)=>{
    const jobName = row.jobName
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否禁用名称为"' + jobName + '"的数据项？'
    }else{
      msg = '是否启用名称为"' + jobName + '"的数据项？'
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
        changeStatus(row.id,tmpStatus).then((res)=>{
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


  // 触发查询
  getList();
  // 进入页面时,就初始化实例列表
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
    if(res.code == 200){
      Object.assign(pluginInstance,res?.data)
    }
  });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card :padding="'18px 18px 0'">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" >
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
                class="search-select"
                v-model="queryParams.instanceCode"
                @keyup.enter.native="handleQuery"
                placeholder="请选择实例"
                clearable
              >
                <el-option v-for="item in pluginInstance"
                           :key="item.pluginCode"
                           :label="item.instanceName"
                           :value="item.instanceCode"/>
              </el-select>
            </el-form-item>
            <el-form-item label="工具类型" prop="queryParams.tools">
              <el-select
                class="search-select"
                v-model="queryParams.tools"
                placeholder="请选择工具类型"
                clearable
              >
                <el-option v-for="tool in tools"
                           :key="tool.value"
                           :label="tool.label"
                           :value="tool.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="任务名" prop="queryParams.jobName">
              <el-input v-model="queryParams.jobName" placeholder="请输入任务名" clearable style="width: 240px"/>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                class="search-select"
                v-model="queryParams.status"
                placeholder="任务状态"
                clearable
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
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary"  @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
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
          @click="handleAdd" v-hasPerms="['/jenkins/job/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="任务编号" key="id" prop="id" v-if="false" />
          <el-table-column label="任务名称" key="jobName" prop="jobName"  :show-overflow-tooltip="true" />
          <el-table-column label="仓库类型" key="scm" prop="scm" :show-overflow-tooltip="true"  v-if="false" />
          <el-table-column label="工具类型" key="tools" prop="tools" :show-overflow-tooltip="true"  />
          <el-table-column label="状态" align="center" key="status"  >
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <!-- <el-table-column label="最后成功时间" align="center" key="lastSuccess" prop="lastSuccess" :show-overflow-tooltip="true" width="180"/> -->
          <!-- <el-table-column label="最后失败时间" align="center" key="lastFailure" prop="lastFailure" :show-overflow-tooltip="true"   width="180"/> -->
          <!-- <el-table-column label="最后构建所需时间" align="center" key="lastDuration" prop="lastDuration" :show-overflow-tooltip="true"  width="180"/> -->
          <!-- <el-table-column label="聚合状态" align="center" key="aggregatedStatus" prop="aggregatedStatus" :show-overflow-tooltip="true" /> -->
          <el-table-column label="构建状态" align="center" key="buildStatus" prop="buildStatus" :show-overflow-tooltip="true"  width="120"/>
          <el-table-column label="备注" align="center" key="remark" prop="remark" :show-overflow-tooltip="true"  />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
              {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" prop="updateTime" width="180">
            <template #default="scope">
              {{ dayjs(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss")   }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="280"
            flxed="right"
          >
            <template #default="scope">
              <div class="action-btn">
                <el-button
                  size="small"
                  icon="Edit"
                  @click="handleUpdate(scope.row)"
                  v-hasPerms="['/jenkins/job/add']"
                >修改</el-button>
                <el-button
                  size="small"
                  icon="SwitchButton"
                  @click="build(scope.row,true)"
                  v-hasPerms="['/jenkins/job/buildJob']"
                >构建</el-button>
                <el-button
                  size="small"
                  :icon="getStatusIcon(scope.row)"
                  @click="handleStatusChange(scope.row)"
                  v-hasPerms="['/jenkins/job/changeStatus/**']"
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



    <!-- 添加或修改组配置对话框 -->
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
                  @change="switchInstance"
                  style="width: 240px"
                >
                  <el-option v-for="item in formInstance"
                             :key="item.pluginCode"
                             :label="item.instanceName"
                             :value="item.instanceCode"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务名" prop="jobName">
                <el-input v-model="form.jobName" placeholder="请输入参数名" maxlength="30" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="仓库类型" prop="scmType" >
                <el-select
                  class="search-select2"
                  v-model="form.scmType"
                  placeholder="仓库类型"
                  clearable
                  style="width: 240px"
                >
                  <el-option v-for="item in scmType"
                             :key="item.value"
                             :label="item.lable"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="url" prop="scm.url">
                <el-input v-model="form.scm.url" placeholder="请输入远程仓库地址" maxlength="200" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" v-if="form.scmType == 'GIT'">
              <el-form-item label="分支" prop="scm.branch">
                <el-input v-model="form.scm.branch" placeholder="请输入分支" maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="凭证" prop="scm.credentialsId">
                <el-select
                  class="search-select2"
                  v-model="form.scm.credentialsId"
                  placeholder="请选择凭证"
                  clearable
                  style="width: 240px"
                >
                  <el-option v-for="item in credentials"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="语言选择" prop="toolsType">
                <el-select
                  class="search-select2"
                  v-model="form.toolsType"
                  placeholder="请选择语言"
                  clearable
                  style="width: 240px"
                  @change="switchLanguage"
                >
                  <el-option v-for="item in tools"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.toolsType != undefined &&  ( form.toolsType == 'MAVEN' || form.toolsType == 'ANT' || form.toolsType == 'GRADLE' ) " >
            <el-col :span="12">
              <el-form-item label="jdk" prop="jdkId">
                <el-select
                  class="search-select2"
                  v-model="form.jdkId"
                  placeholder="请选择插件实例"
                  clearable
                  style="width: 240px"
                >
                  <el-option v-for="item in jdkList"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.toolsType == 'MAVEN'" >
            <template
              v-for="(item, index) in form.setups">
              <el-col :span="12">
                <el-form-item label="maven版本选择" :prop="`setups.${index}.mavenId`" :rules="[  { required: true, message: 'maven版本是必选项', trigger: 'change' } ]" >
                  <el-select
                    class="search-select2"
                    v-model="item.mavenId"
                    placeholder="请选择maven"
                    clearable
                    @change="handleToolChange(item,'MAVEN')"
                    style="width: 240px"
                  >
                    <el-option v-for="version in languages"
                               :key="version.label"
                               :label="version.label"
                               :value="version.value"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item  label="脚本" :prop="`setups.${index}.goals`" :rules="[
                  { required: true, message: '脚本内容不能为空', trigger: 'blur' } ]" >
                  <el-input v-model="item.goals" type="textarea" placeholder="请输入脚本内容"/>
                </el-form-item>
              </el-col>
            </template>

          </el-row>

          <el-row v-if="form.toolsType == 'GO'" >
            <template
              v-for="(item, index) in form.setups">
              <el-col :span="12">
                <el-form-item label="go版本" :prop="`setups.${index}.goId`" :rules="[  { required: true, message: 'go版本是必选项', trigger: 'change' } ]" >
                  <el-select
                    class="search-select2"
                    v-model="item.goId"
                    placeholder="请选择go"
                    clearable
                    @change="handleToolChange(item,'GO')"
                    style="width: 240px"
                  >
                    <el-option v-for="version in languages"
                               :key="version.label"
                               :label="version.label"
                               :value="version.value"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item  label="脚本" :prop="`setups.${index}.script`" :rules="[
                  { required: true, message: '脚本内容不能为空', trigger: 'blur' }]">
                  <el-input v-model="item.script" type="textarea" placeholder="请输入脚本内容"/>
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <el-row v-if="form.toolsType == 'SHELL'" >
            <template
              v-for="(item, index) in form.setups">
              <el-col :span="24">
                <el-form-item   label="脚本" :prop="`setups.${index}.shellScript`"
                :rules="[
                  { required: true, message: '脚本内容不能为空', trigger: 'blur' } ]" >
                  <el-input v-model="item.shellScript"  @blur="handleToolChange(item,'SHELL')" type="textarea"/>
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <el-row v-if="form.toolsType == 'ANT'" >
            <template
              v-for="(item, index) in form.setups">
              <el-col :span="12">
                <el-form-item label="ant版本" :prop="`setups.${index}.antId`" :rules="[  { required: true, message: 'ant版本是必选项', trigger: 'change' } ]" >
                  <el-select
                    class="search-select2"
                    v-model="item.antId"
                    placeholder="请选择ant"
                    clearable
                    @change="handleToolChange(item,'ANT')"
                    style="width: 240px"
                  >
                    <el-option v-for="version in languages"
                               :key="version.label"
                               :label="version.label"
                               :value="version.value"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item  label="脚本" :prop="`setups.${index}.targets`" :rules="[
                  { required: true, message: '脚本内容不能为空', trigger: 'blur' } ]">
                  <el-input v-model="item.targets" type="textarea" placeholder="请输入脚本内容"/>
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <el-row v-if="form.toolsType == 'GRADLE'" >
            <template
              v-for="(item, index) in form.setups">
              <el-col :span="12">
                <el-form-item label="gradle版本" :prop="`setups.${index}.gradleId`" :rules="[  { required: true, message: 'gradle版本是必选项', trigger: 'change' } ]" >
                  <el-select
                    class="search-select2"
                    v-model="item.gradleId"
                    placeholder="请选择gradle"
                    clearable
                    @change="handleToolChange(item,'GRADLE')"
                    style="width: 240px"
                  >
                    <el-option v-for="version in languages"
                               :key="version.label"
                               :label="version.label"
                               :value="version.value"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item  label="脚本" :prop="`setups.${index}.task`" :rules="[
                  { required: true, message: '脚本内容不能为空', trigger: 'blur' } ]">
                  <el-input v-model="item.task" type="textarea" placeholder="请输入脚本内容"/>
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <el-row v-if="form.toolsType == 'NODE_JS'" >
            <template
              v-for="(item, index) in form.setups">
              <el-col :span="12">
                <el-form-item label="nodejs版本" :prop="`setups.${index}.nodejsId`" :rules="[  { required: true, message: 'nodejs版本是必选项', trigger: 'change' } ]" >
                  <el-select
                    class="search-select2"
                    v-model="item.nodejsId"
                    placeholder="请选择nodejs"
                    clearable
                    @change="handleToolChange(item,'NODE_JS')"
                    style="width: 240px"
                  >
                    <el-option v-for="version in languages"
                               :key="version.label"
                               :label="version.label"
                               :value="version.value"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item  label="脚本" :prop="`setups.${index}.script`" :rules="[
                  { required: true, message: '脚本内容不能为空', trigger: 'blur' } ]">
                  <el-input v-model="item.script" type="textarea" placeholder="请输入脚本内容"/>
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <el-row v-if="form.toolsType == 'PYTHON'" >
            <template
              v-for="(item, index) in form.setups">
              <el-col :span="12">
                <el-form-item label="python版本" :prop="`setups.${index}.pythonId`" :rules="[  { required: true, message: 'python版本是必选项', trigger: 'change' } ]" >
                  <el-select
                    class="search-select2"
                    v-model="item.pythonId"
                    placeholder="请选择python"
                    clearable
                    @change="handleToolChange(item,'PYTHON')"
                    style="width: 240px"
                  >
                    <el-option v-for="version in languages"
                               :key="version.label"
                               :label="version.label"
                               :value="version.value"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item  label="脚本" :prop="`setups.${index}.script`" :rules="[
                  { required: true, message: '脚本内容不能为空', trigger: 'blur' } ]">
                  <el-input v-model="item.script" type="textarea" placeholder="请输入脚本内容"/>
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <el-row>
            <el-col :span="12" >
              <el-form-item label="构建依赖" >
                <el-select
                  class="search-select2"
                  placeholder="请选择项目"
                  clearable
                  @change="handleSelectChange"
                >
                  <el-option v-for="job in jobs"
                             :key="job"
                             :label="job"
                             :value="job"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24" >
              <div v-for="(tag, index) in form.buildDependencys" :key="index" style="display: inline-block; margin: 5px;">
                <el-tag
                  :closable="true"
                  @close="handleTagClose(index)">
                  {{ tag }}
                </el-tag>
              </div>
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
            <el-col :span="24">
              <el-form-item label="任务备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </yt-card>
      <template #footer>
        <el-button type="primary" @click="submitForm(false)">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>

</style>


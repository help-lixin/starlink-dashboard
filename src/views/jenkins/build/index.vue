<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange, getStatusIcon  } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit ,Tickets} from '@element-plus/icons-vue'
  import { credentialOption } from "@/api/sys_credential/credential"
  import {toolsSelectOption , jdkSelectOption} from "@/api/jenkins/sys_config"
  import {queryLogInfoByJobId} from "@/api/jenkins/logs"
  import {pageList, showBuildStatusFun} from "@/api/jenkins/build"
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
    jobName: undefined
  })

  const pluginInstance = reactive([]);
  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])
  const total= ref(0)
  const jobList = reactive([])

  // 表单
  const open = ref(false);
  const logInfo = ref("");
  const formRef = ref<FormInstance>();


  const title = ref(null)
  const pluginCode = "jenkins"


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

  // 弹框查询日志
  const lookLogs = (row)=>{
    title.value = row.jobName+" 构建日志"
    queryLogInfoByJobId(row.id).then(res =>{
        logInfo.value = res?.data
    })
    open.value = true;
  }

  // 表单取消处理
  const cancel = ()=>{
    loading.value = false;
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


// 按钮
const btnList = ref([
  {
    btnName: '查看日志',
    permArray: ['/jenkins/job/buildJob'],
    isShow: () => true,
    isDisable: false,
    clickEvent: lookLogs
  }
])
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card :padding="'18px 18px 0'">
      <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" >
        <el-row :gutter="16">
          <el-col :span="8">
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
          </el-col>
          <el-col :span="8">
            <el-form-item label="任务名" prop="queryParams.jobName">
              <el-input v-model="queryParams.jobName" placeholder="请输入任务名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="任务时间">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary"  @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </yt-card>
    <yt-card>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="构建编号" align="left" key="id" prop="id" v-if="false" />
          <el-table-column label="任务编号" align="left" key="jobId" prop="jobId" v-if="false" />
          <el-table-column label="任务名称" align="left" key="jobName" prop="jobName"  :show-overflow-tooltip="true" />
          <el-table-column label="构建状态" align="center" key="buildStatus" prop="buildStatus"  >
            <template #default="scope">
              {{  showBuildStatusFun(scope.row.buildStatus) }}
            </template>
          </el-table-column>

          <el-table-column label="开始时间" align="left" prop="startTime" width="180">
            <template #default="scope">
              {{ dayjs(scope.row.startTime).format("YYYY-MM-DD HH:mm:ss")   }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="220"
            flxed="right"
          >
            <template v-slot="scope">
              <yt-btn-menu-list :btn-list="btnList" :row-data="scope.row"></yt-btn-menu-list>
            </template>

          </el-table-column>
        </el-table>
      </div>
      <div class="page-wrap">
        <yt-page :total="total" v-model="queryParams" @change="getList"></yt-page>
      </div>
    </yt-card>

    <el-dialog :title="title" v-model="open" width="800px"  append-to-body>
      <yt-card>
        <el-form-item >
            <el-input v-model="logInfo" type="textarea" rows="20" disabled="true"></el-input>
        </el-form-item>
      </yt-card>

      <template #footer>
        <el-button @click="cancel">确 定</el-button>
      </template>

    </el-dialog>

  </div>
</template>

<style lang="scss" scoped>

</style>


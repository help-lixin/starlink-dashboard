<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit } from '@element-plus/icons-vue'
  import { pageList, resources} from "@/api/harbor/loginfo"

  const queryFormRef = ref(null);

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    instanceCode:undefined,
    key: undefined,
    value: undefined
  })

  const defaultInstanceCode = ref('')

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])


  const total= ref(0)
  const projectList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();

  const title = ref(null)
  const pluginInstance = reactive([]);
  const pluginCode = "harbor"


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

  // 处理重置按钮
  const resetQuery = function(){
    // queryFormRef.value.resetFields();
    queryParams.value = undefined
    queryParams.key = undefined
    queryParams.instanceCode = defaultInstanceCode.value;
    handleQuery();
  }


  // 多选框选中数据
  const handleSelectionChange = function(selection){

  }

  // 进入页面时,就初始化实例列表
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
    if(res.code == 200){
      Object.assign(pluginInstance,res?.data)
      if(Object.keys(res?.data).length != 0){
        queryParams.instanceCode = pluginInstance[0].instanceCode
        defaultInstanceCode.value = pluginInstance[0].instanceCode
      }
      // 触发查询
      getList();
    }
  });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form  class="form-wrap"  :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" >
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
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
            <el-form-item label="资源" prop="instanceCode">
              <el-input v-model="queryParams.value" placeholder="请输入内容" clearable>
                <template #prepend>
                  <el-select
                    v-model="queryParams.key"
                    placeholder="请选择资源"
                    clearable
                    style="padding: 0 0px;"
                  >
                      <el-option v-for="item in resources"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"/>
                  </el-select>
                </template>
              </el-input>
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

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="项目编号" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="资源" align="left" key="resource" prop="resource"  :show-overflow-tooltip="true"  />
          <el-table-column label="资源类型" align="left" key="resourceType" prop="resourceType"  :show-overflow-tooltip="true"  />
          <el-table-column label="用户名" align="left" key="username" prop="username" :show-overflow-tooltip="true"   />
          <el-table-column label="操作" align="left" key="operation" prop="operation" :show-overflow-tooltip="true"   />
          <el-table-column label="创建时间" align="left" prop="opTime"  width="180">
            <template #default="scope">
              {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-wrap">
        <yt-page :total="total" v-model="queryParams" @change="getList"></yt-page>
      </div>
    </yt-card>


  </div>
</template>

<style lang="scss" scoped>
// .el-input-group__append .el-input-group__prepend{
//   padding-left: 0px;
//     padding-right: 0px;
// }
.el-input-group__prepend{
  padding:0 0px
}
</style>

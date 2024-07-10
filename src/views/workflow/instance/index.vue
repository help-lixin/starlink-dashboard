<script setup lang="ts">
// @ts-nocheck
// 流水线实例管理
import { Plus, Delete, Edit, EditPen, Search, RefreshRight, Sort, QuestionFilled } from '@element-plus/icons-vue'
import { parseTime, status, addDateRange, showStatusFun, showStatusOperateFun, getStatusIcon } from "@/utils/common"
import {  get, changeStatus , startWorkFlowById } from "@/api/workflowDefinition"
import { getProcessInstances } from "@/api/workflow/workflowInstance"
import { useRouter, useRoute } from "vue-router";
const router = useRouter();

// 加载中
const loading = ref(false)
// 显示搜索条件
const showSearch = ref(true)
// 日期范围
const daterangeArray = ref('')

// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
const total = ref(0)
const dataList = reactive([])


// 查询的表单引用
const queryFormRef = ref({});
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  processDefinitionKey: undefined,
  processDefinitionName: undefined,
  status: undefined
})

// 获取列表
const getList = () => {
  loading.value = true;

  getProcessInstances(addDateRange(queryParams, daterangeArray.value)).then(response => {
    loading.value = false
    if (response?.data?.records.length > 0) {
      dataList.splice(0, dataList.length);
      Object.assign(dataList, response?.data?.records)
      total.value = response?.data?.total
    } else {
      dataList.splice(0, dataList.length);
      total.value = 0;
    }
  }
  );
}

// 处理搜索按钮
const handleQuery = function () {
  getList()
}

// 处理查询按钮
const resetQuery = function () {
  daterangeArray.value = ""
  queryFormRef.value.resetFields()
  handleQuery();
}

// 多选框选中数据
const handleSelectionChange = function (selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}


const handleView = (row)=>{
  const processInstnaceId = row.pipelineInstanceId
  // 跳转到页面去查看日志
  router.push({
    name: "workflow-definition-view",
    params: {
      processInstnaceId
    }
  })
}


// 按钮
const btnList = ref([
{
  btnName: '查看',
  permArray: ['/workflow/instance/startById'],
  isShow: () => true,
  isDisable: false,
  clickEvent: handleView
},
])

// 触发查询
getList()
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card padding="18px 18px 0">
      <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="流水线key" prop="processDefinitionKey">
              <el-input v-model="queryParams.processDefinitionKey" placeholder="请输入流水线定义key" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="流水线名称" prop="processDefinitionName">
              <el-input v-model="queryParams.processDefinitionName" placeholder="请输入流水线定义名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select class="search-select" v-model="queryParams.status" placeholder="状态" clearable >
                <el-option v-for="dict in status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间">
              <el-date-picker v-model="daterangeArray" value-format="YYYY-MM-DD" type="daterange"
                              range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                              clearable ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary" @click="handleQuery"><el-icon>
                <Search />
              </el-icon>搜索</el-button>
              <el-button @click="resetQuery"><el-icon>
                <RefreshRight />
              </el-icon>重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </yt-card>

    <yt-card>

      <!--  option -->


      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="流水线ID" key="pipelineInstanceId" prop="pipelineInstanceId" :show-overflow-tooltip="true" />
          <el-table-column label="流水线名称" key="processDefinitionName" prop="processDefinitionName" :show-overflow-tooltip="true" />
          <el-table-column label="流水线定义key" key="processDefinitionKey" prop="processDefinitionKey" :show-overflow-tooltip="true"/>
          <el-table-column label="流水线版本" align="right" key="processDefinitionVersion" prop="processDefinitionVersion" />
          <el-table-column label="状态" align="center" key="status" width="100">
            <template v-slot="scope">
              {{ showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120">
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

  </div>
</template>

<style lang="scss" scoped>

</style>




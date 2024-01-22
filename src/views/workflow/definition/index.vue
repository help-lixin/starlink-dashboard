<script setup lang="ts">
// @ts-nocheck
// 流水线定义管理
import { Plus, Delete, Edit, EditPen, Search, RefreshRight, Sort, QuestionFilled } from '@element-plus/icons-vue'
import { parseTime, status, addDateRange, showStatusFun, showStatusOperateFun } from "@/utils/common"
import { list, get, changeStatus } from "@/api/workflowDefinition"
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

  list(addDateRange(queryParams, daterangeArray.value)).then(response => {
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


// 处理新增按钮
const handleAdd = function () {
  const state = { processDefinitionBody: undefined, count: 1 }
  // 跳转到新增
  router.push({
    name: "workflow-definition-operate",
    state
  })
}


const handleUpdate = function (row) {
  const processDefinitionBodyJson = row?.processDefinitionBody
  if (processDefinitionBodyJson) {
    const state = { processDefinitionBody: JSON.parse(processDefinitionBodyJson), count: 1 }
    // 跳转到修改页面
    router.push({
      name: "workflow-definition-operate",
      state
    })
  } else {
    const val = ids.value
    if (val instanceof Array && val.length > 0) {
      const value = val[0]
      get(value).then((res) => {
        if (res?.code == 200 && res?.data?.processDefinitionBody) {
          const state = { processDefinitionBody: JSON.parse(res.data.processDefinitionBody), count: 1 }
          // 跳转到修改页面
          router.push({
            name: "workflow-definition-operate",
            state
          })
        }
      });
    }
  }
}

const handleDelete = function (row) {
  const id = row.id || ids.value;
  const status = row.status
  let msg = ""
  if (status == 1) {
    msg = '是否禁用编号为"' + id + '"的数据项？'
  } else {
    msg = '是否启用编号为"' + id + '"的数据项？'
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
    if (status == 0) {
      tmpStatus = 1
    } else {
      tmpStatus = 0
    }

    changeStatus(id, tmpStatus).then((res) => {
      if (res.code == 200) {
        // 重置查询表单,并进行查询
        queryParams.pageNum = 1
        getList()
        ElMessage({
          type: 'success',
          message: '操作成功',
        })
      }
    })
  }).catch(() => { });
}


// 触发查询
getList()
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card padding="18px 18px 0">
      <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
            <el-form-item label="流程定义key" prop="processDefinitionKey">
              <el-input v-model="queryParams.processDefinitionKey" placeholder="请输入流程定义key" clearable  />
            </el-form-item>
            <el-form-item label="流程定义名称" prop="processDefinitionName">
              <el-input v-model="queryParams.processDefinitionName" placeholder="请输入流程定义名称" clearable />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select class="search-select" v-model="queryParams.status" placeholder="状态" clearable>
                <el-option v-for="dict in status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker v-model="daterangeArray" value-format="YYYY-MM-DD" type="daterange"
                              range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery"><el-icon>
                <Search />
              </el-icon>搜索</el-button>
              <el-button @click="resetQuery"><el-icon>
                <RefreshRight />
              </el-icon>重置</el-button>
            </el-form-item>
      </el-form>
    </yt-card>

    <yt-card>
      <!--  option-->
      <div class="option-wrap">
        <el-button type="primary" plain size="default" @click="handleAdd"
                   v-hasPerms="['/workflow/definition/operate']"><el-icon>
          <Plus />
        </el-icon>新增</el-button>

        <el-button type="success" plain size="default" :disabled="single" @click="handleUpdate"
                   v-hasPerms="['/workflow/definition/operate']"><el-icon>
          <EditPen />
        </el-icon>修改</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="流水线名称" align="center" key="processDefinitionName" prop="processDefinitionName"
                           :show-overflow-tooltip="true" />
          <el-table-column label="流水线定义key" align="center" key="processDefinitionKey" prop="processDefinitionKey" />
          <el-table-column label="流水线版本" align="center" key="processDefinitionVersion" prop="processDefinitionVersion" />
          <el-table-column label="状态" align="center" key="status" width="100">
            <template v-slot="scope">
              {{ showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createdTime" width="180">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createdTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="220">
            <template v-slot="scope">
              <div class="action-btn">
                <el-button size="default" @click="handleUpdate(scope.row)"
                           v-hasPerms="['/workflow/definition/operate']">修改</el-button>

                <el-button size="default" @click="handleDelete(scope.row)"
                           v-hasPerms="['/workflow/definition/changeStatus/**']">
                  {{ showStatusOperateFun(scope.row.status) }}
                </el-button>

              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-wrap">
        <el-pagination v-show="total > 0" :total="total" background layout="prev, pager, next"
                       v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" @current-change="getList" />
      </div>
    </yt-card>

  </div>
</template>

<style lang="scss" scoped>
.main-wrap {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background: #fff;

}

.option-wrap {
  margin-bottom: 8px;

  .el-button {
    // margin-right: 6px;
  }
}

.table-wrap {
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;

  .action-btn {
    display: flex;
  }
}

.page-wrap {
  padding: 20px 0;

  .el-pagination {
    display: flex;
    align-items: center;
    justify-content: end;
  }

}
</style>
<style>
.el-form-item__label {
  font-size: 14px;
}

.search-select .el-input {
  --el-input-width: 240px;
}
</style>




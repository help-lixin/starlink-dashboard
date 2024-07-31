<script setup lang="ts">
// @ts-nocheck
import { Plus ,Delete, Edit, EditPen, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
import { parseTime , status ,addDateRange , showStatusFun , showStatusOperateFun, getStatusIcon  } from "@/utils/common"
import { list,get,add,changeStatus,del } from "@/api/kubernetes/deploytemplate"
import {removeJob} from "@/api/jenkins/job.ts";

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
const total= ref(0)
const dataList = reactive([])

// 插件列表
const queryPlugins = ref();

// 查询的表单引用
const queryFormRef = ref({});
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  pluginCode : undefined, // []
  instanceName : undefined,
  status : undefined
})

const handlePlugin = (pluginCode:string)=>{
  if(pluginCode == ""){
    delete queryParams.pluginCode
  }
}

// 获取列表
const getList = ()=>{
  loading.value = true;

  list(addDateRange(queryParams, daterangeArray.value)).then(response => {
        loading.value = false
        if(response?.data?.records.length > 0){
          dataList.splice(0 , dataList.length);
          Object.assign(dataList, response?.data?.records)
          total.value = response?.data?.total
        }else{
          dataList.splice(0 , dataList.length);
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
  daterangeArray.value = ""
  queryFormRef.value.resetFields()
  handleQuery();
}

// 多选框选中数据
const handleSelectionChange = function(selection){
  ids.value = selection.map(item => item.deployId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

// ==================================================================================================================
// 表单处理
// ==================================================================================================================
const deployNameReadyOnly = ref(false);
const open = ref(false)
const title = ref("")
const formRef = ref<FormInstance>();
const form = reactive({
  deployId: undefined,
  deployName: undefined,
  yamlContent : undefined,
  remark: undefined,
  status: 1
})

// 表单验证规则
const rules = reactive<FormRules>({
  deployName :[
    { required: true, message: "模板名称不能为空", trigger: "blur" },
    { pattern: /^[-a-zA-Z0-9]*$/, message: '只可以输入字母、数字、下划线', trigger: 'blur' }
  ],
  yamlContent: [
    { required: true, message: "yaml模板内容不能为空", trigger: "blur" }
  ],
  remark: [
    { min: 2, max: 300, message: '备注长度必须介于 2 和 300 之间', trigger: 'blur' }
  ],
})

// 重置表单
const reset = ()=> {
  Object.assign(form,{
    deployId: undefined,
    deployName: undefined,
    yamlContent : undefined,
    remark: undefined,
    status: 1,
  })
}


// 处理新增按钮
const handleAdd = function(){
  reset()
  deployNameReadyOnly.value=false
  open.value = true;
  title.value = "添加Deployment YAML";
}

// 处理更新按钮(仅仅只是把数据拿出来展示一下)
const handleUpdate = function(row){
  deployNameReadyOnly.value=true
  reset();
  const id = row.deployId || ids.value
  get(id).then(response => {
    if(response?.code == 200){
      Object.assign(form , response?.data)
      open.value = true;
      title.value = "修改Deployment YAML";
    }
  });
}

const handleDelete = function(row){
  const deployName = row.deployName
  let msg = ""
  msg = '是否删除任务【"' + deployName + '"】的数据项？'

  ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    del(row.deployId).then((res)=>{
      if(res.code == 200){
        // 重置查询表单,并进行查询
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

const handleChangeStatus = function(row){
  const tmpId = row.deployId || ids.value;
  const status = row.status
  let msg = ""
  if(status == 1){
    msg = '是否禁用编号为"' + tmpId + '"的数据项？'
  }else{
    msg = '是否启用编号为"' + tmpId + '"的数据项？'
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
    changeStatus(tmpId,tmpStatus).then((res)=>{
      if(res.code == 200){
        getList()
        ElMessage({
          type: 'success',
          message: '操作成功',
        })
      }
    })
  }).catch(() => { })
}

// 表单提交处理
const submitForm = async ()=>{
  loading.value = true
  deployNameReadyOnly.value = true
  await formRef.value?.validate()
      .catch((err:Error)=>{
        ElMessage.error('表单验证失败');
        loading.value = false;
        throw err;
      });

  add(form).then(response => {
    if(response?.code == 200){
      if (form.deployId != undefined) {
        ElMessage({
          showClose: true,
          message: '修改成功',
          type: 'success',
        });
      } else {
        ElMessage({
          showClose: true,
          message: '新增成功',
          type: 'success',
        });
      }
      open.value = false;
      getList();
    } else {
      ElMessage.error(response?.msg);
    }
  });

}

// 表单取消处理
const cancel = ()=>{
  open.value = false;
  loading.value = false;
  reset();
}



// ==========================================================================
// 初始化钩子
// ==========================================================================
// 触发查询
getList()


// 按钮
const btnList = ref([
  {
    btnName: '修改',
    permArray: ['/kubernetes/deployment/yaml/template/add'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleUpdate
  },
  {
    btnName: row => showStatusOperateFun(row.status),
    permArray: ['/kubernetes/deployment/yaml/template/changeStatus/**'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleChangeStatus
  },
  {
    btnName: '删除',
    permArray: ['/kubernetes/deployment/yaml/template/del/**'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleDelete
  }
])

</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card padding="18px 18px 0">
      <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="部署别名" prop="deployName">
              <el-input v-model='queryParams.deployName' placeholder='请输入插件实例名称' clearable  />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select
                  class="search-select"
                  v-model="queryParams.status"
                  placeholder="状态"
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
                  v-model="daterangeArray"
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
            @click="handleAdd" v-hasPerms="['/kubernetes/deployment/yaml/template/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="模板名称" align="left" key="deployName" prop="deployName" :show-overflow-tooltip="true"/>
          <el-table-column label="yaml模板内容" align="left" key="yamlContent" prop="yamlContent"  :show-overflow-tooltip="true" />
          <el-table-column label="备注" align="left" key="remark" prop="remark"  :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center" key="status"  width="100">
            <template v-slot="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="left" prop="createTime" width="200">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
              label="操作"
              align="center"
              width="220"
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

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="var(--dialog-lg-w)"  append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="模板名称" prop="deployName">
                <el-input v-model="form.deployName" placeholder="请输入模板名称" maxlength="200" :readonly="deployNameReadyOnly"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="yaml模板" prop="yamlContent">
                <el-input v-model="form.yamlContent" type="textarea" placeholder="请输入yaml模板内容" autosize/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" maxlength="300" autosize/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
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
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>

</style>

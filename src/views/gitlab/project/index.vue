<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange , enable, getStatusIcon } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit ,Delete} from '@element-plus/icons-vue'
  import { pageList , addProject , queryProjectInfoById , changeProjectStatus, removeProject} from "@/api/gitlab/projects"
  import {selectGitlabIdOptions, queryGitlabAddr} from "@/api/gitlab/groups"

  const queryForm = ref(null);

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    instanceCode: undefined,
    projectName: undefined,
    path: undefined,
    visibility: undefined
  })

  // 可见性级别列表
  const visibilityArr = ref(["PUBLIC", "PRIVATE", "INTERNAL"])

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])

  const total= ref(0)
  const projectList = reactive([])
  const groups = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({})
  const title = ref("")
  const pluginInstance = reactive([]);
  const pluginCode = "gitlab"
  const ipAddr = ref(null)

  // 表单规则
  const rules = reactive<FormRules>({
        instanceCode: [
          { required: true, message: "插件实例不能为空", trigger: "blur" }
        ],
        projectName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '项目名称长度必须介于 2 和 20 之间', trigger: 'blur' },
          { pattern: /^[-_a-zA-Z0-9|\u4e00-\u9fa5]*$/, message: '只可以输入字母、数字、下划线、中划线和中文字符', trigger: 'blur' }
        ],
        namespaceByGroup: [
          { required: true, message: "群组不能为空", trigger: "blur" }
        ],
        visibility: [
          { required: true, message: "可见性级别不能为空", trigger: "blur" }
        ],
        path: [
          { required: true, message: "项目标识符不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '项目标识符长度必须介于 2 和 20 之间', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]*$/, message: '只可以输入字母、数字', trigger: 'blur' }
        ],
    })

  // 重置表单
  const reset = ()=> {
      formRef.value?.clearValidate()
      groups.splice(0, groups.length)
      Object.assign(form,{
        id: undefined,
        projectName: undefined,
        visibility: "PRIVATE",
        namespaceByGroup : undefined,
        path: undefined,
        remark: undefined,
        status: 1,
        instanceCode: undefined,
        initiallizeWithReadme:1
      })
  }

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
    dateRange.value = []
    queryForm.value.resetFields()
    queryParams.instanceCode = pluginInstance[0].instanceCode
    handleQuery()
  }

  // 处理新增按钮
  const handleAdd = function(){
    reset()
    const instanceCode = pluginInstance[0].instanceCode
    formInitFunc(instanceCode)
    form.instanceCode = instanceCode
    open.value = true
    title.value = "添加项目"
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset()
    formInitFunc(queryParams.instanceCode)
    queryProjectInfoById(row.id,queryParams.instanceCode)
    .then(response => {
      if(response?.code == 200){
        Object.assign(form,response?.data)
        open.value = true;
        title.value = "修改项目";
      }
    });
  }

  // 处理删除按钮
  const handleDelete = function(row){
    const projectName = row.projectName
    let msg = ""
    msg = '是否删除项目【"' + projectName + '"】的数据项？'

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      removeProject(row.id).then((res)=>{
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
                type: 'success',
                message: '删除失败：'+res.msg,
              })
          }
      })
    })
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

    if (form.id != undefined) {
      addProject(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '修改成功',
                  type: 'success',
            });
          }else{
            ElMessage({
                  showClose: true,
                  message: response?.msg,
                  type: 'warning',
            });
          }
          open.value = false;
          getList();
        });
      } else {
        addProject(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '新增成功',
                  type: 'success',
            });
          }else{
            ElMessage({
                  showClose: true,
                  message: response?.msg,
                  type: 'warning',
            });
          }
          open.value = false;
          getList();
        });
      }
  }

  const handleStatusChange = (row)=>{
    const changeStatusParams = {
      id: row.id,
      status: undefined,
      instanceCode: queryParams.instanceCode
    };
    const curStatus = row.status
    let msg = ""
    if(curStatus == 1){
      msg = '是否禁用编号为"' + changeStatusParams.id + '"的数据项？'
    }else{
      msg = '是否启用编号为"' + changeStatusParams.id + '"的数据项？'
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
        if(curStatus == 0){
          changeStatusParams.status = 1
        }else{
          changeStatusParams.status = 0
        }
        changeProjectStatus(changeStatusParams).then((res)=>{
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


  // 表单取消处理
  const cancel = ()=>{
    loading.value = false;
    open.value = false;
    reset();
  }

  // form表单初始化,尽量在表单使用时初始化,会影响列表页面的渲染时间.
  const formInitFunc = (instanceCode)=>{
    selectGitlabIdOptions(instanceCode).then((res)=>{
        if(res.code == 200){
            Object.assign(groups,res?.data)
        }
    });
    queryGitlabAddr(instanceCode).then((res)=>{
        if(res.code == 200){
            ipAddr.value = res.data+"/"
        }
    })
  }

  // 进入页面,选择一个实例进行查询
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)
        if(Object.keys(res?.data).length != 0){
          queryParams.instanceCode = pluginInstance[0].instanceCode
        }
      }
      // 触发查询
      getList();
  });



// 按钮
const btnList = ref([
  {
    btnName: '修改',
    permArray: ['/gitlab/project/add'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleUpdate
  },
  {
    btnName: row => showStatusOperateFun(row.status),
    permArray: ['/gitlab/project/changeStatus'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleStatusChange
  },
  {
    btnName: '删除',
    class: 'yt-color-error-hover',
    permArray: ['/gitlab/project/changeStatus'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleDelete
  },
])

</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card :padding="'18px 18px 0'">
    <el-form class="form-wrap"  :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" >
      <el-row :gutter="16">
        <el-col :span="8">
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
              class="search-select"
                v-model="queryParams.instanceCode"
                @keyup.enter.native="handleQuery"
                placeholder="请选择实例"
              >
              <el-option v-for="item in pluginInstance"
                :key="item.pluginCode"
                :label="item.instanceName"
                :value="item.instanceCode"/>
              </el-select>
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
            <el-form-item label="可见性级别" prop="visibility">
              <el-select
              class="search-select"
                v-model="queryParams.visibility"
                @keyup.enter.native="handleQuery"
                placeholder="请选择可见性级别"
                clearable
              >
              <el-option v-for="item in visibilityArr"
                :key="item"
                :label="item"
                :value="item"/>
              </el-select>
            </el-form-item>
        </el-col>

        <el-col :span="8">
            <el-form-item label="项目名称" prop="projectName">
              <el-input
                v-model="queryParams.projectName"
                placeholder="请输入项目名称"
                clearable
                @keyup.enter.native="handleQuery"
              />
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
              ></el-date-picker>
            </el-form-item>
        </el-col>

        <el-col :span="8">
            <el-form-item>
              <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button  @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
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
          @click="handleAdd" v-hasPerms="['/gitlab/project/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>
      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="60" align="left" />
            <el-table-column label="项目编号" align="left" key="id" prop="id" v-if="false"/>
            <el-table-column label="项目名称" align="left" key="projectName" prop="projectName"  :show-overflow-tooltip="true" />
            <el-table-column label="项目标识符" align="left" key="path" prop="path" :show-overflow-tooltip="true" />
            <el-table-column label="webUrl" align="left" key="webUrl" prop="webUrl" :show-overflow-tooltip="true"  />
            <el-table-column label="sshUrl" align="left" key="sshUrl" prop="sshUrl" :show-overflow-tooltip="true" />
            <el-table-column label="备注" align="left" key="remark" prop="remark" :show-overflow-tooltip="true" />
            <el-table-column label="状态" align="center" key="status" prop="status">
              <template #default="scope">
                {{  showStatusFun(scope.row.status) }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="left" prop="createTime" width="180">
              <template #default="scope">
                <span>{{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}</span>
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


    <!-- 添加或修改项目配置对话框 -->
    <el-dialog :title="title" v-model="open" width="800px"  append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="插件实例" prop="instanceCode">
                <el-select
                class="search-select2"
                  v-model="form.instanceCode"
                  @keyup.enter.native="handleQuery"
                  placeholder="请选择实例"
                  @change="formInitFunc"
                  clearable
                  style="width: 240px"
                  :disabled="form.id != undefined"
                >
                <el-option v-for="item in pluginInstance"
                  :key="item.pluginCode"
                  :label="item.instanceName"
                  :value="item.instanceCode"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目名称" prop="projectName">
                <el-input v-model="form.projectName" placeholder="请输入项目名称" maxlength="30" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col>
              <el-form-item label="项目URL" prop="namespaceByGroup">
                <el-input style="width:380px;" class="input-with-select" v-model="ipAddr" disabled >
                  <template #append>
                      <el-select
                        v-model="form.namespaceByGroup"
                        placeholder="请选择群组"
                        clearable
                        style="width: 180px;background-color: var(--el-fill-color-blank);"
                        :disabled="form.id != undefined"
                      >
                      <el-option v-for="group in groups"
                        :key="group.gitlabGroupId"
                        :label="group.gitlabGroupName"
                        :value="group.gitlabGroupId"/>
                      </el-select>
                  </template>
                </el-input>
                <el-col :span="1" style="display: flex; justify-content: center;">/</el-col>
                <el-form-item  prop="path">
                    <el-input v-model="form.path" placeholder="请输入项目标识串" maxlength="30" style="width:228px" :disabled="form.id != undefined"/>
                </el-form-item>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="可见性级别" prop="visibility">
              <el-select
                v-model="form.visibility"
                @keyup.enter.native="handleQuery"
                placeholder="请选择可见性级别"
                clearable
                style="width: 240px"
                :disabled="form.id != undefined"
              >
              <el-option v-for="item in visibilityArr"
                :key="item"
                :label="item"
                :value="item"/>
              </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col>
              <el-form-item label="Readme" v-if="form.id == undefined">
                <el-radio-group v-model="form.initiallizeWithReadme">
                  <el-radio
                      v-for="dict in enable"
                      :key="dict.value"
                      :label="dict.value"
                  >{{dict.label}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
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

          <el-row :gutter="16">
            <el-col>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" maxlength="255" />
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

 .search-select2 .el-input {
  --el-input-width: 200px;
}

/* .input-with-select .el-input-group__append {
  background-color: var(--el-fill-color-blank);
} */
.el-input.is-disabled .el-input__inner {
    color: var(--el-text-color-regular);
}
</style>

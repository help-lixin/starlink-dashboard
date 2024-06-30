<script setup lang="ts">
  // @ts-nocheck
  import { Delete } from '@element-plus/icons-vue'
  import { addDateRange , showStatusOperateFun, status ,getStatusIcon ,showStatusFun} from "@/utils/common"
  import { queryInstanceInfoByPluginCode} from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import { memberList , addProjectMember , updateProjectMember , projectList , removeMember, selectUsersOptions, changeStatus} from "@/api/gitlab/project-member"
  import { selectOption} from "@/api/gitlab/users"
  import { accessLevels } from "@/api/gitlab/groups"

  const queryForm = ref(null);

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    userName: undefined,
    groupId: undefined,
    projectId: undefined
  })

  // 查询项目列表信息
  const projectParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: 1,
    projectName: undefined,
    instanceCode: undefined
  })

  // 查询组列表信息
  const groupParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: 1,
    groupName: undefined,
    instanceCode: undefined
  })

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])
  // 成员列表
  const users = ref([]);
  // 选中数成员
  const ids = ref([])
  // 非单个禁用
  const single = ref(true)
  // 非多个禁用
  const multiple = ref(true)

  const total= ref(0)
  // 列表信息
  const memberRow = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({})
  const title = ref("")
  const pluginInstance = reactive([]);
  const projects = reactive([]);
  const pluginCode = "gitlab"

  // 表单规则
  const rules = reactive<FormRules>({
        instanceCode: [
          { required: true, message: "插件实例不能为空", trigger: "blur" }
        ],
        projectId: [
          { required: true, message: "项目不能为空", trigger: "blur" }
        ],
        userId: [
          { required: true, message: "成员不能为空", trigger: "blur" }
        ],
        accessLevel: [
          { required: true, message: "角色不能为空", trigger: "blur" }
        ],
  })

  // 重置表单
  const reset = ()=> {
      formRef.value?.clearValidate()
      Object.assign(form,{
        id: undefined,
        userId:undefined,
        userName: undefined,
        visibility: undefined,
        path: undefined,
        remark: undefined,
        status: undefined,
        accessLevel: undefined,
        projectId: undefined,
        instanceCode: queryParams.instanceCode
      })
  }

  // 获取列表
  const getList = ()=>{

    loading.value = true;
    memberList(addDateRange(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            memberRow.splice(0,memberRow.length);
            Object.assign(memberRow, response?.data?.records)
            total.value = response?.data?.total
          }else{
            memberRow.splice(0,memberRow.length);
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
    queryForm.value.resetFields();
    queryParams.instanceCode = pluginInstance[0].instanceCode
    handleQuery();
  }

  // 处理新增按钮
  const handleAdd = function(){
    reset();
    // 实例下拉列表
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)
        const instanceCode = pluginInstance[0].instanceCode

        const projectListQueryParam = reactive({instanceCode:instanceCode,status:1})
        // 项目下拉列表
        projectList(projectListQueryParam).then((response)=>{
          if(response.code = 200){
            Object.assign(projects,response?.data?.records)
          }
        })
        // 查询用户下拉列表
        selectOption(instanceCode).then(response =>{
          if(response.code == 200){
            users.value = response?.data
          }
        })

        open.value = true;
        title.value = "新增项目成员";
      }

    });
  }

  // 多选框选中数据
  const handleSelectionChange = function(selection){
    ids.value = selection.map(item => item.id);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
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
        updateProjectMember(form).then(response => {
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
        addProjectMember(form).then(response => {
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

  const instanceChangeHandle = (instanceCode)=>{
    projectList(instanceCode).then((response)=>{
        if(response.code == 200){
              Object.assign(projects,response?.data?.records)
        }
    })
  }

// 处理修改状态
const handleChangeStatus = (row)=>{
    const id = row.id
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否禁用编号为"' + id + '"的数据项？'
    }else{
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
        if(status == 0){
          tmpStatus = 1
        }else{
          tmpStatus = 0
        }
        changeStatus(id,tmpStatus).then((res)=>{
          if(res.code == 200){
          ElMessage({ showClose: true, message: '修改成功', type: 'success', });
          getList()
        }else{
          ElMessage({ showClose: true, message: res?.msg, type: 'error', });
        }
        })
    })
    .catch(() => { })
  }

  // 查询未选用户列表
  const queryMemberList = (value) =>{
    selectUsersOptions(form.projectId,"test").then((response)=>{
        if(response.code == 200){
          Object.assign(users, response?.data)
        }
    })
  }

  // 删除处理
  const handleDelete = (row)=>{
    const memberName = row.userName
    let msg = ""
    msg = '是否删除项目成员【"' + memberName + '"】的数据项？'

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      removeMember(row.id).then((res)=>{
          if(res.code == 200){
              // 重置查询表单,并进行查询
              queryParams.pageNum=1
              getList()
              ElMessage({
                type: 'success',
                message: '操作成功',
              })
          }
      })
    })
  }


  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
    reset();
  }


  // 查询实例列表
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)
        groupParams.instanceCode = pluginInstance[0].instanceCode
        queryParams.instanceCode = pluginInstance[0].instanceCode
        projectParams.instanceCode = pluginInstance[0].instanceCode
        projectList(groupParams).then((response) =>{
          Object.assign(projects,response?.data?.records)
        })
        projectList(projectParams).then((response)=>{
          if(response.code == 200){
            Object.assign(projects,response?.data?.records)
          }
          // queryParams.projectId = projects[0]?.id
          getList();
        })

      }
    });

// 按钮
const btnList = ref([
  {
    btnName: row => showStatusOperateFun(row.status),
    permArray: ['/gitlab/project/member/changeStatus/**'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleChangeStatus
  },
  {
    btnName: '删除',
    class: 'yt-color-error-hover',
    permArray: ['/gitlab/project/member/del/*'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleDelete
  },
])


</script>

<template>
  <div class="main-wrapp">
    <yt-card>
      <!--sousuo  -->
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
              <el-form-item label="成员名称" prop="userName">
                <el-input
                  v-model="queryParams.userName"
                  placeholder="请输入成员名称"
                  clearable
                  @keyup.enter.native="handleQuery"
                />
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
                <el-form-item label="项目" prop="projectId">
                  <el-select
                  class="search-select"
                    v-model="queryParams.projectId"
                    placeholder="请选择项目"
                    clearable
                  >
                  <el-option v-for="dict in projects"
                    :key="dict.projectName"
                    :label="dict.projectName"
                    :value="dict.id"/>
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
          @click="handleAdd" v-hasPerms="['/gitlab/project/member/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="memberRow" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="60" align="center" />
            <el-table-column label="用户编号" align="left" key="userId" prop="userId" v-if="false"/>
            <el-table-column label="成员编号" align="left" key="id" prop="id" v-if="false"/>
            <el-table-column label="项目编号" align="left" key="projectId" prop="projectId" v-if="false"/>
            <el-table-column label="成员名称" align="left" key="userName" prop="userName"  :show-overflow-tooltip="true" />
            <el-table-column label="成员昵称" align="left" key="nickName" prop="nickName"  :show-overflow-tooltip="true"  />
            <el-table-column label="邮箱" align="left" key="email" prop="email"  :show-overflow-tooltip="true"  />
            <el-table-column label="项目" align="left" key="projectName" prop="projectName" :show-overflow-tooltip="true"/>
            <el-table-column label="状态" align="center" key="status">
              <template #default="scope">
                {{  showStatusFun(scope.row.status) }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="left" prop="createTime" width="180">
              <template #default="scope">
                {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
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

    <!-- 添加或修改成员配置对话框 -->
    <el-dialog :title="title" v-model="open" width="var(--dialog-md-w)"  append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="16">
          <el-col>
            <el-form-item label="实例" prop="instanceCode">
              <el-select
              class="search-select2"
                v-model="form.instanceCode"
                @keyup.enter.native="handleQuery"
                @change="instanceChangeHandle"
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
        </el-row>

        <el-row :gutter="16">
          <el-col>
            <el-form-item label="项目" prop="projectId">
              <el-select
                  class="search-select"
                  v-model="form.projectId"
                  placeholder="请选择项目"
                  clearable
              >
                <el-option v-for="dict in projects"
                           :key="dict.projectName"
                           :label="dict.projectName"
                           :value="dict.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row  :gutter="16">
            <el-col>
              <el-form-item label="角色" prop="accessLevel">
                <el-select
                    class="search-select"
                    v-model="form.accessLevel"
                    placeholder="请选择角色"
                    clearable
                >
                  <el-option v-for="accessLevel in accessLevels"
                             :key="accessLevel.label"
                             :label="accessLevel.label"
                             :value="accessLevel.value"/>
                </el-select>
              </el-form-item>
            </el-col>
        </el-row>

        <el-row  :gutter="16">
          <el-col>
            <el-form-item label="成员" prop="userId">
              <el-select
                  v-model="form.userId"
                  filterable
                  @input="queryMemberList"
                  style="width: 190px"
              />
              <el-option v-for="user in users"
                         :key="user.label"
                         :label="user.label"
                         :value="user.value"/>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
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
</style>

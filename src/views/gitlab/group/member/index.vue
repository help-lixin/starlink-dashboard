<script setup lang="ts">
  // @ts-nocheck
  import { Plus , Search , RefreshRight , Sort } from '@element-plus/icons-vue'
  import {  status , showStatusFun , addDateRange ,showStatusOperateFun, getStatusIcon} from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Delete } from '@element-plus/icons-vue'
  import { memberList , addGroupMember , updateGroupMember  , removeMember ,changeStatus} from "@/api/gitlab/members"
  import { selectOption} from "@/api/gitlab/users"
  import { selectGitlabIdOptions,accessLevels,selectIdOptions, selectUsersOptions } from "@/api/gitlab/groups"
import { assign } from 'lodash'


  const queryFormRef = ref(null);
  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    userName: undefined,
    groupId: undefined,
    instanceCode: undefined,
    groups:undefined
  })

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])
  const total= ref(0)
  // 列表信息
  const dataList = reactive([])
  const groups = reactive([])

  const users = reactive([])
  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({
        id: undefined,
        accessLevel: undefined,
        projectId: undefined,
        userId: undefined,
        instanceCode: queryParams.instanceCode
  })
  const title = ref("")
  const pluginInstance = reactive([]);
  const pluginCode = "gitlab"

  // 表单规则
  const rules = reactive<FormRules>({
        instanceCode: [
          { required: true, message: "插件实例不能为空", trigger: "blur" }
        ],
        groupId: [
          { required: true, message: "成员组不能为空", trigger: "blur" }
        ],
        userIds: [
          { required: true, message: "成员不能为空", trigger: "blur" }
        ],
        accessLevel: [
          { required: true, message: "角色不能为空", trigger: "blur" }
        ]
    })

  // 重置表单
  const resetForm = ()=> {
      formRef.value?.clearValidate()
      groups.splice(0,groups.length)
      users.splice(0,users.length)
      Object.assign(form,{
        id: undefined,
        userId: undefined,
        groupId: undefined,
        accessLevel: undefined,
        projectId: undefined,
        instanceCode: queryParams.instanceCode
      })
  }

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    // 临时拷贝一份,清除:groups属性和数据
    const requesParams = {};
    Object.assign(requesParams,queryParams);
    delete requesParams.groups

    memberList(addDateRange(requesParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            dataList.splice(0,dataList.length);
            Object.assign(dataList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            dataList.splice(0,dataList.length);
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
    getList();
  }


  // 处理新增按钮
  const handleAdd = ()=>{
    resetForm();
    open.value = true;
    title.value = "新增组成员";


    selectIdOptions(queryParams.instanceCode).then((response)=>{
      Object.assign(groups , response?.data)
    })

    form.instanceCode = queryParams.instanceCode;
  }

  // 多选框选中数据
  const handleSelectionChange = function(selection){
    // ids.value = selection.map(item => item.id);
    // single.value = selection.length != 1;
    // multiple.value = !selection.length;
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

    // 临时拷贝一份,清除:groups/users属性和数据
    const requestForm = {};
    Object.assign(requestForm,form)

    if (requestForm.id != undefined) {
        updateGroupMember(requestForm)
        .then(response => {
          if(response?.code == 200){
            ElMessage({ showClose: true, message: '修改成功', type: 'success', });
          }else{
            ElMessage({ showClose: true, message: response?.msg, type: 'warning', });
          }
          open.value = false;
          getList();
        });
      } else {
        addGroupMember(requestForm)
        .then(response => {
          if(response?.code == 200){
            ElMessage({ showClose: true, message: '新增成功', type: 'success', });
          }else{
            ElMessage({ showClose: true, message: response?.msg, type: 'warning', });
          }

          open.value = false;
          getList();
        });
      }
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
  }

  // 查询未选用户列表
  const queryMemberList = (value) =>{
    console.log(value, 'value')
    selectUsersOptions(form.groupId,"test").then((response)=>{
        if(response.code == 200){
          console.log(response.data)
          console.log(users)
          Object.assign(users, response?.data)
          console.log(users)
        }
    })
  }

  // 删除处理
  const handleDelete = (row)=>{
    const memberName = row.userName
    let msg = ""
    msg = '是否删除组成员【"' + memberName + '"】的数据项？'

    ElMessageBox.confirm(
      msg, 'Warning', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning', }
    ).then(() => {
      removeMember(row.id)
      .then((res)=>{
          if(res.code == 200){
              ElMessage({ type: 'success', message: '操作成功', })
          }else{
              ElMessage({type: 'warning',message: '删除失败',})
          }
          getList()
        })
    }).catch(() => {

    })
  }

  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
    resetForm();
  }

  // form表单切换实例,修改群组下拉列表
  const formSwitchInstance = ()=>{
    const instanceCode = queryParams?.instanceCode;
    if(instanceCode && instanceCode.length > 0 ){
      // 根据instanceCode重新加载用户组
      selectIdOptions(instanceCode).then(response => {
          Object.assign(groups , response?.data)
      })
    }else{
      groups.splice(0,groups.length)
    }
  }

  // 列表页面,切换实例操作.
  const listSwitchInstance = ()=>{
    const instanceCode = queryParams?.instanceCode;
    if(instanceCode && instanceCode.length > 0 ){
       // 根据instanceCode重新加载用户组
      selectIdOptions(instanceCode).then(response => {
          Object.assign(groups,response?.data)
      })
    }else{
      groups.splice(0,groups.length);
    }
  }


  // 按钮
  const btnList = ref([
  {
    btnName: row => showStatusOperateFun(row.status),
    permArray: ['/gitlab/group/member/changeStatus/**'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleChangeStatus
  },
  {
    btnName: '删除',
    class: 'yt-color-error-hover',
    permArray: ['/gitlab/group/member/del'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleDelete
  },
])


  const iniOption = ()=>{
    // 默认情况下:选择一个"实例"下的一个"组",进行查询
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
        if(res.code == 200){
          // 检查一下数组情况
          if(res?.data && res?.data.length > 0){
            Object.assign(pluginInstance,res?.data)
            queryParams.instanceCode = res?.data[0].instanceCode
          }

          selectIdOptions(queryParams.instanceCode).then((response)=>{
            Object.assign(groups ,response?.data)
            // queryParams.groupId = response?.data[0]?.id
            // 触发查询

          })
          getList();
        }
    });
  }

  iniOption()
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form class="form-wrap"  :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch"  >
        <el-row :gutter="16">
          <el-col :span="8">
              <el-form-item label="插件实例" prop="instanceCode">
                <el-select
                class="search-select"
                  v-model="queryParams.instanceCode"
                  :change="listSwitchInstance()"
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
              <el-form-item label="成员组" prop="groupId">
                <el-select
                class="search-select"
                  v-model="queryParams.groupId"
                  placeholder="成员组"
                  clearable
                >
                <el-option v-for="dict in groups"
                  :key="dict.id"
                  :label="dict.gitlabGroupName"
                  :value="dict.id"/>
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
                  placeholder="成员状态"
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
          @click="handleAdd" v-hasPerms="['/gitlab/group/member/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="60" align="center" />
            <el-table-column label="用户编号" align="left" key="userId" prop="userId" v-if="false"/>
            <el-table-column label="成员编号" align="left" key="id" prop="id" v-if="false"/>
            <el-table-column label="成员昵称" align="left" key="nickName" prop="nickName"  :show-overflow-tooltip="true" />
            <el-table-column label="邮箱" align="left" key="email" prop="email"  :show-overflow-tooltip="true" />
            <el-table-column label="成员名称" align="left" key="userName" prop="userName"  :show-overflow-tooltip="true" />
            <el-table-column label="组" align="left" key="gitlabGroupName" prop="gitlabGroupName" :show-overflow-tooltip="true" />
            <el-table-column label="状态" align="center" key="status" >
              <template #default="scope">
                {{  showStatusFun(scope.row.status) }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="left" prop="createTime" width="200">
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


    <!-- 添加或修改成员配置对话框 -->
    <el-dialog :title="title" v-model="open" width="var(--dialog-lg-w)"  append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="实例" prop="instanceCode">
                <el-select
                class="search-select2"
                  v-model="form.instanceCode"
                  @change="formSwitchInstance"
                  placeholder="请选择实例"
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
              <el-form-item label="成员组" prop="groupId">
                <el-select
                  class="search-select"
                  v-model="form.groupId"
                  placeholder="请选择成员组"
                  @change="queryMemberList"
                  style="width: 240px"
                >
                <el-option v-for="dict in groups"
                  :key="dict.id"
                  :label="dict.gitlabGroupName"
                  :value="dict.id"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>



          <el-row>
            <el-col :span="12">
              <el-form-item label="成员" prop="userIds">
                  <el-select
                        v-model="form.userId"
                        multiple
                        filterable
                        remote
                        reserve-keyword
                        :remote-method="queryMemberList"
                        style="width: 190px"
                  >
                  <el-option v-for="item in users"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"/>
                  </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色" prop="accessLevel">
                <el-select
                  class="search-select"
                  v-model="form.accessLevel"
                  placeholder="请选择角色"
                  style="width: 240px"
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
</style>

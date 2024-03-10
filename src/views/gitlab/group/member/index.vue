<script setup lang="ts">
  // @ts-nocheck
  import { Plus , Search , RefreshRight , Sort } from '@element-plus/icons-vue'
  import {  status , showStatusFun , addDateRange } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Delete } from '@element-plus/icons-vue'
  import { memberList , addGroupMember , updateGroupMember  , removeMember} from "@/api/gitlab/members"
  import { selectOption} from "@/api/gitlab/users"
  import { selectGitlabIdOptions,accessLevels,selectIdOptions } from "@/api/gitlab/groups"


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
    groups:[]
  })

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])
  const total= ref(0)
  // 列表信息
  const dataList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({
        id: undefined,
        accessLevel: undefined,
        projectId: undefined,
        userIds: [],
        instanceCode: queryParams.instanceCode,
        users:[],
        groups:[]
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
      form.groups.splice(0,form.groups.length)
      form.users.splice(form.users.length)
      // form.userIds.splice(form.userIds.length)
      Object.assign(form,{
        id: undefined,
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
      form.groups = response?.data
      console.log("group->")
      console.log(form.groups)
    })

    selectOption(queryParams.instanceCode).then((response)=>{
      console.log("user->")
      console.log(response)
      form.users = response?.data
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
    delete requestForm.groups
    delete requestForm.users

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

  // 修改处理
  const handleEdit = (row)=>{

  }

  // 删除处理
  const handleDelete = (row)=>{
    const memberName = row.userName
    const curStatus = row.status
    let msg = ""
    msg = '是否删除组成员【"' + memberName + '"】的数据项？'

    const deleteParams = {
      userId: row.userId,
      groupId: row.groupId,
      instanceCode: row.instanceCode
    };

    ElMessageBox.confirm(
      msg, 'Warning', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning', }
    ).then(() => {
      removeMember(deleteParams)
      .then((res)=>{
          if(res.code == 200){
              getList()
              ElMessage({ type: 'success', message: '操作成功', })
          }
        })
    }).catch(() => {
      getList()
      ElMessage({type: 'warning',message: '删除失败',})
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
          form.groups = response?.data
      })
    }else{
      form.groups = []
    }
  }

  // 列表页面,切换实例操作.
  const listSwitchInstance = ()=>{
    const instanceCode = queryParams?.instanceCode;
    if(instanceCode && instanceCode.length > 0 ){
       // 根据instanceCode重新加载用户组
        selectGitlabIdOptions(instanceCode).then(response => {
            queryParams.groups = response?.data
        })
    }else{
      queryParams.groups=[];
    }
  }

  const iniOption = ()=>{
    // 默认情况下:选择一个"实例"下的一个"组",进行查询
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
        if(res.code == 200){
          // 检查一下数组情况
          if(res?.data && res?.data.length > 0){
            Object.assign(pluginInstance,res?.data)
            queryParams.instanceCode = res?.data[0].instanceCode
          }

          selectGitlabIdOptions(queryParams.instanceCode).then((response)=>{
            queryParams.groups = response?.data
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
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch"  >

          <el-form-item label="插件实例" prop="instanceCode">
            <el-select
            class="search-select"
              v-model="queryParams.instanceCode"
              :change="listSwitchInstance()"
              placeholder="请选择实例"
              style="width: 240px"
            >
            <el-option v-for="item in pluginInstance"
              :key="item.pluginCode"
              :label="item.instanceName"
              :value="item.instanceCode"/>
            </el-select>
          </el-form-item>
          <el-form-item label="成员组" prop="groupId">
            <el-select
            class="search-select"
              v-model="queryParams.groupId"
              placeholder="成员组"
              clearable
              style="width: 240px"
            >
            <el-option v-for="dict in queryParams.groups"
              :key="dict.id"
              :label="dict.gitlabGroupName"
              :value="dict.id"/>
            </el-select>
          </el-form-item>
          <el-form-item label="成员名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入成员名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
            class="search-select"
              v-model="queryParams.status"
              placeholder="成员状态"
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
          <el-table-column label="组" align="left" key="gitlabGroupName" prop="gitlabGroupName" />
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
            align="left"
            width="220"
          >
            <template #default="scope">
             <div class="action-btn">
              <el-button
                size="small"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPerms="['/gitlab/group/member/del']"
              >删除</el-button>
              <!-- <el-button
                size="small"
                icon="Edit"
                @click="handleEdit(scope.row)"
                v-hasPerms="['/gitlab/group/edit']"
              >修改</el-button> -->
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


    <!-- 添加或修改成员配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="实例" prop="instanceCode">
                <el-select
                class="search-select2"
                  v-model="form.instanceCode"
                  :change="formSwitchInstance"
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
                  clearable
                  style="width: 240px"
                >
                <el-option v-for="dict in form.groups"
                  :key="dict.gitlabGroupName"
                  :label="dict.gitlabGroupName"
                  :value="dict.id"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>



          <el-row>
            <el-col :span="12">
              <el-form-item label="成员" prop="userIds">
                  <el-tree-select
                    v-model="form.userIds"
                    :data="form.users"
                    :multiple="true"
                    show-checkbox
                    style="width: 240px"
                  />
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
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
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

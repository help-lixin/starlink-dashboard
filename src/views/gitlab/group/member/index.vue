<script setup lang="ts">
  // @ts-nocheck  
  import { Plus ,Delete, Edit, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
  import { showStatusOperateFun , status , showStatusFun , addDateRange } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import { memberList , addGroupMember , updateGroupMember , queryGroupMemberInfoById , removeMember, showMemberGroup} from "@/api/gitlab/members"
  import { userList} from "@/api/gitlab/users"
  import { groupList } from "@/api/gitlab/groups"
  
 
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
  // 权限列表
  const accessLevels = [
  {
    value: 10,
    label: 'GUEST',
  },
  {
    value: 20,
    label: 'REPORTER',
  },
  {
    value: 30,
    label: 'DEVELOPER',
  },
  {
    value: 40,
    label: 'MAINTAINER',
  },
  {
    value: 50,
    label: 'OWNER',
  }
];

  const total= ref(0)
  // 列表信息
  const dataList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({})
  const title = ref("")
  const pluginInstance = reactive([]);
  // const groups = reactive([]);
  const pluginCode = "gitlab"

  // 表单规则
  const rules = reactive<FormRules>({
        groupName: [
          { required: true, message: "成员名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '成员名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ]
  })

  // 重置表单
  const reset = ()=> {
      Object.assign(form,{
        id: undefined,
        userName: undefined,
        visibility: undefined,
        path: undefined,
        remark: undefined,
        status: undefined,
        instanceCode: undefined,
        groups: [],
        users: []
      })
  }

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    // 临时拷贝一份
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

  // 处理查询按钮
  const resetQuery = function(){
    dateRange.value = [];
    queryFormRef.value.resetFields();
    handleQuery();
  }



  // 处理新增按钮
  const handleAdd = ()=>{
    reset();
    open.value = true;
    title.value = "新增组成员";


    groupListFunc(queryParams.instanceCode,(response)=>{
      form.groups = response?.data?.records
    })

    userListFunc(queryParams.instanceCode,(response)=>{
      form.users = response?.data.records
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

    if (form.id != undefined) {
        updateGroupMember(form)
        .then(response => {
          if(response?.code == 200){
            ElMessage({ showClose: true, message: '修改成功', type: 'success', });
            open.value = false;
            getList();
          }else{
            ElMessage({ showClose: true, message: response?.msg, type: 'warning', });
            open.value = false;
            getList();
          }

        });
      } else {
        addGroupMember(form)
        .then(response => {
          if(response?.code == 200){
            ElMessage({ showClose: true, message: '新增成功', type: 'success', });
            open.value = false;
            getList();
          }else{
            ElMessage({ showClose: true, message: response?.msg, type: 'warning', });
            open.value = false;
            getList();
          }
        });
      }
  }


  // 修改状态弹出框处理
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

  // 加载"项目组下拉表框"
  const groupListFunc = (instanceCode:any,callback:any) =>{
    const groupParams = { 
        instanceCode : instanceCode
    }

    // TODO 伍岳林,后端开独立的接口,为下拉列表进行赋值.
    groupList(addDateRange(groupParams, dateRange.value))
      .then(response => {
        if(callback){
          callback(response);
        }
    })
  }

  // 加载"用户下拉表框"
  const userListFunc = (instanceCode:any,callback:any)=>{
    const uesrListqueryParams = {
      instanceCode : instanceCode
    };

    //  TODO 伍岳林,后端抽出独立接口来渲染成下拉列表框,不要共用一个接口.
    userList(uesrListqueryParams)
    .then(response =>{
      if(callback){
        callback(response);
      }
    })
  }


  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
    reset();
  }

  // form表单切换实例
  const formSwitchInstance = ()=>{
    if(form?.instanceCode && form?.instanceCode.length > 0 ){
      // 根据instanceCode重新加载用户组
      groupListFunc(form.instanceCode,(response)=>{
        form.groups = response?.data?.records
      })
    }else{
      form.groups = []
    }
  }

  // 列表页面,切换实例操作.
  const listSwitchInstance = ()=>{
    if(queryParams?.instanceCode && queryParams?.instanceCode.length > 0 ){
       // 根据instanceCode重新加载用户组
       groupListFunc(queryParams.instanceCode,(response)=>{
        queryParams.groups = response?.data?.records;
      })
    }else{
      queryParams.groups=[];
    }
  }

  // 默认情况下:选择一个"实例"下的一个"组",进行查询
  queryInstanceInfoByPluginCode(pluginCode)
  .then((res)=>{
    if(res.code == 200){
      Object.assign(pluginInstance,res?.data)
      queryParams.instanceCode = res?.data[0].instanceCode

      // TODO 伍岳林,后端开独立的接口,为下拉列表进行赋值.
      groupListFunc(queryParams.instanceCode,(response)=>{
        queryParams.groups = response?.data?.records
        queryParams.groupId = response?.data?.records[0]?.id
        // 触发查询
        getList();
      })
    }
  });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="68px">
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="插件实例" prop="instanceCode">
            <el-select
            class="search-select"
              v-model="queryParams.instanceCode"
              :change="listSwitchInstance()"
              placeholder="请选择实例"
              clearable
              style="width: 240px"
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
              style="width: 240px"
            >
            <el-option v-for="dict in queryParams.groups"
              :key="dict.gitlabGroupName"
              :label="dict.gitlabGroupName"
              :value="dict.id"/>
            </el-select>
          </el-form-item>
        </el-col> 
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="成员名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入成员名称"
              clearable
              style="width: 240px"
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
              style="width: 240px"
            >
            <el-option v-for="dict in status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
            </el-select>
          </el-form-item>
        </el-col> 
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col> 
        <el-col :span="8">
          <div>
            <el-button type="primary" size="small" @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
            <el-button  size="small" @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
          </div>
        </el-col>
      </el-row>  
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
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="false"/>
          <el-table-column label="成员编号" align="center" key="id" prop="id"/>
          <el-table-column label="成员昵称" align="center" key="nickName" prop="nickName"  :show-overflow-tooltip="true"  width="100" />
          <el-table-column label="邮箱" align="center" key="email" prop="email"  :show-overflow-tooltip="true"  width="100" />
          <el-table-column label="成员名称" align="center" key="userName" prop="userName"  :show-overflow-tooltip="true"  width="100" />
          <el-table-column label="组" align="center" key="groupId"  width="100">
            #### 待处理
          </el-table-column>
          <el-table-column label="状态" align="center" key="status"  width="100">
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime"  width="180">
            <template #default="scope">
              <span>{{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="220"
          >
            <template #default="scope">
             <div class="action-btn">
              <el-button
                size="default"
                @click="handleDelete(scope.row)"
                v-hasPerms="['/gitlab/group/member/del']"
              >删除</el-button>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="实例" prop="instanceCode">
              <el-select
              class="search-select2" 
                v-model="form.instanceCode"
                :change="formSwitchInstance()"
                placeholder="请选择实例"
                clearable
                style="width: 240px"
              >
              <el-option v-for="item in pluginInstance"
                :key="item.pluginCode"
                :label="item.instanceName"
                :value="item.instanceCode"/>
              </el-select>
            </el-form-item>
          </el-col> 
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="成员组" prop="groupId">
              <el-select
                class="search-select"
                v-model="form.groupId"
                placeholder="成员组"
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
          <el-col :span="24">
            <el-form-item label="成员" prop="userId">
              <el-select
                class="search-select"
                v-model="form.userId"
                placeholder="成员"
                style="width: 240px"
                clearable
              >
              <el-option v-for="user in form.users"
                :key="user.userName"
                :label="user.userName"
                :value="user.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="权限" prop="accessLevel">
              <el-select
                class="search-select"
                v-model="form.accessLevel"
                placeholder="权限"
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
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
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
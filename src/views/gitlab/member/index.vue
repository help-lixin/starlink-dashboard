<script setup lang="ts">
  // @ts-nocheck  
  import { Plus ,Delete, Edit, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
  import { showStatusOperateFun , status , showStatusFun , addDateRange } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import { memberList , addGroupMember , updateGroupMember , queryGroupMemberInfoById , changeGroupStatus} from "@/api/gitlab/members"
  import { userList} from "@/api/gitlab/users"
  import { groupList } from "@/api/gitlab/groups"
  
 
  const queryForm = ref(null);
  // 日期范围
  const daterangeArray = ref('')

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    userName: undefined,
    groupId: undefined
  })

    //查询列表信息
  const groupParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    groupName: undefined,
    instanceCode: undefined
  })

  // 根据成员名查询成员信息
  const queryUserParams = reactive({
    pageNum: 1,
    pageSize: 10,
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
  const groups = reactive([]);
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
        instanceCode: undefined
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
            console.log(memberRow)
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
    handleQuery();
  }

  // 处理新增按钮
  const handleAdd = function(){
    reset();
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)
        open.value = true;
        title.value = "新增组成员";
      }

      
    });
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset();

    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)

        queryGroupMemberInfoById(row.id).then(response => {
          if(response?.code == 200){
            Object.assign(form,response?.data)
            
          }
        });
      
        userList(queryUserParams).then(response =>{
          Object.assign(users,response?.data)
          form.userId = users[0].id
        })
        open.value = true;
        title.value = "修改组成员";
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
        updateGroupMember(form).then(response => {
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
        addGroupMember(form).then(response => {
          if(response?.code){
            ElMessage({
                  showClose: true,
                  message: '新增成功',
                  type: 'success',
            });
            open.value = false;
            getList();
          }
        });
      }
  }

  
  // 修改状态弹出框处理
  const handleStatusChange = (row)=>{
    const memberId = row.id || ids.value;
    const curStatus = row.status
    let msg = ""
    if(curStatus == 1){
      msg = '是否禁用编号为"' + memberId + '"的数据项？'
    }else{
      msg = '是否启用编号为"' + memberId + '"的数据项？'
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
        if(curStatus == 0){
          tmpStatus = 1
        }else{
          tmpStatus = 0
        }
        changeUserStatus(memberId,tmpStatus).then((res)=>{
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
    }).catch(() => { })
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
        queryUserParams.instanceCode =  queryParams.instanceCode = groupParams.instanceCode = res?.data[0].instanceCode
        
        groupList(addDateRange(groupParams, dateRange.value))
          .then(response => {
            Object.assign(groups,response?.data?.records)
            queryParams.groupId = response?.data?.records[0]?.id
            // 触发查询
            getList();

            userList(queryUserParams).then(response =>{
                Object.assign(users,response?.data?.records)
                console.log(users)
            })
        })
      }
    });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <el-form class="form-wrap" :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
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
          <el-form-item label="成员组" prop="groupId">
            <el-select
            class="search-select"
              v-model="queryParams.groupId"
              placeholder="成员组"
              clearable
              style="width: 240px"
            >
            <el-option v-for="dict in groups"
              :key="dict.gitlabGroupName"
              :label="dict.gitlabGroupName"
              :value="dict.id"/>
            </el-select>
          </el-form-item>
        </el-col> 
        <el-col :span="8">
          <el-form-item label="插件实例" prop="instanceCode">
            <el-select
            class="search-select"
              v-model="queryParams.instanceCode"
              @keyup.enter.native="handleQuery"
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
      <el-table v-loading="loading" :data="memberRow" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column label="成员编号" align="center" key="id" prop="id"/>
          <el-table-column label="成员昵称" align="center" key="nickName" prop="nickName"  :show-overflow-tooltip="true"  width="100" />
          <el-table-column label="邮箱" align="center" key="email" prop="email"  :show-overflow-tooltip="true"  width="100" />
          <el-table-column label="成员名称" align="center" key="userName" prop="userName"  :show-overflow-tooltip="true"  width="100" />
          <el-table-column label="状态" align="center" key="status"  width="100">
            <template v-slot="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createdTime"  width="180">
            <template v-slot="scope">
              <span>{{ dayjs(scope.row.createdTime).format("YYYY-MM-DD HH:mm:ss")   }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="220"
          >
            <template v-slot="scope">
             <div class="action-btn">
              <el-button
                size="default"
                @click="handleUpdate(scope.row)"
                v-hasPerms="['/gitlab/group/member/edit']"
              >修改</el-button>
              <el-button
                size="default"
                @click="handleStatusChange(scope.row)"
                v-hasPerms="['/gitlab/group/member/changeStatus/**']"
              >{{ showStatusOperateFun(scope.row.status)  }}</el-button>
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
          <el-col :span="8">
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
              class="search-select2" 
                v-model="form.instanceCode"
                @keyup.enter.native="handleQuery"
                placeholder="请选择实例"
                clearable
                style="width: 200px;"
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
                v-model="form.groupId"
                placeholder="成员组"
                clearable
                style="width: 240px"
              >
              <el-option v-for="dict in groups"
                :key="dict.gitlabGroupName"
                :label="dict.gitlabGroupName"
                :value="dict.id"/>
              </el-select>
            </el-form-item>
          </el-col> 
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="成员" prop="userId">
              <el-select
                class="search-select"
                v-model="form.userId"
                placeholder="成员"
                clearable
                style="width: 240px"
              >
              //todo lixin
              <el-option v-for="user in users"
                :key="user.userName"
                :label="user.userName"
                :value="user.id"/>
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
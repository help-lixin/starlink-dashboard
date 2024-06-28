<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange , getStatusIcon } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit } from '@element-plus/icons-vue'
  import { userList , addUser , updateUser , queryUserInfoById , changeUserStatus} from "@/api/gitlab/users"

  const queryForm = ref(null);

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    userName: undefined,
    instanceCode: undefined
  })

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])
  const total= ref(0)
  const userRow = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({
        id: undefined,
        userName: undefined,
        nickName : undefined,
        email : undefined,
        visibility: undefined,
        path: undefined,
        remark: undefined,
        status: 1,
        instanceCode: undefined
  })
  const title = ref("")
  const pluginInstance = reactive([]);
  const pluginCode = "gitlab"

  // 表单规则
  const rules = reactive<FormRules>({
        instanceCode: [
          { required: true, message: "插件实例不能为空", trigger: "blur" }
        ],
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' },
          { pattern: /^[-_a-zA-Z0-9]*$/, message: '只可以输入字母、数字、下划线及中划线', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '用户昵称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        email: [
            { required: true, message: "邮箱地址不能为空", trigger: "blur" },
            {type: "email", message: "请输入正确的邮箱地址", trigger: ["blur"]}
        ],
        pwd: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: '密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ],
    })

  // 重置表单
  const reset = ()=> {
      formRef.value?.clearValidate()
      Object.assign(form,{
        id: undefined,
        userName: undefined,
        nickName : undefined,
        email : undefined,
        visibility: undefined,
        path: undefined,
        remark: undefined,
        status: 1,
        instanceCode: undefined
      })
  }

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    userList(addDateRange(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            userRow.splice(0,userRow.length);
            Object.assign(userRow, response?.data?.records)
            total.value = response?.data?.total
          }else{
            userRow.splice(0,userRow.length);
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
    open.value = true;
    title.value = "添加用户";
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset();
    queryUserInfoById(row.id)
    .then(response => {
      if(response?.code == 200){
        Object.assign(form,response?.data)
        console.log(form)
        open.value = true;
        title.value = "修改用户";
      }
    });
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
        updateUser(form)
        .then(response => {
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
        addUser(form)
        .then(response => {
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
    const id = row.id
    const curStatus = row.status
    const instanceCode = row.instanceCode;

    const changeStatusParams = {
          status: undefined,
          id: id,
          instanceCode: instanceCode
    };

    let msg = ""
    if(curStatus == 1){
      msg = '是否禁用编号为"' + id + '"的数据项？'
      changeStatusParams.status = 0
    }else{
      msg = '是否启用编号为"' + id + '"的数据项？'
      changeStatusParams.status = 1
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
        changeUserStatus(changeStatusParams)
        .then((res)=>{
            if(res.code == 200){
                getList()
                ElMessage({
                  type: 'success',
                  message: '操作成功',
                })
            }
        })
    })
    .catch(() => { })
  }


  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
    reset();
  }

  // 触发查询
  getList();

  // 提前加载实例列表.
  queryInstanceInfoByPluginCode(pluginCode)
  .then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)
      }
    });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form :model="queryParams" ref="queryForm"  :inline="true" v-show="showSearch" >
        <el-row :gutter="16">
          <el-col :span="8">
              <el-form-item label="用户名称" prop="userName">
                <el-input
                  v-model="queryParams.userName"
                  placeholder="请输入用户名称"
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
                  placeholder="用户状态"
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
                  style="width: 240px"
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
        <!-- <el-button
          type="primary"
          plain
          size="default"
          @click="handleAdd" v-hasPerms="['/gitlab/user/add']" ><el-icon><Plus /></el-icon>新增</el-button> -->
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="userRow">
            <el-table-column type="selection" width="60" align="center" />
            <el-table-column label="用户编号" align="left" key="id" prop="id" v-if="false"/>
            <el-table-column label="用户名称" align="left" key="userName" prop="userName"  :show-overflow-tooltip="true"  />
            <el-table-column label="用户昵称" align="left" key="nickName" prop="nickName"  :show-overflow-tooltip="true"  />
            <el-table-column label="邮箱" align="left" key="email" prop="email"  :show-overflow-tooltip="true" />
            <el-table-column label="状态" align="center" key="status" >
              <template #default="scope">
                {{  showStatusFun(scope.row.status) }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="left" prop="createTime" width="180">
              <template #default="scope">
                {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
              </template>
            </el-table-column>
            <!-- <el-table-column
              label="操作"
              align="left"
              width="220"
            >
              <template #default="scope">
               <div class="action-btn">
                <el-button
                  size="small"
                  icon="Edit"
                  @click="handleUpdate(scope.row)"
                  v-hasPerms="['/gitlab/user/edit']"
                >修改</el-button>
                <el-button
                  size="small"
                  :icon="getStatusIcon(scope.row)"
                  @click="handleStatusChange(scope.row)"
                  v-hasPerms="['/gitlab/user/changeStatus']"
                >{{ showStatusOperateFun(scope.row.status)  }}</el-button>
               </div>
              </template>
            </el-table-column> -->
      </el-table>
      </div>
      <div class="page-wrap">
        <yt-page :total="total" v-model="queryParams" @change="getList"></yt-page>
      </div>
    </yt-card>


    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="插件实例" prop="instanceCode" >
                <el-select
                class="search-select2"
                  v-model="form.instanceCode"
                  @keyup.enter.native="handleQuery"
                  placeholder="请选择实例"
                  clearable
                  style="width: 200px;"
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
              <el-form-item label="用户名称" prop="userName">
                <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户昵称" prop="nickName">
                <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱名称" maxlength="30" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="密码" prop="pwd" v-if="form.id == undefined">
                <el-input v-model="form.pwd" placeholder="请输入密码" maxlength="30" minlength="6" type="password" show-password />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="20">
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

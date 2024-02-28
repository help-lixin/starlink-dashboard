<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange , getStatusIcon } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit } from '@element-plus/icons-vue'
  import {addGroup , updateGroup , queryGroupInfoById, changeGroupStatus, groupList, queryGitlabAddr} from "@/api/gitlab/groups"

  const queryFormRef = ref(null);
  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    instanceCode:undefined,
    groupName: undefined
  })


  // 可见性等级列表
  const visibilityArr = ref(["PUBLIC", "PRIVATE", "INTERNAL"])

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])


  const total= ref(0)
  const groupPageList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({
        groupId: undefined,
        groupName: undefined,
        visibility: undefined,
        path: undefined,
        remark: undefined,
        status: 1,
        instanceCode: undefined
  })
  const ipAddr = ref(null)
  const title = ref("")
  const pluginInstance = reactive([]);
  const pluginCode = "gitlab"

  // 表单规则
  const rules = reactive<FormRules>({
        groupName: [
          { required: true, message: "群组名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '群组名称长度必须介于 2 和 20 之间', trigger: 'blur' },
          { pattern: /^[-_a-zA-Z0-9|\u4e00-\u9fa5]*$/, message: '只可以输入字母、数字、下划线、中划线和中文字符', trigger: 'blur' }
          
        ],
        visibility: [
          { required: true, message: "可见性等级不能为空", trigger: "blur" }
        ],
        instanceCode: [
          { required: true, message: "插件实例不能为空", trigger: "blur" }
        ],
        path: [
          { required: true, message: "URL不能为空", trigger: "blur" },
          { pattern: /^[0-9a-zA-Z]*$/, message: '只可以输入数字和字母', trigger: 'blur' },
          { min: 2, max: 20, message: 'URL长度必须介于 2 和 20 之间', trigger: 'blur' }
        ]
    })

  // 重置表单
  const reset = ()=> {
      formRef.value?.clearValidate()
      Object.assign(form,{
        groupId: undefined,
        groupName: undefined,
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
    groupList(addDateRange(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            groupPageList.splice(0,groupPageList.length);
            Object.assign(groupPageList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            groupPageList.splice(0,groupPageList.length);
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
  const handleAdd = function(){
    reset()
    form.instanceCode = pluginInstance[0]
    queryGitlabAddrFun()
    open.value = true
    title.value = "添加组"
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset();
    queryGroupInfoById(row.id).then(response => {
      if(response?.code == 200){
        Object.assign(form,response?.data)
        form.groupName = response?.data.gitlabGroupName
        form.groupId = response?.data.id
        open.value = true;
        title.value = "修改组";
      }
    });
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

    if (form.groupId != undefined) {
      updateGroup(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '修改成功',
                  type: 'success',
            });
          }else{
            ElMessage({
                  showClose: true,
                  message: '更新出现异常,请联系管理员',
                  type: 'error',
            });
          }
          open.value = false;
          getList();
        });
      } else {
        addGroup(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '新增成功',
                  type: 'success',
            });
          }else{
            ElMessage({
                  showClose: true,
                  message: '新增出现异常,请联系管理员',
                  type: 'error',
            });
          }
          open.value = false;
          getList();
        });
      }

      
  }

  const handleStatusChange = (row)=>{
    const groupId = row.id
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否禁用编号为"' + groupId + '"的数据项？'
    }else{
      msg = '是否启用编号为"' + groupId + '"的数据项？'
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
        changeGroupStatus(groupId,tmpStatus).then((res)=>{
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

  // 查询当前实例ip端口地址
  const queryGitlabAddrFun = ()=>{
    queryGitlabAddr(form.instanceCode.instanceCode).then((res)=>{
      ipAddr.value = res.data+"/";
    })
  }

  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
  }


  // 触发查询
  getList();
  // 进入页面时,就初始化实例列表
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
    if(res.code == 200){
      Object.assign(pluginInstance,res?.data)
    }
  });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
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
          <el-form-item label="组名称" prop="groupName">
            <el-input
              v-model="queryParams.groupName"
              placeholder="请输入组名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="可见性等级" prop="visibility">
            <el-select
            class="search-select"
              v-model="queryParams.visibility"
              @keyup.enter.native="handleQuery"
              placeholder="请选择可见性等级"
              clearable
              style="width: 240px"
            >
            <el-option v-for="item in visibilityArr"
              :key="item"
              :label="item"
              :value="item"/>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
            class="search-select"
              v-model="queryParams.status"
              placeholder="组状态"
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
            <el-button  @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
          </el-form-item>
    </el-form>

    <!--  option-->
    <div class="option-wrap">
      <el-button
        type="primary"
        plain
        size="default"
        @click="handleAdd" v-hasPerms="['/gitlab/group/add']" ><el-icon><Plus /></el-icon>新增</el-button>
    </div>

    <!--table  -->
    <div class="table-wrap">
      <el-table v-loading="loading" :data="groupPageList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="组编号" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="组名称" align="left" key="gitlabGroupName" prop="gitlabGroupName"  :show-overflow-tooltip="true" />
          <el-table-column label="群组URL" align="left" key="path" prop="path"  :show-overflow-tooltip="true" />
          <el-table-column label="备注" align="left" key="remark" prop="remark" :show-overflow-tooltip="true"  />
          <el-table-column label="状态" align="center" key="status" >
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" >
            <template #default="scope">
              {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
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
                size="small"
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPerms="['/gitlab/group/add']"
              >修改</el-button>
              <el-button
                size="small"
                :icon="getStatusIcon(scope.row)"
                @click="handleStatusChange(scope.row)"
                v-hasPerms="['/gitlab/group/changeStatus/**']"
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


    <!-- 添加或修改组配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="实例" prop="instanceCode">
                <el-select
                  class="search-select2"
                  v-model="form.instanceCode"
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
          <el-row>
            <el-col :span="12">
              <el-form-item label="群组名称" prop="groupName">
                <el-input v-model="form.groupName" placeholder="请输入群组名称" maxlength="30" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row >
              <el-form-item label="群组URL" prop="path">
                <el-input v-model="form.path" placeholder="请输入群组URL" maxlength="30" clearable style="width: 435px">
                  <template #prepend>{{ipAddr}}</template>
                </el-input>
              </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="可见性等级" prop="visibility">
              <el-select
                v-model="form.visibility"
                @keyup.enter.native="handleQuery"
                placeholder="请选择可见性等级"
                clearable
                style="width: 240px"
              >
              <el-option v-for="item in visibilityArr"
                :key="item"
                :label="item"
                :value="item"/>
              </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
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

.el-form-item__label {
  font-size: 14px;
 }

.search-select .el-input {
  --el-input-width: 240px;
}
</style>

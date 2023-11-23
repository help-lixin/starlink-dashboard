<script setup lang="ts">
  // @ts-nocheck  
  import { showStatusOperateFun , status , showStatusFun , addDateRange , addDateRangeRuoyi } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {addGroup , updateGroup , queryGroupInfoById, changeGroupStatus, groupList} from "@/api/gitlab/groups"
 
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
    instanceCode:undefined,
    groupName: undefined
  })

  // 根据组名查询组信息
  const queryGroupParams = reactive({
    groupName: undefined
  })

  // 权限列表
  const visibilityArr = ref(["PUBLIC", "PRIVATE", "INTERNAL"])

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])

  // 选中数组
  const ids = ref([])
  // 非单个禁用
  const single = ref(true)
  // 非多个禁用
  const multiple = ref(true)

  const total= ref(0)
  const groupPageList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({})
  const title = ref("")
  const pluginInstance = reactive([]);
  const pluginCode = "gitlab"

  // 表单规则
  const rules = reactive<FormRules>({
        groupName: [
          { required: true, message: "组名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '组名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        visibility: [
          { required: true, message: "权限不能为空", trigger: "blur" }
        ],
        path: [
          { required: true, message: "路径不能为空", trigger: "blur" }
        ]
    })

  // 重置表单
  const reset = ()=> {
      Object.assign(form,{
        groupId: undefined,
        groupName: undefined,
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
    queryForm.value.resetFields();
    handleQuery();
  }

  // 处理新增按钮
  const handleAdd = function(){
    reset();
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        open.value = true;
        title.value = "添加组";
        Object.assign(pluginInstance,res?.data)
      }
    });
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset();
    queryGroupParams.groupName = row.gitlabGroupName
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)
      }
    });
    queryParams.groupName = row.groupName
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

    if (form.groupId != undefined) {
      updateGroup(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '修改成功',
                  type: 'success',
            });
          }
        });
      } else {
        addGroup(form).then(response => {
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

      open.value = false;
      getList();
  }

  const handleStatusChange = (row)=>{
    const groupId = row.id || ids.value;
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
        console.log(row)
        changeGroupStatus(groupId,tmpStatus).then((res)=>{
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


  // 触发查询
  getList();
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)
      }
    });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <el-form class="form-wrap" :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="组名称" prop="groupName">
            <el-input
              v-model="queryParams.groupName"
              placeholder="请输入组名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col> 
        <el-col :span="8">
          <el-form-item label="权限" prop="visibility">
            <el-select
            class="search-select"
              v-model="queryParams.visibility"
              @keyup.enter.native="handleQuery"
              placeholder="请选择权限"
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
      <el-row :gutter="20">
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
        <el-col :span="8">
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
        @click="handleAdd" v-hasPerms="['/gitlab/group/add']" ><el-icon><Plus /></el-icon>新增</el-button>
    </div>

    <!--table  -->
    <div class="table-wrap">
      <el-table v-loading="loading" :data="groupPageList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column label="组编号" align="center" key="id" prop="id"/>
          <el-table-column label="组名称" align="center" key="gitlabGroupName" prop="gitlabGroupName"  :show-overflow-tooltip="true"  width="100" />
          <el-table-column label="备注" align="center" key="remark" prop="remark" :show-overflow-tooltip="true"  width="100" />
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
                v-hasPerms="['/gitlab/group/add']"
              >修改</el-button>
              <el-button
                size="default"
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="组编号" prop="groupId" :readonly="true">
              <el-input v-model="form.groupId" placeholder="组编号" maxlength="30" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组名称" prop="groupName">
              <el-input v-model="form.groupName" placeholder="请输入组名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限" prop="visibility">
            <el-select
              v-model="form.visibility"
              @keyup.enter.native="handleQuery"
              placeholder="请选择权限"
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
          <el-col :span="12">
            <el-form-item label="路径" prop="path">
              <el-input v-model="form.path" placeholder="请输路径" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
                class="search-select2" 
                v-model="form.instanceCode"
                @keyup.enter.native="handleQuery"
                placeholder="请选择插件实例"
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
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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

.search-select .el-input {
  --el-input-width: 240px;
}
</style>
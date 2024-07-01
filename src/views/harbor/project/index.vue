<script setup lang="ts">
  // @ts-nocheck
  import {nextTick,ref, getCurrentInstance} from 'vue';
  import { showStatusOperateFun , status , showStatusFun , addDateRange,getStatusIcon } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit, List, CopyDocument, Unlock, Lock } from '@element-plus/icons-vue'
  import { handleTree } from "@/utils/common"
  import { changeStatus, pageList, queryNodeList, addProject, projectNameIsExist,
    units, pullCommand, pushCommand, showIsPublicFun, changeAccessLevel, showAccessLevelOperateFun, isPublic, removeProject} from "@/api/harbor/project"

  const queryFormRef = ref(null);
  const refreshTable = ref(true);
  const defaultInstanceCode = ref(null)


  // 复制push命令
  const copyPushCommand = async (row) => {
    await navigator.clipboard.writeText(pushCommand(row.projectName));
      ElMessage({
          type: 'success',
          message: '操作成功',
      })
  }

  // 复制pull命令
  const copyPullCommand = async (row) => {
      try {

          for(const value of menuListRef._rawValue){
                if(value.id == row.parentId){
                  await navigator.clipboard.writeText(pullCommand(value.name,row.digest));
                  ElMessage({
                      type: 'success',
                      message: '操作成功',
                  })
                  return;
                }
          }

      } catch (err) {
        ElMessage({
            type: 'error',
            message: '操作失败'+err,
        })
      }
  };


  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    instanceCode:undefined,
    projectName: undefined
  })

  const validProjectName = (rule:any,value:any, callback:any)=>{
    projectNameIsExist(value,form.instanceCode).then((res)=>{
        if(res.code == 200){
          if(!res.data){
            callback()
          }else{
            callback(new Error('项目名称已存在，请确认后修改'));
          }
        }
    })
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
      'instanceCode' : [
        { required: true, message: "实例编码不能为空", trigger: "blur" },
      ],
      'projectName': [
        { required: true, message: "项目名称不能为空", trigger: "blur" },
        { min: 2, max: 20, message: '项目名称长度必须介于 2 和 20 之间', trigger: 'blur' },
        { validator: validProjectName , trigger: 'blur' }
      ],
      'capacity': [
        { required: true, message: "容量不能为空", trigger: "blur" }
      ]
  })

  type MenuItem = {
    parentId:number,
    id:number,
    name:string,
    createTime:string,
    digest:string,
    tag:string,
    size:string,
    pushTime:string,
    pullTime:string,
    children: Array<MenuItem>
  };

  // 存储数据的引用
  const menuListRef = ref<MenuItem[]>([] as MenuItem[]);

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])


  const total= ref(0)
  const projectList = reactive([])

  // 详情
  const detail = ref(false);
  // 新增表单
  const addDialog = ref(false);
  const formRef = ref<FormInstance>();

  const title = ref(null)
  const pluginInstance = reactive([]);
  const pluginCode = "harbor"

  const formInstance = reactive([]);

  const form = reactive({
    instanceCode:undefined,
    projectName:undefined,
    capacity:-1,
    isPublic:undefined
  })

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

    queryParams.projectName = undefined
    dateRange.value = [];
    queryFormRef.value.resetFields();
    queryParams.instanceCode = defaultInstanceCode.value;
    handleQuery();
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
              getList()
              ElMessage({
                type: 'error',
                message: '删除失败',
              })
          }
      })
    })
  }

  // 多选框选中数据
  const handleSelectionChange = function(selection){

  }

  // 修改访问级别
  const handleChangeAccessLevel = (row)=>{
    const projectName = row.projectName
    const isPublic = row.isPublic
    const accessLevel = showAccessLevelOperateFun(row.isPublic)
    let msg = ""
    msg = '是否修改项目【"' + projectName + '"】的访问级别为'+ accessLevel +'？'

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      changeAccessLevel(isPublic,row.instanceCode).then((res)=>{
          if(res.code == 200){
              ElMessage({
                type: 'success',
                message: '修改成功',
              })
          }else{
              ElMessage({
                type: 'error',
                message: '修改失败',
              })
          }
          getList()
      })
    })
  }

  const handleStatusChange = (row)=>{
    const projectId = row.id
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否禁用编号为"' + row.projectName + '"的数据项？'
    }else{
      msg = '是否启用编号为"' + row.projectName + '"的数据项？'
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
        changeStatus(projectId,tmpStatus).then((res)=>{
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

  // 重置表单
  const reset = ()=> {
    Object.assign(form,{
      instanceCode:queryParams.instanceCode,
      projectName:undefined,
      capacity:undefined,
      isPublic:1,
      unit:units[0]
    })
  }

  // 表单提交处理
  const submitForm = async ()=>{
    loading.value = true;
    //todo 这里校验全部失败，需要改
    await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage.error('表单验证失败');
            loading.value = false;
            throw err;
        });

    form.capacity = form.capacity * form.unit.value;
    addProject(form).then(response => {
      if(response?.code == 200){
        ElMessage({
              showClose: true,
              message: '新增成功',
              type: 'success',
        });
      }else{
        ElMessage.error('新增出现异常');
        loading.value = false;
        throw response?.msg;
      }
      addDialog.value = false;
      getList();
    });

  }

  // 处理新增按钮
  const handleAdd = function(){
    reset()
    // 查询实例编码下拉列表
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(formInstance,res?.data)
        let instanceCode = queryParams.instanceCode;
        if(instanceCode == undefined){
          instanceCode = formInstance[0].instanceCode;
        }
        form.instanceCode = instanceCode

      }
    });

    addDialog.value = true
    title.value = "添加harbor配置信息"
  }

  const getAccessLevel = (row)=>{
    if(row.isPublic == 1){
      return "Lock"
    }

    return "Unlock"
  }
  // 表单取消处理
  const cancelDetail = ()=>{
    detail.value = false;
    reset();
  }
  // 表单取消处理
  const cancelAdd = ()=>{
    addDialog.value = false;
    reset();
  }

  const  queryDetail = async (row)=> {
    loading.value = true;
    refreshTable.value = false;
    nextTick(() => {
        refreshTable.value = true;
    });
    const menuResult = await queryNodeList(row.projectName,queryParams.instanceCode);
    if(menuResult.code == 200){
        // 把菜单打平,渲染成一颗树
        menuListRef.value = handleTree(menuResult.data,"id");
    } else {
        ElMessage.error("获取菜单信息失败");
    }

    detail.value = true
    title.value = "项目详情"
    loading.value = false;
  }



  // 进入页面时,就初始化实例列表
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
    if(res.code == 200){
      Object.assign(pluginInstance,res?.data)
      queryParams.instanceCode = pluginInstance[0].instanceCode
      defaultInstanceCode.value = pluginInstance[0].instanceCode
      // 触发查询
      getList();
    }
  });

  // 按钮
  const btnList = ref([
    {
      btnName: '详情',
      permArray: ['/harbor/project/queryNodeList/**'],
      isShow: () => true,
      isDisable: false,
      clickEvent: queryDetail
    },
    {
      btnName: row => showStatusOperateFun(row.status),
      permArray: ['/harbor/project/changeStatus/**'],
      isShow: () => true,
      isDisable: false,
      clickEvent: handleStatusChange
    },
    {
      btnName: row => showAccessLevelOperateFun(row.isPublic),
      permArray: ['/harbor/project/changeAccessLevel/**'],
      isShow: () => true,
      isDisable: false,
      clickEvent: handleChangeAccessLevel
    },
    {
      btnName: '复制',
      isShow: () => true,
      isDisable: false,
      clickEvent: copyPushCommand
    },
    {
      btnName: '删除',
      class: 'yt-color-error-hover',
      permArray: ['/harbor/project/del/**'],
      isShow: () => true,
      isDisable: false,
      clickEvent: handleDelete
    },
  ])

</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form class="form-wrap"  :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" >
        <el-row :gutter="16">
          <el-col :span="8">
              <el-form-item label="插件实例" prop="instanceCode">
                <el-select
                  class="search-select"
                  v-model="queryParams.instanceCode"
                  @keyup.enter.native="handleQuery"
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
          <el-col :span="8">
            <el-form-item label="项目名" prop="queryParams.projectName">
              <el-input v-model="queryParams.projectName" placeholder="请输入项目名" />
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
          @click="handleAdd" v-hasPerms="['/harbor/project/add']" ><el-icon><Plus /></el-icon>新增</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="项目编号" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="项目名称" align="left" key="projectName" prop="projectName"  :show-overflow-tooltip="true"  />
          <el-table-column label="访问级别" align="center" key="isPublic" prop="isPublic" :show-overflow-tooltip="true"   >
            <template #default="scope">
              {{  showIsPublicFun(scope.row.isPublic) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" key="status" >
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="left" prop="createTime"  width="200">
            <template #default="scope">
              {{
                   scope.row.createTime ? dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") : ''
              }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" align="left" prop="updateTime" width="200" >
            <template #default="scope">
              {{ scope.row.updateTime ? dayjs(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss") : ''  }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="250"
            flixed="right"
          >
            <template #default="scope">
              <div class="action-btn">
                <yt-btn-menu-list :btn-list="btnList" :row-data="scope.row"></yt-btn-menu-list>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-wrap">
        <yt-page :total="total" v-model="queryParams" @change="getList"></yt-page>
      </div>
    </yt-card>

    <!-- 新增对话框 -->
    <el-dialog :title="title" v-model="addDialog" width="var(--dialog-md-w)"  append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row :gutter="16">
            <el-col>
              <el-form-item label="插件实例" prop="instanceCode">
                <el-select
                  class="search-select"
                  v-model="form.instanceCode"
                  placeholder="请选择插件实例"
                  @change="switchInstance"
                  style="width: 240px"
                >
                  <el-option v-for="item in formInstance"
                             :key="item.pluginCode"
                             :label="item.instanceName"
                             :value="item.instanceCode"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>


          <el-row :gutter="16">
            <el-col>
              <el-form-item label="项目名称" prop="projectName">
                <el-input v-model="form.projectName" placeholder="请输入项目名称" maxlength="20" style="width: 240px"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col>
              <el-form-item label="存储容量" prop="capacity">
                <el-input v-model="form.capacity" placeholder="请输入容量" style="width: 240px" maxlength="5">
                    <template #append>
                        <el-select
                          class="search-select"
                          v-model="form.unit"
                          placeholder="单位"
                          style="width: 70px"
                        >
                            <el-option v-for="item in units"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"/>
                        </el-select>
                    </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col>
              <el-form-item label="访问级别" prop="isPublic">
                <el-radio-group v-model="form.isPublic">
                  <el-radio
                      v-for="item in isPublic"
                      :key="item.value"
                      :label="item.value"
                  >{{item.label}}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

        </el-form>
      </yt-card>
      <template #footer>
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="submitForm()">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog :title="title" v-model="detail" width="800px" append-to-body>
       <!-- 表格 -->
       <el-table
        :data="menuListRef"
        row-key="id"
        v-if="refreshTable"
        v-loading="loading"
        :default-expand-all="isExpandAll"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" width="60" :show-overflow-tooltip="true"/>
        <el-table-column prop="digest" label="镜像编码" width="100" :show-overflow-tooltip="true">
          <template #default="scope">
              {{  scope.row.digest ? scope.row.digest : ''  }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="镜像大小" width="100" :show-overflow-tooltip="true"/>
        <el-table-column prop="pushTime" label="推送时间" :show-overflow-tooltip="true">
          <template #default="scope">
              {{  scope.row.pushTime ? dayjs(scope.row.pushTime).format("YYYY-MM-DD HH:mm:ss") : ''  }}
          </template>
        </el-table-column>
        <el-table-column prop="pullTime" label="拉取时间" :show-overflow-tooltip="true">
          <template #default="scope">
              {{  scope.row.pullTime && dayjs(scope.row.createTime).isValid(dayjs('0001-01-01')) ? dayjs(scope.row.pullTime).format("YYYY-MM-DD HH:mm:ss") : ''  }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" :show-overflow-tooltip="true">
          <template #default="scope">
              {{  scope.row.createTime ? dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") : ''   }}
          </template>
        </el-table-column>
        <el-table-column prop="option" label="操作" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-button type="primary" icon="CopyDocument" size="small" v-if="scope.row.digest" @click="copyPullCommand(scope.row)">复制pull</el-button>
          </template>
        </el-table-column>
        <!-- 其他列 -->
      </el-table>
      <template #footer>
        <el-button @click="cancelDetail">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>

</style>

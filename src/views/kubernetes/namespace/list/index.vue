<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import { pageList,nameSpaceList,removeNameSpace,changeStatus,addNameSpace,nameIsExist} from "@/api/kubernetes/namespace"

  const queryFormRef = ref(null);

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    instanceCode:undefined,
    nameSpaceId:undefined,
    kind:"NameSpace"
  })

  const formDefault = reactive({
      name: undefined,
      instanceCode: undefined,
      remark: undefined
  });

  const form = reactive(formDefault)

  const defaultInstanceCode = ref('')

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])
  const nameSpaces = reactive([])
  const nameSpaceMap =new Map()


  const total= ref(0)
  const tabelDataList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();

  const title = ref(null)
  const pluginInstance = reactive([]);
  const pluginCode = "k8s"

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    pageList(addDateRange(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            tabelDataList.splice(0,tabelDataList.length);
            Object.assign(tabelDataList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            tabelDataList.splice(0,tabelDataList.length);
            total.value = 0;
          }
        }
    );
  }

  const handleAdd = (row)=>{
    title.value = "添加命名空间"
    form.instanceCode = pluginInstance[0].instanceCode
    open.value = true;
  }

  // 表单取消处理
  const cancel = ()=>{
    loading.value = false;
    open.value = false;
    reset();
  }

  // 表单提交处理
  const submitForm = async (isBuild)=>{
    loading.value = true;
    await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage.error('表单验证失败');
            loading.value = false;
            throw err;
        });

    addNameSpace(form).then(response => {
      if(response?.code == 200){
        ElMessage({
              showClose: true,
              message: '新增成功',
              type: 'success',
        });
        build(form,isBuild)
        loading.value = false;
      }else{
        ElMessage.error('新增出现异常');
        loading.value = false;
        throw response?.msg;
      }
      open.value = false;
      getList();
    });

  }

  const handleDelete = function(row){
    const name = row.name
    let msg = ""
    msg = '是否删除命名空间【"' + name + '"】的数据项？'

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      removeNameSpace(row.id).then((res)=>{
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
                type: 'error',
                message: '删除失败:'+res.msg,
              })
          }
      })
    })
  }

  const handleStatusChange = (row)=>{
    const name = row.name
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否停用名称为"' + name + '"的数据项？'
    }else{
      msg = '是否启用名称为"' + name + '"的数据项？'
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
        changeStatus(row.id,tmpStatus).then((res)=>{
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

  // 处理搜索按钮
  const handleQuery = function(){
    getList()
  }

  // 处理重置按钮
  const resetQuery = function(){
    queryParams.instanceCode = defaultInstanceCode.value;
    handleQuery();
  }

  // 多选框选中数据
  const handleSelectionChange = function(selection){

  }

  const validName = (rule:any,value:any, callback:any)=>{
    nameIsExist(form.name,form.instanceCode).then((res) =>{
        if(res.code == 200){
          if(res.data){
            callback(new Error('名称已存在，请确认后修改'));
          }else{
            callback()
          }
        }
    })
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
      'name' : [
        { required: true, message: "名称不能为空", trigger: "blur" },
        { pattern: /^[-_a-z0-9]*$/, message: '名称只可以输入小写字母、数字及中划线', trigger: 'blur' },
        { validator: validName , trigger: 'blur' }
      ]
  })

  // 按钮
  const btnList = ref([
    {
      btnName: row => showStatusOperateFun(row.status),
      permArray: ['/kubernetes/nameSpace/changeStatus/**'],
      isShow: () => true,
      isDisable: false,
      clickEvent: handleStatusChange
    },
    {
      btnName: '删除',
      permArray: ['/kubernetes/nameSpace/del/*'],
      isShow: () => true,
      isDisable: false,
      clickEvent: handleDelete
    }
  ])

  // 进入页面时,就初始化实例列表
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
    if(res.code == 200){
      Object.assign(pluginInstance,res?.data)
      if(Object.keys(res?.data).length != 0){
        queryParams.instanceCode = pluginInstance[0].instanceCode
        defaultInstanceCode.value = pluginInstance[0].instanceCode
      }

      nameSpaceList(defaultInstanceCode.value).then((res) =>{
        if(res.code == 200){
          Object.assign(nameSpaces,res?.data)
          nameSpaces.forEach(function(nameSpace){
            nameSpaceMap.set(Number(nameSpace.value),nameSpace.label)
          })
        }
      })

      // 触发查询
      getList();
    }
  });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" >
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
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
            <el-form-item label="命名空间" prop="nameSpace">
              <el-select
                class="search-select2"
                v-model="queryParams.nameSpaceId"
                placeholder="请选择命名空间"
                clearable
              >
                <el-option v-for="namespace in nameSpaces"
                      :key="namespace.value"
                      :label="namespace.label"
                      :value="namespace.value"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select
                class="search-select"
                v-model="queryParams.status"
                placeholder="任务状态"
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
              <el-button @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </yt-card>
    <yt-card>
        <div class="option-wrap">
            <el-button
              type="primary"
              plain
              size="default"
              @click="handleAdd" v-hasPerms="['/kubernetes/nameSpace/add']" ><el-icon><Plus /></el-icon>新增</el-button>
        </div>
      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="tabelDataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="id" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="应用名称" align="left" key="name" prop="name"  :show-overflow-tooltip="true" />
          <el-table-column label="实例编码" align="left" key="instanceCode" prop="instanceCode" :show-overflow-tooltip="true"   />
          <el-table-column label="状态" align="left" key="status" prop="status" :show-overflow-tooltip="true" width="100"  >
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="left" prop="opTime"  width="200">
            <template #default="scope">
              {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" key="operation" prop="operation" :show-overflow-tooltip="true" width="220">
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

    <el-dialog :title="title" v-model="open" width="var(--dialog-md-w)"  append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row :gutter="16">
              <el-form-item label="插件实例" prop="instanceCode">
                <el-select
                  v-model="form.instanceCode"
                  @keyup.enter.native="handleQuery"
                  placeholder="请选择实例"
                  style="width: 240px"
                >
                  <el-option v-for="item in pluginInstance"
                              :key="item.pluginCode"
                              :label="item.instanceName"
                              :value="item.instanceCode"/>
                </el-select>
              </el-form-item>
          </el-row>
          <el-row :gutter="16">
            <el-form-item label="名称" prop="name">
              <el-input style="width: 240px" v-model="form.name" placeholder="请输入名称" clearable />
            </el-form-item>
          </el-row>
          <el-row :gutter="16">
            <el-form-item label="备注" prop="remark">
              <el-input style="width: 240px" type="textarea" v-model="form.remark" placeholder="请输入备注" clearable />
            </el-form-item>
          </el-row>
        </el-form>
      </yt-card>

      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm(form)">确 定</el-button>
      </template>

    </el-dialog>

  </div>
</template>

<style lang="scss" scoped>

</style>

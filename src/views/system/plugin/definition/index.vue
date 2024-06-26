<script setup lang="ts">
  // @ts-nocheck
  import { Plus ,Delete, Edit, EditPen, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
  import { parseTime , status ,addDateRange , showStatusFun , showStatusOperateFun, getStatusIcon  } from "@/utils/common"
  import { list , get , update , add , changeStatus, removePluginDefinition } from "@/api/pluginDefinition"
  import { checkPluginCode} from "@/api/pluginInstance"

  // 查询的表单引用
  const queryFormRef = ref({});
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    pluginCode: undefined,
    pluginName: undefined,
    status : undefined
  })

  // 加载中
  const loading = ref(false)
  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const daterangeArray = ref('')

  // 选中数组
  const ids = ref([])
  // 非单个禁用
  const single = ref(true)
  // 非多个禁用
  const multiple = ref(true)

  const total= ref(0)
  const dataList = reactive([])

  // 表单
  const isReadyOnly = ref(false);
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({
        id: undefined,
        pluginCode: undefined,
        pluginName: undefined,
        pluginMeta: undefined,
        status: 1
      })
  const title = ref("")

  // 表单规则
  const rules = reactive<FormRules>({
        pluginCode: [
          { required: true, message: "插件编码不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '插件编码长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        pluginName: [
          { required: true, message: "插件名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '插件名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ]
    })

  // 重置表单
  const reset = ()=> {
      formRef.value?.clearValidate()
      Object.assign(form,{
        id: undefined,
        pluginCode: undefined,
        pluginName: undefined,
        pluginMeta: undefined,
        status: 1
      })
  }


  // 获取列表
  const getList = ()=>{
    loading.value = true;

    list(addDateRange(queryParams, daterangeArray.value)).then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            dataList.splice(0 , dataList.length);
            Object.assign(dataList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            dataList.splice(0 , dataList.length);
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
    daterangeArray.value = ""
    queryFormRef.value.resetFields()
    handleQuery();
  }

  // 处理新增按钮
  const handleAdd = function(){
    reset();
    isReadyOnly.value = false;
    open.value = true;
    title.value = "添加插件";
  }

  // 处理更新按钮(仅仅只是把数据拿出来展示一下)
  const handleUpdate = function(row){
    reset();
    isReadyOnly.value = true;
    const id = row.id || ids.value
    get(id).then(response => {
      if(response?.code == 200){
        Object.assign(form,response?.data)
        open.value = true;
        title.value = "修改插件";
      }
    });
  }

  const handleDelete = function(row){
    const pluginName = row.pluginName
    let msg = ""
    msg = '是否删除插件管理【"' + pluginName + '"】的数据项？'

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      checkPluginCode(row.pluginCode).then((res)=>{
        if(res.code == 200){
          if(res?.data?.length > 0){
            ElMessage({
                type: 'error',
                message: '存在【 '+res.data.length+' 】处引用，不能删除',
            })
          }else{
            removePluginDefinition(row.id).then((res)=>{
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
          }
        }
      })
      
    })
  }

  const handleChangeStatus = function(row){
    const tmpId = row.id || ids.value;
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否禁用编号为"' + tmpId + '"的数据项？'
    }else{
      msg = '是否启用编号为"' + tmpId + '"的数据项？'
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
        changeStatus(tmpId,tmpStatus).then((res)=>{
            if(res.code == 200){
                getList()
                ElMessage({
                  type: 'success',
                  message: '操作成功',
                })
            }
        })
    }).catch(() => { })

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
        update(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '修改成功',
                  type: 'success',
            });
            open.value = false;
            getList();
          } else {
            ElMessage.error(response?.msg)
          }
        });
      } else {
        add(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '新增成功',
                  type: 'success',
            });
            open.value = false;
            getList();
          } else {
            ElMessage.error(response?.msg);
          }
        });
      }
  }

  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
    reset();
  }

  // 触发查询
  getList()
</script>

<template>
  <div class="main-wrapp">
    <yt-card  padding="18px 18px 0">
      <!--sousuo  -->
      <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
        <el-row>
            <el-form-item label="插件编码" prop="pluginCode">
              <el-input
                v-model="queryParams.pluginCode"
                placeholder="请输入插件编码"
                clearable
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item label="插件名称" prop="pluginName">
              <el-input
                v-model="queryParams.pluginName"
                placeholder="请输入插件名称"
                clearable
                style="width: 240px"
              />
            </el-form-item>
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
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="daterangeArray"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
                style="width: 240px"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
            </el-form-item>
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
          @click="handleAdd" v-hasPerms="['/system/plugin/definition/add']" ><el-icon><Plus /></el-icon>新增</el-button>


        <el-button
          type="success"
          plain
          size="default"
          :disabled="single"
          @click="handleUpdate" v-hasPerms="['/system/plugin/definition/edit']" ><el-icon><EditPen /></el-icon>修改</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="插件编码" align="left" key="pluginCode" prop="pluginCode"/>
          <el-table-column label="插件名称" align="left" key="pluginName" prop="pluginName"  :show-overflow-tooltip="true"/>
          <el-table-column label="插件元数据" align="left" key="pluginMeta" prop="pluginMeta"  :show-overflow-tooltip="true"/>
          <el-table-column label="状态" align="center" key="status">
            <template v-slot="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="left" prop="createdTime" width="200">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createdTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="left"
            width="250"
          >
            <template v-slot="scope">
              <div class="action-btn">
                <el-button
                  size="small"
                  icon="Edit"
                  @click="handleUpdate(scope.row)"
                  v-hasPerms="['/system/plugin/definition/edit']"
                >修改</el-button>
                
                <el-button
                size="small"
                :icon="getStatusIcon(scope.row)"
                @click="handleChangeStatus(scope.row)"
                v-hasPerms="['/system/plugin/definition/changeStatus/**']"
                >
                {{ showStatusOperateFun(scope.row.status)  }}
              </el-button>
              <el-button
                size="small"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPerms="['/system/plugin/definition/del/*']"
              >删除</el-button>

              </div>
            </template>
          </el-table-column>
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
            <el-col :span="24">
              <el-form-item label="插件编码" prop="pluginCode">
                <el-input v-model="form.pluginCode" placeholder="请输入插件编码" maxlength="30" :disabled="isReadyOnly"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="插件名称" prop="pluginName">
                <el-input v-model="form.pluginName" placeholder="请输入插件名称" maxlength="30" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="插件元数据" prop="pluginMeta" label-width="100px">
                <el-input v-model="form.pluginMeta" placeholder="请输入插件元数据" type="textarea" maxlength="50000" autosize/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
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

</style>

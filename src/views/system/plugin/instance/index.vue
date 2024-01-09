<script setup lang="ts">
  // @ts-nocheck
  import { Plus ,Delete, Edit, EditPen, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
  import { parseTime , status ,addDateRange , showStatusFun , showStatusOperateFun  } from "@/utils/common"
  import { getPluginMeta } from '@/api/pluginDefinition';
  import { pluginOptionSelect } from "@/api/common-api"
  import { list , get , update , add , changeStatus } from "@/api/pluginInstance"


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

  // 插件列表
  const queryPlugins = ref();

  // 查询的表单引用
  const queryFormRef = ref({});
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    pluginCode : undefined, // []
    instanceName : undefined,
    status : undefined
  })

  const handlePlugin = (pluginCode:string)=>{
    if(pluginCode == ""){
      delete queryParams.pluginCode
    }
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

  // 多选框选中数据
  const handleSelectionChange = function(selection){
    ids.value = selection.map(item => item.instanceId);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
  }

  // ==================================================================================================================
  // 表单处理
  // ==================================================================================================================
  // 表单插件列表
  const formPlugins = ref();

  const isReadyOnly = ref(false);
  const open = ref(false)
  const pluginForm = ref()
  const title = ref("")
  const formRef = ref<FormInstance>();
  const form = reactive({
        instanceId: undefined,
        pluginCode: undefined,
        instanceCode: undefined,
        instanceName: undefined,
        items: [ ],
        content : undefined,    // 动态内容
        remarks: undefined,
        status: 1,
  })

  // 表单验证规则
  const rules = reactive<FormRules>({
        pluginCode: [
          { required: true, message: "插件是必选项", trigger: "blur" }
        ],
        instanceCode :[
          { required: true, message: "实例编码不能为空", trigger: "blur" },
        ],
        instanceName: [
          { required: true, message: "实例名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '实例名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ]
    })

  // 重置表单
  const reset = ()=> {
      Object.assign(form,{
        instanceId: undefined,
        pluginCode: undefined,
        instanceCode: undefined,
        instanceName: undefined,
        items: [],
        content : undefined,    // 动态内容
        remarks: undefined,
        status: 1,
      })
      pluginForm.value = "";
  }


  // 处理新增按钮
  const handleAdd = function(){
    reset()
    formInit()
    isReadyOnly.value=false;
    open.value = true;
    title.value = "添加插件实例";
  }

  // 处理更新按钮(仅仅只是把数据拿出来展示一下)
  const handleUpdate = function(row){
    reset();
    formInit();
    isReadyOnly.value=true;
    const id = row.instanceId || ids.value
    get(id).then(response => {
      if(response?.code == 200){
        Object.assign(form , response?.data?.instance)

        // 插件元数据在页面上展示
        try{
          const metaString = response?.data?.pluginMeta
          const metaArray = JSON.parse(metaString);
          form.items = []
          form.items = form.items.concat(metaArray)
        } catch(error) {
          console.log("解析元数据出错")
          throw error;
        }

        // 根据插件元数据,渲染成表单后,保存的内容
        try{
          const contentString = response?.data?.instance?.content;
          if(contentString != undefined){
            const resultForm = JSON.parse(contentString);

            // 遍历赋值
            form.items.forEach((item)=>{
              const key = item.key;
              if(resultForm[key]){
                item.name = resultForm[key];
              }
            });
          }
        }catch(error){
          console.log("解析元数据内容出错")
          throw error;
        }

        // 根据pluginCode获取元数据.
        // 把元数据填充到:form.items
        // 把form.items数组里的name填上,用户填写的值.
        open.value = true;
        title.value = "修改插件实例";
      }
    });
  }

  const handleDelete = function(row){
    const tmpId = row.instanceId || ids.value;
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

  const handleFormPlugin = (pluginCode:String)=>{
    if(pluginCode != ""){
      getPluginMeta(pluginCode).then((res)=>{
        if(res?.code == 200 && res?.data?.pluginMeta){
          try {
            const pluginMetaArray:[] = JSON.parse(res?.data?.pluginMeta);
            // 先清空
            form.items =[]
            // 再重新进生赋值
            form.items = form.items.concat(pluginMetaArray)
          } catch (error) {
            console.log("处理异常", error)
            throw error;
          }
        }
      });
    }else{
      form.items = []
    }
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

    // content
    const dynamicFormBody = {}
    // 把items打平,然后,配置到
    form.items.forEach((obj)=>{
      dynamicFormBody[obj.key] = obj.name;
    })
    form.content = JSON.stringify(dynamicFormBody)
    // 可删,可不删来着
    // delete form.items;

    if (form.instanceId != undefined) {
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

  const formInit = ()=>{
      // 获取插件列表
      pluginOptionSelect().then((res)=>{
        if(res?.code == 200){
          formPlugins.value = res?.data;
        }
      })
  }

  // ==========================================================================
  // 初始化钩子
  // ==========================================================================
  // 触发查询
  getList()

  // 获取插件列表
  pluginOptionSelect().then((res)=>{
    if(res?.code == 200){
      queryPlugins.value = res?.data;
    }
  })
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="请选择插件" prop="pluginCode">
              <el-select
                class="search-select"
                v-model="queryParams.pluginCode"
                @change="handlePlugin"
                @keyup.enter.native="handleQuery"
                placeholder="请选择插件"
                clearable
                style="width: 240px"
              >
                <el-option v-for="item in queryPlugins"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="插件名称" prop="instanceName">
              <el-input v-model='queryParams.instanceName' placeholder='请输入插件实例名称' clearable style='width: 240px' @keyup.enter.native='handleQuery' />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select
                class="search-select"
                v-model="queryParams.status"
                placeholder="状态"
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
                v-model="daterangeArray"
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
    </yt-card>

    <yt-card>
      <!--  option-->
      <div class="option-wrap">
        <el-button
          type="primary"
          plain
          size="default"
          @click="handleAdd" v-hasPerms="['/system/plugin/instance/add']" ><el-icon><Plus /></el-icon>新增</el-button>


        <el-button
          type="success"
          plain
          size="default"
          :disabled="single"
          @click="handleUpdate" v-hasPerms="['/system/plugin/instance/edit']" ><el-icon><EditPen /></el-icon>修改</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="插件编码" align="center" key="pluginCode" prop="pluginCode"/>
          <el-table-column label="实例编码" align="center" key="instanceCode" prop="instanceCode"/>
          <el-table-column label="实例名称" align="center" key="instanceName" prop="instanceName"  :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center" key="status"  width="100">
            <template v-slot="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createdTime">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createdTime) }}</span>
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
                  v-hasPerms="['/system/plugin/instance/edit']"
                >修改</el-button>

                <el-button
                  size="default"
                  @click="handleDelete(scope.row)"
                  v-hasPerms="['/system/plugin/instance/changeStatus/**']"
                >
                  {{ showStatusOperateFun(scope.row.status)  }}
                </el-button>

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

    </yt-card>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="插件" prop="pluginCode">
                <el-select
                  class="search-select"
                  v-model="form.pluginCode"
                  @change="handleFormPlugin"
                  @keyup.enter.native="handleQuery"
                  placeholder="插件"
                  style="width: 240px"
                >
                  <el-option v-for="item in formPlugins"
                             :disabled="isReadyOnly"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="实例编码" prop="instanceCode">
                <el-input v-model="form.instanceCode" placeholder="请输入实例编码" maxlength="30" :disabled="isReadyOnly"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="实例名称" prop="instanceName">
                <el-input v-model="form.instanceName" placeholder="请输入实例名称" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-for="(item,index) in form.items">
            <el-col :span="24">
              <el-form-item
                label-width="150px"
                :label="item.label"
                :prop="`items.${index}.name`"
                :rules="item.rules">
                <el-input :type="item.type" v-model="item.name" :key="item.key" :placeholder="item.placeholder"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="备注" prop="remarks">
                <el-input v-model="form.remarks" type="textarea" placeholder="请输入备注" maxlength="30" />
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

.search-select .el-input {
  --el-input-width: 240px;
}
</style>

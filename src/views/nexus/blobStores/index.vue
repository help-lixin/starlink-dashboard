<script setup lang="ts">
// @ts-nocheck  
import { Plus,Search,RefreshRight } from '@element-plus/icons-vue'
import { queryInstanceInfoByPluginCode } from "@/api/common-api"
import { dayjs } from "@/utils/common-dayjs"
import { getBlobStoresList, createFileBlobStores, getFileBlobStoresInfoByName, deleteBlobStoresByName,  unitConversion ,mBToGB , byteToMB } from "@/api/nexus/blobStores"
import { showBlobStoresState ,addDateRange} from "@/utils/common"

//插件Code
const pluginCode = "nexus";
//实例信息列表
const pluginInstance = ref([]);

//查询列表信息
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  instanceCode: undefined,
  name: undefined,
  type: undefined
});

//弹窗开关
const open = ref(false);
//页面遮罩开关
const loading = ref(false);
//页面标题
const title = ref("");
//存储仓库集合
const blobStoresList = ref([]);

// 表单信息校验
//如果 quotaShow = true 需要对softQuotaLimit、softQuotaType进行非空校验，否则不做校验
const rules = reactive<FormRules>({
  instanceCode: [
    { required: true, message: "插件实例是必填项", trigger: "blur" }
  ],
  type: [
    { required: true, message: "存储类型不能为空", trigger: "blur" }
  ],
  name: [
    { required: true, message: "存储仓库名称不能为空", trigger: "blur" }
  ],
  path: [
    { required: true, message: "路径不能为空", trigger: "blur" }
  ],
  softQuotaLimit: [
    { required: true, message: "警戒值不能为空", trigger: "blur" }
  ],
  softQuotaType: [
    { required: true, message: "预警类型不能为空", trigger: "blur" }
  ]
});

const queryFormRef = ref(null);
//存储库类型
const blobStoresTypes = ref(["File"]);
//File类型存储库的限制类型
const constraintType = ref([
  { value: "spaceRemainingQuota", label: "Space Remaining" },
  { value: "spaceUsedQuota", label: "Space Used" }
]);

const formRef = ref<FormInstance>();
const form = ref({
  nexusId:undefined,
  instanceCode: undefined,
  type: undefined,
  name: undefined,
  path: undefined,
  softQuota: {
    limit: undefined,
    type: undefined,
    enabled: undefined
  }
});
//分页信息
const total = ref(0);
//是否显示file类型的表单
const fileIsShow = ref(false);
//是否显示s3类型的表单
const s3IsShow = ref(false);
//是否显示限制表单
const quotaShow = ref(false);
//删除按钮显示开关
const delButtonShow = ref(false);
//新增按钮显示开关
const newButtonShow = ref(true);
//更新按钮显示开关
const updateButtonShow = ref(false);
//表单中name输入框是否可用
const nameDisabled = ref(true);
// 显示搜索条件
const showSearch = ref(true);
  // 日期范围
const dateRange = ref([]);

// 重置表单
const reset = () => {
  form.value={
    type: undefined,
    name: undefined,
    path: undefined,
    softQuota: {
      limit: undefined,
      type: undefined,
      enabled: false
    }
  }
};

const resetQueryParams = () => {
  queryParams.value={
    pageNum: 1,
    pageSize: 10,
    instanceCode: undefined,
    name: undefined,
    type: undefined
  }
};



// 表单提交处理
const submitForm = async () => {
  loading.value = true;
  await formRef.value?.validate()
    .catch((err: Error) => {
      ElMessage.error('表单验证失败');
      loading.value = false;
      throw err;
    });
  createFileBlobStores(form.value)
  .then(response => {
    if (response?.code == 200) {
      ElMessage({
        showClose: true,
        message: '创建成功',
        type: 'success',
      });
      open.value = false;
      
      getList();
    } else {
      ElMessage.error('创建失败');
    }
  });
};

//更新操作
const updateInfo = async () => {
  loading.value = true;
  await formRef.value?.validate()
    .catch((err: Error) => {
      ElMessage.error('表单验证失败');
      loading.value = false;
      throw err;
    });
  
    createFileBlobStores(form.value) //
    .then(response => {
    if (response?.code == 200) {
      ElMessage({
        showClose: true,
        message: '修改成功',
        type: 'success',
      });
      open.value = false;

      // 重新进行查询
      getList();
    } else {
      ElMessage.error('修改失败');
    }
  });
};

// 表单取消处理
const cancel = () => {
  open.value = false;
  reset();
};

// 处理搜索按钮
const handleQuery = function(){
  getList();
};

// 处理查询按钮
const resetQuery = function(){
  dateRange.value = []
  queryFormRef.value.resetFields()
  getList()
};

//处理新增按钮
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "新增存储库";

  quotaShow.value = false;
  fileIsShow.value = false;
  delButtonShow.value = false;
  updateButtonShow.value = false;
  newButtonShow.value = true;
  nameDisabled.value = false;
};

//修改时,弹出修改界面
const handleUpdate = (row)=>{
  reset();

  const updateQuery = {
    instanceCode: row.instanceCode,
    name : row.name
  }

  getFileBlobStoresInfoByName(updateQuery).then(response => {
    if(response.code == 200){
      open.value = true;

      form.value = response?.data
      form.value.instanceCode = updateQuery.instanceCode;
      
      delButtonShow.value = true;
      newButtonShow.value = false;
      updateButtonShow.value = true;
      if (form.value.type == "File") {
        fileIsShow.value = true
      }
      if (form.value.softQuota.enabled) {
        quotaShow.value = true;
      }
    }else{
      ElMessage({
        showClose: true,
        message: '查询详情失败',
        type: 'fail',
      });
    }
    
  });
}



//删除操作
const handleStatusChange = (row) => {
  const params = {
    name: row.name,
    instanceCode : row.instanceCode
  }
  deleteBlobStoresByName(params).then(response => {
    if (response?.code == 200) {
      ElMessage({
        showClose: true,
        message: '删除成功',
        type: 'success',
      });
      open.value = false;
      getList();
    } else {
      ElMessage({
        showClose: true,
        message: '删除失败',
        type: 'fail',
      });
    }
  });
};

// 获取列表
const getList = () => {
  loading.value = true;
  getBlobStoresList(addDateRange(queryParams.value,dateRange.value))
    .then(response => {
      loading.value = false
      if (response?.data?.records.length > 0) {
        blobStoresList.value = response?.data.records
        total.value = response?.data?.total
      } else {
        blobStoresList.value = []
        total.value = 0;
      }
    });
};


const selectFirstInstanceQuery = ()=>{
  queryFirstInstance()
  .then(()=>{
    getList();
  });
}

//处理两种不同类型的存储仓库的表单显示与隐藏
const handleBlobStoresTypeShow = (type) => {
  if (type == "File") {
    fileIsShow.value = true;
  } else {
    fileIsShow.value = false;

  }
};

//处理警戒类型的显示与隐藏
const handleSoftQuotaShow = (val) => {
  if (val) {
    form.value.softQuota.enabled = true;
    quotaShow.value = true;
 
  } else {
    form.value.softQuota.enabled = false;
    quotaShow.value = false;
  }
};

const queryFirstInstance = ()=>{
  // 挑选一个插件实例,进行查询
  return queryInstanceInfoByPluginCode(pluginCode).then((res) => {
      if (res.code == 200) {
        pluginInstance.value = res?.data
        if(pluginInstance.value.length> 0){
          // 挑出一个实例进行查询
          const firstInstance = pluginInstance.value[0]
          queryParams.value.instanceCode = firstInstance.instanceCode;
        }
      }
    });
}

// 选择一个实例进行查询
selectFirstInstanceQuery();
</script>

<template>
  <div class="main-wrapp">
    <el-form class="form-wrap" :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch"
      label-width="68px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="插件实例" prop="instanceCode">
            <el-select class="search-select" v-model="queryParams.instanceCode" @keyup.enter.native="handleQuery"
              placeholder="请选择实例" clearable style="width: 240px">
              <el-option v-for="item in pluginInstance" :key="item.pluginCode" :label="item.instanceName"
                :value="item.instanceCode" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col> 
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="类型" prop="type">
            <el-input
              v-model="queryParams.type"
              placeholder="请输入类型"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col> 
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
            <el-button type="primary" size="small" @click="handleQuery"><el-icon>
                <Search />
              </el-icon>搜索</el-button>
            <el-button size="small" @click="resetQuery"><el-icon>
                <RefreshRight />
              </el-icon>重置</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <!-- add BlobStore -->
    <div class="option-wrap">
      <el-button type="primary" plain size="default" @click="handleAdd"
      v-hasPerms="['/nexus/blobstores/file/add']"><el-icon>
          <Plus/>
        </el-icon>新增</el-button>
    </div>
    <!--table  -->
    <div class="table-wrap">
      <el-table v-loading="loading" :data="blobStoresList">
        <el-table-column label="名称" align="center" key="name" prop="name" />
        <el-table-column label="类型" align="center" key="type" prop="type" />
        <el-table-column label="状态" align="center" key="state" prop="state">
          <template #default="scope">
            {{ showBlobStoresState(scope.row.state) }}
          </template>
        </el-table-column>
        <el-table-column label="BLOB数量" align="center" key="blobCount" prop="blobCount" />
        <el-table-column label="使用空间" align="center" key="totalSize" prop="totalSize">
          <template #default="scope">
            {{ unitConversion(scope.row.totalSize) }}
          </template>
        </el-table-column>
        <el-table-column label="空间总大小" align="center" key="availableSpace" prop="availableSpace">
          <template #default="scope">
            {{ unitConversion(scope.row.availableSpace) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime"  width="180">
            <template #default="scope">
              {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") }}
            </template>
          </el-table-column>
        <el-table-column label="操作" align="center" width="220" >
            <template #default="scope">
             <div class="action-btn">
              <el-button size="default" @click="handleUpdate(scope.row)" v-hasPerms="['/nexus/blobstores/file/add']">修改</el-button>
              <el-button size="default" @click="handleStatusChange(scope.row)">删除</el-button>
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
  </div>

  <!-- 添加或修改组配置对话框 -->
  <el-dialog :title="title" v-model="open" width="800px" append-to-body>
    <div class="main-wrapp">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="200px">
        <el-form-item label="插件实例" prop="instanceCode" label-width="150px">
            <el-select
              class="search-select2" 
              v-model="form.instanceCode"
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
        <el-form-item label="存储库类型：" prop="type" label-width="150px">
          <el-select v-model="form.type" style="width: 240px">
            <el-option v-for="item in blobStoresTypes" :key="item" :label="item" :value="item"
              @click="handleBlobStoresTypeShow(item)" />
          </el-select>
        </el-form-item>
        <div v-show="fileIsShow">
          <el-row>
            <el-form-item label="存储库名称" prop="name"  label-width="150px">
              <el-input v-model="form.name" placeholder="请输入库名称" maxlength="30" style="width:240px"
                :disabled="nameDisabled" />
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="路径" prop="path" label-width="150px">
              <el-input v-model="form.path" placeholder="请输路径" maxlength="200" style="width:500px" />
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="是否开启预警" prop="softQuotaEnabled" label-width="150px">
              <el-checkbox v-model="form.softQuota.enabled"
                @change="checked => handleSoftQuotaShow(checked)">开启</el-checkbox>
            </el-form-item>
          </el-row>
        </div>
        <div v-show="quotaShow">
          <el-row>
            <el-form-item label="预警类型" prop="softQuotaType" label-width="150px">
              <el-select v-model="form.softQuota.type" clearable style="width: 240px">
                <el-option v-for="item in constraintType" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-row>

          <el-row>
            <el-form-item label="警戒值(单位:MB)" prop="softQuotaLimit" label-width="150px">
              <el-input v-model="form.softQuota.limit" maxlength="100" style="width:240px" />
            </el-form-item>
          </el-row>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align:right;">
        <el-button type="primary" v-show="updateButtonShow" @click="updateInfo">更 新</el-button>
        <el-button type="primary" v-show="newButtonShow" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">返 回</el-button>
      </div>
    </div>
  </el-dialog>
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
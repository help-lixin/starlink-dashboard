<script setup lang="ts">
// @ts-nocheck  
import { Plus } from '@element-plus/icons-vue'
import { queryInstanceInfoByPluginCode } from "@/api/common-api"
import { getBlobStoresList, createFileBlobStores, getFileBlobStoresInfoByName, deleteBlobStoresByName, updateFileBlobStoresInfoByName } from "@/api/nexus/blobStores"
import { showBlobStoresState } from "@/utils/common"

const pluginCode = "nexus";

const pluginInstance = reactive({});
//查询列表信息
const queryParams = reactive({
  instanceCode: undefined,
  name: undefined
});
const open = ref(false);
const loading = ref(false);
const title = ref("");
const blobStoresList = reactive([]);

// 表单规则
const rules = reactive<FormRules>({
  type: [
    { required: true, message: "存储类型不能为空", trigger: "blur" }
  ],
  name: [
    { required: true, message: "存储仓库不能为空", trigger: "blur" }
  ],
  path: [
    { required: true, message: "路径不能为空", trigger: "blur" }
  ]
});

//存储库类型
const blobStoresTypes = ref(["File", "S3"]);
//File类型存储库的限制类型
const constraintType = ref([
  { value: "spaceRemainingQuota", label: "Space Remaining" },
  { value: "spaceUsedQuota", label: "Space Used" }
]);

const formRef = ref<FormInstance>();
const form = reactive({
  instanceCode: undefined,
  type: undefined,
  name: undefined,
  path: undefined,
  softQuota: {
    limit: undefined,
    type: undefined,
    enabled: false
  }
});

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

// 重置表单
const reset = () => {
  Object.assign(form, {
    type: undefined,
    name: undefined,
    path: undefined,
    softQuota: {
      limit: undefined,
      type: undefined,
      enabled: false
    }
  })
};

const resetQueryParams = () => {
  Object.assign(queryParams, {
    instanceCode: undefined,
    name: undefined
  })
};


const resetBlobStoresList = ()=>{
  Object.assign(blobStoresList, []);
};
//处理两种不同类型的存储仓库的表单显示与隐藏
const handleBlobStoresTypeShow = (type: string) => {
  if (type == "File") {
    s3IsShow.value = false;
    fileIsShow.value = true;
  } else {
    fileIsShow.value = false;
    s3IsShow.value = true;
  }
};

//处理两种不同类型的存储仓库的表单显示与隐藏
const handleSoftQuotaShow = (val: any) => {
  if (val) {
    form.softQuota.enabled = true;
    quotaShow.value = true;
  } else {
    form.softQuota.enabled = false;
    quotaShow.value = false;
  }
};

// 表单提交处理
const submitForm = async () => {
  loading.value = true;
  console.log("form:", form);
  await formRef.value?.validate()
    .catch((err: Error) => {
      ElMessage.error('表单验证失败');
      loading.value = false;
      throw err;
    });
  form.instanceCode = toRefs(pluginInstance).instanceCode;

  createFileBlobStores(form).then(response => {
    if (response?.code == 200) {
      ElMessage({
        showClose: true,
        message: '创建成功',
        type: 'success',
      });
      open.value = false;
      getList();
    } else {
      ElMessage({
        showClose: true,
        message: '创建失败',
        type: 'fail',
      });
    }
  });
};

//更新操作
const updateInfo = async () => {
  loading.value = true;
  console.log("form:", form);
  await formRef.value?.validate()
    .catch((err: Error) => {
      ElMessage.error('表单验证失败');
      loading.value = false;
      throw err;
    });
  form.instanceCode = toRefs(pluginInstance).instanceCode;

  updateFileBlobStoresInfoByName(form).then(response => {
    if (response?.code == 200) {
      ElMessage({
        showClose: true,
        message: '修改成功',
        type: 'success',
      });
      open.value = false;
      reset();
      resetQueryParams();
      getList();
    } else {
      ElMessage({
        showClose: true,
        message: '修改失败',
        type: 'fail',
      });
    }
  });
};

// 表单取消处理
const cancel = () => {
  open.value = false;
  reset();
};


//处理新增按钮
const handleAdd = () => {
  reset();
  quotaShow.value = false;
  fileIsShow.value = false;
  delButtonShow.value = false;
  updateButtonShow.value = false;
  newButtonShow.value = true;
  open.value = true;
  nameDisabled.value = false;
  title.value = "新增存储库";
};

//表单行的点击事件：获取详情
const clickRow = (row) => {
  nameDisabled.value = true;
  quotaShow.value = false;
  reset();
  queryParams.instanceCode = pluginInstance.instanceCode;
  queryParams.name = row.name;

  getFileBlobStoresInfoByName(queryParams).then(response => {
    Object.assign(form, response?.data);
    open.value = true;
    delButtonShow.value = true;
    newButtonShow.value = false;
    updateButtonShow.value = true;
    resetQueryParams();
    if (form.type == "File") {
      fileIsShow.value = true
    }
    if (response?.data.softQuota.enabled) {
      quotaShow.value = true;
    }
  });
};

//B转MB
const byteToMB = (param: string) => {
  return parseInt(param) / (1024 * 1024);
};

const mBToGB = (param) => {
  return parseInt(param) / 1024;
};

//显示单位，param=Byte，大于1024转为GB，保留2位小数
const unitConversion = (param: string) => {
  let value = byteToMB(param);
  if (mBToGB(value) > 1) {
    return mBToGB(value).toFixed(2) + " GB";
  } else if (value > 1) {
    return parseInt(value).toFixed(2) + ' MB';
  } else {
    return parseInt(value * 1024).toFixed(2) + ' KB';
  }
};

const deleteInfo = (name: string) => {
  queryParams.instanceCode = pluginInstance.instanceCode;
  queryParams.name = name;
  console.log("queryParams:", queryParams);
  deleteBlobStoresByName(queryParams).then(response => {
    if (response?.code == 200) {
      ElMessage({
        showClose: true,
        message: '删除成功',
        type: 'success',
      });
      open.value = false;
      reset();
      resetQueryParams();
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
  reset();
  queryParams.instanceCode = pluginInstance.instanceCode;
  console.log("queryParams:", queryParams);
  console.log("qblobStoresList:", blobStoresList);
  resetBlobStoresList();
  console.log("hblobStoresList:", blobStoresList);
  getBlobStoresList(queryParams)
    .then(response => {
      loading.value = false
      Object.assign(blobStoresList, response?.data)
    });
};

//获取插件信息
queryInstanceInfoByPluginCode(pluginCode).then((res) => {
  if (res.code == 200) {
    Object.assign(pluginInstance, res?.data[0]);
    //获取列表
    getList();
  }
});
</script>

<template>
  <div class="main-wrapp">
    <!-- add BlobStore -->
    <div class="option-wrap">
      <el-button type="primary" plain size="default" @click="handleAdd"><el-icon>
          <Plus />
        </el-icon>新增</el-button>
    </div>
    <!--table  -->
    <div class="table-wrap">
      <el-table v-loading="loading" :data="blobStoresList" @row-click="clickRow">
        <el-table-column label="名称" align="center" key="name" prop="name" />
        <el-table-column label="类型" align="center" key="type" prop="type" />
        <el-table-column label="状态" align="center" key="state" prop="state">
          <template v-slot="scope">
            {{ showBlobStoresState(scope.row.state) }}
          </template>
        </el-table-column>
        <el-table-column label="BLOB数量" align="center" key="blobCount" prop="blobCount" />
        <el-table-column label="使用空间" align="center" key="totalSize" prop="totalSize">
          <template v-slot="scope">
            {{ unitConversion(scope.row.totalSize) }}
          </template>
        </el-table-column>
        <el-table-column label="空间总大小" align="center" key="availableSpace" prop="availableSpace">
          <template v-slot="scope">
            {{ unitConversion(scope.row.availableSpace) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <!-- 添加或修改组配置对话框 -->
  <el-dialog :title="title" v-model="open" width="800px" append-to-body>
    <div class="main-wrapp">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="200px">
        <el-form-item label="存储库类型：" prop="type" label-width="150px">
          <el-select v-model="form.type" style="width: 240px">
            <el-option v-for="item in blobStoresTypes" :key="item" :label="item" :value="item"
              @click="handleBlobStoresTypeShow(item)" />
          </el-select>
        </el-form-item>
        <div v-show="fileIsShow">
          <el-row>
            <el-form-item label="存储库名称" prop="name" :required="true" label-width="150px">
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
        <el-button type="primary" v-show="delButtonShow" @click="deleteInfo(form.name)">删 除</el-button>
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
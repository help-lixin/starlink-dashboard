<script setup lang="ts">
  // @ts-nocheck  
  import {status,showRepoStatus } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"

  import { repositoryList } from "@/api/nexus/repository"
 
  const queryForm = [];

  //查询列表信息
  const queryParams = {
    instanceCode:"nexus-instance-1",
    envCode:undefined,
    groupCode:undefined
  }

  const loading = ref(false)

  const repositoresList = reactive([]);
  const pluginInstance = reactive([]);
  const pluginCode = "nexus"

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    repositoryList(queryParams)
    .then(response => {
      loading.value = false
      Object.assign(repositoresList, response?.data)
    });
  }


  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        if(res?.data){
          Object.assign(queryForm, response?.data)
        }
      }
  });
     // 触发查询
  getList();
</script>

<template>
  <div class="main-wrapp">
    <!--table  -->
    <div class="table-wrap">
      <el-table v-loading="loading" :data="repositoresList">
          <el-table-column label="Name" align="center" key="name" prop="name"/>
          <el-table-column label="Type" align="center" key="type" prop="type" />
          <el-table-column label="Format" align="center" key="format" prop="format"/>
          <el-table-column label="Status" align="center" key="status"  width="100">
            <template v-slot="scope">
              {{  showRepoStatus(scope.row.status,scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column label="URL" align="center" key="url" prop="url"  />
      </el-table>
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
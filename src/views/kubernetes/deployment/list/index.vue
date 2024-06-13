<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange } from "@/utils/common"
  import { queryInstanceInfoByPluginCode } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {  Edit } from '@element-plus/icons-vue'
  // import router from '@/router'
  import { pageList,nameSpaceList} from "@/api/kubernetes/deployment"
  import { useRouter, useRoute } from "vue-router";

  const router = useRouter();


  const queryFormRef = ref(null);

  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    instanceCode:undefined,
    nameSpace:undefined,
    key: undefined,
    value: undefined
  })

  const defaultInstanceCode = ref('')

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])
  const nameSpaces = ref([])


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

  const addHandle = function(){
    router.push("/kubernetes/deployment/index")
  }

  // 处理搜索按钮
  const handleQuery = function(){
    getList()
  }

  // 处理重置按钮
  const resetQuery = function(){
    // queryFormRef.value.resetFields();
    queryParams.value = undefined
    queryParams.key = undefined
    queryParams.instanceCode = defaultInstanceCode.value;
    handleQuery();
  }

  const map = new Map();

  const showNameSpace = function(id){
    map.set(16,"命名空间")
    map.get(16)

  }

  // 多选框选中数据
  const handleSelectionChange = function(selection){

  }

  

  const queryNameSpace = function(instanceCode){
    nameSpaceList(instanceCode).then((res) =>{
      if(res.code == 200){
        Object.assign(nameSpaces,res?.data)
      }
    })
  }

  // 进入页面时,就初始化实例列表
  queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
    if(res.code == 200){
      Object.assign(pluginInstance,res?.data)
      queryParams.instanceCode = pluginInstance[0].instanceCode
      defaultInstanceCode.value = pluginInstance[0].instanceCode

      // 触发查询
      getList();
      queryNameSpace(defaultInstanceCode.value);
    }
  });
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" >
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
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
            <el-form-item label="命名空间" prop="nameSpace">
              <el-select
                class="search-select2"
                v-model="queryParams.nameSpace"
                placeholder="请选择资源"
                style="width: 100px"
                clearable
              >
                  <el-option v-for="item in nameSpaces"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
            </el-form-item>
      </el-form>
    </yt-card>
    <yt-card>
        <div class="option-wrap">
          <!-- <router-link :to="{ path: '/kubernetes/deployment/index', query: { timestamp: Date.now() }}" > -->
            <el-button
              type="primary"
              plain
              size="default"
              @click="addHandle" v-hasPerms="['/kubernetes/deployment/add']" ><el-icon><Plus /></el-icon>新增</el-button>
          <!-- </router-link> -->
        </div>
      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="tabelDataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="id" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="命名空间" align="left" key="nameSpace" prop="nameSpace" >
            <template #default="scope">
              {{ showNameSpace(scope.row.nameSpaceId)   }}
            </template>
          </el-table-column>
          <el-table-column label="部署种类" align="left" key="kind" prop="kind"  :show-overflow-tooltip="true"  />
          <el-table-column label="应用名称" align="left" key="name" prop="name"  :show-overflow-tooltip="true"  />
          <el-table-column label="实例编码" align="left" key="instanceCode" prop="instanceCode" :show-overflow-tooltip="true"   />
          <el-table-column label="状态" align="left" key="isDel" prop="isDel" :show-overflow-tooltip="true"   />
          <el-table-column label="操作" align="left" key="operation" prop="operation" :show-overflow-tooltip="true"   />
          <el-table-column label="创建时间" align="left" prop="opTime"  width="180">
            <template #default="scope">
              {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
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


  </div>
</template>

<style lang="scss" scoped>

</style>

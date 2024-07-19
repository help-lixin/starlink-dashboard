<script setup lang="ts">
  // @ts-nocheck
  import { dayjs } from "@/utils/common-dayjs"
  import { podGroup,podLog,updateReplicas} from "@/api/kubernetes/deployment"
  import { useRouter } from "vue-router";

  const $route = useRouter();

  //查询pod容器组列表信息
  const queryPodGroupParams = reactive({
    instanceCode: $route.currentRoute.value.query.instanceCode,
    deploymentName: $route.currentRoute.value.query.deploymentName,
    nameSpace: $route.currentRoute.value.query.nameSpace
  })

  //查询pod容器日志信息
  const queryPodLogParams = reactive({
    instanceCode: $route.currentRoute.value.query.instanceCode,
    containerName: undefined,
    nameSpace: $route.currentRoute.value.query.nameSpace,
    podName:undefined
  })

  // 更新副本数量
  const updateReplicasParams = reactive({
    instanceCode: $route.currentRoute.value.query.instanceCode,
    nameSpace: $route.currentRoute.value.query.nameSpace,
    deployName: $route.currentRoute.value.query.deploymentName,
    replicas: undefined
  })

  const loading = ref(false)
  const detailDialog = ref(false);
  const tabelDataList = reactive([])

  const title = ref(null)

  // 期望运行副本数
  const replicas = ref(0)
  // 当前运行副本数
  const curReplicas = ref(0)

  // dialog 属性
  const activeNames = ref();
  const logContent = ref('');
  const items = ref([]);

  const selectItem = (name) => {
    queryPodLogParams.containerName = name
    podLog(queryPodLogParams).then(res =>{
      logContent.value = res.data
    })
  };
  // dialog 属性 end

  // 获取列表
  const getList = ()=>{
    loading.value = true;
    podGroup(queryPodGroupParams)
    .then(response => {
          loading.value = false
          tabelDataList.splice(0,tabelDataList.length);
          if(response?.data?.pods.length > 0){
            Object.assign(tabelDataList, response?.data?.pods)
            replicas.value = response?.data?.replicas
            curReplicas.value = response?.data?.curReplicas
          }
        } 
    );
  }

  const showStatusFun = (status)=> {
    if(status == "Running" || status == true){
      return "运行中";
    }else{
      return "等待中";
    }
  }


  const handleDetail = function(row){
    items.value = []
    logContent.value = undefined

    detailDialog.value = true
    queryPodLogParams.podName = row.podName
    row.containers.forEach((container)=>{
      items.value.push(container)
    })

  }

  const cancel = function(){
    detailDialog.value = false
  }

  const changeAmount = function(){
    updateReplicasParams.replicas = replicas.value
    updateReplicas(updateReplicasParams).then(res =>{
      if(res.code == 200){
        getList()
      }
    })
  }

  // 多选框选中数据
  const handleSelectionChange = function(selection){

  }

  // 按钮
  const btnList = ref([
    {
      btnName: '详情',
      permArray: ['/kubernetes/deployment/container'],
      isShow: () => true,
      isDisable: false,
      clickEvent: handleDetail
    },
  ])

  // 触发查询
  getList();
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="期望容器副本数量" >
              <el-input-number @click="changeAmount" min="1" v-model="replicas"  placeholder="请输入副本数量"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          当前运行副本数/期望容器副本数：{{  curReplicas }}/{{replicas}}
        </el-row>
    </yt-card>
    <yt-card>
        <div class="option-wrap">
            <el-button type="primary" @click="getList"><el-icon><Refresh /></el-icon>刷新列表</el-button>
        </div>
      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="tabelDataList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="id" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="pod名称" align="left" key="podName" prop="podName"  :show-overflow-tooltip="true" />
          <el-table-column label="节点名称" align="left" key="nodeName" prop="nodeName"  :show-overflow-tooltip="true" />
          <el-table-column label="ip地址" align="left" key="ipAddress" prop="ipAddress"  :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="left" key="status" prop="status" :show-overflow-tooltip="true" width="100"  >
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" key="operation" prop="operation" :show-overflow-tooltip="true" width="220" >
            <template v-slot="scope">
              <yt-btn-menu-list :btn-list="btnList" :row-data="scope.row"></yt-btn-menu-list>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </yt-card>

    <el-dialog :title="title" v-model="detailDialog" width="var(--dialog-lg-w)"  append-to-body>
      <yt-card>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-collapse v-model="activeNames" accordion>
              <el-collapse-item
                v-for="item in items"
                :key="item.containerName"
                :name="item.containerName"
                @click="selectItem(item.containerName)"
              >
                <template #title>
                  <span>{{ item.containerName }}</span>
                </template>
                <el-form-item label="镜像名称:">
                  <div>{{ item.imageName }}</div>
                </el-form-item>
                <el-form-item label="重启次数:">
                  <div>{{ item.restartCount }}</div>
                </el-form-item>
                <el-form-item label="运行状态:">
                  <div>{{ showStatusFun(item.status) }}</div>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-input
              type="textarea"
              v-model="logContent"
              placeholder="请输入内容"
              rows="10"
            />
          </el-col>
        </el-row>
      </yt-card>
      <template #footer>
        <el-button @click="cancel">确 定</el-button>
      </template>
    </el-dialog>

  </div>
</template>


<style lang="scss" scoped>
</style>

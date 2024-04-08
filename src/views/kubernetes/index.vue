<script setup lang="ts">
// @ts-nocheck

import YamlEditor from '@/views/demo/utils/yamlEditor.vue'
import type { FormInstance } from 'element-plus'
const ruleFormRef = ref<FormInstance>()
// 通用标签 start
const port = ref({
                'name': '',
                'expose': 'true',
                'protocol': 'TCP',
                'containerPort': '1111',
                '_serviceType': [],
                '_ipam': '',
                '_name': 'nulltcp'
              })
const ports = ref([port])
const removeRow = (index,portIndex) =>{
  initData.value.spec.template.spec.containers[index].ports.splice(portIndex, 1);
}

const addRow = (index) =>{
  initData.value.spec.template.spec.containers[index].ports.push(port.value)
}
const services = ref([{label:"不创建服务",value:""},{label:"Cluster IP",value:"Cluster IP"}])
// 通用标签 end

const initData = ref({
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": "spring-web-demo",
    "annotations": {
      "deployment.kubernetes.io/revision": "2"
    },
    "creationTimestamp": "2024-03-22T04:57:23Z",
    "generation": 2,
    "labels": {
      "workload.user.cattle.io/workloadselector": "apps.deployment-default-spring-web-demo"
    },
    "namespace": "default",
    "resourceVersion": "19131771",
    "uid": "5b6f9662-4809-409c-9b63-dd633d1410eb",
    "fields": [
      "spring-web-demo",
      "2/2",
      2,
      2,
      "17d",
      "container-0",
      "nginx:1.17.2",
      "workload.user.cattle.io/workloadselector=apps.deployment-default-spring-web-demo"
    ]
  },
  "spec": {
    "selector": {
      "matchLabels": {
        "workload.user.cattle.io/workloadselector": "apps.deployment-default-spring-web-demo"
      }
    },
    "template": {
      "metadata": {
        "labels": {
          "workload.user.cattle.io/workloadselector": "apps.deployment-default-spring-web-demo"
        },
        "creationTimestamp": null,
        "namespace": "default"
      },
      "spec": {
        "containers": [
          {
            "image": "nginx:1.17.2",
            "imagePullPolicy": "Always",
            "name": "container-0",
            "securityContext": {
              "allowPrivilegeEscalation": false,
              "privileged": false,
              "readOnlyRootFilesystem": false,
              "runAsNonRoot": false
            },
            "terminationMessagePath": "/dev/termination-log",
            "terminationMessagePolicy": "File",
            "_init": false,
            "__active": true,
            "stdin": false,
            "stdinOnce": false,
            "command": [
              "/bin/sh"
            ],
            "tty": false,
            "args": [
              "/user/sbin"
            ],
            "workingDir": "/myapp",
            "resources": {}
          },
          {
            "image": "nginx:1.17.1",
            "imagePullPolicy": "Always",
            "name": "container-1",
            "securityContext": {
              "allowPrivilegeEscalation": false,
              "privileged": false,
              "readOnlyRootFilesystem": false,
              "runAsNonRoot": false
            },
            "terminationMessagePath": "/dev/termination-log",
            "terminationMessagePolicy": "File",
            "_init": false,
            "__active": true,
            "stdin": false,
            "stdinOnce": false,
            "command": [
              "/bin/sh"
            ],
            "tty": false,
            "args": [
              "/user/sbin"
            ],
            "workingDir": "/myapp",
            "resources": {}
          }
        ],
        "dnsPolicy": "ClusterFirst",
        "imagePullSecrets": [
          {
            "name": "harbor-login"
          }
        ],
        "restartPolicy": "Always",
        "schedulerName": "default-scheduler",
        "terminationGracePeriodSeconds": 30,
        "volumes": null
      }
    },
    "progressDeadlineSeconds": 600,
    "replicas": 2,
    "revisionHistoryLimit": 10,
    "strategy": {
      "rollingUpdate": {
        "maxSurge": "25%",
        "maxUnavailable": "25%"
      },
      "type": "RollingUpdate"
    }
  },
  "__clone": true
})
console.log("===========")
console.log(initData.value.spec.template.spec.containers)

import { Select } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import yaml from 'js-yaml'
const selectTabIndex = ref(0)


const handleTabsEdit = (
  targetName: string | number,
  action: 'remove' | 'add'
) => {
  if (action === 'add') {
    initData.value.location.push(locationItem.value)
  } else if (action === 'remove') {
    if (initData.value.location.length === 1) {
      ElMessage.warning('请至少保留一个tab页')
      return
    }
    initData.value.location.splice(targetName, 1)
    delete selectTabIndexObj.value[targetName]
  }
}
const isShowYamlEditor = ref(false)
const editYaml = () => {
  isShowYamlEditor.value = true
}
const setValue = (data) => {
  initData.value = data
}

const saveData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      console.log(yaml.safeLoad(initData.value))
    } else {
      ElMessage.error('请填写完整')
    }
  })
}

const showSelectTabIndex = (item) =>{
  console.log("=====>")
  console.log(item)
}

const selectTabIndexPods = ref(
  {0:"标签注释",
  1:"网络",
  2:"节点调度",
  3:"pod调度",
  4:"资源",
  5:"扩缩容和升级策略",
  6:"安全性上下文",
  7:"存储"}
)


</script>
<template>
  <div class="yamlDemo">
    <el-form :label-position="'top'" label-width="auto" :model="initData" ref="ruleFormRef">
      <div class="top">
        <yt-card :title="'公共配置'">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="版本号">
                <el-input v-model="initData.apiVersion" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="操作类型">
                <el-select v-model="initData.kind" style="width: 100%;" placeholder="请选择">
                  <el-option label="Deployment" value="Deployment"></el-option>
                  <el-option label="Create" value="Create"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="命名空间">
                <el-select v-model="initData.namespace" style="width: 100%;" placeholder="请选择">
                  <el-option label="default" value="default"></el-option>
                  <el-option label="my-project" value="my-project"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </yt-card>
        <yt-card :title="'详细配置'">
          <div class="detail-content">
            <el-tabs
              v-model="selectTabIndex"
              class="top-tabs"
              editable
              type="card"
              @edit="handleTabsEdit"
            >
              <template #add-icon>
                <el-icon><Select /></el-icon>
              </template>
              <el-tab-pane name="Deployment" label="Deployment">
                <el-scrollbar>
                  <div class="tab-content">
                    <div class="left">
                      <el-tabs :tab-position="'left'" >
                        <el-tab-pane label="标签注释" />
                        <el-tab-pane label="扩缩容和升级策略" />
                      </el-tabs>
                    </div>
                    <div class="right">
                        <el-row :gutter="24">
                          <el-col :span="8">
                            <el-form-item label="容器名称" prop="name" >
                              <el-input placeholder="请输入内容"></el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        
                    </div>
                  </div>
                </el-scrollbar>
              </el-tab-pane>
              <el-tab-pane name="Pod" label="Pod">
                <el-scrollbar>
                  <div class="tab-content">
                    <div class="left">
                      <el-tabs :tab-position="'left'" @click="showSelectTabIndex">
                        <el-tab-pane label="标签注释" name="detailed" @click="showSelectTabIndex(selectTabIndex)"/>
                        <el-tab-pane label="网络" name="net"/>
                        <el-tab-pane label="节点调度" />
                        <el-tab-pane label="pod调度" />
                        <el-tab-pane label="资源" />
                        <el-tab-pane label="扩缩容和升级策略" />
                        <el-tab-pane label="安全性上下文" />
                        <el-tab-pane label="存储" />
                      </el-tabs>
                    </div>
                    <div class="right">
                        <el-row :gutter="24" v-show="false">
                          <el-col :span="8">
                            <el-form-item label="Pod标签" prop="PodLabel" >
                              <el-input label="键" placeholder="请输入键"></el-input>
                              <el-input label="值" placeholder="请输入值"></el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <el-row :gutter="24">
                          <el-col :span="8">
                            <el-form-item label="容器名称" prop="name" >
                              <el-input placeholder="请输入内容"></el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                    </div>
                  </div>
                </el-scrollbar>
              </el-tab-pane>
              <el-tab-pane v-for="(container, index) in initData.spec.template.spec.containers"
               :key="index" :label="container.name" :name="container.name">
                <el-scrollbar>
                  <div class="tab-content">
                    <div class="left">
                      <el-tabs :tab-position="'left'" >
                        <el-tab-pane label="通用" />
                        <el-tab-pane label="健康检查" />
                        <el-tab-pane label="资源" />
                        <el-tab-pane label="安全性上下文" />
                        <el-tab-pane label="存储" />
                      </el-tabs>
                    </div>
                    <div class="right">
                        <el-row :gutter="24">
                          <el-col :span="8">
                            <el-form-item label="容器名称"  >
                              <el-input placeholder="请输入内容" :model-value="initData.spec.template.spec.containers[index].name"
                               :name="initData.spec.template.spec.containers[index].name"></el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        
                    </div>
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </el-tabs>
          </div>
        </yt-card>
      </div>
    </el-form>
    <yt-bottom-operate>
      <el-button @click="editYaml">编辑yaml</el-button>
      <el-button type="primary" @click="saveData">保存</el-button>
    </yt-bottom-operate>
  </div>
  <yaml-editor :init-data="initData" v-model:visible="isShowYamlEditor" @setValue="setValue"></yaml-editor>
</template>
<style lang="scss" scoped>
  .detail-content {
    ::v-deep(.el-tabs--card > .el-tabs__header) {
      margin-bottom: 0;
    }
    ::v-deep(.el-tabs__content) {
      border: 1px solid #ebeef5;
      border-top: 0;
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
      position: relative;
      top: -4px;
    }
    ::v-deep(.el-tabs--left .el-tabs__nav-wrap.is-left::after) {
      right: auto;
      left: 0;
    }
    ::v-deep(.el-tabs--left .el-tabs__active-bar.is-left) {
      right: auto;
      left: 0;
    }
    ::v-deep(.el-tabs__item.is-active) {
      background: white;
    }
    ::v-deep(.el-tabs--left .el-tabs__header.is-left) {
      margin: 0;
      float: none;
    }
    .tab-content {
      display: flex;
      height: 400px;
      overflow-x: hidden;
      padding-top: 16px;
      .left {
        background: var(--el-table-header-bg-color-my);
        ::v-deep(.el-tabs__content) {
          display: none;
        }
      }
      .right {
        padding: 16px;
        box-sizing: border-box;
        flex: 1;
      }
    }
  }
</style>

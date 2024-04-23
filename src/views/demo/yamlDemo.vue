<script setup lang="ts">
// @ts-nocheck

import YamlEditor from '@/views/demo/utils/yamlEditor2.vue'
import type { FormInstance } from 'element-plus'
import _ from 'lodash';
const ruleFormRef = ref<FormInstance>()
const copyData = ref({})
const initData = ref({
  'apiVersion': 'apps/v1',
  'kind': 'Deployment',
  'metadata': {
    'name': 'nginx-deploy',
    'namespace': 'default',
    'labels': {
      'controller': 'deploy'
    }
  },
  'spec': {
    'replicas': 3,
    'revisionHistoryLimit': 3,
    'paused': false,
    'progressDeadlineSeconds': 600,
    'strategy': {
      'type': 'RollingUpdate',
      'rollingUpdate': {
        'maxSurge': '30%',
        'maxUnavailable': '30%'
      }
    },
    'selector': {
      'matchLabels': {
        'app': 'nginx-pod'
      },
      'matchExpressions': [
        {
          'key': 'app',
          'operator': 'In',
          'values': [
            'nginx-pod'
          ]
        }
      ]
    },
    'template': {
      'metadata': {
        'labels': {
          'app': 'nginx-pod'
        }
      },
      'spec': {
        'containers': [
          {
            'name': 'nginx',
            'image': 'nginx:1.17.1',
            'ports': [
              {
                'containerPort': 80
              }
            ]
          }
        ]
      }
    }
  },
  'location': [
    {
      resource: {
        'matching': '/api',
        'proxy_pass': 'http://175.178.238.212:3002',
        'rewrite': '^/api(.*)$ $1 break'
      },
      storage: {
        'position': 'c盘'
      }
    },
    {
      resource: {
        'matching': '/api',
        'proxy_pass': 'http://175.178.238.212:3002',
        'rewrite': '^/api(.*)$ $1 break'
      },
      storage: {
        'position': 'c盘'
      }
    },
    {
      resource: {
        'matching': '/api',
        'proxy_pass': 'http://175.178.238.212:3002',
        'rewrite': '^/api(.*)$ $1 break'
      },
      storage: {
        'position': 'c盘'
      }
    }
  ]
})

import { Select } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import yaml from 'js-yaml'
const selectTabIndex = ref(0)
const selectTabIndexObj = ref({
  0: 'resource',
  1: 'storage',
  2: 'resource'
})
const locationItem = ref({
  resource: {
    'matching': undefined,
    'proxy_pass': undefined,
    'rewrite': undefined
  },
  storage: {
    'position': undefined
  }
})

const handleTabsEdit = (
  targetName: string | number,
  action: 'remove' | 'add'
) => {
  console.log(targetName, 'targetName')
  if (initData.value.location.length === 1) {
    ElMessage.warning('请至少保留一个tab页')
    return
  }
  if (action === 'add') {
    initData.value.location.push(locationItem.value)
    selectTabIndexObj.value[initData.value.location.length - 1] = 'resource'
  } else if (action === 'remove') {
    initData.value.location.splice(targetName, 1)
    delete selectTabIndexObj.value[targetName]
  }
}
const isShowYamlEditor = ref(false)
const editYaml = () => {
  isShowYamlEditor.value = true

  // copyData.value = _.cloneDeep(initData.value) 
  const yamlData = yaml.dump(initData.value);
  const json = yaml.load(yamlData);
  const yamlData2 = yaml.dump(json);
  const json2 = yaml.load(yamlData2);
  console.log(json2)
}
const setValue = (data) => {
  initData.value = data
  const container = {
    'name': 'nginx2',
    'image': 'nginx:1.17.2',
    'ports': [
      {
        'containerPort': 8080
      }
    ]
  }

  initData.value.spec.template.spec.containers.push(container)
}
const rules = reactive<FormRules>({
  matching: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
})

const saveData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      console.log(yaml.dump(initData.value))
    } else {
      ElMessage.error('请填写完整')
    }
  })
}
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
              <el-tab-pane
                v-for="(item, index) in initData.location"
                :key="index"
                :label="`location_${index}`"
                :name="index"
              >
                <el-scrollbar>
                  <div class="tab-content">
                    <div class="left">
                      <el-tabs :tab-position="'left'" v-model="selectTabIndexObj[selectTabIndex]">
                        <el-tab-pane :label="item1" v-for="(item1, index1) in Object.keys(item)" :key="index1" :name="item1"></el-tab-pane>
                      </el-tabs>
                    </div>
                    <div class="right">
                      <template v-if="selectTabIndexObj[selectTabIndex] === 'resource'">
                        <el-row :gutter="24">
                          <el-col :span="8">
                            <el-form-item label="匹配规则" :prop="`location[${index}][${selectTabIndexObj[selectTabIndex]}].matching`" :rules="rules.matching">
                              <el-input v-model="item[selectTabIndexObj[selectTabIndex]].matching" placeholder="请输入内容"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="proxy_pass">
                              <el-input v-model="item[selectTabIndexObj[selectTabIndex]].proxy_pass" placeholder="请输入内容"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="rewrite">
                              <el-input v-model="item[selectTabIndexObj[selectTabIndex]].rewrite" placeholder="请输入内容"></el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </template>
                      <template v-else-if="selectTabIndexObj[selectTabIndex] === 'storage'">
                        <el-row :gutter="24">
                          <el-col :span="8">
                            <el-form-item label="位置">
                              <el-input v-model="item[selectTabIndexObj[selectTabIndex]].position" placeholder="请输入内容"></el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </template>
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

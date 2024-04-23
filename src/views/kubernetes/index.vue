<script setup lang="ts">
// @ts-nocheck

import YamlEditor from '@/views/demo/utils/yamlEditor.vue'
import type { FormInstance } from 'element-plus'
import _ from 'lodash';
const ruleFormRef = ref<FormInstance>()
// 通用标签 start
const envSecrets = ref([
  {
    "label":"app-service",
    "value":"app-service"
  }
])
const envSecretKeys = ref([
  {
    "label":"ssh-privatekey",
    "value":"ssh-privatekey"
  }
])
const protocols = ref([{
  "label":"TCP",
  "value":"TCP"
},
{
  "label":"UDP",
  "value":"UDP"
}])
const removePort = (index,portIndex) =>{
  initData.value.spec.template.spec.containers[index].ports.splice(portIndex, 1);
}
const addPort = (index) =>{
  const port = {
                'name': undefined,
                'expose': undefined,
                'protocol': 'TCP',
                'containerPort': 80,
                'hostPort': undefined,
                'hostIP': undefined,
                '_serviceType': [],
              }
  initData.value.spec.template.spec.containers[index].ports.push(port)
}

// 标签 & 注解统一设置对象
const labelAnnotation=reactive({
  deployment:{
    labels:[
      {
        key:"",
        value:""
      }
    ],
    annotations:[
      {
        key:"",
        value:""
      }
    ]
  },
  pod:{
    labels:[
      {
        key:"",
        value:""
      }
    ],
    annotations:[
      {
        key:"",
        value:""
      }
    ]
  }
})
// deployment标签增删
const removeDeployLabel = (index) =>{
  labelAnnotation.deployment.labels.splice(index, 1);
}
const addDeployLabel = () =>{
  labelAnnotation.deployment.labels.push({key:"", value:""})
}
// deployment注解增删
const removeDeployAnnotation = (labelIndex) =>{
  labelAnnotation.deployment.annotations.splice(labelIndex, 1);
}
const addDeployAnnotation = () =>{
  labelAnnotation.deployment.annotations.push({key:"", value:""})
}

// pod标签增删
const removePodLabel = (index) =>{
  labelAnnotation.pod.labels.splice(index, 1);
}
const addPodLabel = () =>{
  labelAnnotation.pod.labels.push({key:"", value:""})
}
// pod注解增删
const removePodAnnotation = (labelIndex) =>{
  labelAnnotation.pod.annotations.splice(labelIndex, 1);
}
const addPodAnnotation = () =>{
  labelAnnotation.pod.annotations.push({key:"", value:""})
}


// 解析器选项增删
const addOption = () =>{
  if(initData.value.spec.template.spec?.dnsConfig == undefined){
    Object.assign(initData.value.spec.template.spec.dnsConfig,{"dnsConfig":""})
  }
  if(initData.value.spec.template.spec.dnsConfig.searches == undefined){
    Object.assign(initData.value.spec.template.spec.dnsConfig,{"options":[]})
  }
  initData.value.spec.template.spec.dnsConfig.options.push({"name":"","value":""})
}
const removeOption = (optionIndex) =>{
  initData.value.spec.template.spec.dnsConfig.options.splice(optionIndex, 1);
}

// 搜索域增删
const addSearch = () =>{
  if(initData.value.spec.template.spec?.dnsConfig == undefined){
    Object.assign(initData.value.spec.template.spec.dnsConfig,{"dnsConfig":""})
  }
  if(initData.value.spec.template.spec.dnsConfig.searches == undefined){
    Object.assign(initData.value.spec.template.spec.dnsConfig,{"searches":[]})
  }
  initData.value.spec.template.spec.dnsConfig.searches.push("")
}
const removeSearch = (searchIndex) =>{
  initData.value.spec.template.spec.dnsConfig.searches.splice(searchIndex, 1);
}

// 域名服务器增删
const addNameServer = () =>{
  if(initData.value.spec.template.spec?.dnsConfig == undefined){
    Object.assign(initData.value.spec.template.spec.dnsConfig,{"dnsConfig":""})
  }
  if(initData.value.spec.template.spec?.dnsConfig?.nameservers == undefined){
    Object.assign(initData.value.spec.template.spec,{"nameservers":[]})
  }
  initData.value.spec.template.spec.dnsConfig.nameservers.push("")
}
const removeNameServer = (searchIndex) =>{
  initData.value.spec.template.spec.dnsConfig.nameservers.splice(searchIndex, 1);
}

// 主机别名增删
const addHostAlias = () =>{
  if(initData.value.spec.template.spec?.hostAliases == undefined){
    Object.assign(initData.value.spec.template.spec,{"hostAliases":""})
  }
  initData.value.spec.template.spec.hostAliases.push({"ip":"","hostnames":[]})
}
const removeHostAlias = (searchIndex) =>{
  initData.value.spec.template.spec.hostAliases.splice(searchIndex, 1);
}

// 环境变量增删
const removeEnv = (index,envIndex) =>{
  initData.value.spec.template.spec.containers[index].env.splice(envIndex, 1);
}
const addEnv = (container) =>{
  const env = {
    "item":"Key/Value",
    "name": undefined,
    "value": undefined
  }
  container.env.push(env)
}

// pod调度(*)
const freePod=ref([])
const namespaces = [{label:"default",value:"default"},{label:"my-project",value:"my-project"}]
// 添加pod调度
const addPod = ()=>{
  freePod.value.push(
    {
      "podAffinity":true,
      "namespaces":[],
      "weight":1,
      "nodeLevel":"0",
      "curNameSpace":true,
      "topologyKey":"",
      "labelSelector": {
        "matchExpressions": [
          {
            "key": "",
            "operator": "In",
            "values": [""]
          }
        ]
      }
    }
  )
}
// 删除节点调度
const removePod = (index)=>{
  freePod.value.splice(index, 1);
}
// 添加规则
const addPodRule = (pod)=>{
    pod.labelSelector.matchExpressions.push(
        {
            "key": "",
            "operator": "In",
            "values": [
              ""
            ]
        }
    );
}
// 删除规则
const removePodRule = (pod,index)=>{
  pod.labelSelector.matchExpressions.splice(index, 1);
}


// 节点调度
const nodeAffinity=ref("none")
const nodeSelector=[{label:"默认规则",value:"none"},{label:"集中调度",value:"nodeName"},{label:"自定义规则",value:"affinity"}]
const nodeData=[{label:"node-default",value:"node-default"},{label:"my-project",value:"my-project"},{label:"slave-node",value:"slave-node"}]
// 自定义规则节点对象（*）
const freeNode=ref([])
// 添加节点调度
const addNode = ()=>{
  freeNode.value.push(
    {
      "nodeLevel": "0",
      "weight": 1,
      "preference": {
        "matchExpressions": [
          {
            "key": "",
            "operator": "In",
            "values": [
              ""
            ]
          }
        ]
      }
    }
  )
}
// 删除节点调度
const removeNode = (index)=>{
  freeNode.value.splice(index, 1);
}
// 添加规则
const addRule = (node)=>{
    node.preference.matchExpressions.push(
        {
            "key": "",
            "operator": "In",
            "values": [
              ""
            ]
        }
    );
}
// 删除规则
const removeRule = (node,index)=>{
  node.preference.matchExpressions.splice(index, 1);
}
// 修改节点亲和度方式
const nodeChange = (selectItem)=>{
  nodeAffinity.value = selectItem
  delete initData.value.spec.template.spec?.nodeName

  if(selectItem == "nodeName"){
    Object.assign(initData.value.spec.template.spec,{"nodeName":""})
  }else if(selectItem == "affinity"){
    if(freeNode.value.length == 0){
      addNode()
    }
  }
}

const status = [{label:"初始化容器",value:true},{label:"标准容器",value:false}]

const changeLifeCycle = (lifecycle)=>{
  const value = lifecycle?.item
  delete lifecycle?.httpGet
  delete lifecycle?.exec
  delete lifecycle?.tcpScoket

  if(value == "exec"){
    const exec = {
      "item":"exec",
      "exec": { "command": undefined }
    }
    Object.assign(lifecycle,exec)
  }else if(value == "httpGet"){
    const httpGet = {
      "item":"httpGet",
      "httpGet": {
                  "host": undefined,
                  "path": undefined,
                  "port": undefined
                }
    }
    Object.assign(lifecycle,httpGet)

  }else if(value == "tcpScoket"){
    const tcpScoket = {
        "item":"tcpScoket",
        "tcpScoket": {
          "port": undefined
        }
    }
    Object.assign(lifecycle,tcpScoket)
  }
}
const lifeCycles = [
  {label:"无",value:""},
  {label:"命令",value:"exec"},
  {label:"HTTP",value:"httpGet"},
  {label:"TCP",value:"tcpScoket"}
]
const services = ref([{label:"不创建服务",value:""},{label:"Cluster IP",value:"Cluster IP"}])
const serviceAccountNames = ref([{label:"default",value:"default"},{label:"Ken",value:"Ken"}])
const checkHealthTypes = ref([
  {label:"无",value:""},
  {label:"HTTP请求返回成功的状态",value:"HTTP"},
  {label:"HTTPS请求返回成功的状态",value:"HTTPS"},
  {label:"成功启动TCP连接",value:"tcpSocket"}
])
const capabilities = ref([
  {label:"ALL",value:"ALL"},
  {label:"AUDIT_CONTROL",value:"AUDIT_CONTROL"},
  {label:"AUDIT_WRITE",value:"AUDIT_WRITE"},
  {label:"BLOCK_SUSPEND",value:"BLOCK_SUSPEND"},
  {label:"CHOWN",value:"CHOWN"},
  {label:"DAC_OVERRIDE",value:"DAC_OVERRIDE"},
  {label:"DAC_READ_SEARCH",value:"DAC_READ_SEARCH"},
  {label:"FOWNER",value:"FOWNER"},
  {label:"FSETID",value:"FSETID"},
  {label:"IPC_LOCK",value:"IPC_LOCK"},
  {label:"IPC_OWNER",value:"IPC_OWNER"},
  {label:"KILL",value:"KILL"},
  {label:"LEASE",value:"LEASE"},
  {label:"LINUX_IMMUTABLE",value:"LINUX_IMMUTABLE"},
  {label:"MAC_ADMIN",value:"MAC_ADMIN"},
  {label:"MAC_OVERRIDE",value:"MAC_OVERRIDE"},
  {label:"MKNOD",value:"MKNOD"},
])
const envTypes = ref([
  {label:"Key/Value Pair",value:"Key/Value"},
  {label:"Resource",value:"Resource"},
  {label:"ConfigMap Key",value:"ConfigMapKey"},
  {label:"Secret Key",value:"SecretKey"},
  {label:"Pod Field",value:"PodField"}
  // {label:"Secret",value:"Secret"},
  // {label:"ConfigMap",value:"ConfigMap"},
])

const envSelectHandle = (env) =>{
  const envObjes= [{
                "item":"Key/Value",
                "name": undefined,
                "value": undefined
              },
              {
                "item":"SecretKey",
                "name": undefined,
                "valueFrom": {
                  "secretKeyRef": {
                    "key": undefined,
                    "name": undefined,
                    "optional": false
                  }
                }
              },
              {
                "item":"Resource",
                "name": undefined,
                "valueFrom": {
                  "resourceFieldRef": {
                    "containerName": undefined,
                    "divisor": undefined,
                    "resource": undefined
                  }
                }
              },
              {
                "item":"ConfigMapKey",
                "name": undefined,
                "valueFrom": {
                  "configMapKeyRef": {
                    "key": undefined,
                    "name": undefined,
                    "optional": false
                  }
                }
              },
              {
                "item":"PodField",
                "name": undefined,
                "valueFrom": {
                  "fieldRef": {
                    "apiVersion": "v1",
                    "fieldPath": undefined
                  }
                }
  }]
  for(const index in envObjes){
    if(env.item == envObjes[index].item){
      delete env?.value
      delete env?.valueFrom
      Object.assign(env,envObjes[index])
    }
  }

}
// 修改就绪检查下拉框
const changeReadinessProbe = (container) =>{
  if(container._checkHealthItem.readinessProbe == "HTTP" ){
    const http = {
              "failureThreshold": 3,
              "successThreshold": 1,
              "initialDelaySeconds": 0,
              "timeoutSeconds": 1,
              "periodSeconds": 10,
              "httpGet": {
                "scheme": "HTTP",
                "port": undefined
              }
            }
    Object.assign(container,{"readinessProbe":http})
    return
  }
  
  if(container._checkHealthItem.readinessProbe == "HTTPS" ){
    const https = {
                "failureThreshold": 3,
                "successThreshold": 1,
                "initialDelaySeconds": 0,
                "timeoutSeconds": 1,
                "periodSeconds": 10,
                "httpGet": {
                  "scheme": "HTTPS",
                  "port": undefined
                }
              }
    Object.assign(container,{"readinessProbe":https})
    return
  }


  if(container._checkHealthItem.readinessProbe == "tcpSocket" ){
    const tcpSocket = {
              "failureThreshold": 3,
              "successThreshold": 1,
              "initialDelaySeconds": 0,
              "timeoutSeconds": 1,
              "periodSeconds": 10,
              "tcpSocket": {
                "port": 8080
              }
            }
    Object.assign(container,{"readinessProbe":tcpSocket})
    return
  }
    
}

// // 修改存活检查下拉框
const changeLivenessProbe = (container) =>{
  
  if(container._checkHealthItem.livenessProbe == "HTTP" ){
    const http = {
            "failureThreshold": 3,
            "successThreshold": 1,
            "initialDelaySeconds": 0,
            "timeoutSeconds": 1,
            "periodSeconds": 10,
            "httpGet": {
              "scheme": "HTTP",
              "port": undefined
            }
          }
    Object.assign(container,{"livenessProbe":http})
    return
  }
    
  
  if(container._checkHealthItem.livenessProbe == "HTTPS" ){
    const https = {
              "failureThreshold": 3,
              "successThreshold": 1,
              "initialDelaySeconds": 0,
              "timeoutSeconds": 1,
              "periodSeconds": 10,
              "httpGet": {
                "scheme": "HTTPS",
                "port": undefined
              }
            }
    Object.assign(container,{"livenessProbe":https})
    return
  }


  if(container._checkHealthItem.livenessProbe == "tcpSocket" ){
    const tcpSocket = {
              "failureThreshold": 3,
              "successThreshold": 1,
              "initialDelaySeconds": 0,
              "timeoutSeconds": 1,
              "periodSeconds": 10,
              "tcpSocket": {
                "port": 8080
              }
            }
    Object.assign(container,{"livenessProbe":tcpSocket})
    return
  }

}

// 修改启动检查下拉框
const changeStartupProbe = (container) =>{
  
  if(container._checkHealthItem.startupProbe == "HTTP" ){
    const http = {
            "failureThreshold": 3,
            "successThreshold": 1,
            "initialDelaySeconds": 0,
            "timeoutSeconds": 1,
            "periodSeconds": 10,
            "httpGet": {
              "scheme": "HTTP",
              "port": undefined
            }
          }
    Object.assign(container,{"startupProbe":http})
    return
  }
    
  
  if(container._checkHealthItem.startupProbe == "HTTPS" ){
    const https = {
              "failureThreshold": 3,
              "successThreshold": 1,
              "initialDelaySeconds": 0,
              "timeoutSeconds": 1,
              "periodSeconds": 10,
              "httpGet": {
                "scheme": "HTTPS",
                "port": undefined
              }
            }
    Object.assign(container,{"startupProbe":https})
    return 
  }


  if(container._checkHealthItem.startupProbe == "tcpSocket" ){
    const tcpSocket = {
              "failureThreshold": 3,
              "successThreshold": 1,
              "initialDelaySeconds": 0,
              "timeoutSeconds": 1,
              "periodSeconds": 10,
              "tcpSocket": {
                "port": 8080
              }
            }
    Object.assign(container,{"startupProbe":tcpSocket})
    return
  }

}
// 通用标签 end
const copyData = ref({})
const initData = ref({
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": undefined,
    "annotations": {},
    "labels": {},
    "namespace": "default",
  },
  "spec": {
    "selector": {
      "matchLabels": {}
    },
    "template": {
      "metadata": {
        "labels": {},
        "annotations": {},
        "namespace": "default"
      },
      "spec": {
        "serviceAccountName":"default",
        "securityContext":{
          "fsGroup":undefined
        },
        "containers": [
          {
            "image": undefined,
            "imagePullPolicy": "Always",
            "name": "container-0",
            "terminationMessagePath": undefined,
            "terminationMessagePolicy": undefined,
            "_init": false,
            "ports":[],
            "env": [],
            "stdin": false,
            "stdinOnce": false,
            "_commandIO":"NO",
            "command": undefined,
            "tty": true,
            "args": undefined,
            "workingDir": undefined,
            "lifecycle": {
              "postStart": {},
              "preStop": {}
            },
            "_checkHealthItem":{
              "readinessProbe":"",
              "livenessProbe":"",
              "startupProbe":""
            },
            "securityContext": {
              "capabilities": {
                "add": [],
                "drop": []
              },
              "runAsNonRoot": false,
              "readOnlyRootFilesystem": false,
              "privileged": false,
              "allowPrivilegeEscalation": false,
              "runAsUser": undefined
            },
            "resources": {
              "requests": {
                "cpu": undefined,
                "memory": undefined,
                "nvidia.com/gpu": undefined
              },
              "limits": {
                "cpu": undefined,
                "memory": undefined,
                "nvidia.com/gpu": undefined
              }
            }
          }
        ],
        
        "dnsConfig": {
          "nameservers": [],
          "options": [],
          "searches": []
        },
        "hostAliases": [
          {"hostnames":[]}
        ],
        "dnsPolicy": undefined,
        "hostNetwork":undefined,
        "hostname": undefined,
        "subdomain": undefined,
        "imagePullSecrets": [{name:"default"}]
      }
    },
    "minReadySeconds":3,
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
  }
})

import { Select } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import yaml from 'js-yaml'
const selectTabName = ref('')



const handleTabsEdit = (
  targetName: string | number,
  action: 'remove' | 'add'
) => {
  const container = 
          {
            "image": undefined,
            "imagePullPolicy": "Always",
            "name": undefined,
            "terminationMessagePath": undefined,
            "terminationMessagePolicy": undefined,
            "_init": false,
            "ports":[],
            "env": [],
            "stdin": false,
            "stdinOnce": false,
            "_commandIO":"NO",
            "command": undefined,
            "tty": true,
            "args": undefined,
            "workingDir": undefined,
            "lifecycle": {
              "postStart": {},
              "preStop": {}
            },
            "_checkHealthItem":{
              "readinessProbe":"",
              "livenessProbe":"",
              "startupProbe":""
            },
            "securityContext": {
              "capabilities": {
                "add": [],
                "drop": []
              },
              "runAsNonRoot": false,
              "readOnlyRootFilesystem": false,
              "privileged": false,
              "allowPrivilegeEscalation": false,
              "runAsUser": undefined
            },
            "resources": {
              "requests": {
                "cpu": undefined,
                "memory": undefined,
                "nvidia.com/gpu": undefined
              },
              "limits": {
                "cpu": undefined,
                "memory": undefined,
                "nvidia.com/gpu": undefined
              }
            }
          }
  const containers = initData.value.spec.template.spec.containers
  const size = containers.length
  if (action === 'add') {
    container.name = "container_"+size
    containers.push(container)
    initData.value.spec.template.spec.imagePullSecrets.push({name:""})
  } else if (action === 'remove') {
    if (size === 1) {
      ElMessage.warning('请至少保留一个tab页')
      return
    }

    for(const index in containers){
        if(containers[index].name == targetName){
            containers.splice(index,1);
            initData.value.spec.template.spec.imagePullSecrets.splice(index,1)
        }
    }
  }
}
const isShowYamlEditor = ref(false)

const editYaml = () => {
  isShowYamlEditor.value = true
  // 处理标签 & 注解
  labelAnnotationHandle()
  initData.value.spec.template.metadata.namespace = initData.value.metadata.namespace

  // const test = {obj:{
  //   arr:[{aa:"aa"}]
  // }}
  console.log("=================")
  console.log(_.cloneDeep(initData.value) )
  console.log("=================")
  // TODO lixin  节点亲和度 层级：initData.value.spec.template.spec.affinity 后面取决于选的是什么类型的亲和度
  // 操作页面中点击pod的tab页，点击pod调度，添加pod亲和度
  copyData.value = _.cloneDeep(initData.value) 
  console.log(copyData.value)
  
  // 容器处理
  containerHandle();
  // 网络设置
  netSetting();
  // 镜像拉取密文
  imageSecret();
  
  //亲和度处理
  affinityHandle()
  
}

// 镜像拉取密文
const imageSecret = ()=>{
  const specConfig = copyData.value.spec.template.spec
  const switchArr = []
  
  specConfig.imagePullSecrets.forEach(function(secret){
    if(secret.name != "default"){
      switchArr.push(secret)
    }
  })
  specConfig.imagePullSecrets = switchArr
}

// 网络设置
const netSetting = ()=>{
  const specConfig = copyData.value.spec.template.spec

  // 域名服务器、解析器、搜索域为空时删除dnsConfig
  if(specConfig.dnsConfig.nameservers.length == 0 && specConfig.dnsConfig.options.length == 0 && specConfig.dnsConfig.searches.length == 0 ){
      delete specConfig.dnsConfig
  }else{
    if(specConfig.dnsConfig.nameservers.length == 0){
      delete specConfig.dnsConfig.nameservers
    }
    if(specConfig.dnsConfig.options.length == 0){
      delete specConfig.dnsConfig.options
    }
    if(specConfig.dnsConfig.searches.length == 0){
      delete specConfig.dnsConfig.searches
    }
  }

  // 主机别名
  if(specConfig.hostAliases.hostnames == undefined || specConfig.hostAliases.hostnames.length == 0){
    delete specConfig.hostAliases
  }

}

// 容器处理
const containerHandle = ()=>{
  copyData.value.spec.template.spec.containers.forEach(function(container){
    // 通用：标准容器&初始化容器选择
    if(container._init == true){
      copyData.value.spec.template.spec.initContainers = container
    }
    // 容器命令：标准输入选项
    stdinInit(container)
    resourceHandle(container)

    // 生命周期相关
    if(container.lifecycle.postStart?.item == undefined && container.lifecycle.preStop?.item == undefined ){
      delete container.lifecycle
    }else{
      if(container.lifecycle.postStart?.item == undefined ){
        delete container.lifecycle.postStart
      }
      if(container.lifecycle.preStop?.item == undefined ){
        delete container.lifecycle.preStop
      }
    }

    if(container.ports.length == 0){
      delete container.ports
    }else{
      container.ports.forEach(function(port){
        delete port._serviceType
      })
    }

    // 命令相关
    if(container.args == undefined && container.command == undefined){
      delete container.stdin
      delete container.stdinOnce
    }
    // 命令相关
    if(container.args == undefined){
      delete container.args
    }
    if(container.command == undefined){
      delete container.command
    }

    // 环境变量
    if(container.env.length == 0){
      delete container.env
    }

    // 安全性上下文
    if(!(container.securityContext.runAsNonRoot && container.securityContext.readOnlyRootFilesystem 
      && container.securityContext.privileged && container.securityContext.allowPrivilegeEscalation) ){
        delete container.securityContext
    }

    delete container._checkHealthItem
    delete container._init
  })
}

const affinityHandle = ()=>{
  if(freeNode.value.length > 0){
    Object.assign(copyData.value.spec.template.spec,{
      "affinity": {
        "nodeAffinity": {"preferredDuringSchedulingIgnoredDuringExecution":[],"requiredDuringSchedulingIgnoredDuringExecution":[]}
      }
    })
    freeNode.value.forEach(function(node){
      // 首选
      if(node.nodeLevel == "0"){
        copyData.value.spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.push({
          "weight":node.weight,
          "preference":node.preference
        })
        
      // 必须
      }else if(node?.nodeLevel == "1"){ 
        copyData.value.spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.push({
          "nodeSelectorTerms":node.preference
        })
      }
    })
  }

  if(freePod.value.length > 0){
    if(copyData.value.spec.template.spec?.affinity == undefined){
        Object.assign(copyData.value.spec.template.spec,{  "affinity": {}  })
    }

    freePod.value.forEach(function(pod){
      if(pod.podAffinity){

        if(copyData.value.spec.template.spec?.affinity?.podAffinity == undefined){
            Object.assign(copyData.value.spec.template.spec.affinity,{
              "podAffinity":{
                "preferredDuringSchedulingIgnoredDuringExecution":[],
                "requiredDuringSchedulingIgnoredDuringExecution":[]
              }
            })
        }

        // 首选
        if(pod.nodeLevel == "0"){
          copyData.value.spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.push({
            "podAffinityTerm":{
              "namespaces": pod.namespaces,
              "labelSelector": pod.labelSelector,
              "topologyKey": pod.topologyKey
            },
            "weight": pod.weight
          })
          
        // 必须
        }else if(pod?.nodeLevel == "1"){ 
          copyData.value.spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.push({
            "namespaces": pod.namespaces,
            "labelSelector":pod.labelSelector,
            "topologyKey": pod.topologyKey
          })
        }
      }else if(!pod.podAffinity){

        if(copyData.value.spec.template.spec?.affinity?.podAntiAffinity == undefined){
            Object.assign(copyData.value.spec.template.spec.affinity,{
              "podAntiAffinity":{
                "preferredDuringSchedulingIgnoredDuringExecution":[],
                "requiredDuringSchedulingIgnoredDuringExecution":[]
              }
            })
        }

        // 首选
        if(pod.nodeLevel == "0"){
          copyData.value.spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.push({
            "podAffinityTerm":{
              "namespaces": pod.namespaces,
              "labelSelector": pod.labelSelector,
              "topologyKey": pod.topologyKey
            },
            "weight": pod.weight
          })
          
        // 必须
        }else if(pod?.nodeLevel == "1"){ 
          copyData.value.spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.push({
            "namespaces": pod.namespaces,
            "labelSelector":pod.labelSelector,
            "topologyKey": pod.topologyKey
          })
        }
      }
    })
  }
}

// 处理标签 & 注解
const labelAnnotationHandle = ()=>{
  labelAnnotation2Json(labelAnnotation.deployment.labels , initData.value.metadata.labels)
  labelAnnotation2Json(labelAnnotation.pod.labels , initData.value.spec.template.metadata.labels)
  labelAnnotation2Json(labelAnnotation.deployment.annotations , initData.value.metadata.annotations)
  labelAnnotation2Json(labelAnnotation.pod.annotations , initData.value.spec.template.metadata.annotations)

  if(initData.value.spec.template.metadata.labels.length == 0){
    Object.assign(initData.value.spec.template.metadata.labels,initData.value.metadata.labels)
  }
  
  Object.assign(initData.value.spec.selector.matchLabels,initData.value.spec.template.metadata.labels)
}

// 内存&CPU限制处理
const resourceHandle = (container) =>{
  if(container.resources.requests.memory != undefined){
    container.resources.requests.memory = container.resources.requests.memory+"Mi"
  }
  if(container.resources.limits.memory != undefined){
    container.resources.limits.memory = container.resources.limits.memory+"Mi"
  }
}
// 容器命令：标准输入选项
const stdinInit = (container)=>{
  container.stdin = false
  container.stdinOnce = false

  if(container._commandIO == "ONCE"){
    container.stdin = true
    container.stdinOnce = true
  }else if(container._commandIO == "YES"){
    container.stdin = true
  }else{
    delete container?.tty
  }

  delete container._commandIO
}
// 标签 & 注解
const labelAnnotation2Json = (formValue,yamlValue)=>{
  const mapObject=new Map()
  for(const index in formValue){
    if((formValue[index].key != undefined && formValue[index].key != '') 
        &&
        (formValue[index].value != undefined && formValue[index].value != '')){
      
      mapObject.set(formValue[index].key,formValue[index].value)
    }
  }
  const entries = Object.fromEntries(mapObject.entries())
  for(const index in yamlValue){
    delete yamlValue[index]
  }
  Object.assign(yamlValue,entries)
}

const setValue = (data) => {
  initData.value = data
  copyData.value = {}
  
  // 设置标签 & 注解
  reverseLabelAnnotationHandle()
  if(initData.value.spec.template.spec?.imagePullSecrets == undefined || initData.value.spec.template.spec?.imagePullSecrets.length == 0){
    Object.assign(initData.value.spec.template.spec,{"imagePullSecrets":[{name:""}]})
  }
  // 设置容器处理
  reverseContainerHandle()
  // 设置网络处理
  reverseDnsConfigHandle()
  // 设置亲和度处理
  reverseAffinityHandle()
}

// 逆转 设置网络处理
const reverseDnsConfigHandle = ()=>{
  if(initData.value.spec.template.spec?.dnsConfig == undefined){
    Object.assign(initData.value.spec.template.spec,{
      "dnsConfig": {
        "nameservers": [],
        "options": [],
        "searches": []
      }
    })
  }

  if(initData.value.spec.template.spec?.hostAliases == undefined){
    Object.assign(initData.value.spec.template.spec,{
        "hostAliases": [
          {"hostnames":[]}
        ]
    })
  }

  if(initData.value.spec.template.spec?.dnsPolicy == undefined){
    Object.assign(initData.value.spec.template.spec,{"dnsPolicy": undefined})
  }
  if(initData.value.spec.template.spec?.hostNetwork == undefined){
    Object.assign(initData.value.spec.template.spec,{"hostNetwork": undefined})
  }
  if(initData.value.spec.template.spec?.hostname == undefined){
    Object.assign(initData.value.spec.template.spec,{"hostname": undefined})
  }
  if(initData.value.spec.template.spec?.subdomain == undefined){
    Object.assign(initData.value.spec.template.spec,{"subdomain": undefined})
  }

}

// 逆转 容器处理
const reverseContainerHandle = ()=>{
  if(initData.value.spec.template.spec?.containers != undefined){
    initData.value.spec.template.spec.containers.forEach(function(container){
      delete initData.value.spec.template.spec?.initContainers
      
      // 标准输入处理
      reverseCommonIOHandle(container)

      // 生命周期处理
      reverseLifecycleHandle(container)

      //健康检查
      reverseCheckHealthHandle(container)

      // 安全上下文
      if(container?.securityContext == undefined){
        Object.assign(container,{
          "securityContext": {
            "capabilities": {
              "add": [],
              "drop": []
            },
            "runAsNonRoot": false,
            "readOnlyRootFilesystem": false,
            "privileged": false,
            "allowPrivilegeEscalation": false,
            "runAsUser": undefined
          }
        })
      }

      if(container?.ports == undefined){
        Object.assign(container,{"ports":[]})
      }

      if(container?.args == undefined){
        Object.assign(container,{"args":undefined})
      }

      if(container?.command == undefined){
        Object.assign(container,{"command":undefined})
      }

      if(container?.workingDir == undefined){
        Object.assign(container,{"workingDir":undefined})
      }

      if(container?.env == undefined){
        Object.assign(container,{"env":[]})
      }
    })
  }else if(initData.value.spec.template.spec?.initContainers != undefined){
    initData.value.spec.template.spec.initContainers.forEach(function(container){
      // 标准输入处理
      reverseCommonIOHandle(container)

      // 生命周期处理
      reverseLifecycleHandle(container)

      //健康检查
      reverseCheckHealthHandle(container)

      // 安全上下文
      if(container?.securityContext == undefined){
        Object.assign(container,{
          "securityContext": {
            "capabilities": {
              "add": [],
              "drop": []
            },
            "runAsNonRoot": false,
            "readOnlyRootFilesystem": false,
            "privileged": false,
            "allowPrivilegeEscalation": false,
            "runAsUser": undefined
          },
        })
      }
    })
  }
  
}

// 逆转 健康检查
const reverseCheckHealthHandle = (container)=>{
  Object.assign(container,{
    "_checkHealthItem":{
      "readinessProbe":"",
      "livenessProbe":"",
      "startupProbe":""
    },
  })

  // 就绪检查
  if(container._checkHealthItem?.readinessProbe != undefined){
    if(container._checkHealthItem.readinessProbe?.httpGet?.scheme != undefined){
      container._checkHealthItem.readinessProbe = "HTTP"

    }else if(container._checkHealthItem.readinessProbe?.exec != undefined){
      container._checkHealthItem.readinessProbe = "exec"
      
    }else if(container._checkHealthItem.readinessProbe.tcpSocket != undefined){
      container._checkHealthItem.readinessProbe = "tcpSocket"

    }
    
  }
  // 存活检查
  if(container?.livenessProbe != undefined){
    if(container._checkHealthItem.livenessProbe?.httpGet?.scheme != undefined){
      container._checkHealthItem.livenessProbe = "HTTP"
      
    }else if(container._checkHealthItem.livenessProbe?.exec != undefined){
      container._checkHealthItem.livenessProbe = "exec"
      
    }else if(container._checkHealthItem.livenessProbe.tcpSocket != undefined){
      container._checkHealthItem.livenessProbe = "tcpSocket"

    }
    
  }
  // 启动检查
  if(container?.startupProbe != undefined){
    if(container._checkHealthItem.startupProbe?.httpGet?.scheme != undefined){
      container._checkHealthItem.startupProbe = "HTTP"
      
    }else if(container._checkHealthItem.startupProbe?.exec != undefined){
      container._checkHealthItem.startupProbe = "exec"
      
    }else if(container._checkHealthItem.startupProbe.tcpSocket != undefined){
      container._checkHealthItem.startupProbe = "tcpSocket"

    }
  }
            
    
}

// 逆转 生命周期处理
const reverseLifecycleHandle = (container)=>{
  // 都为空的情况初始化生命周期对象
  if(container?.lifecycle?.postStart == undefined && container?.lifecycle?.preStop == undefined){
        Object.assign(container,{
          "lifecycle": {
            "postStart": {
              "item":""
            },
            "preStop": {
              "item":""
            }
          }
        })
      }else{
        if(container?.lifecycle?.postStart == undefined){
          if(container.lifecycle.postStart?.httpGet?.scheme != undefined){
            Object.assign(container.lifecycle.postStart,{"item":"HTTP"})
            
          }else if(container.lifecycle.postStart?.exec != undefined){
            Object.assign(container.lifecycle.postStart,{"item":"exec"})
            
          }else if(container.lifecycle.postStart?.tcpSocket != undefined){
            Object.assign(container.lifecycle.postStart,{"item":"tcpSocket"})

          }
        }else{
          if(container.lifecycle.preStop?.httpGet?.scheme != undefined){
            Object.assign(container.lifecycle.preStop,{"item":"HTTP"})
            
          }else if(container.lifecycle.preStop?.exec != undefined){
            Object.assign(container.lifecycle.preStop,{"item":"exec"})
            
          }else if(container.lifecycle.preStop?.tcpSocket != undefined){
            Object.assign(container.lifecycle.preStop,{"item":"tcpSocket"})

          }
          
        }
      }
}

// 逆转 容器命令：标准输入选项设置
const reverseCommonIOHandle = (container)=>{
   if(container.stdin && container.stdinOnce){
        container._commandIO = "ONCE"
      }else if(container.stdin && !container.stdinOnce){
        container._commandIO = "YES"
      }else{
        container._commandIO = "NO"
      }
      reverseResourceHandle(container)
}

// 逆转 亲和性处理
const reverseAffinityHandle = ()=>{
  // 节点亲和性
  if(initData.value.spec.template.spec?.affinity?.nodeAffinity != undefined){
    freeNode.value.length = 0
    
    // 必须
    if(initData.value.spec.template.spec?.affinity?.nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution.length > 0){
      initData.value.spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.forEach(function(required){
        const node = {
          "nodeLevel": "1",
          "weight": undefined,
          "preference": required.nodeSelectorTerms
        }
        freeNode.value.push(node)
      })
    }
    // 首选
    if(initData.value.spec.template.spec?.affinity?.nodeAffinity?.preferredDuringSchedulingIgnoredDuringExecution.length > 0){
      initData.value.spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.forEach(function(preferred){
        const node = {
          "nodeLevel": "0",
          "weight": preferred.weight,
          "preference": preferred.preference
        }
        freeNode.value.push(node)
      })
    }
    
  // pod亲和性
  }else if(initData.value.spec.template.spec?.affinity?.podAffinity != undefined){
    freePod.value.length = 0

    // 必须
    if(initData.value.spec.template.spec?.affinity?.podAffinity?.requiredDuringSchedulingIgnoredDuringExecution.length > 0){
      initData.value.spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.forEach(function(requireds){
        const pod = {
          "podAffinity":true,
          "namespaces":requireds.nodeSelectorTerms?.namespaces,
          "weight":1,
          "nodeLevel":"1",
          "curNameSpace":requireds.nodeSelectorTerms?.namespaces.length == 0,
          "topologyKey":"",
          "labelSelector": requireds.labelSelector
        }

        freePod.value.push(pod)
      })
    }
    // 首选
    if(initData.value.spec.template.spec?.affinity?.podAffinity?.preferredDuringSchedulingIgnoredDuringExecution.length > 0){
      initData.value.spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.forEach(function(preferred){
      const pod = {
          "podAffinity":true,
          "namespaces":preferred.nodeSelectorTerms?.namespaces,
          "weight":preferred.weight,
          "nodeLevel":"0",
          "curNameSpace":preferred.nodeSelectorTerms?.namespaces.length == 0,
          "topologyKey":preferred.podAffinityTerm.topologyKey,
          "labelSelector": preferred.podAffinityTerm.labelSelector.matchExpressions
      }
      freePod.value.push(pod)
    })

    // pod反亲和性
    }else if(initData.value.spec.template.spec?.affinity?.podAntiAffinity != undefined){
      freePod.value.splice(0,freePod.length)
      freePod.value.push(
        {
          "podAffinity":false,
          "namespaces":[],
          "weight":undefined,
          "nodeLevel":"0",
          "curNameSpace":true,
          "topologyKey":"",
          "labelSelector": {}
        }
      )

      // 必须
      if(initData.value.spec.template.spec?.affinity?.podAntiAffinity?.requiredDuringSchedulingIgnoredDuringExecution != undefined){
        freePod.value.nodeLevel = "1"
        Object.assign(freePod.value.labelSelector , initData.value.spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector)
        if(initData.value.spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.namespaces.length > 0){
          freePod.value.namespaces = freePod.value.namespaces.concat( initData.value.spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.namespaces )
          freePod.value.curNameSpace = false
        }

      }
      // 首选
      if(initData.value.spec.template.spec?.affinity?.podAntiAffinity?.preferredDuringSchedulingIgnoredDuringExecution != undefined){
        freePod.value.nodeLevel = "0"
        freePod.value.weight = initData.value.spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution?.weight
        freePod.value.topologyKey = initData.value.spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.topologyKey
        Object.assign(freePod.value.labelSelector , initData.value.spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector)
      }
    }

  }
}

// 内存&CPU限制处理
const reverseResourceHandle = (container) =>{
  if(container.resources.requests.memory != undefined){
    container.resources.requests.memory = container.resources.requests.memory.match(/\d+/)[0];
  }
  if(container.resources.limits.memory != undefined){
    container.resources.limits.memory = container.resources.limits.memory.match(/\d+/)[0];
  }
}

// 标签 & 注解从yaml逆向回来
const reverseLabelAnnotationHandle = ()=>{
  const cleanObj = {
    deployment:{
      labels:[],
      annotations:[]
    },
    pod:{
      labels:[],
      annotations:[]
    }
  }
  Object.assign(labelAnnotation,cleanObj)
  json2labelAnnotation(labelAnnotation.deployment.labels , initData.value.metadata.labels)
  json2labelAnnotation(labelAnnotation.pod.labels , initData.value.spec.template.metadata.labels)
  json2labelAnnotation(labelAnnotation.deployment.annotations , initData.value.metadata.annotations)
  json2labelAnnotation(labelAnnotation.pod.annotations , initData.value.spec.template.metadata.annotations)

}

// 标签 & 注解
const json2labelAnnotation = (values,yamlValues)=>{
  const mapObject=new Map(Object.entries(yamlValues))
  for (const k of mapObject.keys()){
    values.push({
      key:k,
      value:mapObject.get(k)
    })
  }
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

const changeSelectTab = (item) =>{
  selectTabIndexPods.value = item
}
const changePodSelectTab = (item) =>{
  selectPod.value = item
}
const changeDeploymentSelectTab = (item) =>{
  selectDepolyment.value = item
}

const selectDepolyment = ref('')
const selectPod = ref('')
const selectTabIndexPods = ref('')


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
              <el-form-item label="名称">
                <el-input v-model="initData.metadata.name" placeholder="请输入内容"></el-input>
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
                <el-select v-model="initData.metadata.namespace" style="width: 100%;" placeholder="请选择">
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
              <el-tab-pane name="Deployment" label="Deployment" closable="false">
                <el-scrollbar>
                  <div class="tab-content">
                    <div class="left">
                      <el-tabs :tab-position="'left'" @tab-change="changeDeploymentSelectTab">
                        <el-tab-pane label="标签注释" name="deploymentLabel" />
                        <el-tab-pane label="扩缩容和升级策略" name="deploymentStrategy" />
                      </el-tabs>
                    </div>
                    <div class="right">
                      <div v-show="selectDepolyment === 'deploymentLabel'  ? true : false ">
                        <H1>Deployment标签</H1>
                        {{ labelAnnotation.deployment}}
                        <el-row :gutter="24" v-for="(label,index) in labelAnnotation.deployment.labels" :key="index" style="margin-top:30px">
                            <el-col :span="6" >
                              <el-input label="键" placeholder="请输入键" v-model="label.key"></el-input>
                            </el-col>
                            <el-col :span="6" >
                              <el-input label="值" placeholder="请输入值" v-model="label.value" ></el-input>
                            </el-col>
                          <el-button @click="removeDeployLabel(index)" type="danger" >删除标签</el-button>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-button @click="addDeployLabel" type="primary" plain>添加标签</el-button>
                        </el-row>
                        <H1>注解</H1>
                        <el-row :gutter="24" v-for="(annotation,index) in labelAnnotation.deployment.annotations" :key="index" style="margin-top:30px">
                          <el-col :span="6" >
                              <el-input label="键" placeholder="请输入键" v-model="annotation.key"></el-input>
                          </el-col>
                          <el-col :span="6" >
                              <el-input label="值" placeholder="请输入值" v-model="annotation.value" ></el-input>
                          </el-col>
                          <el-button @click="removeDeployAnnotation(index)"  type="danger">删除注解</el-button>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-button @click="addDeployAnnotation" type="primary" plain>添加标签</el-button>
                        </el-row>
                      </div>
                      <div v-show="selectDepolyment === 'deploymentStrategy'  ? true : false ">
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-col :span="12">
                            <el-radio-group v-model="initData.spec.strategy.type" >
                                    <el-radio-button label="RollingUpdate">滚动升级</el-radio-button>
                                    <el-radio-button label="Recreate">重新创建</el-radio-button>
                            </el-radio-group>
                          </el-col>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px" v-if="initData.spec.strategy.type == 'RollingUpdate'">
                          <el-col :span="12">
                            <el-form-item label="最大可用数量">
                              <el-input placeholder="请输入数量" v-model="initData.spec.strategy.rollingUpdate.maxSurge"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="最大不可用数量">
                              <el-input placeholder="请输入数量" v-model="initData.spec.strategy.rollingUpdate.maxUnavailable"></el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-col :span="12">
                            <el-form-item label="最短就绪时间">
                              <el-input type="number" placeholder="请输入最短就绪时间" v-model="initData.spec.minReadySeconds">
                                <template #append>秒</template>
                              </el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="修订历史记录限制">
                              <el-input type="number" placeholder="请输入修订历史记录限制" v-model="initData.spec.revisionHistoryLimit">
                                <template #append>秒</template>
                              </el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="进程截止时间">
                              <el-input type="number" placeholder="请输入进程截止时间数量" v-model="initData.spec.progressDeadlineSeconds">
                                <template #append>秒</template>
                              </el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </div>
                    </div>
                  </div>
                </el-scrollbar>
              </el-tab-pane>
              <el-tab-pane name="Pod" label="Pod">
                <el-scrollbar>
                  <div class="tab-content">
                    <div class="left">
                      <el-tabs :tab-position="'left'" @tab-change="changePodSelectTab">
                        <el-tab-pane label="标签注释" name="podLabel" />
                        <el-tab-pane label="网络" name="podNet"/>
                        <el-tab-pane label="节点调度" name="podNode" />
                        <el-tab-pane label="pod调度" name="pod" />
                        <el-tab-pane label="资源" name="podResource" />
                        <el-tab-pane label="扩缩容和升级策略" name="podStrategy" />
                        <el-tab-pane label="安全性上下文" name="podContext" />
                        <el-tab-pane label="存储" name="podVolumes" />
                      </el-tabs>
                    </div>
                    <div class="right" >
                      <div v-show="selectPod === 'podLabel'  ? true : false ">
                        <H1>Pod标签</H1>
                        {{labelAnnotation.pod }}
                        <el-row :gutter="24" v-for="(label,index) in labelAnnotation.pod.labels" :key="index" style="margin-top:30px">
                            <el-col :span="6" >
                              <el-input label="键" placeholder="请输入键" v-model="label.key"></el-input>
                            </el-col>
                            <el-col :span="6" >
                              <el-input label="值" placeholder="请输入值" v-model="label.value" ></el-input>
                            </el-col>
                          <el-button @click="removePodLabel(index)" type="danger" >删除标签</el-button>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-button @click="addPodLabel" type="primary" plain>添加标签</el-button>
                        </el-row>
                        <H1>注解</H1>
                        <el-row :gutter="24" v-for="(annotation,index) in labelAnnotation.pod.annotations" :key="index" style="margin-top:30px">
                          <el-col :span="6" >
                              <el-input label="键" placeholder="请输入键" v-model="annotation.key"></el-input>
                          </el-col>
                          <el-col :span="6" >
                              <el-input label="值" placeholder="请输入值" v-model="annotation.value" ></el-input>
                          </el-col>
                          <el-button @click="removePodAnnotation(index)"  type="danger">删除注解</el-button>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-button @click="addPodAnnotation" type="primary" plain>添加标签</el-button>
                        </el-row>
                      </div>

                      <div v-show="selectPod === 'podNet'  ? true : false ">
                        <H1>网络设置</H1>
                        <el-row :gutter="24">
                          <el-col :span="8">
                            <el-form-item label="网络模式">
                              <el-select v-model="initData.spec.template.spec.hostNetwork" style="width: 100%;" placeholder="请选择">
                                <el-option label="常规" :value=false></el-option>
                                <el-option label="主机网络" :value=true></el-option>
                              </el-select>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="DNS策略">
                              <el-select v-model="initData.spec.template.spec.dnsPolicy" style="width: 100%;" placeholder="请选择">
                                <el-option label="默认" value="Default"></el-option>
                                <el-option label="集群优先" value="ClusterFirst"></el-option>
                                <el-option label="集群优先使用主机网络" value="ClusterFirstWithHostNet"></el-option>
                                <el-option label="无" value="None"></el-option>
                              </el-select>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <el-row :gutter="24">
                          <el-col :span="8">
                            <el-form-item label="主机名">
                              <el-input  placeholder="请输入内容" v-model="initData.spec.template.spec.hostname"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="子域">
                              <el-select v-model="initData.spec.template.spec.subdomain" style="width: 100%;" placeholder="请选择">
                                <el-option label="常规" :value=false></el-option>
                                <el-option label="主机网络" :value=true></el-option>
                              </el-select>
                            </el-form-item>
                          </el-col>
                        </el-row>

                        <H1>DNS</H1>
                          <H1>域名服务器</H1>
                          <el-row :gutter="8" v-for="(nameServers,index) in initData.spec.template.spec.dnsConfig.nameservers" :key="nameServers" style="margin-top:15px">
                            <el-col :span="8">
                                <el-input   placeholder="请输入内容" v-model="initData.spec.template.spec.dnsConfig.nameservers[index]"></el-input>
                            </el-col>
                            <el-button type="danger" @click="removeNameServer(index)">删除</el-button>
                          </el-row>
                          <el-row :gutter="8">
                              <el-button type="primary" style="margin-top:15px" @click="addNameServer" plain>添加域名服务器</el-button>
                          </el-row>
                          <H1>搜索域</H1>
                          <el-row :gutter="8" v-for="(search,index) in initData.spec.template.spec.dnsConfig.searches" :key="search" style="margin-top:15px">
                            <el-col :span="8">
                                <el-input  placeholder="请输入内容" v-model="initData.spec.template.spec.dnsConfig.searches[index]"></el-input>
                            </el-col>
                            <el-button type="danger" @click="removeSearch(index)">删除</el-button>
                          </el-row>
                          <el-row :gutter="8">
                              <el-button type="primary" style="margin-top:15px" @click="addSearch" plain>添加搜索域</el-button>
                          </el-row>

                        <div :span="8">
                          <H1>解析器选项</H1>
                          <el-row :gutter="8" v-for="(option,index) in initData.spec.template.spec.dnsConfig.options" :key="option">
                            <el-col :span="8">
                              <el-form-item label="名称">
                                <el-input  placeholder="请输入内容" v-model="initData.spec.template.spec.dnsConfig.options[index].name"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="8">
                              <el-form-item label="值">
                                <el-input  placeholder="请输入内容" v-model="initData.spec.template.spec.dnsConfig.options[index].value"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-button type="danger" @click="removeOption(index)" style="margin-top:30px">删除</el-button>
                          </el-row>
                          <el-row :gutter="8">
                              <el-button type="primary" @click="addOption" plain>添加解析器选项</el-button>
                          </el-row>
                        </div>
                        <div :span="8">
                          <H1>主机别名</H1>
                          <el-row :gutter="8" v-for="(hostAliase,index) in initData.spec.template.spec.hostAliases" :key="hostAliase">
                            <el-col :span="8">
                              <el-form-item label="IP 地址">
                                <el-input  placeholder="请输入内容" v-model="initData.spec.template.spec.hostAliases[index].ip"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="8">
                              <el-form-item label="主机名">
                                <el-input  placeholder="请输入内容" v-model="initData.spec.template.spec.hostAliases[index].hostnames[0]"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-button type="danger" @click="removeHostAlias(index)" style="margin-top:30px">删除</el-button>
                          </el-row>
                          <el-row :gutter="8">
                              <el-button type="primary" @click="addHostAlias" plain>添加选项</el-button>
                          </el-row>
                        </div>
                      </div>

                      <div v-show="selectPod === 'podNode'  ? true : false ">
                        <H1>节点调度</H1>
                        <el-row :gutter="24" >
                          <el-col :span="12">
                              <el-radio-group v-model="nodeAffinity" @change="nodeChange">
                                <el-radio-button
                                  v-for="item in nodeSelector"
                                  :key="item.value"
                                  :label="item.value"
                                >{{item.label}}</el-radio-button>
                              </el-radio-group>
                          </el-col>
                        </el-row>
                        <template v-if="nodeAffinity == 'none'">
                        </template>
                        <template v-if="nodeAffinity == 'nodeName'">
                          <el-row>
                            <el-col>
                              <el-select v-model="initData.spec.template.spec.nodeName" placeholder="请选择">
                                <el-option v-for="node in nodeData"
                                            :key="node.value"
                                            :label="node.label"
                                            :value="node.value"/>
                              </el-select>
                            </el-col>
                          </el-row>
                        </template>
                        <template v-if="nodeAffinity == 'affinity'" >
                          <template v-for="(node,nodeIndex) in freeNode" :key="nodeIndex">
                            <el-row :gutter="24" style="margin-top:30px">
                              <el-col :span="14">
                                <el-form-item label="优先级">
                                  <el-select v-model="node.nodeLevel" style="width: 100%;" placeholder="请选择">
                                    <el-option label="首选" value="0"></el-option>
                                    <el-option label="必须" value="1"></el-option>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="6" v-if="node.nodeLevel == '0'">
                                <el-form-item label="权重">
                                  <el-input type="number" 
                                  v-model="node.weight"/>
                                </el-form-item>
                              </el-col>
                            </el-row>
                            <el-row v-for="(item,index) in node.preference.matchExpressions" :key="index">
                              <el-col :span="6" >
                                <el-form-item label="键">
                                  <el-input v-model="item.key"/>
                                </el-form-item>
                              </el-col>
                              <el-col :span="2">
                                <el-form-item label="运算符">
                                  <el-select style="width: 100%;" v-model="item.operator" placeholder="请选择">
                                      <el-option label="包含" value="In"></el-option>
                                      <el-option label="不包含" value="NotIn"></el-option>
                                      <el-option label="等于" value="Exists"></el-option>
                                      <el-option label="不等于" value="DoesNotExist"></el-option>
                                      <el-option label="小于" value="Gt"></el-option>
                                      <el-option label="大于" value="Lt"></el-option>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="6">
                                <el-form-item label="值">
                                  <el-input v-model="item.values[0]"/>
                                </el-form-item>
                              </el-col>

                              <el-col :span="3" style="margin-top:30px">
                                <el-button @click="removeRule(node,index)" type="danger" plain>删除</el-button>
                              </el-col>
                            </el-row>
                            <el-row>
                              <el-col :span="12">
                                <el-button @click="addRule(node)" type="primary" plain>添加规则</el-button>
                              </el-col>
                            </el-row>
                            <el-row>
                              <el-col :span="12">
                                <el-button @click="removeNode(nodeIndex)" type="danger" plain>删除节点调度</el-button>
                              </el-col>
                            </el-row>
                          </template>
                          <el-button @click="addNode" type="primary" plain>添加节点调度</el-button>
                        </template>
                      </div>

                      <div v-show="selectPod === 'pod'  ? true : false ">
                        <H1>Pod调度</H1>
                        <template v-for="(pod,podIndex) in freePod" :key="podIndex" >
                          <el-row :gutter="24" style="margin-top:30px">
                            <el-col :span="8">
                                <el-radio-group v-model="pod.podAffinity" >
                                  <el-radio-button :label=true>亲和性</el-radio-button>
                                  <el-radio-button :label=false>反亲和性</el-radio-button>
                                </el-radio-group>
                            </el-col>
                            <el-col :span="12">
                                <el-radio-group v-model="pod.curNameSpace" >
                                  <el-radio-button :label=true>当前pod命名空间</el-radio-button>
                                  <el-radio-button :label=false>特定命名空间</el-radio-button>
                                </el-radio-group>
                            </el-col>
                          </el-row>
                          <el-row :gutter="24" style="margin-top:30px">
                            <el-col :span="6">
                              <el-form-item label="优先级">
                                <el-select v-model="pod.nodeLevel" style="width: 100%;" placeholder="请选择">
                                  <el-option label="首选" value="0"></el-option>
                                  <el-option label="必须" value="1"></el-option>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="6">
                              <el-form-item label="拓扑键">
                                <el-select v-model="pod.topologyKey" style="width: 100%;" placeholder="请选择">
                                  <el-option label="kubernetes.io/hostname" value="kubernetes.io/hostname"></el-option>
                                  <el-option label="topology.kubernetes.io/zone" value="topology.kubernetes.io/zone"></el-option>
                                  <el-option label="topology.kubernetes.io/region" value="topology.kubernetes.io/region"></el-option>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3" v-if="pod.nodeLevel == '0'">
                              <el-form-item label="权重">
                                <el-input type="number" 
                                v-model="pod.weight"/>
                              </el-form-item>
                            </el-col>
                            <el-col :span="6" v-if="pod.curNameSpace == false">
                              <el-form-item label="特定命名空间">
                                <el-select
                                    class="search-select"
                                    v-model="pod.namespaces"
                                    placeholder="请选择"
                                    multiple
                                    clearable
                                >
                                  <el-option v-for="namespace in namespaces"
                                              :key="namespace.value"
                                              :label="namespace.label"
                                              :value="namespace.value"/>
                                </el-select>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row v-for="(item,index) in pod.labelSelector.matchExpressions" :key="index">
                            <el-col :span="6" >
                              <el-form-item label="键">
                                <el-input v-model="item.key"/>
                              </el-form-item>
                            </el-col>
                            <el-col :span="2">
                              <el-form-item label="运算符">
                                <el-select style="width: 100%;" v-model="item.operator" placeholder="请选择">
                                    <el-option label="包含" value="In"></el-option>
                                    <el-option label="不包含" value="NotIn"></el-option>
                                    <el-option label="等于" value="Exists"></el-option>
                                    <el-option label="不等于" value="DoesNotExist"></el-option>
                                    <el-option label="小于" value="Gt"></el-option>
                                    <el-option label="大于" value="Lt"></el-option>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="6">
                              <el-form-item label="值">
                                <el-input v-model="item.values[0]"/>
                              </el-form-item>
                            </el-col>

                            <el-col :span="3" style="margin-top:30px">
                              <el-button @click="removePodRule(pod,index)" type="danger" plain>删除</el-button>
                            </el-col>
                          </el-row>
                          <el-row>
                            <el-col :span="12">
                              <el-button @click="addPodRule(pod)" type="primary" plain>添加规则</el-button>
                            </el-col>
                          </el-row>
                          <el-row>
                            <el-col :span="12">
                              <el-button @click="removePod(pod,podIndex)" type="danger" plain>删除节点调度</el-button>
                            </el-col>
                          </el-row>
                        </template>
                        <el-button @click="addPod" type="primary" plain>添加节点调度</el-button>
                      </div>
              
                      <div v-show="selectPod === 'podStrategy'  ? true : false ">
                        <H1>扩缩容和升级策略</H1>
                        <el-row :gutter="24" >
                          <el-col :span="8">
                            <el-form-item label="终止宽限期"  >
                              <el-input placeholder="请输入内容" type="number" v-model="initData.spec.template.spec.terminationGracePeriodSeconds" >
                              <template #append>秒</template>
                              </el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </div>

                      <div v-show="selectPod === 'podContext'  ? true : false ">
                        <H1>安全性上下文</H1>
                        <el-row :gutter="24" >
                          <el-col :span="8">
                            <el-form-item label="Pod文件系统组"  >
                              <el-input placeholder="请输入内容" type="number" v-model="initData.spec.template.spec.securityContext.fsGroup" >
                              </el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </div>
                    </div>
                  </div>
                </el-scrollbar>
              </el-tab-pane>
              <el-tab-pane v-for="(container, index) in initData.spec.template.spec.containers"
               :key="index" :label="container.name" >
                <el-scrollbar>
                  <div class="tab-content">
                    <div class="left">
                      <el-tabs :tab-position="'left'" @tab-change="changeSelectTab">
                        <el-tab-pane label="通用" name="containerGeneral" />
                        <el-tab-pane label="健康检查" name="containerCheckHealth"/>
                        <el-tab-pane label="资源" name="containerSource"/>
                        <el-tab-pane label="安全性上下文" name="containerSecurityContext" />
                        <el-tab-pane label="存储" name="containerVolumes"/>
                      </el-tabs>
                    </div>
                    <div class="right">
                      <div v-show="selectTabIndexPods === 'containerGeneral'  ? true : false ">
                        <H1>通用</H1>
                        <el-row :gutter="24" >
                          <el-col :span="8">
                            <el-form-item label="容器名称"  >
                              <el-input placeholder="请输入内容" v-model="container.name" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="2">
                            <el-radio-group v-model="container._init">
                                <el-radio :label=true>初始化容器</el-radio>
                                <el-radio :label=false>标准容器</el-radio>
                            </el-radio-group>
                          </el-col>
                        </el-row>
                        <H1>镜像</H1>
                        <el-row :gutter="24" >
                          <el-col :span="8">
                            <el-form-item label="容器镜像"  >
                              <el-input placeholder="如：nginx:1.17.2" v-model="container.image" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="镜像拉取策略">
                              <el-select v-model="container.imagePullPolicy" style="width: 100%;" placeholder="请选择">
                                <el-option label="每次总是从远程仓库拉取镜像" value="Always"></el-option>
                                <el-option label="优先使用本地镜像" value="ifNotPresent"></el-option>
                                <el-option label="仅使用本地镜像" value="Never"></el-option>
                              </el-select>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="拉取密文">
                              <el-select v-model="initData.spec.template.spec.imagePullSecrets[index].name" style="width: 100%;" placeholder="请选择">
                                <el-option label="harbor" value="harbor-login"></el-option>
                                <el-option label="default" value="default"></el-option>
                              </el-select>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <H1>网络</H1>
                        <el-row :gutter="24" v-for="(port, portIndex) in container?.ports" :key="portIndex">
                          <el-col :span="3">
                            <el-form-item label="Service类型">
                                <el-select
                                  class="search-select"
                                  v-model="port._serviceType"
                                  placeholder="Service类型"
                                  clearable
                                >
                                  <el-option v-for="service in services"
                                            :key="service.value"
                                            :label="service.label"
                                            :value="service.value"/>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="名称">
                                <el-input v-model="port.name" placeholder="请输入名称"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="私有容器端口">
                                <el-input type="number" v-model="port.containerPort" placeholder="如：8080"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="2">
                              <el-form-item label="协议" >
                                <el-select
                                  class="search-select"
                                  v-model="port.protocol"
                                  placeholder="协议"
                                  clearable
                                >
                                  <el-option v-for="protocol in protocols"
                                            :key="protocol.value"
                                            :label="protocol.label"
                                            :value="protocol.value"/>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="公共主机端口">
                                <el-input type="number" v-model="port.hostPort" placeholder="如：80"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="主机ip">
                                <el-input v-model="port.hostIP" placeholder="如：1.1.1.1"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="操作" >
                              <el-button @click="removePort(index,portIndex)" type="danger">删除</el-button>
                              </el-form-item>
                            </el-col>
                        </el-row>
                        <el-button @click="addPort(index)" type="primary" plain>添加端口或service</el-button>
                        <H1>命令</H1>
                        <el-row :gutter="24" >
                          <el-col :span="7">
                            <el-form-item label="命令"  >
                              <el-input placeholder="如：/bin/sh" v-model="container.command" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="7">
                            <el-form-item label="参数"  >
                              <el-input placeholder="如：/usr/sbin/httpd -f" v-model="container.args" />
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <el-row :gutter="24">
                          <el-col :span="7">
                            <el-form-item label="工作目录"  >
                              <el-input placeholder="如：/myapp" v-model="container.workingDir" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="7">
                            <el-form-item label="标准输入">
                              <el-select v-model="container._commandIO" style="width: 100%;" placeholder="请选择">
                                <el-option label="NO" value="NO"></el-option>
                                <el-option label="ONCE" value="ONCE"></el-option>
                                <el-option label="YES" value="YES"></el-option>
                              </el-select>
                            </el-form-item>
                          </el-col>
                          <el-col :span="2" v-if="container._commandIO != 'NO'">
                            <el-form-item label="TTY" >
                              <el-checkbox v-model="container.tty" />
                            </el-form-item>
                          </el-col>
                        </el-row>

                        <H1>环境变量</H1>
                        <el-row :gutter="24" v-for="(env, envIndex) in container?.env" :key="envIndex">
                          <el-col :span="3">
                            <el-form-item label="类型" >
                                <el-select
                                  class="search-select"
                                  placeholder="类型"
                                  v-model="env.item"
                                  @change="envSelectHandle(env)"
                                  clearable
                                >
                                  <el-option v-for="envType in envTypes"
                                            :key="envType.value"
                                            :label="envType.label"
                                            :value="envType.value"/>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <template v-if="env.item == 'Key/Value'">
                              <el-col :span="5">
                                <el-form-item label="名称">
                                  <el-input v-model="env.name" placeholder="请输入名称"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="值">
                                  <el-input v-model="env.value" placeholder="value"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item style="padding-top:30px" >
                                  <el-button @click="removeEnv(index,envIndex)" type="danger">删除</el-button>
                                </el-form-item>
                              </el-col>
                            </template>
                            
                            <template v-if="env.item == 'SecretKey'">
                              <el-col :span="5">
                                <el-form-item label="变量名">
                                  <el-input v-model="env.name" placeholder="例如：FOO"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="密文">
                                  <el-select
                                    class="search-select"
                                    v-model="env.valueFrom.secretKeyRef.name"
                                    placeholder="请选择密文"
                                    clearable
                                  >
                                    <el-option v-for="envSecret in envSecrets"
                                              :key="envSecret.value"
                                              :label="envSecret.label"
                                              :value="envSecret.value"/>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="键">
                                  <el-select
                                    class="search-select"
                                    v-model="env.valueFrom.secretKeyRef.key"
                                    placeholder="请选择键名"
                                    clearable
                                  >
                                    <el-option v-for="envSecretKey in envSecretKeys"
                                              :key="envSecretKey.value"
                                              :label="envSecretKey.label"
                                              :value="envSecretKey.value"/>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item style="padding-top:30px" >
                                <el-button @click="removeEnv(index,envIndex)" type="danger">删除</el-button>
                                </el-form-item>
                              </el-col>
                            </template>

                            <template v-if="env.item == 'Resource'">
                              <el-col :span="5">
                                <el-form-item label="变量名">
                                  <el-input v-model="env.name" placeholder="例如：FOO"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="容器名称">
                                  <el-input v-model="env.valueFrom.resourceFieldRef.containerName" placeholder="例如：my-container"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="键">
                                  <el-select
                                    class="search-select"
                                    v-model="env.valueFrom.resourceFieldRef.resource"
                                    placeholder="请选择键名"
                                    clearable
                                  >
                                    <el-option v-for="envSecretKey in envSecretKeys"
                                              :key="envSecretKey.value"
                                              :label="envSecretKey.label"
                                              :value="envSecretKey.value"/>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item style="padding-top:30px" >
                                <el-button @click="removeEnv(index,envIndex)" type="danger">删除</el-button>
                                </el-form-item>
                              </el-col>
                            </template>

                            <template v-if="env.item == 'ConfigMapKey'">
                              <el-col :span="5">
                                <el-form-item label="变量名">
                                  <el-input v-model="env.name" placeholder="例如：FOO"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="ConfigMap">
                                  <el-select
                                    class="search-select"
                                    v-model="env.valueFrom.configMapKeyRef.name"
                                    placeholder="请选择ConfigMap"
                                    clearable
                                  >
                                    <el-option v-for="envSecret in envSecrets"
                                              :key="envSecret.value"
                                              :label="envSecret.label"
                                              :value="envSecret.value"/>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="键">
                                  <el-select
                                    class="search-select"
                                    v-model="env.valueFrom.configMapKeyRef.key"
                                    placeholder="请选择键名"
                                    clearable
                                  >
                                    <el-option v-for="envSecretKey in envSecretKeys"
                                              :key="envSecretKey.value"
                                              :label="envSecretKey.label"
                                              :value="envSecretKey.value"/>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item style="padding-top:30px" >
                                <el-button @click="removeEnv(index,envIndex)" type="danger">删除</el-button>
                                </el-form-item>
                              </el-col>
                            </template>

                            <template v-if="env.item == 'PodField'">
                              <el-col :span="5">
                                <el-form-item label="变量名">
                                  <el-input v-model="env.name" placeholder="例如：FOO"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="键">
                                  <el-input v-model="env.valueFrom.fieldRef.fieldPath" placeholder="例如：metadata.labels[<KEY>]"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item style="padding-top:30px" >
                                <el-button @click="removeEnv(index,envIndex)" type="danger">删除</el-button>
                                </el-form-item>
                              </el-col>
                            </template>
                        </el-row>
                        <el-button @click="addEnv(container)" type="primary" plain>添加环境变量</el-button>
                        <H1>Service Account 名称</H1>
                        <el-row :gutter="24" >
                          <el-col :span="8">
                            <el-form-item label="Service Account 名称" >
                              <el-select
                                class="search-select"
                                v-model="initData.spec.template.spec.serviceAccountName"
                                placeholder="请选择名称"
                                clearable
                              >
                                <el-option v-for="serviceAccountName in serviceAccountNames"
                                          :key="serviceAccountName.value"
                                          :label="serviceAccountName.label"
                                          :value="serviceAccountName.value"/>
                              </el-select>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <H1>生命周期管理</H1>
                        {{ container.lifecycle.postStart }}
                        <el-row :gutter="24" >
                          <el-col :span="24">
                            <el-form-item label="启动后动作"  >
                              <el-radio-group v-model="container.lifecycle.postStart.item">
                                <el-radio-button
                                  v-for="lifeCycle in lifeCycles"
                                  :key="lifeCycle.value"
                                  :label="lifeCycle.value"
                                  @change="changeLifeCycle(container.lifecycle.postStart)"
                                >{{lifeCycle.label}}</el-radio-button>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <template v-if="container?.lifecycle?.postStart?.item == 'httpGet' &&
                                  container?.lifecycle?.postStart?.httpGet != undefined">
                          <el-row :gutter="24">
                            <el-col :span="4">
                              <el-form-item label="主机IP"  >
                                <el-input placeholder="如：192.168.1.1" v-model="container.lifecycle.postStart.httpGet.host" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="4">
                              <el-form-item label="路径"  >
                                <el-input placeholder="如：/myapp" v-model="container.lifecycle.postStart.httpGet.path" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="4">
                              <el-form-item label="端口"  >
                                <el-input placeholder="如：/myapp" v-model="container.lifecycle.postStart.httpGet.port" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="4">
                              <el-form-item label="Scheme"  >
                                <el-input placeholder="如：/myapp" v-model="container.lifecycle.postStart.httpGet.scheme" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        <template v-if="container?.lifecycle?.postStart?.item == 'exec' &&
                                  container?.lifecycle?.postStart?.exec != undefined">
                          <el-row :gutter="24">
                            <el-col :span="24">
                              <el-form-item label="指令"  >
                                <el-input type="textarea" placeholder="如：192.168.1.1" v-model="container.lifecycle.postStart.exec.command" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        <template v-if="container?.lifecycle?.postStart?.item == 'tcpScoket' &&
                                  container?.lifecycle?.postStart?.tcpScoket != undefined">
                          <el-row :gutter="24">
                            <el-col :span="4">
                              <el-form-item label="端口"  >
                                <el-input  placeholder="如：80" v-model="container.lifecycle.postStart.tcpScoket.port" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>

                        <el-row :gutter="24" >
                          <el-col :span="24">
                            <el-form-item label="终止前动作"  >
                              <el-radio-group v-model="container.lifecycle.preStop.item">
                                <el-radio-button
                                  v-for="lifeCycle in lifeCycles"
                                  :key="lifeCycle.value"
                                  :label="lifeCycle.value"
                                  @change="changeLifeCycle(container.lifecycle.preStop)"
                                >{{lifeCycle.label}}</el-radio-button>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <template v-if="container?.lifecycle?.preStop?.item == 'httpGet' &&
                                  container?.lifecycle?.preStop?.httpGet != undefined">
                          <el-row :gutter="24">
                            <el-col :span="6">
                              <el-form-item label="主机IP"  >
                                <el-input placeholder="如：192.168.1.1" v-model="container.lifecycle.preStop.httpGet.host" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="6">
                              <el-form-item label="路径"  >
                                <el-input placeholder="如：/myapp" v-model="container.lifecycle.preStop.httpGet.path" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="6">
                              <el-form-item label="端口"  >
                                <el-input placeholder="如：8080" v-model="container.lifecycle.preStop.httpGet.port" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>

                        <template v-if="container?.lifecycle?.preStop?.item == 'exec' &&
                                  container?.lifecycle?.preStop?.exec != undefined">
                          <el-row :gutter="24">
                            <el-col :span="24">
                              <el-form-item label="指令" >
                                <el-input type="textarea" placeholder="如：sh" v-model="container.lifecycle.preStop.exec.command" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>

                        <template v-if="container?.lifecycle?.preStop?.item == 'tcpScoket' &&
                                  container?.lifecycle?.preStop?.tcpScoket != undefined">
                          <el-row :gutter="24">
                            <el-col :span="4">
                              <el-form-item label="端口"  >
                                <el-input  placeholder="如：80" v-model="container.lifecycle.preStop.tcpScoket.port" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>

                      </div>
                      <div v-show="selectTabIndexPods === 'containerCheckHealth'  ? true : false ">
                        <H1>就绪检查</H1>
                        <el-row :gutter="24">
                          <el-col :span="24">
                            <el-form-item label="类型"  >
                              <el-radio-group v-model="container._checkHealthItem.readinessProbe">
                                <el-radio-button
                                  v-for="checkHealth in checkHealthTypes"
                                  :key="checkHealth.value"
                                  :label="checkHealth.value"
                                  @change="changeReadinessProbe(container)"
                                >{{checkHealth.label}}</el-radio-button>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        
                        <div v-if="container?._checkHealthItem.readinessProbe == 'HTTP' &&
                                container?.readinessProbe?.httpGet != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.readinessProbe.httpGet.port" placeholder="例如：" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="请求路径" >
                                <el-input v-model="container.readinessProbe.httpGet.path" placeholder="例如：/my-project" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.readinessProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.readinessProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.readinessProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.readinessProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.readinessProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>

                        <div v-if="container?._checkHealthItem.readinessProbe == 'HTTPS'  &&
                                container?.readinessProbe?.httpGet != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.readinessProbe.httpGet.port" placeholder="例如：" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="请求路径" >
                                <el-input v-model="container.readinessProbe.httpGet.path" placeholder="例如：/my-project" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.readinessProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.readinessProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.readinessProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.readinessProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.readinessProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>

                        <div v-if="container?._checkHealthItem.readinessProbe == 'tcpSocket'  &&
                                container?.readinessProbe?.tcpSocket != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.readinessProbe.tcpSocket.port" placeholder="例如：80" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.readinessProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.readinessProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.readinessProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.readinessProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.readinessProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>
                        <H1>存活检查</H1>
                        <el-row :gutter="24">
                          <el-col :span="24">
                            <el-form-item label="类型"  >
                              <el-radio-group v-model="container._checkHealthItem.livenessProbe">
                                <el-radio-button
                                  v-for="checkHealth in checkHealthTypes"
                                  :key="checkHealth.value"
                                  :label="checkHealth.value"
                                  @change="changeLivenessProbe(container)"
                                >{{checkHealth.label}}</el-radio-button>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <div v-if="container?._checkHealthItem.livenessProbe == 'HTTP' &&
                                container?.livenessProbe?.httpGet != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.livenessProbe.httpGet.port" placeholder="例如：" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="请求路径" >
                                <el-input v-model="container.livenessProbe.httpGet.path" placeholder="例如：/my-project" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.livenessProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.livenessProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.livenessProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.livenessProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.livenessProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>

                        <div v-if="container?._checkHealthItem.livenessProbe == 'HTTPS'  &&
                                container?.livenessProbe?.httpGet != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.livenessProbe.httpGet.port" placeholder="例如：" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="请求路径" >
                                <el-input v-model="container.livenessProbe.httpGet.path" placeholder="例如：/my-project" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.livenessProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.livenessProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.livenessProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.livenessProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.livenessProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>

                        <div v-if="container?._checkHealthItem.livenessProbe == 'tcpSocket'  &&
                                container?.livenessProbe?.tcpSocket != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.livenessProbe.tcpSocket.port" placeholder="例如：80" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.livenessProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.livenessProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.livenessProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.livenessProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.livenessProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>

                        <H1>启动检查</H1>
                        <el-row :gutter="24">
                          <el-col :span="24">
                            <el-form-item label="类型"  >
                              <el-radio-group v-model="container._checkHealthItem.startupProbe">
                                <el-radio-button
                                  v-for="checkHealth in checkHealthTypes"
                                  :key="checkHealth.value"
                                  :label="checkHealth.value"
                                  @change="changeStartupProbe(container)"
                                >{{checkHealth.label}}</el-radio-button>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <div v-if="container?._checkHealthItem.startupProbe == 'HTTP'  &&
                                container?.startupProbe?.httpGet != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.startupProbe.httpGet.port" placeholder="例如：" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="请求路径" >
                                <el-input v-model="container.startupProbe.httpGet.path" placeholder="例如：/my-project" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.startupProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.startupProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.startupProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.startupProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.startupProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>

                        <div v-if="container?._checkHealthItem.startupProbe == 'HTTPS'  &&
                                container?.startupProbe?.httpGet != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.startupProbe.httpGet.port" placeholder="例如：" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="请求路径" >
                                <el-input v-model="container.startupProbe.httpGet.path" placeholder="例如：/my-project" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.startupProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.startupProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.startupProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.startupProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.startupProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>

                        <div v-if="container?._checkHealthItem.startupProbe == 'tcpSocket'  &&
                                container?.startupProbe?.tcpSocket != undefined">
                          <el-row :gutter="12" >
                            <el-col :span="5">
                              <el-form-item label="检查端口" >
                                  <el-input type="number" v-model="container.startupProbe.tcpSocket.port" placeholder="例如：80" />
                                  <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="12">
                            <el-col :span="3">
                              <el-form-item label="检查间隔" >
                                <el-input type="number" v-model="container.startupProbe.periodSeconds" placeholder="请输入检查间隔" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="初始延迟" >
                                <el-input type="number" v-model="container.startupProbe.initialDelaySeconds" placeholder="请输入初始延迟" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="超时" >
                                <el-input type="number" v-model="container.startupProbe.timeoutSeconds" placeholder="请输入超时时间" />
                                <template #append>秒</template>
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="成功阈值" >
                                <el-input type="number" v-model="container.startupProbe.successThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="5">
                              <el-form-item label="失败阈值" >
                                <el-input type="number" v-model="container.startupProbe.failureThreshold" placeholder="例如：1" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>

                      </div>

                      <div v-show="selectTabIndexPods === 'containerSource'  ? true : false ">
                        <el-row :gutter="24">
                          <el-col :span="8">
                            <el-form-item label="CPU预留" >
                                <el-input v-model="container.resources.requests.cpu" placeholder="例如：1.5" type="number">
                                  <template #append>CPU</template>
                                </el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="内存预留" >
                                <el-input v-model="container.resources.requests.memory" placeholder="例如：128" type="number">
                                  <template #append>MiB</template>
                                </el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="NVIDIA GPU预留" >
                                <el-input v-model="container.resources.requests['nvidia.com/gpu']" placeholder="例如：1" type="number">
                                  <template #append>GPU</template>
                                </el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="CPU限制" >
                                <el-input v-model="container.resources.limits.cpu" placeholder="例如：1.5" type="number">
                                  <template #append>CPU</template>
                                </el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="内存限制" >
                                <el-input v-model="container.resources.limits.memory" placeholder="例如：128" type="number">
                                  <template #append>MiB</template>
                                </el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="8">
                            <el-form-item label="NVIDIA GPU限制" >
                                <el-input v-model="container.resources.limits['nvidia.com/gpu']" placeholder="例如：1" type="number">
                                  <template #append>GPU</template>
                                </el-input>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </div>
                      <div v-show="selectTabIndexPods === 'containerSecurityContext'  ? true : false ">
                        <el-row :gutter="24">
                          <el-col :span="12">
                            <el-form-item label="Privileged" >
                              <el-radio-group v-model="container.securityContext.privileged">
                                <el-radio :label="false" >否</el-radio>
                                <el-radio :label="true" >是：容器可以完全访问主机</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="允许权限提升" >
                              <el-radio-group v-model="container.securityContext.allowPrivilegeEscalation">
                                <el-radio :label="false">否</el-radio>
                                <el-radio :label="true">是：容器可以获得比其父进程更多的权限</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="以非Root方式运行" >
                              <el-radio-group v-model="container.securityContext.runAsNonRoot">
                                <el-radio :label="false">否</el-radio>
                                <el-radio :label="true">是：容器可以完全访问主机</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="只读根文件系统" >
                              <el-radio-group v-model="container.securityContext.readOnlyRootFilesystem">
                                <el-radio :label="false">否</el-radio>
                                <el-radio :label="true">是：容器可以完全访问主机</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="以用户ID运行" >
                              <el-input v-model="container.securityContext.runAsUser" ></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="添加Capabilities" >
                              <el-select
                                  class="search-select"
                                  v-model="container.securityContext.capabilities.add"
                                  placeholder="请选择"
                                  multiple
                                  clearable
                                >
                                <el-option v-for="capabilitie in capabilities"
                                            :key="capabilitie.value"
                                            :label="capabilitie.label"
                                            :value="capabilitie.value"/>
                              </el-select>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="移除Capabilities" >
                              <el-select
                                  class="search-select"
                                  v-model="container.securityContext.capabilities.drop"
                                  placeholder="请选择"
                                  multiple
                                  clearable
                                >
                                <el-option v-for="capabilitie in capabilities"
                                            :key="capabilitie.value"
                                            :label="capabilitie.label"
                                            :value="capabilitie.value"/>
                              </el-select>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </div>
                      <div v-show="selectTabIndexPods === 'containerVolumes'  ? true : false ">
                      
                      </div>
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
  <yaml-editor :copy-data="copyData" v-model:visible="isShowYamlEditor" @setValue="setValue"></yaml-editor>
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

<script setup lang="ts">
// @ts-nocheck

import YamlEditor from '@/views/demo/utils/yamlEditor.vue'
import type { FormInstance } from 'element-plus'
import _ from 'lodash';
const ruleFormRef = ref<FormInstance>()
const copyData = ref({})
const initData = ref({
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
      "name": undefined,
      "annotations": {},
      "labels": {},
      "namespace": "default",
    },
    "spec": {
      "selector": {},
      "ports":[],
      "type":"ClusterIP",
      "sessionAffinity": undefined,
      "sessionAffinityConfig": {
        "clientIP":{
          "timeoutSeconds": undefined
        }
      }
    },
    //外部操作参数
    "option":{
      // 标签 & 注解统一设置对象
      "labelAnnotation":{
        "service":{
          "labels":[],
          "annotations":[
            {
              "key":"field.cattle.io/description",
              "value":undefined
            }
          ]
        },
        "selector":{
          "labels":[]
        }
      },
      // 命名空间下拉列表
      "namespaces":[],
      "pluginInstance":[],
      "instanceCode":undefined,
      // 记录当前点击的左侧标签位置
      "curPoint":"servicePort",
      "sessionRetention":false,
      // 是否显示yaml弹窗
      "isShowYamlEditor":false,
      "namespaceId":undefined,
      "selectTabIndex":"Service"
    }
  })

import { Select } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import yaml from 'js-yaml'
import { addService,nameSpaceList,nameIsExist,queryDetail} from "@/api/kubernetes/service"
import { useRouter } from "vue-router";
import { queryInstanceInfoByPluginCode } from "@/api/common-api"

const $route = useRouter();
  const editYaml = () => {
    initData.value.option.isShowYamlEditor = true
    generateYamlJson()

  }

  // 生成yaml所需Json
  const generateYamlJson = ()=>{
    // 处理标签 & 注解
    labelAnnotationHandle()

    copyData.value = _.cloneDeep(initData.value)
    delete copyData.value.option

    console.log(copyData.value)
  }


  // 处理标签 & 注解
  const labelAnnotationHandle = ()=>{
    labelAnnotation2Json(initData.value.option.labelAnnotation.service.labels , initData.value.metadata.labels)
    labelAnnotation2Json(initData.value.option.labelAnnotation.selector.labels , initData.value.spec.selector)
    labelAnnotation2Json(initData.value.option.labelAnnotation.service.annotations , initData.value.metadata.annotations)

    if(!initData.value.metadata.labels.length){
      Object.assign(initData.value.metadata.labels,{"app":initData.value.metadata.name})
    }
  }

  // 标签 & 注解
  const labelAnnotation2Json = (formValue,yamlValue)=>{
    if(!formValue  || !yamlValue ){
      return
    }
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
    const optionValues = _.cloneDeep(initData.value.option)
    Object.assign(data,{option:optionValues})
    initData.value = _.cloneDeep(data)
    copyData.value = {}

    // 设置标签 & 注解
    reverseLabelAnnotationHandle()
  }

  // 标签 & 注解从yaml逆向回来
  const reverseLabelAnnotationHandle = ()=>{

    delete initData.value.option.labelAnnotation
    const cleanObj = {
      service:{
        labels:[],
        annotations:[
          {
            key:"field.cattle.io/description",
            value:undefined
          }
        ]
      },
      selector:{
        labels:[]
      }
    }
    Object.assign(initData.value.option,{labelAnnotation:cleanObj})
    json2labelAnnotation(initData.value.option.labelAnnotation.service.labels , initData.value.metadata.labels)
    json2labelAnnotation(initData.value.option.labelAnnotation.selector.labels , initData.value.spec.selector)
    json2labelAnnotation(initData.value.option.labelAnnotation.service.annotations , initData.value.metadata.annotations)

  }

  // 标签 & 注解
  const json2labelAnnotation = (values,yamlValues)=>{
    if(!values  || !yamlValues ){
      return
    }

    const mapObject=new Map(Object.entries(yamlValues))
    for (const k of mapObject.keys()){
      if(k == "field.cattle.io/description"){
        values[0].value = mapObject.get(k)
      }else{
        values.push({
          key:k,
          value:mapObject.get(k)
        })
      }
    }
  }

  const protocols = ref([{
    "label":"TCP",
    "value":"TCP"
  },
    {
      "label":"UDP",
      "value":"UDP"
    }])

  // 添加端口
  const addPort = () =>{
    const port = {
      'name': undefined,
      'targetPort': undefined,
      'protocol': "TCP",
      'port': undefined,
      'nodePort': undefined,
    }
    initData.value.spec.ports.push(port)
  }

  // 删除端口
  const removePort = (portIndex) =>{
    if(initData.value.spec.ports.length <= 1){
      ElMessage({
        type: 'warning',
        message: '端口设置不能少于1个',
      })
      return;
    }
    initData.value.spec.ports.splice(portIndex, 1);
  }

  // 修改会话保持
  const changeSessionRetention = (item) =>{
    if(!item){
      initData.value.spec.sessionAffinity = undefined
      initData.value.spec.sessionAffinityConfig.clientIP.timeoutSeconds = undefined
    }
  }

  // 修改当前选中标签
  const changeSelectTab = (item) =>{
    initData.value.option.curPoint = item
  }

  // 添加选择器
  const addSelector = () =>{
    initData.value.option.labelAnnotation.selector.labels.push({key:"", value:""})
  }

  // 删除选择器
  const removeSelector = (labelIndex) =>{
    if(initData.value.option.labelAnnotation.selector.labels.length <= 1){
      ElMessage({
        type: 'warning',
        message: '选择器设置不能少于1个',
      })
      return;
    }
    initData.value.option.labelAnnotation.selector.labels.splice(labelIndex, 1);
  }

  // 添加标签
  const addLabel = () =>{
    initData.value.option.labelAnnotation.service.labels.push({key:"", value:""})
  }

  // 删除标签
  const removeLabel = (labelIndex) =>{
    initData.value.option.labelAnnotation.service.labels.splice(labelIndex, 1);
  }

  // 添加注解
  const addAnnotations = () =>{
    initData.value.option.labelAnnotation.service.annotations.push({key:"", value:""})
  }

  // 删除注解
  const removeAnnotations = (labelIndex) =>{
    initData.value.option.labelAnnotation.service.annotations.splice(labelIndex, 1);
  }

  const changeService = ()=>{
    initData.value.spec.ports = []
  }

  const cancel = ()=>{
    $route.push({path : "/kubernetes/service/list/index"})
  }

  const saveData = () => {
    ruleFormRef.value.validate((valid,field) => {
      console.log(field)
      if (valid) {
        generateYamlJson()
        const nameSpaceId = initData.value.option.namespaceId
        const data =  _.cloneDeep(copyData.value)
        data.option = undefined
        const saveData = {
          "id": $route.currentRoute.value.query.id,
          "instanceCode": initData.value.option.instanceCode,
          "namespace": initData.value.metadata.namespace,
          "nameSpaceId": nameSpaceId,
          "name": initData.value.metadata.name,
          "kind": initData.value.kind,
          "jsonBody": JSON.stringify(yaml.load(yaml.dump(data)))
        }
        addService(saveData).then(res=>{
          if(res.code == 200){
            ElMessage({
                type: 'success',
                message: '保存成功',
            })
            $route.push({path : "/kubernetes/service/list/index"})
          }
        })
     } else {
        ElMessage.error('请填写完整:')
      }
    })
  }
  // 修改命名空间下拉框时修改id
  const changeNameSpace = (name)=>{
    for(const index in initData.value.option.namespaces){
      if(name == initData.value.option.namespaces[index].label){
        initData.value.option.namespaceId = initData.value.option.namespaces[index].value
      }
    }
  }

  const validName = (rule:any,value:any, callback:any)=>{
    if($route.currentRoute.value.query.id != undefined){
      callback()
      return
    }

    nameIsExist(initData.value.option.instanceCode,value).then((res)=>{
        if(res.code == 200){
          if(!res.data){
            callback()
            return
          }else{
            callback(new Error('名称已存在，请确认后修改'));
          }
        }
    })
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
    "metadata.name" : [
      { required: true, message: "名称不能为空", trigger: "blur" },
      { min: 2, max: 20, message: '名称长度必须介于 2 和 20 之间', trigger: 'blur' },
      { pattern: /^[-a-z0-9]*$/, message: '只可以输入小写字母、数字、中划线', trigger: 'blur' },
      { validator: validName , trigger: 'blur' }
    ]
  })

  // 初始化页面
  const initPage = ()=>{
    const id = $route.currentRoute.value.query.id
    if(id != null){
      queryDetail(id).then((res)=>{
        if(res.code == 200){
          setValue(yaml.load(res.data))
        }
      })
    }

    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        const defaultInstanceCode = res?.data[0].instanceCode
        Object.assign(initData.value.option.pluginInstance,res?.data)
        Object.assign(initData.value.option.instanceCode,defaultInstanceCode)

        nameSpaceList(defaultInstanceCode).then((res)=>{
          if(res.code == 200){
            Object.assign(initData.value.option.namespaces,res.data);
            changeNameSpace("default")
          }
        })
      }
    });

    // 添加默认端口
    addPort()
    // 添加默认选择器
    addSelector()

  }

  initPage();

</script>
<template>
  <div class="yamlDemo">
    <el-form :label-position="'top'" label-width="auto" :rules="rules" :model="initData" ref="ruleFormRef">
      <div class="top">
        <yt-card :title="'公共配置'">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="命名空间">
                <el-select v-model="initData.metadata.namespace" style="width: 100%;" placeholder="请选择" @change="changeNameSpace"
                    :disabled="$route.currentRoute.value.query.id != undefined">
                  <el-option v-for="namespace in initData.option.namespaces"
                    :key="namespace.value"
                    :label="namespace.label"
                    :value="namespace.label"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="插件实例" prop="instanceCode">
                <el-select
                  v-model="initData.option.instanceCode"
                  @keyup.enter.native="handleQuery"
                  placeholder="请选择实例"
                  clearable
                  style="width: 240px"
                >
                  <el-option v-for="item in initData.option.pluginInstance"
                            :key="item.pluginCode"
                            :label="item.instanceName"
                            :value="item.instanceCode"/>
                </el-select>
              </el-form-item>  
            </el-col>
            <el-col :span="8">
              <el-form-item label="Service">
                <el-select v-model="initData.spec.type" style="width: 100%;" placeholder="请选择" @change="changeService">
                  <el-option label="ClusterIP" value="ClusterIP"></el-option>
                  <el-option label="NodePort" value="NodePort"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="名称" prop="metadata.name">
                <el-input v-model="initData.metadata.name" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="描述">
                <el-input v-model="initData.option.labelAnnotation.service.annotations[0].value" placeholder="请输入描述内容"></el-input>
              </el-form-item>
            </el-col>

          </el-row>
        </yt-card>
        <yt-card :title="'详细配置'">
          <div class="detail-content">
            <el-tabs
                    v-model="initData.option.selectTabIndex"
                    class="top-tabs"
                    editable
                    type="card"
            >
              <el-tab-pane name="Service" label="Service" closable="false">
                <el-scrollbar>
                  <div class="tab-content">
                    <div class="left">
                      <el-tabs :tab-position="'left'" @tab-change="changeSelectTab" v-model="initData.option.curPoint">
                        <el-tab-pane label="服务端口" name="servicePort" />
                        <el-tab-pane label="会话保持" name="sessionRetention" />
                        <el-tab-pane label="选择器" name="selector" />
                        <el-tab-pane label="标签 & 注释" name="labelAndAnnotation" />
                      </el-tabs>
                    </div>
                    <div class="right">
                      <div v-show="initData.option.curPoint === 'servicePort'  ? true : false ">
                        <H1>服务端口</H1>
                        <el-row :gutter="24" v-for="(port, portIndex) in initData.spec.ports" :key="portIndex">
                          <el-col :span="5">
                            <el-form-item label="名称" :prop="`spec.ports[${portIndex}][name]`" :rules="[
                                { required: true, message: '名称不能为空', trigger: 'blur' },
                                { min: 2, max: 50, message: '名称长度必须介于 2 和 50 之间', trigger: 'blur' }
                              ]">
                              <el-input v-model="port.name" placeholder="请输入名称"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="3">
                            <el-form-item label="监听端口" :prop="`spec.ports[${portIndex}][port]`" :rules="[
                                { required: true, message: '监听端口不能为空', trigger: 'blur' }
                              ]">
                              <el-input-number v-model="port.port" placeholder="如：8080"></el-input-number>
                            </el-form-item>
                          </el-col>
                          <el-col :span="2" v-if="initData.spec.type == 'ClusterIP'">
                            <el-form-item label="协议" >
                              <el-select
                                      class="search-select"
                                      v-model="port.protocol"
                                      placeholder="协议"
                              >
                                <el-option v-for="protocol in protocols"
                                           :key="protocol.value"
                                           :label="protocol.label"
                                           :value="protocol.value"/>
                              </el-select>
                            </el-form-item>
                          </el-col>
                          <el-col :span="3">
                            <el-form-item label="目标端口" :prop="`spec.ports[${portIndex}][targetPort]`" :rules="[
                                { required: true, message: '目标端口不能为空', trigger: 'blur' }
                              ]">
                              <el-input-number  v-model="port.targetPort" placeholder="如：80"></el-input-number>
                            </el-form-item>
                          </el-col>
                          <el-col :span="3" v-if="initData.spec.type == 'NodePort'" :prop="`spec.ports[${portIndex}][nodePort]`" :rules="[
                                { required: true, message: '节点端口不能为空', trigger: 'blur' }
                              ]">
                            <el-form-item label="Node Port">
                              <el-input-number  v-model="port.nodePort" placeholder="如：3000"></el-input-number>
                            </el-form-item>
                          </el-col>
                          <el-col :span="3">
                            <el-form-item label="操作" >
                              <el-button @click="removePort(portIndex)" type="danger">删除</el-button>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <el-button @click="addPort()" type="primary" plain>添加端口</el-button>
                      </div>
                      <div v-show="initData.option.curPoint === 'sessionRetention'  ? true : false ">
                        <H1>会话保持</H1>
                        <el-row :gutter="24" style="margin-top:30px">
                          <el-col :span="8">
                            <el-radio-group v-model="initData.spec.sessionAffinity" @change="changeSessionRetention">
                              <el-radio-button :label=undefined>未配置会话保持</el-radio-button>
                              <el-radio-button label="ClientIP">客户端ip</el-radio-button>
                            </el-radio-group>
                          </el-col>
                        </el-row>
                        <el-row :span="8" v-if="initData.spec.sessionAffinity">
                          <el-form-item label="会话粘滞时间" >
                            <el-input-number  placeholder="请输入数字" v-model="initData.spec.sessionAffinityConfig.clientIP.timeoutSeconds" />
                          </el-form-item>
                        </el-row>
                      </div>
                      <div v-show="initData.option.curPoint === 'selector'  ? true : false ">
                        <H1>选择器</H1>
                        <el-row :gutter="24" v-for="(label,index) in initData.option.labelAnnotation.selector.labels" :key="index" style="margin-top:30px">
                          <el-col :span="6" >
                            <el-form-item label="键" :prop="`option.labelAnnotation.selector.labels[${index}][key]`" :rules="[
                                { required: true, message: '键不能为空', trigger: 'blur' },
                                { min: 2, max: 50, message: '长度必须介于 2 和 50 之间', trigger: 'blur' }
                              ]">
                              <el-input label="键" placeholder="请输入键" v-model="label.key"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="6" >
                            <el-form-item label="值" :prop="`option.labelAnnotation.selector.labels[${index}][value]`" :rules="[
                                { required: true, message: '值不能为空', trigger: 'blur' },
                                { min: 2, max: 50, message: '长度必须介于 2 和 50 之间', trigger: 'blur' }
                              ]">
                              <el-input label="值" placeholder="请输入值" v-model="label.value" ></el-input>
                            </el-form-item>
                          </el-col>
                          <el-button @click="removeSelector(index)" style="margin-top: 30px;" type="danger" >删除标签</el-button>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-button @click="addSelector" type="primary" plain>添加标签</el-button>
                        </el-row>
                      </div>
                      <div v-show="initData.option.curPoint === 'labelAndAnnotation'  ? true : false ">
                        <H1>标签 & 注解</H1>
                        <el-row :gutter="24" v-for="(label,index) in initData.option.labelAnnotation.service.labels" :key="index" style="margin-top:30px">
                          <el-col :span="6" >
                            <el-form-item label="键" >
                              <el-input label="键" placeholder="请输入键" v-model="label.key"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="6" >
                            <el-form-item label="值">
                              <el-input label="值" placeholder="请输入值" v-model="label.value" ></el-input>
                            </el-form-item>
                          </el-col>
                          <el-button style="margin-top:30px" @click="removeLabel(index)" type="danger" >删除标签</el-button>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-button @click="addLabel" type="primary" plain>添加标签</el-button>
                        </el-row>
                        <H1>注解</H1>
                        <el-row :gutter="24" v-for="(annotation,index) in initData.option.labelAnnotation.service.annotations" :key="index" style="margin-top:30px"
                                v-show="annotation.key != 'field.cattle.io/description'">
                          <el-col :span="6" >
                            <el-form-item label="键" >
                              <el-input label="键" placeholder="请输入键" v-model="annotation.key"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col :span="6" >
                            <el-form-item label="值">
                              <el-input label="值" placeholder="请输入值" v-model="annotation.value" ></el-input>
                            </el-form-item>
                          </el-col>
                          <el-button style="margin-top:30px" @click="removeAnnotations(index)"  type="danger">删除注解</el-button>
                        </el-row>
                        <el-row :gutter="24" style="margin-top:10px;margin-left:2px">
                          <el-button @click="addAnnotations" type="primary" plain>添加标签</el-button>
                        </el-row>
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
      <el-button @click="cancel">取消</el-button>
      <el-button @click="editYaml" v-if="$route.currentRoute.value.query.id == undefined">编辑yaml</el-button>
      <el-button @click="viewYaml" v-if="$route.currentRoute.value.query.id != undefined">查看yaml</el-button>
      <el-button type="primary" @click="saveData" v-if="$route.currentRoute.value.query.id == undefined">保存</el-button>
    </yt-bottom-operate>
  </div>
  <yaml-editor :copy-data="copyData" v-model:visible="initData.option.isShowYamlEditor" @setValue="setValue"></yaml-editor>
</template>
<style lang="scss" scoped>
  .detail-content {
    ::v-deep(.el-tabs__new-tab) {
      transform: scale(1.2);
      transform-origin: right;
    }
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
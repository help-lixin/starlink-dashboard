<template>
  <div class="bpmn">
    <div ref="canvasRef" class="canvas"></div>
    <CustomPropertiesPanel
      v-if="bpmnModeler"
      :modeler="bpmnModeler"
      :processInstanceId="processInstanceId"
      :workFlowInstanceLogs="workFlowInstanceLogs"
      :show-position="showPanelPosition"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

// bpmn 相关依赖
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
// 左边工具栏以及编辑节点的样式
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'

import { onMounted, onUnmounted, ref } from 'vue'
import CustomModeler from './customModeler'
import propertiesPanelModule from 'bpmn-js-properties-panel'
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'
import CustomPropertiesPanel from './CustomPropertiesPanel.vue'
import workflowXml from './xmlStr'
import customTranslate from './customTranslate'
import { emitter } from '@/utils/mitt'
import { encode } from 'js-base64'
import { useRoute } from 'vue-router'

import { getProcessInstance, getProcessInstanceLogs } from '@/api/workflow/workflowInstance'
// 当前活跃的节点
const activeElementId = ref(undefined)

const route = useRoute()

const bpmnModeler = ref()
const canvasRef = ref()
const processInstanceId = ref()
const workFlowInstanceId = ref()
const timerPullInstanceLog = ref()
const workFlowInstanceLogs = ref({})
const showPanelPosition = computed(() => {
  return workFlowInstanceLogs.value ? 'bottom' : 'right'
})

// 获取xml
function getXml(cb: any) {
  bpmnModeler.value.saveXML({ format: true }, (err, xml) => cb(err, xml))
}

// 渲染xml
function setDiagram(bpmn: any) {
  // 将字符串转换成图显示出来
  bpmnModeler.value.importXML(bpmn, (err) => {
    if (err) {
      console.error(err)
    } else {
      // 去掉左侧Palette
      const palette = bpmnModeler.value.get('palette')
      palette._container.style.display = 'none'
      bpmnModeler.value.on('commandStack.changed', function () {
        getXml((_err, xml) => console.log(xml))
      })
    }
  })
}

// 初始化
function init() {
  // 将汉化包装成一个模块
  const customTranslateModule = {
    translate: ['value', customTranslate]
  }

  // 建模
  bpmnModeler.value = new CustomModeler({
    container: canvasRef.value,
    additionalModules: [
      // 属性栏
      propertiesPanelModule,
      propertiesProviderModule,
      // 汉化模块
      customTranslateModule
    ],
    moddleExtensions: {
      camunda: camundaModdleDescriptor
    }
  })

	// 先进行一次初始化
	setDiagram(workflowXml)

	// 流程定义内容
	processInstanceId.value = route.params?.processInstnaceId;
	if(processInstanceId.value){
		getProcessInstance(processInstanceId.value)
		  .then((res)=>{
			if(res?.code == 200){
				// 工作流实例id
				workFlowInstanceId.value = res?.data?.processInstanceId
				const processStatus = res?.data?.processStatus

				// 只有当实例状态为:0时,才会开启定时拉取日志
				if(processStatus == 0){
					// 定时任务获取状态
					timerPullInstanceLog.value = setInterval(timerPullInstanceLogFunction,2000);
				}else{
					// 手动拉取一次日志回来
					timerPullInstanceLogFunction()
				}

				const processDefinitionBody = res?.data?.processDefinitionBody
				// 把json转换成xml进行展示
				if (processInstanceId.value) {
					const processDefinitionJson = JSON.parse(processDefinitionBody)
					const processDefinitionXml = jsonToXml(processDefinitionJson)
					setDiagram(processDefinitionXml)
				}// end if
			}
		  })
	}
}

function isNode(element) {
  // 判断元素类型是否为节点
  return (
    element.type === 'bpmn:Task' || // 任务节点
    element.type === 'bpmn:UserTask' || // 用户任务节点
    element.type === 'bpmn:ServiceTask' || // 服务任务节点
    // 其他可能的节点类型...
    false
  ) // 如果有其他类型的节点，添加到此处
}

function updateHighlightFunction() {
  try {
    if (activeElementId.value) {
      const elementRegistry = bpmnModeler.value.get('elementRegistry')
      const elementToSelect = elementRegistry.get(activeElementId.value)
      // 处理一下,同一时间只有一个节点是高亮.
      const canvas = bpmnModeler.value.get('canvas')
      const rootElement = canvas.getRootElement()
      const bpmnElements = rootElement.children
      // 添加高亮样式
      if (elementToSelect?.id) {
        // 先取消所有的高亮
        unAllHighlight()
        
        canvas.addMarker(elementToSelect.id, 'highlight')
      }
    }
  } catch (e) {
    console.log(e, 'err')
  }
}

// json转xml
function jsonToXml(json) {
  // 处理nodes
  function convertNodes(nodes) {
    let xml = ''
    for (const node of nodes) {
      xml += `    <${node.nodeType} id="${node.id}"`

      if (node.name) {
        xml += ` name="${node.name}" `
        xml += ` _name="${node.name}" `
      }

      if (node.plugin) xml += ` plugin="${node.plugin}"`
      if (node.pluginCode) xml += ` pluginCode="${node.pluginCode}"`

      if (node.source) xml += ` sourceRef="${node.source}"`
      if (node.target) xml += ` targetRef="${node.target}"`
      if (node.pluginIcon) xml += ` pluginIcon="${node.pluginIcon}" `

      // 针对JSON参数进行编码,因为,json中有一些数据会影响xml
      // "{\"envCode\":\"common\",\"groupCode\":\"common-group\",\"instanceCode\":\"gitlab-instance-1\",\"projectId\":\"1\",\"branch\":\"v1.0\"}"
      if (node.nodeType === 'serviceTask' && node.params) {
        if (node.params) {
          const base64Params = encode(node.params)
          xml += ` _params="${base64Params}"`
        }
      }

      xml += `>\n`

      if (node.sources && node.sources.length > 0) {
        xml += `      <incoming>${node.sources[0]}</incoming>\n`
      }

      if (node.targets && node.targets.length > 0) {
        xml += `      <outgoing>${node.targets[0]}</outgoing>\n`
      }

      xml += `    </${node.nodeType}>\n`
    }
    return xml
  }

  // 处理BPMNDiagram
  function convertElements(elements) {
    let xml = ''
    for (const element of elements) {
      if (element.type === 'edge') {
        xml += `        <bpmndi:BPMNEdge bpmnElement="${element.ref}" id="${element.id}">
          <di:waypoint x="${element.waypoints[0].x}" y="${element.waypoints[0].y}"/>
          <di:waypoint x="${element.waypoints[1].x}" y="${element.waypoints[1].y}"/>
        </bpmndi:BPMNEdge>\n`
      } else if (element.type === 'shape') {
        xml += `        <bpmndi:BPMNShape bpmnElement="${element.ref}" id="${element.id}">
          <dc:Bounds height="${element.bounds.height}" width="${element.bounds.width}" x="${element.bounds.x}" y="${element.bounds.y}"/>
        </bpmndi:BPMNShape>\n`
      }
    }
    return xml
  }

  // 处理转义字符
  function escapeXml(string) {
    return string.replace(/[<>&"']/g, (match) => {
      switch (match) {
        case '<':
          return '&lt;'
        case '>':
          return '&gt;'
        case '&':
          return '&amp;'
        case '"':
          return '&quot;'
        case "'":
          return '&apos;'
        default:
          return match
      }
    })
  }

  // 最终期望的xml
  let xml = `<definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
	xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
	xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
	xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
	xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
	targetNamespace="http://camunda.org/schema/1.0/bpmn"
	xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="${json.id}" isExecutable="true" name="${json.name}">
    ${convertNodes(json.nodes)}
  </process>
	<bpmndi:BPMNDiagram id="${json.diagram.id}">
      <bpmndi:BPMNPlane bpmnElement="${json.id}" id="${json.diagram.plane.id}">
        ${convertElements(json.diagram.plane.elements)}
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
</definitions>`
  return xml
}

// 定时拉取实例日志
function timerPullInstanceLogFunction() {
  if (workFlowInstanceId.value) {
    // 获取流程实例的日志信息
    getProcessInstanceLogs(workFlowInstanceId.value).then((res) => {
      if (res?.code == 200 && res.data) {
        const logs = res.data
        for (let i = 0; i < logs.length; i++) {
          const nodeId = logs[i].nodeId
          workFlowInstanceLogs.value[nodeId] = logs[i].nodeLog
        }
      }
    })
  }
}

function cancelPullLog(){
	// 流水线完成之后,取消定时任务
	clearInterval(timerPullInstanceLog.value)
}


onMounted(() => {
  // 1. 订阅事件
  emitter.on('pipeline-active-node', (data) => {
    if (data?.body) {
      const bodyObject = JSON.parse(data.body)
      const businessId = bodyObject?.businessId
      const nodeId = bodyObject?.nodeId

      if (nodeId && businessId && processInstanceId.value == businessId) {
        activeElementId.value = nodeId
        // 高亮展示
        updateHighlightFunction()
      }
    }
  })

	// pipeline-complete
	emitter.on("pipeline-complete",(data)=>{
		if(data?.body){
			const bodyObject = JSON.parse(data.body)
			const businessId = bodyObject?.businessId

			if(businessId && ( processInstanceId.value == businessId ) ){
				// 1.延迟10秒后,关闭定时任务
				setTimeout(cancelPullLog,1000 * 30)
        
        // 2. 取消所有的高亮
        unAllHighlight()
			}
		}
	});

  // 2. 初始化BPMNJS
  init()
})

function unAllHighlight(){
  try {
    const canvas = bpmnModeler.value.get('canvas')
    const rootElement = canvas.getRootElement()
    const bpmnElements = rootElement.children
    const nodes = bpmnElements.filter((element) => isNode(element))
    // 先取消所有的高亮
    nodes.forEach((row) => canvas.removeMarker(row.id, 'highlight'))
  } catch (e) {
    console.log(e, 'err')
  } // end catch
}

onUnmounted(() => {
  // pipeline-active-node
  emitter.off('pipeline-active-node')
  clearInterval(timerPullInstanceLog.value)
})
</script>
<style lang="scss">
/* 定义动画 */
@keyframes taskAnimation {
  0% {
    stroke-opacity: 0;
  }
  50% {
    stroke-opacity: 1;
  }
  100% {
    stroke-opacity: 0;
  }
}

//高亮节点
.highlight {
  .djs-hit {
    stroke: #f65d68 !important;
    stroke-width: 4px !important;
    animation: taskAnimation 2s infinite;
    stroke-dasharray: 5, 5;
    rx: 10;
    ry: 10;
  }

  .djs-visual {
    text {
      //fill: #1fbe07 !important;
    }
  }
}
</style>
<style scoped lang="scss">
.bpmn {
  width: 100%;
  display: flex;
  height: 100%;
  position: relative;

  .canvas {
    height: 100%;
    flex: 1;
  }

  .action {
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex;
  }
}
</style>

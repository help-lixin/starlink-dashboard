<template>
	<div class="bpmn">
		<div ref="canvasRef" class="canvas"></div>
		<CustomPropertiesPanel v-if="bpmnModeler" :modeler="bpmnModeler" />
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

import { ref, onMounted } from 'vue'
import CustomModeler from './customModeler'
import propertiesPanelModule from 'bpmn-js-properties-panel'
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'
import CustomPropertiesPanel from './CustomPropertiesPanel.vue'
import workflowXml from './xmlStr'
import customTranslate from './customTranslate'


import { encode, decode } from 'js-base64';

import {  useRoute } from "vue-router";
import { getProcessDefinition } from '@/api/workflow/workflowInstance'
const route = useRoute();

const bpmnModeler = ref()
const canvasRef = ref()

// 获取xml
function getXml(cb: any) {
	bpmnModeler.value.saveXML({ format: true }, (err, xml) => cb(err, xml))
}

// 渲染xml
function setDiagram(bpmn: any) {
	// 将字符串转换成图显示出来
	bpmnModeler.value.importXML(bpmn, err => {
		if (err) {
			console.error(err)
		} else {
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
		translate: ['value', customTranslate],
	}

	// 建模
	bpmnModeler.value = new CustomModeler({
		container: canvasRef.value,
		additionalModules: [
			// 属性栏
			propertiesPanelModule,
			propertiesProviderModule,
			// 汉化模块
			customTranslateModule,
		],
		moddleExtensions: {
			camunda: camundaModdleDescriptor,
		},
	})

	// 先进行一次初始化
	setDiagram(workflowXml)

	// 流程定义内容
	const params = route.params;
	if(params?.processInstnaceId){
		getProcessDefinition(params.processInstnaceId)
		  .then((res)=>{
			if(res?.code == 200){
				const processDefinitionBody = res?.data?.processDefinitionBody;
				// 把json转换成xml进行展示
				if (processDefinitionBody) {
					const processDefinitionJson = JSON.parse(processDefinitionBody)
					const processDefinitionXml = jsonToXml(processDefinitionJson)
					setDiagram(processDefinitionXml)
					// 定时任务获取状态

				}
			}
		  })
	}
}

// xml转json
function xmlToJson(xmlString) {
	const NAMESPACE_BPMN = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
	const NAMESPACE_BPMNDI = 'http://www.omg.org/spec/BPMN/20100524/DI'
	const NAMESPACE_DDDI = 'http://www.omg.org/spec/DD/20100524/DI'
	const NAMESPACE_DC = 'http://www.omg.org/spec/DD/20100524/DC'

	const parser = new DOMParser()
	const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

	const definitionsNode = xmlDoc.getElementsByTagNameNS(
		NAMESPACE_BPMN,
		'definitions',
	)[0]

	// 获得节点<process>
	const processNode = definitionsNode.getElementsByTagNameNS(
		NAMESPACE_BPMN,
		'process',
	)[0]

	const result = {
		id: processNode.getAttribute('id'),
		name: processNode.getAttribute('name'),
		nodes: [],
		diagram: {
			id: null,
			plane: {
				id: null,
				ref: processNode.getAttribute('id'),
				elements: [],
			},
		},
	}


	// 处理节点
	for (let i = 0; i < processNode.children.length; i++) {
		const el = processNode.children[i]
		const obj = {
			id: el.id,
			nodeType: el.nodeName,
		}

		const name = el.getAttribute('name')
		if (name) obj.name = name

		const source = el.getAttribute('sourceRef')
		if (source) obj.source = source

		const target = el.getAttribute('targetRef')
		if (target) obj.target = target

		const sources = el.getElementsByTagName('incoming')?.[0]?.textContent
		if (sources) obj.sources = [sources]

		const targets = el.getElementsByTagName('outgoing')?.[0]?.textContent
		if (targets) obj.targets = [targets]

		if (el.nodeName === 'serviceTask') {
			obj.nodeType = "serviceTask"
		}

		// 只有serviceTask的情况下才会有plugin属性和pluginCode属性
		const plugin = el.getAttribute('plugin')
		if (plugin) obj.plugin = plugin;

		const pluginCode = el.getAttribute('pluginCode')
		if (pluginCode) obj.pluginCode = pluginCode;

		const params = el.getAttribute('_params')
		if(params) obj.params = decode(params)

		const pluginIcon = el.getAttribute('pluginIcon')
		if(pluginIcon) obj.pluginIcon = pluginIcon

		// 重点
		result.nodes.push(obj);
	}

	const bpmndiDiagramNode = xmlDoc.getElementsByTagNameNS(
		NAMESPACE_BPMNDI,
		'BPMNDiagram',
	)[0]
	if (bpmndiDiagramNode) {
		result.diagram.id = bpmndiDiagramNode.getAttribute('id')

		const bpmndiPlaneNode = bpmndiDiagramNode.getElementsByTagNameNS(
			NAMESPACE_BPMNDI,
			'BPMNPlane',
		)[0]
		if (bpmndiPlaneNode) {
			result.diagram.plane.id = bpmndiPlaneNode.getAttribute('id')

			const bpmndiShapeNodes = bpmndiPlaneNode.getElementsByTagNameNS(
				NAMESPACE_BPMNDI,
				'BPMNShape',
			)
			for (let i = 0; i < bpmndiShapeNodes.length; i++) {
				const bpmndiShapeNode = bpmndiShapeNodes[i]
				const shapeId = bpmndiShapeNode.getAttribute('id')
				const bpmnElement = bpmndiShapeNode.getAttribute('bpmnElement')

				const boundsNode = bpmndiShapeNode.getElementsByTagNameNS(
					NAMESPACE_DC,
					'Bounds',
				)[0]
				if (!boundsNode) continue

				const bounds = {
					x: parseFloat(boundsNode.getAttribute('x')),
					y: parseFloat(boundsNode.getAttribute('y')),
					width: parseFloat(boundsNode.getAttribute('width')),
					height: parseFloat(boundsNode.getAttribute('height')),
				}

				result.diagram.plane.elements.push({
					id: shapeId,
					ref: bpmnElement,
					type: 'shape',
					bounds: bounds,
				})
			}

			const bpmndiEdgeNodes = bpmndiPlaneNode.getElementsByTagNameNS(
				NAMESPACE_BPMNDI,
				'BPMNEdge',
			)
			for (let i = 0; i < bpmndiEdgeNodes.length; i++) {
				const bpmndiEdgeNode = bpmndiEdgeNodes[i]
				const edgeId = bpmndiEdgeNode.getAttribute('id')
				const bpmnElement = bpmndiEdgeNode.getAttribute('bpmnElement')

				const waypointNodes = bpmndiEdgeNode.getElementsByTagNameNS(
					NAMESPACE_DDDI,
					'waypoint',
				)
				const waypoints = []
				for (let j = 0; j < waypointNodes.length; j++) {
					const waypointNode = waypointNodes[j]
					waypoints.push({
						x: parseFloat(waypointNode.getAttribute('x')),
						y: parseFloat(waypointNode.getAttribute('y')),
					})
				}

				result.diagram.plane.elements.push({
					id: edgeId,
					ref: bpmnElement,
					type: 'edge',
					waypoints: waypoints,
				})
			}
		}
	}

	return result
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
			if (node.nodeType === 'serviceTask' && (node.params)) {
				if (node.params) {
					const base64Params = encode(node.params);
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
		return string.replace(/[<>&"']/g, match => {
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


onMounted(() => {
	init()
})

</script>

<style scoped lang="scss">
.bpmn {
	width: 100%;
	display: flex;
  height: 100%;
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

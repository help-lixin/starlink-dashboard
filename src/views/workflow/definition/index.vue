<template>
	<div class="bpmn">
		<div ref="canvasRef" class="canvas"></div>
		<CustomPropertiesPanel v-if="bpmnModeler" :modeler="bpmnModeler" />

		<div class="action">
			<label for="jsonInput">选择json：</label>
			<input id="jsonInput" type="file" />
			<label for="xmlInput">选择xml：</label>
			<input id="xmlInput" type="file" />
			<button @click="getJson">打印当前图的json</button>
		</div>
	</div>
</template>

<script setup>

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

const bpmnModeler = ref()
const canvasRef = ref()

// 获取xml
function getXml(cb) {
	bpmnModeler.value.saveXML({ format: true }, (err, xml) => cb(err, xml))
}

// 渲染xml
function setDiagram(bpmn) {
	// 将字符串转换成图显示出来
	bpmnModeler.value.importXML(bpmn, err => {
		if (err) {
			console.error(err)
		} else {
			// 这里是成功之后的回调, 可以在这里做一系列事情
			// getXml((_err: any, xml: string) => console.log(xml))

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
		// 容器
		container: canvasRef.value,
		//添加控制板
		// propertiesPanel: {
		// 	parent: '#properties-panel',
		// },
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

	setDiagram(workflowXml)
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
			const properties = el.getElementsByTagName('camunda:property')
			let plugin = ''
			for (let j = 0; j < properties.length; j++) {
				const property = properties[j]
				const propertyName = property.getAttribute('name')
				const propertyValue = property.getAttribute('value')
				if (propertyName === 'plugin') {
					plugin = propertyValue
				}
			}
			if (plugin) obj.plugin = plugin
		}

		// 收集所有的属性和属性值,转换成json字符串.
		const excludeAttributeNames = Object.keys(obj).concat(["sourceRef", "targetRef"]);
		const nodeAttributeNames = el.getAttributeNames();
		const nodeOtherAllAttributeNames = nodeAttributeNames.filter((item) => {
			const index = excludeAttributeNames.indexOf(item)
			return index == -1 ? true : false;
		});

		if (nodeOtherAllAttributeNames.length > 0) {
			const params = {}
			for (const attributeName of nodeOtherAllAttributeNames) {
				const attributeValue = el.getAttribute(attributeName);
				params[attributeName] = attributeValue;
			}
			obj.params = JSON.stringify(params)
		}

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

			if (node.name) xml += ` name="${node.name}"`
			if (node.source) xml += ` sourceRef="${node.source}"`
			if (node.target) xml += ` targetRef="${node.target}"`

			xml += `>\n`

			if (node.nodeType === 'serviceTask' && (node.plugin || node.params)) {
				xml += `      <extensionElements>\n`

				if (node.plugin) {
					xml += `        <camunda:property name="plugin" value="${node.plugin}"/>\n`
				}

				if (node.params) {
					xml += `        <camunda:property name="pluginParams" value="${escapeXml(
						node.params,
					)}"/>\n`
				}

				xml += `      </extensionElements>\n`
			}

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
	let xml = `<definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="${generateUniqueId()}" targetNamespace="http://camunda.org/schema/1.0/bpmn" xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
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

function generateUniqueId() {
	return Math.random().toString(36).substr(2, 9)
}

// 读取文件
function readFile(file, callback) {
	const reader = new FileReader()

	reader.onload = function (event) {
		const fileContent = event.target.result
		callback(fileContent)
	}

	reader.onerror = function (event) {
		console.error('Error reading file:', event.target.error)
		callback(null)
	}

	reader.readAsText(file)
}

function handleXmlInput() {
	const input = document.getElementById('xmlInput')
	input.addEventListener('change', function (event) {
		const file = event.target.files[0]
		readFile(file, function (xmlString) {
			if (xmlString) {
				console.log(xmlString)
				setDiagram(xmlString)
				const json = xmlToJson(xmlString)
				console.log(json)
			} else {
				console.log('无法读取文件。')
			}
		})
	})
}

function handleJsonInput() {
	const input = document.getElementById('jsonInput')
	input.addEventListener('change', function (event) {
		const file = event.target.files[0]
		readFile(file, function (json) {
			if (json) {
				console.log(JSON.parse(json))
				const xmlString = jsonToXml(JSON.parse(json))
				console.log(xmlString, 'dsasdasd')
				setDiagram(xmlString)
			} else {
				console.log('无法读取文件。')
			}
		})
	})
}

onMounted(() => {
	init()
	handleXmlInput()
	handleJsonInput()
})

function getJson() {
	getXml((err, xml) => {
		if (!err) {
			console.log(xml)
			const json = xmlToJson(xml)
			console.log(json)
		}
	})
}
</script>

<style scoped lang="scss">
.bpmn {
	width: 100%;
	display: flex;

	.canvas {
		height: 100vh;
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

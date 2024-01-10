// @ts-nocheck  

/**
 * 定义BPMNJB中左侧的工具栏
 */

import { useActionMetasStore } from "@/stores/plugin";
import {STARLINK_SERVICE} from "@/utils/env"

const actionMetasStore = useActionMetasStore();

export default function PaletteProvider(
	palette,
	create,
	elementFactory,
	globalConnect,
	bpmnFactory,
) {
	this.create = create
	this.elementFactory = elementFactory
	this.globalConnect = globalConnect
	this.bpmnFactory = bpmnFactory

	palette.registerProvider(this)
}

PaletteProvider.$inject = [
	'palette',
	'create',
	'elementFactory',
	'globalConnect',
	'bpmnFactory',
]

PaletteProvider.prototype.getPaletteEntries = function (element) {
	const { create, elementFactory, bpmnFactory } = this

	function createTask(attr) {
		return function (event) {
			const businessObject = bpmnFactory.create('bpmn:ServiceTask')
			if (attr) {
				Object.assign(businessObject.$attrs, attr);
			}
			const shape = elementFactory.createShape({
				type: 'bpmn:ServiceTask',
				businessObject,
			})
			create.start(event, shape)
		}
	}

	function createStratEvent() {
		return function (event) {
			const shape = elementFactory.createShape({
				type: 'bpmn:StartEvent',
			})
			create.start(event, shape)
		}
	}

	function createEndEvent() {
		return function (event) {
			const shape = elementFactory.createShape({
				type: 'bpmn:EndEvent',
			})
			create.start(event, shape)
		}
	}

	function createGateway() {
		return function (event) {
			const shape = elementFactory.createShape({
				type: 'bpmn:ExclusiveGateway',
			})
			create.start(event, shape)
		}
	}

	const paletteObj = {
		'create.start-event': {
			group: 'start',
			className: 'bpmn-icon-start-event-none',
			title: '创建开始节点',
			action: {
				dragstart: createStratEvent(),
				click: createStratEvent(),
			},
		},
		// 'create.lindaidai-task': {
		// 	group: 'task',
		// 	className: 'bpmn-icon-service-task',
		// 	title: '创建一个类型为service-task的任务节点',
		// 	action: {
		// 		dragstart: createTask({}),
		// 		click: createTask({}),
		// 	},
		// },
		'create.end-event': {
			group: 'end',
			className: 'bpmn-icon-end-event-none',
			title: '创建结束节点',
			action: {
				dragstart: createEndEvent(),
				click: createEndEvent(),
			},
		}
	}

	function deserialize(serializedJavascript){
		return eval('(' + serializedJavascript + ')');
	}

	// 获取所有的actions
	actionMetasStore.initActions()
	const actions = actionMetasStore.getActions
	actions.forEach((value, key) => {
		const pluginItem = deserialize(value)
		const pluginMeta = { 
			"plugin": key 
		};

		if(pluginItem?.name){
			pluginMeta["_name"] = pluginItem?.name;
		}

		if(pluginItem?.icon){
			// pluginMeta["pluginIcon"] = STARLINK_SERVICE + "/icons/" + pluginItem?.icon;
			pluginMeta["pluginIcon"] = pluginItem?.icon;
		}

		if(pluginItem?.pluginCode){
			pluginMeta["pluginCode"] = pluginItem?.pluginCode;
		}

		paletteObj[key] = {
			group: pluginItem?.group,
			title: pluginItem?.name,
			action: {
				dragstart: createTask(pluginMeta),
				click: createTask(pluginMeta),
			},
		}

		if(pluginMeta?.pluginIcon){
			paletteObj[key]["imageUrl"] = pluginMeta?.pluginIcon
		}
		
		if(pluginItem?.className){
			paletteObj[key]["className"] = "custom-task-common " + pluginItem?.className;
		}else{
			paletteObj[key]["className"] = "custom-task-common";
		}
	});
	return paletteObj;
}


<template>
	<div v-if="selectedElements.length === 1" class="custom-properties-panel">

		<el-form :inline="true" :model="form" class="demo-form-inline">
			<el-form-item label="任务名称">
				<el-input v-model="form.name" placeholder="请输入任务名称" clearable
					@change="event => changeField(event, 'name')" />
			</el-form-item>

			<template v-if="element.type === 'bpmn:ServiceTask'">
				<el-form-item label="实例">
					<el-select v-model="form.instanceCode" placeholder="请选择实例" @change="event => selectInstance(event)"
						clearable>
						<el-option v-for="(option, index) in   form.instances  " :label="option.instanceName"
							:value="option.instanceCode" />
					</el-select>
				</el-form-item>
			</template>

			<!-- 动态表单 -->
			<template v-for="(item, index) in form.items">
				<template v-if="item.type === 'select'">
					<el-form-item :label="item.label" :prop="`items.${index}.name`">
						<el-select v-model="item.name" :placeholder="item.placeholder"
							@change="event => changeField(event, item.key)" clearable>
							<el-option v-for="(option, index) in item.values" :label="option.label" :key="option.value"
								:value="option.value" />
						</el-select>
					</el-form-item>
				</template>

				<template v-if="item.type === 'text'">
					<el-form-item :label="item.label" :prop="`items.${index}.name`">
						<el-input v-model="item.name" :placeholder="item.placeholder" clearable
							@change="event => changeField(event, item.key)" />
					</el-form-item>
				</template>
			</template>
		</el-form>

	</div>
</template>

<script setup>

import { ref, toRaw } from 'vue'
import { pluginInstanceOptionSelect } from '@/api/common-api'
import request from "@/utils/request"
import mitt from "@/mitt/bus"


const props = defineProps({
	modeler: Object,
})

const selectedElements = ref([])
const element = ref(null)
const form = ref({
	name: undefined,
	envCode: undefined,
	groupCode: undefined,
	pluginCode: undefined,
	instanceCode: undefined,
	instances: [],
	itemsMap: {}
})


// 事件网桥
function eventBridgeFun(ctx) {
	const items = ctx.items;
	const eventName = ctx.eventName;

	Object.values(items).forEach(item => {
		if (item?.events && item.events instanceof Array && item.events.includes(eventName)) {
			if (item?.eventHandler) {
				if (typeof item.eventHandler === "object") {
					if (item.eventHandler instanceof Array) {
						item?.eventHandler.forEach(bridgeJs => {
							const bridgeFun = eval(bridgeJs);
							bridgeFun(ctx);
						});
					}
				} else if (typeof item.eventHandler === "string") {
					const bridgeFun = eval(item.eventHandler);
					bridgeFun(ctx);
				}
			}
		}
	});
}


function init() {
	props.modeler.on('selection.changed', async e => {
		// 所有的节点
		selectedElements.value = e.newSelection
		// 被选中的节点
		element.value = e.newSelection[0]

		// 先清空数据
		form.value = {
			name: undefined,
			envCode: undefined,
			groupCode: undefined,
			pluginCode: undefined,
			instanceCode: undefined,
			instances: [],
			itemsMap: {}
		}

		// 元数据对象(右侧表单动态展示)
		if (element.value?.businessObject?.$attrs?._meta) {
			const meta = JSON.parse(element.value?.businessObject?.$attrs?._meta)
			form.value.items = meta
			// 转换成map,方便业务对象使用.
			meta.forEach(item => {
				const propertyName = item.key
				form.value.itemsMap[propertyName] = item

				// 订阅事件
				if (item?.events) {
					for (const eventName of item.events) {
						mitt.off(eventName)
						mitt.on(eventName, eventBridgeFun)
					}
				}
			});
		}

		// 节点名称
		if (element.value?.businessObject?.$attrs?.name) {
			form.value.name = element.value?.businessObject?.$attrs?.name;
			element.value['name'] = element.value?.businessObject?.$attrs?.name
			// 注意哈,要调用更新,才能真正的render
			updateProperties({ "name": form.value.name })
		}

		// 环境编码
		if (element.value?.businessObject?.$attrs?.envCode) {
			form.value.envCode = element.value?.businessObject?.$attrs?.envCode;
		}
		// 环境组编码
		if (element.value?.businessObject?.$attrs?.groupCode) {
			form.value.groupCode = element.value?.businessObject?.$attrs?.groupCode;
		}
		//插件编码
		if (element.value?.businessObject?.$attrs?.pluginCode) {
			form.value.pluginCode = element.value?.businessObject?.$attrs?.pluginCode;
		}
		//实例编码
		if (element.value?.businessObject?.$attrs?.instanceCode) {
			form.value.instanceCode = element.value?.businessObject?.$attrs?.instanceCode;
		}

		if (form.value.pluginCode) {
			// 初始化插件对应的实例列表
			pluginInstanceOptionSelect(form.value.pluginCode).then((res) => {
				if (res?.code == 200) {
					form.value.instances = res?.data
					// 触发下拉列表被动改变
					if (form.value.instanceCode) {
						selectInstance(form.value.instanceCode);
					}
				}
			})
		}

		// 如果: $attrs有用户填充的数据, 且, 表单的动态元数据大于零的情况下, 遍历动态表单的每一项, 进行赋值操作.
		if (element.value?.businessObject?.$attrs && form?.value?.items?.length > 0) {
			form.value.items.forEach((item) => {
				const propertyName = item.key
				const propertyValue = element.value.businessObject.$attrs[propertyName]
				if (propertyValue) {
					item.name = propertyValue
				}
			});
		}

		//  为节点配置默认属性
		setDefaultProperties()
	})

	props.modeler.on('element.changed', e => {
		const { element } = e
		if (!element.value) {
			return
		}
		if (e.element.id === element.value.id) {
			element.value = e.element
		}
	})
}

init()

function setDefaultProperties() {
	if (element.value) {
		element.value['name'] = element.value.businessObject.name
	}
}

// 选择实例
async function selectInstance(value) {
	if (value == "") {
		return;
	}

	const instance = form.value.instances.filter(item => item.instanceCode === value).shift()
	const properties = {
		"envCode": instance.envCode,
		"groupCode": instance.groupCode,
		"pluginCode": instance.pluginCode,
		"instanceCode": instance.instanceCode,
	}

	element.value["envCode"] = instance.envCode;
	element.value["groupCode"] = instance.groupCode;
	element.value["pluginCode"] = instance.pluginCode;
	element.value["instanceCode"] = instance.instanceCode;

	updateProperties(properties)


	// 把相关对象塞到上下文里
	const eventName = instance.pluginCode + "." + "instance" + "." + "change"
	const ctx = {
		"request": request,
		"bus": mitt,
		"items": form.value.itemsMap,
		"env": properties,
		"eventName": eventName,
		"value": value
	}

	mitt.emit(eventName, ctx);
}

/**
 * 改变控件触发的事件
 * @param { Object } input的Event
 * @param { String } 要修改的属性的名称
 */
function changeField(value, propertyName) {
	const item = form.value.itemsMap[propertyName];
	if (item) {
		item.name = value

		// 环境信息
		const envProperties = {
			"envCode": element.value["envCode"],
			"groupCode": element.value["groupCode"],
			"pluginCode": element.value["pluginCode"],
			"instanceCode": element.value["instanceCode"],
		}

		// 
		const eventName = envProperties.pluginCode + "." + propertyName + "." + "change"
		const ctx = {
			"request": request,
			"bus": mitt,
			"items": form.value.itemsMap,
			"env": envProperties,
			"eventName": eventName,
			"value": value
		}

		console.log("====================client event=================================");
		console.log(eventName);
		mitt.emit(eventName, ctx)
	}

	element.value[propertyName] = value
	const properties = {}
	properties[propertyName] = value
	updateProperties(properties)
}


/**
 * 更新元素属性
 * @param { Object } 要更新的属性, 例如 { name: '' }
 */
function updateProperties(properties) {
	const modeling = props.modeler.get('modeling')
	modeling.updateProperties(toRaw(element.value), properties)
}
</script>

<style scoped lang="scss">
.custom-properties-panel {
	position: absolute;
	top: 0;
	right: 0;
	width: 300px;
	min-height: 100vh;
	background-color: #f8f8f8;

	.element-item {
		padding: 9px 15px;

		&:first-child {
			padding-top: 20px;
		}

		.attr {
			font-weight: bold;
			margin-bottom: 3px;
		}
	}
}
</style>

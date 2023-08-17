<template>
	<div v-if="selectedElements.length === 1" class="custom-properties-panel">
		<div class="element-item">
			<div class="attr">任务名称</div>
			<input :value="element.name" @change="event => changeField(event, 'name')" />

			<template v-if="element.type === 'bpmn:ServiceTask'">
				<div class="attr">实例</div>
				<select id="instanceCode" @change="event => selectInstance(event)">
					<option value="">----请选择----</option>
					<option v-for="(option, index) in instances" :value="option.instanceCode">{{ option.instanceName }}
					</option>
				</select>
			</template>

			<template v-for="(item, index) in items">
				<!-- 下拉列表框处理 -->
				<template v-if="item.type === 'select'">
					<div class="attr">{{ item.label }}</div>
					<select :id="item.key" @change="event => changeField(event, item.key)">
						<option value="">----请选择----</option>
						<option v-for="(option, index) in item.values" :value="option.value">{{ option.label }}</option>
					</select>
				</template>

				<!-- 普通文本框处理 -->
				<template v-if="item.type === 'text'">
					<div class="attr">{{ item.label }}</div>
					<input :name="item.key" :placeholder="item.placeholder" :value="item.name"
						@change="event => changeField(event, item.key)" />
				</template>
			</template>
		</div>
	</div>
</template>

<script setup>
import { ref, toRaw } from 'vue'
import { pluginInstanceOptionSelect } from '@/api/common-api'
import request from "@/utils/request"

const props = defineProps({
	modeler: Object,
})

const selectedElements = ref([])
const element = ref(null)
// 动态元数数组
const items = ref([])


// 插件code
const pluginCode = ref("")
// 根据环境coe/环境组code/插件code,获取所有的实例.
const instances = ref([])

function init() {
	props.modeler.on('selection.changed', e => {
		// 先清空数据
		items.value = []
		pluginCode.value = ""

		// 所有的节点
		selectedElements.value = e.newSelection
		// 被选中的节点
		element.value = e.newSelection[0]
		// 元数据对象
		if (element.value?.businessObject?.$attrs?._meta) {
			const meta = JSON.parse(element.value?.businessObject?.$attrs?._meta)
			items.value = meta;
		}

		// 节点名称
		if (element.value?.businessObject?.$attrs?._name) {
			element.value.businessObject.name = element.value?.businessObject?.$attrs?._name
			element.value['name'] = element.value.businessObject.name
		}

		// 插件编码
		if (element.value?.businessObject?.$attrs?._pluginCode) {
			pluginCode.value = element.value?.businessObject?.$attrs?._pluginCode
		}


		if (pluginCode.value != "") {
			// 初始化插件对应的实例列表
			pluginInstanceOptionSelect(pluginCode.value).then((res) => {
				if (res?.code == 200) {
					instances.value = res?.data;
				}
			})
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
async function selectInstance(event) {
	const value = event.target.value
	if (value == "") {
		return;
	}

	const instance = instances.value.filter(item => item.instanceCode === value).shift()
	const properties = {
		"envCode": instance.envCode,
		"groupCode": instance.groupCode,
		"pluginCode": instance.pluginCode,
		"instanceCode": instance.instanceCode,
	}

	element.value["envCode"] = properties.envCode
	element.value["groupCode"] = properties.groupCode
	element.value["instanceCode"] = properties.instanceCode
	element.value["pluginCode"] = properties.pluginCode
	updateProperties(properties)


	// 把相关对象塞到上下文里
	const ctx = {
		"items": items.value,
		"item": undefined,
		"element": element,
		"env": properties,
		"modeling": props.modeler
	}

	// 过滤出,依赖节点的所有数据
	const dependencieInstanceNodes = ctx.items.filter((item) => {
		var isDependencies = false;
		if (item?.dependencies) {
			if (item.dependencies instanceof Array) {
				const dependencies = item.dependencies;
				for (const i = 0; i < dependencies.length; i++) {
					if (dependencies[i] == "instanceSelect") {
						isDependencies = true;
						break;
					}
				}
			}
		}
		return isDependencies;
	});

	if (dependencieInstanceNodes.length > 0) {
		for (var i = 0; i < dependencieInstanceNodes.length; i++) {
			const dependencieInstanceNode = dependencieInstanceNodes[i]
			ctx.item = dependencieInstanceNode;

			// 发起请求的上下文
			const requestCtx = {
				url: undefined,
				method: 'GET',
				headers: {},
				params: {}
			}
			// 拷贝必要参数
			Object.assign(requestCtx.params, ctx.env);


			if (ctx.item?.requestUrl) {
				requestCtx.url = ctx.item.requestUrl
			}
			if (ctx.item?.requestParams) {
				Object.assign(requestCtx.params, ctx.item.requestParams);
			}
			if (ctx.item?.requestHeader) {
				Object.assign(requestCtx.headers, ctx.item.requestHeader);
			}

			//  请求之前的拦截器
			if (dependencieInstanceNode?.requestBefore) {
				const runRequestBefore = eval(dependencieInstanceNode.requestBefore)
				runRequestBefore(requestCtx, ctx);
			}

			const requestData = await request(requestCtx).then((res) => {
				return res.data;
			});

			if (requestData?.code == 200) {
				ctx.item.values = requestData.data;
			}
		}
	}

	// console.log("==============================================");
	// console.log(element.value?.businessObject?.$attrs);
	// console.log("==============================================");
}

/**
 * 改变控件触发的事件
 * @param { Object } input的Event
 * @param { String } 要修改的属性的名称
 */
function changeField(event, type) {
	const value = event.target.value

	const item = items.value.filter(item => item.key == event.target.id).shift();
	item.name = value

	console.log("========================================================");
	console.log(item)
	console.log(type);
	console.log("========================================================");

	element.value[type] = value
	const properties = {}
	properties[type] = value
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

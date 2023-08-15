<template>
	<div v-if="selectedElements.length === 1" class="custom-properties-panel">
		<div class="element-item">
			<div class="attr">名称</div>
			<input :value="element.name" @change="event => changeField(event, 'name')" />
			<div class="attr">属性aaa</div>
			<input :value="element.aaa" @change="event => changeField(event, 'aaa')" />
			<div class="attr">属性bbb</div>
			<input :value="element.bbb" @change="event => changeField(event, 'bbb')" />
		</div>
	</div>
</template>

<script setup>
import { ref, toRaw } from 'vue'

// TODO lixin 属性面板

const props = defineProps({
	modeler: Object,
})

const selectedElements = ref([])
const element = ref(null)

function init() {
	props.modeler.on('selection.changed', e => {
		selectedElements.value = e.newSelection
		element.value = e.newSelection[0]
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

/**
 * 改变控件触发的事件
 * @param { Object } input的Event
 * @param { String } 要修改的属性的名称
 */
function changeField(event, type) {
	const value = event.target.value
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

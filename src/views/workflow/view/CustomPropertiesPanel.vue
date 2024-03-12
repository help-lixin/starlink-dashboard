<script setup lang="ts">
// @ts-nocheck

import { ref } from 'vue'

const props = defineProps({
	modeler: Object,
	processInstanceId: undefined
})

const isShowProperties = ref(false)
const selectedElements = ref([])
const element = ref(null)

function init() {
	props.modeler.on('selection.changed', async e => {
		// 所有的节点
		selectedElements.value = e.newSelection
		// 被选中的节点
		element.value = e.newSelection[0]
		
		if(undefined == element.value ||
			element.value?.type=="bpmn:SequenceFlow" ||
			element.value?.type=="bpmn:StartEvent" ||
			element.value?.type=="bpmn:EndEvent" ){
				isShowProperties.value=false;
				return;
		}else{
			// 展示右侧属性面板
			isShowProperties.value=true;
		}

		const nodeId = element.value.id
		const nodeName = element.value.businessObject?.name
		const processInstanceId = props.processInstanceId

		console.log("============================================")
		console.log(processInstanceId)
		console.log(nodeId)
		console.log(nodeName)
		console.log("============================================")
	}) // end  selection.changed

	props.modeler.on('element.changed', e => {
		const { element } = e
		if (!element.value) {
			return
		}
		if (e.element.id === element.value.id) {
			element.value = e.element
		}
	}) // end element.changed
}

// 初始化
init()
</script>


<template>
    <div v-if="isShowProperties" class="custom-properties-panel">
      <yt-card style="height: 100%;" :content-style="{height: '100%'}">
        <el-scrollbar :height="'calc(100vh - var(--el-header-height) - 88px)'">
          
        </el-scrollbar>
      </yt-card>
    </div>
</template>

<style scoped lang="scss">
.custom-properties-panel {
	position: absolute;
	top: 0;
	right: 0;
	width: 300px;
	height: calc(100vh - var(--el-header-height));
  padding-bottom: 58px;
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

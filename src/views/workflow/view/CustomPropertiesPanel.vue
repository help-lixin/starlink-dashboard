<script setup lang="ts">
// @ts-nocheck

import { ref } from 'vue'

import { createForm } from '@formily/core'
import { createSchemaField, FormProvider } from '@formily/vue'
import { FormItem, FormLayout, Input, PreviewText } from '@formily/element-plus'


const props = defineProps({
	modeler: Object,
  	showPosition: 'left' | 'bottom',
	processInstanceId: undefined,
	workFlowInstanceLogs: undefined
})

const isShowProperties = ref(false)
const selectedElements = ref([])
const element = ref(null)

// 表单schema
const formSchema = {
	type: 'object',
	properties: {
		layout: {
		type: 'void',
		'x-component': 'FormLayout',
		'x-component-props': {
			labelAlign: "left",
			wrapperAlign: "left",
			labelCol: 24,
			wrapperCol: 24,
			layout: 'vertical',
		},
		properties: {
			// name: {
			// 	type: "string",
			// 	title: "节点",
			// 	'x-decorator': "FormItem",
			// 	'x-component': "PreviewText.Input"
			// },
			log: {
				type: "string",
				title: "",
				'x-decorator': "FormItem",
				'x-component': "Input.TextArea",
				"x-component-props": {
					"autosize": true,
					"readonly": true,
				}
			}
		},
		},
	},
};


const schema = ref({});
let form = createForm({})
const { SchemaField } = createSchemaField({
	components: {
		FormLayout,
		FormItem,
		Input,
		PreviewText,
	},
});


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
		const workFlowInstanceLogs = props.workFlowInstanceLogs;

		if(workFlowInstanceLogs){
			const log = workFlowInstanceLogs[nodeId]
      console.log(log, 'log11')
			if(log){
				schema.value = formSchema;
				// 先清空表单里的内容
				form.setValues({ log })
				console.log(log, 'run123')
			} else {
        // schema.value = undefined
        form.setValues({ log: '暂无日志！' })
      }
		}
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
const scrollbarHeight = computed(() => {
  return props.showPosition === 'bottom' ? '220px' : 'calc(100vh - var(--el-header-height) - 88px)'
})
// 初始化
init()
</script>


<template>
    <div v-if="isShowProperties" class="custom-properties-panel" :class="[showPosition]">
      <yt-card style="height: 100%;">
        <el-scrollbar :height="scrollbarHeight">
          <FormProvider :form="form">
            <SchemaField :schema="schema" />
          </FormProvider>
        </el-scrollbar>
      </yt-card>
    </div>
</template>

<style scoped lang="scss">
.custom-properties-panel {
	position: absolute;
	top: 0;
	right: 0;
	width: 220px;
	height: calc(100vh - var(--el-header-height));
  padding-bottom: 58px;
	background-color: #f8f8f8;
  &.bottom {
    width: 100%;
    bottom: 0;
    height: 220px;
    padding-bottom: 24px;
    top: auto;
  }
  ::v-deep(.yt-card) {
    .content {
      height: 100%;
    }
  }
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

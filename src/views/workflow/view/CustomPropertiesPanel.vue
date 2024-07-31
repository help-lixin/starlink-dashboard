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
const scrollbarRef = ref()
const helperRef = ref()
watch(() => props.workFlowInstanceLogs, () => {
  if (isShowProperties.value && element.value.id) {
    setNodeLog()
  }
}, {deep: true});

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
					"autosize": false,
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
    setNodeLog()
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

const setNodeLog = async () => {
  const nodeId = element.value.id
  const nodeName = element.value.businessObject?.name
  const processInstanceId = props.processInstanceId
  const workFlowInstanceLogs = props.workFlowInstanceLogs;

  if(workFlowInstanceLogs){
    const log = workFlowInstanceLogs[nodeId]
    if(log){
      schema.value = formSchema;
      // 先清空表单里的内容
      form.setValues({ log })
    } else {
      form.setValues({ log: '暂无日志！' })
    }
    setTimeout(() => {
      // 滚动到最底下
      console.log(helperRef.value?.clientHeight, scrollbarRef.value, 'test123')
      const clientHeight = helperRef.value?.clientHeight
      if (clientHeight > 300) {
        ele.scrollTop = clientHeight;
        // scrollbarRef.value?.setScrollTop?.(clientHeight - 100)
      }
    })
  }
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
        <el-scrollbar :height="scrollbarHeight" ref="scrollbarRef" :noresize="true">
          <div class="helper" ref="helperRef">
            <FormProvider :form="form">
              <SchemaField :schema="schema" />
            </FormProvider>
          </div>
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

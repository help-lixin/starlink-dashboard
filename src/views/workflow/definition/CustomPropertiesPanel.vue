<script setup lang="ts">
// @ts-nocheck

import mitt from '@/mitt/bus'
window.mitt = mitt;

import formCreate from "@form-create/element-ui";
import install from '@form-create/element-ui/auto-import'
formCreate.use(install);

import { ref, toRaw } from 'vue'
import {STARLINK_SERVICE} from "@/utils/env"
import { pluginInstanceOptionSelect } from '@/api/common-api'
import request from '@/utils/request';
import { encode, decode } from 'js-base64';
import { useActionMetasStore } from "@/stores/plugin";
const actionMetasStore = useActionMetasStore();

// mock jenkins
import jenkins from '@/api/mock/form-schema/jenkins';



const props = defineProps({
	modeler: Object,
})

const selectedElements = ref([])
const element = ref(null)


function extraRule(rules,fieldName){
	for(let i=0;i<rules.length;i++){
		const rule = rules[i];
		if(rule.type == "subForm" || rule.type == "group"){
			return (rule?.rule?.rule,fieldName);
		} else{
			if(rule.field == fieldName){
				return rule;
			}
		}
	}
}



const eventBridge = {};
formCreate.register({
	name: "dependencies",
	init({value}, rule) {
		const events = eventBridge[value];
		if(events == undefined){
			eventBridge[value]=[];
		}

		const funTemplate = (val,_rule,fApi)=>{
			if(_rule?.update){
				_rule.update(val,_rule,fApi.value,{origin:"dependencies"})
			}
		}
		eventBridge[value].push({ event:value,rule:rule, fApi: fApi,action: funTemplate})

		mitt.off(value)
		mitt.on(value,()=>{
			let events = eventBridge[value];
			for(let i=0;i<events.length;i++){
				const _event = events[i]?.event 
				const _rule = events[i]?.rule
				const _fApi = events[i]?.fApi
				const _action = events[i]?.action
				
				_action(_event,_rule,_fApi);
			}
		})
	},
	deleted({value}, rule, fapi) {
		mitt.off(value)
		delete eventBridge[value]
    },
});

//获取 formCreate 组件
const FormCreate = formCreate.$form();
const fApi = ref({});
const formData = ref({});
const options = ref({
  form: {
    labelPosition: 'top',
    inline: false,
    labelWidth: 'auto',
  },
  mounted: function() {
      console.log('mounted')
  },
  //表单提交事件
  onSubmit: function (formData) {
    alert(JSON.stringify(formData))
  },
  // 
  beforeFetch: function(config,form) {
	console.log("^^^^^^^^^^^^^^^^^^^beforeFetch^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
	console.log(config)
	console.log(form)
	console.log("^^^^^^^^^^^^^^^^^^^beforeFetch^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
  }
});


const rule = ref([]);


function init() {
	props.modeler.on('selection.changed', async e => {
		// 所有的节点
		selectedElements.value = e.newSelection
		// 被选中的节点
		element.value = e.newSelection[0]


		// 元数据对象(右侧表单动态展示)
		if (element.value?.businessObject?.$attrs?.plugin) {
			// 从store里拿数据
			// const plugins = actionMetasStore.getActions
			// const pluginInfoStr = plugins.get(element.value.businessObject.$attrs.plugin)
			// const pluginInfo = deserialize(pluginInfoStr)
			const pluginInfo = deserialize(jenkins)
			console.log("==================================================")
			console.log(pluginInfo)
			console.log("==================================================")
			if(pluginInfo?.meta){
				rule.value = pluginInfo?.meta
			}
		}

		const params = {};
		if(element.value?.businessObject?.$attrs?._params){
			const decodeParamsString = decode(element.value?.businessObject?.$attrs?._params)
			const decodeParams = JSON.parse(decodeParamsString);
			Object.assign(params,decodeParams)
		}

		// 节点名称
		if (element.value?.businessObject?.$attrs?._name) {
			element.value['name'] = element.value?.businessObject?.$attrs?._name
			params["name"] = element.value?.businessObject?.$attrs?._name
			// 注意哈,要调用更新,才能真正的render
			updateProperties({ "name": params["name"] })
		} else {
			if (element.value?.businessObject?.name) {
				params["name"] = element.value?.businessObject?.name
			}
		}

		//插件编码
		if (element.value?.businessObject?.$attrs?.pluginCode) {
			params["pluginCode"] = element.value?.businessObject?.$attrs?.pluginCode;
		}

		//插件
		if (element.value?.businessObject?.$attrs?.plugin) {
			params["plugin"] = element.value?.businessObject?.$attrs?.plugin;
		}

		//实例编码
		if (element.value?.businessObject?.$attrs?.instanceCode) {
			params["instanceCode"] = element.value?.businessObject?.$attrs?.instanceCode;
		}

		//  为节点配置默认属性
		setDefaultProperties()
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


function setDefaultProperties() {
	if (element.value) {
		element.value['name'] = element.value.businessObject.name
	}
}


/**
 * 改变控件触发的事件
 */
function changeForm(value) {
	const propertyName = "_params"
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


function deserialize(serializedJavascript){
  return eval('(' + serializedJavascript + ')');
}

// 初始化
init()
</script>


<template>
	<div v-if="selectedElements.length === 1" class="custom-properties-panel">
    <yt-card>
      <FormCreate :rule="rule" :option="options" v-model="formData" v-model:api="fApi"></FormCreate>
    </yt-card>
	</div>
</template>


<style scoped lang="scss">
.custom-properties-panel {
	position: absolute;
	top: 0;
	right: 0;
	width: 300px;
	min-height: 100vh;
	background-color: #f8f8f8;
  ::v-deep(.yt-card) {
    padding: 0;
  }
  ::v-deep(.content) {
    min-height: 100vh;
    overflow: auto;
    box-sizing: border-box;
    max-height: 100vh;
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

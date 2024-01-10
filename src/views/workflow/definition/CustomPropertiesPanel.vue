<script setup lang="ts">
// @ts-nocheck  

import { ref, toRaw } from 'vue'
import {STARLINK_SERVICE} from "@/utils/env"
import { pluginInstanceOptionSelect } from '@/api/common-api'
import { encode, decode } from 'js-base64';

import { 
	createForm ,
	onFormValuesChange,
	onFieldInit,
	onFieldChange,
	onFieldMount,
	onFieldValueChange,

	FormPath
} from '@formily/core'

import { createSchemaField, FormProvider } from '@formily/vue'
import {
  FormItem,
  FormLayout,
  FormButtonGroup,
  Space,
  Submit,
  Reset,

  Input,
  Password,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Transfer,
  Cascader,
  Radio,
  Checkbox,
  Upload,
  Switch,
  PreviewText,

  ArrayCards,
  ArrayItems,
  ArrayTable,
  ArrayTabs,
  FormCollapse,
  FormStep,
  FormTab,
  FormDialog,
  FormDrawer,
  Editable,
} from '@formily/element-plus'


import request from '@/utils/request';

import { useActionMetasStore } from "@/stores/plugin";
const actionMetasStore = useActionMetasStore();


const props = defineProps({
	modeler: Object,
})

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
			labelWrap: true,
			labelCol: 8,
			wrapperCol: 14,
			layout: 'horizontal',
		},
		properties: {

		},
		},
	},
};

const commonSchmea = {
	name: {
	   type: "string",
       title: "任务名称",
       required: false,
       'x-decorator': "FormItem",
       'x-component': "PreviewText.Input",
	   default: ""
	}
}

// 公共业务Schema
const commonBussnessSchema = {
	instanceCode: {
	   "type": "string",
       "title": "实例",
       "required": true,
       "x-decorator": "FormItem",
       "x-decorator-props": {
         "tooltip": "请选择实例"
       },
       "x-component": "Select",
	   "x-data": {
		"onInitCallback": [
			(ctx:any)=>{
				if(element.value?.businessObject?.$attrs?.pluginCode){
					pluginInstanceOptionSelect(element.value?.businessObject?.$attrs?.pluginCode).then((res)=>{
						if(res?.code == 200){
							const datasources = [];
							res.data.forEach((item)=>{
								datasources.push({
									label: item?.instanceName,
									value: item?.instanceCode
								});
							})
							ctx.field.dataSource = datasources;
						}
					});
				}
			}
		]
	   }
	}
}


const exclusionField = new Set()
exclusionField.add("name")


const schema = ref({});

const formProperties = {
  effects(){
	// 当表单被更改时,序列化表单的内容为json,并base64给bpmnjs进行保存好
    onFormValuesChange((form)=>{
		if(element.value){
			const formJsonString = JSON.stringify(form.values)
			const encodeFormValues = encode(formJsonString)
			changeForm(encodeFormValues)
		}
	})

	// * : 监听所有的属性
	onFieldMount('*',(field,form)=>{
		if(field.data?.onInitCallback){
			const ctx = {
				field,
				form,
				request,
				formValues:form.values,
				urlPrefix:STARLINK_SERVICE
			}
			const callbackArray = field.data?.onInitCallback
			callbackArray.forEach(callback => {
              callback(ctx)
            });
		}
	})

	// 监听组件变化
	onFieldChange('*',['value'],(field,form)=>{
		const dependenciesArray = [];
		// 排除掉哪些不需要进行监听
		if(!exclusionField.has(field?.props?.name)){
			// 属性的value有值的情况下.
			if(field?.value && field?.value?.length > 0) {
				const properties = schema.value?.properties?.layout?.properties
				if(!properties){
					return;
				}
				extraField(field,properties,dependenciesArray)
			}
		}

		if(dependenciesArray.length > 0) {
			for(let i=0;i<dependenciesArray.length;i++){
				const dependenciesItem = dependenciesArray[i]
				// 当前属性(field)发生变改时,找出那些依赖于我的属性.调用:onChangeCallback方法
				const address = form.query("*."+dependenciesItem)?.addresses
				for(let i=0;i<address.length;i++){
					const addr = address[i]
					const targetField = form.fields[addr]
					if(targetField){
						const callbacks = targetField?.data?.onChangeCallback;
						if(callbacks){
							callbacks.forEach(callback => {
								const ctx = {
									field:targetField,
									form,
									request,
									formValues:form.values,
									urlPrefix:STARLINK_SERVICE
								}
								
								callback(ctx)
							});
						} // end if
					}
				}
			}
		}
	})

	// * : 监听所有的属性
	onFieldValueChange('*',(field,form)=>{
		if(field.data?.onChangeCallback){
			const ctx = {
				field,
				form,
				request,
				formValues:form.values,
				urlPrefix:STARLINK_SERVICE
			}
			const callbackArray = field.data?.onChangeCallback
			callbackArray.forEach(callback => {
			  
              callback(ctx)
            });
		}
	})
  }
}

// 提取属性
const extraField = (field,properties,dependenciesArray)=>{
	// 对所有的属性(all)进行遍历,如果,发现属性(x-reactions)上配置的dependencies正好依赖于当前属性(field)的话
	// 则,记住所有属性中,是哪一个属性依赖当前(field)
	// x-reactions: {  "dependencies": ["instanceCode"] }
	// 
	for(let key in properties){
		if(properties[key]?.type == 'object') {
			// properties
			const objectProperties = properties[key]?.["properties"];
			if(objectProperties){
				extraField(field,objectProperties,dependenciesArray)
			}
		} else if(properties[key]?.type == 'array'){
			const itemsProperties = properties[key]?.items?.properties;
			if(itemsProperties){
				extraField(field,itemsProperties,dependenciesArray)
			}
		} else if( properties[key]?.type == 'string' ||
				   properties[key]?.type == 'number' ||
				   properties[key]?.type == 'boolean' ||
				   properties[key]?.type == 'date' ||
				   properties[key]?.type == 'datetime'
		 ){
			// 普通对象
			const dependencies = properties[key]?.["x-reactions"]?.dependencies
			if(dependencies){
				dependencies.forEach(el => {
					if(el == field?.props?.name){
						dependenciesArray.push(key)
					}
				});
			}
		}
	}
}


var form = createForm(formProperties)

var { SchemaField } = createSchemaField({
	components: {
		FormLayout,
		FormItem,
		FormButtonGroup,
		Space,
		Submit,
		Reset,
		Input,
		Password,
		Select,
		DatePicker,
		TimePicker,
		InputNumber,
		Transfer,
		Cascader,
		Radio,
		Checkbox,
		Upload,
		Switch,
		PreviewText,

		ArrayCards,
		ArrayItems,
		ArrayTable,
		ArrayTabs,
		FormCollapse,
		FormStep,
		FormTab,
		FormDialog,
		FormDrawer,
		Editable,
	},
});



function init() {
	props.modeler.on('selection.changed', async e => {
		// 所有的节点
		selectedElements.value = e.newSelection
		// 被选中的节点
		element.value = e.newSelection[0]
		// 先置空
		delete schema.value?.properties?.layout?.properties

		//拷贝出一份新的schema
		const tempScehma = {};
		Object.assign(tempScehma,formSchema);
		tempScehma.properties.layout.properties = {}
		Object.assign(tempScehma.properties.layout.properties,commonSchmea);
		
		// 元数据对象(右侧表单动态展示)
		if (element.value?.businessObject?.$attrs?.plugin) {
			// 从store里拿数据
			const plugins = actionMetasStore.getActions
			const pluginInfoStr = plugins.get(element.value.businessObject.$attrs.plugin)
			const pluginInfo = deserialize(pluginInfoStr)

			
			// 启用实例选择
			if(pluginInfo?.enableInstanceSelect){
				Object.assign(tempScehma.properties.layout.properties,commonBussnessSchema);
			}

			// 存在元数据的情况下做处理.
			if(pluginInfo?._meta){
				Object.assign(tempScehma.properties.layout.properties,pluginInfo._meta)
			}
		}

		// 重点,要重新为schema赋值
		schema.value = tempScehma;
		// 重点,重新生成表单.
		form = createForm(formProperties)


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
		// 为表单赋值
		form.setValues(params);
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
		<FormProvider :form="form">
			<SchemaField :schema="schema" />
		</FormProvider>
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

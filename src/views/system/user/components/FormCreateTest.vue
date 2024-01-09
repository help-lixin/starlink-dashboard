<template>
  <FormCreate :rule="rule" :option="options" v-model="formData" v-model:api="fApi"></FormCreate>
</template>
<script setup>
//导入 form-create
import formCreate from "@form-create/element-ui";
import install from '@form-create/element-ui/auto-import'
formCreate.use(install);
import {ref} from "vue";
//获取 formCreate 组件
const FormCreate = formCreate.$form();
const fApi = ref({});
const formData = ref({});
const options = ref({
  //表单提交事件
  onSubmit: function (formData) {
    alert(JSON.stringify(formData))
  }
});
const rule = ref([
  {
    type:'input',
    field:'goods_name',
    title:'商品名称',
    value:'form-create'
  },
  {
    type:'checkbox',
    field:'label',
    title:'标签',
    value:[0,1,2,3],
    options: [
      {label:'好用',value:0},
      {label:'快速',value:1},
      {label:'高效',value:2},
      {label:'全能',value:3},
    ]
  },
]);
</script>

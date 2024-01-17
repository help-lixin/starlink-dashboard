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
  global: {
      '*': {
        beforeFetch: function() {
          console.log('run111111111111111111111111111111111111111111111111111111111111111111111111111111')
        }
      }
  },
  //表单提交事件
  onSubmit: function (formData) {
    console.log(fApi.value.getRule('goods_name2'), 'test')
    console.log(fApi.value.getRule('object'), 'test')
  },
  beforeFetch: function() {
    console.log('run111111111111111111111111111111111111111111111111111111111111111111111111111111')
  }
});

const rule = ref([
  {
    type: 'select',
    field: 'city',
    title: '城市',
    value: '陕西省',
    options: [],
    effect: {
      fetch: {
        action: () => {
          function tidy(list) {
            return list.map(val => {
              return {
                value: val.name,
                label: val.name,
                children: val.children ? tidy(val.children) : undefined
              }
            })
          }

          return new Promise((resolve) => {
            fetch('https://cdn.jsdelivr.net/gh/modood/Administrative-divisions-of-China@2.4.0/dist/pc-code.json', {
              headers: {
                'Content-Type': 'application/json',
                'test': 111
              }}).then(res => {
              console.log(res)
              res.json().then(res => {
                console.log(res, 'res1111')
                resolve(tidy(res));
              })
            })
          })
        },
        to: 'options',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'test': 111
        },
        parse(res) {
          return res.rows.map(row => {
            return {
              label: row.name,
              value: row.adcode
            }
          })
        }
      }
    }
  }
]);
</script>

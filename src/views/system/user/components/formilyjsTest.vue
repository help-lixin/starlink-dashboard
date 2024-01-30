<template>
  <FormProvider :form="form">
    <SchemaField>
      <SchemaArrayField
        name="string_array"
        title="字符串数组"
        x-decorator="FormItem"
        x-component="ArrayItems"
      >
        <SchemaObjectField x-decorator="ArrayItems.Item">
          <SchemaVoidField
            x-component="FormLayout"
            :x-component-props="{
          labelCol: 24,
          wrapperCol: 24,
          layout: 'vertical'
        }"
          >
            <SchemaStringField
              name="input"
              title="输入框"
              x-decorator="FormItem"
              :x-decorator-props="{
            tooltip: '123',
          }"
              x-component="Input"
              :required="true"
            />
            <SchemaStringField
              name="select"
              title="选择框"
              x-decorator="FormItem"
              x-component="Select"
              :required="true"
            />
          </SchemaVoidField>
          <SchemaVoidField x-component="Space">
            <SchemaVoidField
              x-decorator="FormItem"
              x-component="ArrayItems.Remove"
            />
            <SchemaVoidField
              x-decorator="FormItem"
              x-component="ArrayItems.SortHandle"
            />
          </SchemaVoidField>
        </SchemaObjectField>
        <SchemaVoidField x-component="ArrayItems.Addition" title="添加条目" />
      </SchemaArrayField>
    </SchemaField>
  </FormProvider>
</template>

<script setup lang="ts">
import { createForm } from '@formily/core'
import { createSchemaField, FormProvider } from '@formily/vue'
import { FormLayout, FormItem, Input, Select,
  FormButtonGroup,
  Submit,
  Space,
  DatePicker,
  ArrayItems,} from '@formily/element-plus'

const { SchemaVoidField, SchemaStringField,  SchemaField,
  SchemaArrayField,
  SchemaObjectField} = createSchemaField({
  components: { FormLayout, FormItem, Input, Select,
    Space,
    DatePicker,
    ArrayItems, },
})
const form = createForm()
</script>

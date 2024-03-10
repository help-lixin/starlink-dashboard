<script setup lang="ts">
// @ts-nocheck

import { MonacoEditor } from './MonacoEditor'
import { onMounted, ref, nextTick, defineEmits } from 'vue'
const props = defineProps<{visible: boolean, initData: string}>()
const editor = new MonacoEditor('container')
import yaml from "js-yaml"
import { Message } from '@element-plus/icons-vue'
const emits = defineEmits(['setValue', 'update:visible'])
const closeDialog = () => {
  editor?.dispose?.()
  emits('update:visible', false)
}

watch(() => props.visible, async (newValue) => {
  if (newValue) {
    console.log(yaml.dump(props.initData), '111')
    await nextTick()
    editor.initEditor({
      value: yaml.dump(props.initData),
      language: 'yaml'
    })
  }
});
const confirm = () => {
  try {
    // 尝试将 YAML 解析为 JSON
    const jsonData = yaml.load(editor.getValue());
    console.log(jsonData, 'jsonData')
    // 输出转换后的 JSON 数据
    emits('setValue', jsonData)
    closeDialog()
  } catch (error) {
    console.log(error, 'error')
    // 如果出现错误，输出错误信息
    ElMessage.error(error.message);
  }

}
</script>
<template>
  <div class="yamlDemo">
    <el-dialog :width="'80vw'" :model-value="visible" @close="closeDialog">
      <template #title>
        <span>YAML编辑器</span>
      </template>
      <div id="container" style="width: 100%;height: 60vh;"></div>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style>

</style>

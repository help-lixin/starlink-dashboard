<template>
  <el-pagination
    v-model:current-page="modelConfig.pageNum"
    v-model:page-size="modelConfig.pageSize"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    @change="change"
    v-bind="myConfig"
  />
</template>

<script>
import { cloneDeep } from "lodash";
import {toRaw, toRefs} from "vue"
export default {
  name: 'ytPage',
  props: {
    config: {
      type: Object,
      require: false,
      default() {
        return {}
      }
    },
    modelValue: {
      type: Object,
      require: true,
      default() {
        return {}
      }
    },
    total: {
      type: Number,
      require: true,
      default: 0
    }
  },
  data() {
    return {
      defaultConfig: {
        pageSizes: [10, 20, 50, 100],
        currentPage: 1,
        pageSize: 10,
        small: true,
        disabled: false,
        background: false,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0
      }
    }
  },
  methods: {
    handleSizeChange() {
      this.change()
    },
    handleCurrentChange() {
      this.change()
      // this.$emit('input', this.modelConfig)
    },
    change() {
      const result = Object.assign(this.modelValue, {pageSize: this.modelConfig.pageSize, pageNum: this.modelConfig.pageNum})
      this.$emit('update:modelValue', result)
      this.$emit('change', result)
    }
  },
  components: {},
  created() {},
  emits: ['update:modelValue', 'change'],
  computed: {
    modelConfig: {
      get() {
        const newObj = cloneDeep(toRaw(this.modelValue))
        newObj.pageSize = this.modelValue?.pageSize ?? this.defaultConfig.pageSizes[0]
        newObj.pageNum = this.modelValue?.pageNum ?? this.defaultConfig.currentPage
        return newObj
      },
      set() {
        const newObj = cloneDeep(toRaw(this.modelValue))
        newObj.pageSize = this.modelConfig.pageSize
        newObj.pageNum = this.modelConfig.currentPage
        this.$emit('update:modelValue', newObj)
      },
    },
    myConfig() {
      const { small, disabled, background, layout, total } = this.defaultConfig
      return {
        small: this.config.small ?? small,
        disabled: this.config.disabled ?? disabled,
        background: this.config.background ?? background,
        layout: this.config.layout ?? layout,
        total: this.total ?? total
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>

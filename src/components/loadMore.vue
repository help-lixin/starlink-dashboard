<script>
import { debounce } from '@/utils/common'
import { Loading } from '@element-plus/icons-vue'
export default {
  components: { Loading },
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    hasMore: {
      type: Boolean,
      required: true
    },
    height: {
      type: String,
      default: '100%'
    }
  },
  methods: {
    handleScroll({scrollTop}) {
      this.$emit('scroll')
      if (this.loading || !this.hasMore) return
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      console.log(scrollHeight,scrollTop,clientHeight, 'scrollHeight - scrollTop - clientHeight')
      if (scrollHeight - scrollTop - clientHeight < 50) {
        this.$emit('loadMore');
      }
    }
  }
}
</script>

<template>
  <el-scrollbar :height="height" @scroll="handleScroll">
    <div class="loadMore" ref="scrollContainer">
      <slot></slot>
      <div class="text">
        <div class="loading" v-if="loading"><el-icon><Loading></Loading></el-icon></div>
        <div class="tip" v-if="!loading && !hasMore">已加载完毕</div>
      </div>
    </div>
  </el-scrollbar>
</template>

<style scoped lang="scss">
.loadMore {
  position: relative;
  .text {
    position: relative;
    bottom: 12px;
    left: 0;
    width: 100%;
    height: 30px;
    line-height: 30px;
    vertical-align: middle;
    color: #999;
    text-align: center;
    > div {
      left: 0;
      right: 0;
      position: absolute;
    }
  }
}
</style>

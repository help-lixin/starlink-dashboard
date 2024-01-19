<template>
  <div class="yt-card">
    <div class="title" v-if="title">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="content" :style="contentStyleObj" :class="{isFirst}" v-if="$slots.default || subTitle">
      <div v-if="subTitle" class="sub-title">
        {{ subTitle }}
      </div>
      <div style="color: #3E424E;">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'YtCard',
  props: {
    title: undefined,
    subTitle: undefined,
    contentStyle: {
      type: Object,
      default() {
        return {}
      }
    },
    padding: {
      type: [Number, String],
      // 1.默认40，适用于详情表单（数据展示）,填写表单。2. 16适用于附件展示，表格，附件上传，拖拽, 3. 为0时，里面是表单
      default: 20
    },
    isFirst: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 扩展方向填充
    pad() {
      if (typeof (this.padding) === 'string') {
        return this.padding
      } else {
        return this.padding + 'px'
      }
    },
    contentStyleObj() {
      return {...{padding: this.pad}, ...this.contentStyle}
    }
  }
}
</script>

<style scoped lang="scss">
.yt-card {
  & + .yt-card {
    .title {
      margin-top: 16px;
    }
  }
  .title {
    font-size: 14px;
    font-weight: bold;
    color: #1E2027;
    line-height: 1;
    margin-bottom: 10px;
    padding-left: 4px;
  }

  .sub-title {
    font-size: 14px;
    // font-weight:500;
    color: #9CA2B1;
    line-height: 1;
    margin-bottom: 6px;
  }

  .content {
    background: var(--el-bg-color);
    //box-shadow: 4px 12px 4px 4px rgba(0, 0, 0, 0.04), 4px 8px 4px rgba(0, 0, 0, 0.08);
    border-radius: 12px;

    &.isFirst {
      margin-top: 0;
    }
  }

  & + .yt-card {
    .content {
      margin-top: 8px;

    }
  }
}
</style>

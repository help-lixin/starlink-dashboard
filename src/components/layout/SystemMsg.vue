<script setup lang="ts">
  import {ref, computed} from "vue"
  const dataList = ref([
    {
      type: 'system',
      content: '流程审批通知',
      state: 0,
      id: 1,
      time: '2024年4月10日'
    },
    {
      type: 'system',
      content: '流程审批通知',
      state: 1,
      id: 2,
      time: '2024年4月10日'
    },
    {
      type: 'system',
      content: '流程审批通知，流程审批通知，流程审批通知，流程审批通知，流程审批通知，流程审批通知，流程审批通知，流程审批通知',
      state: 0,
      id: 3,
      time: '2024年4月10日'
    },
  ])
  const emits = defineEmits(['close', 'update:isShow'])
  withDefaults(defineProps<{isShow: boolean}>(), { isShow: false})
  const totalData = ref(0)
  const isLoading = ref(false)
  const hasMore = computed(() => {
    return dataList.value.length >= totalData.value
  })
  const noReadCount = ref(0)

  const close = () => {
    emits('update:isShow', false)
  }
  // 加载更更多
  const loadMoreHandel = (obj) => {
    console.log(obj, 'obj')
  }

  const clickHandel = (item, index) => dataList.value[index].state = 1

</script>

<template>
  <transition :name="'msg'">
    <div class="system-msg" v-if="isShow">
      <div class="mask" @click="close"></div>
      <div class="main-content">
        <div class="head">
          <div class="title">消息中心</div>
          <div class="msg">您有<span>{{noReadCount}}</span>条消息未读！</div>
        </div>
        <div class="msg-body">
        <load-more height="calc(100vh - 78px)" :has-more="hasMore" :loading="isLoading" @loadMore="loadMoreHandel">
            <div class="msg-item" :class="item.state === 1 && 'is-reader'" v-for="(item, index) in dataList" :key="item.id" @click="clickHandel(item, index)">
              <div class="body">
                <div class="content" :title="item.content">{{item.content}}</div>
              </div>
              <div class="footer">
                <el-tag type="success">{{item.type}}</el-tag>
                <div class="time">{{item.time}}</div>
              </div>
            </div>
        </load-more>
        </div>
      </div>
    </div>
  </transition>

</template>

<style scoped lang="scss">
  .system-msg {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 12;
    background-color: rgba(0,0,0,0.5);
    .head {
      height: 78px;
      background-color: #f9f9f9;
      box-shadow: inset 0 -1px 0 0 #e7eaec;
      padding: 20px 0 0 20px;
      .title {
        cursor: pointer;
        font-size: 22px;
        color: #2c59d6;
      }
      .msg {
        margin-top: 8px;
        font-size: 12px;
        color: #676a6c;
        span {
          color: #2c59d6;
        }
      }
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .time {
        font-size: 12px;
        color: #676a6c;
      }
    }
    .msg-body {
      .msg-item {
        padding: 8px 20px;
        border-bottom: 1px solid #e7eaec;
        cursor: pointer;
        &.is-reader {
          cursor: auto;
          .content {
            color: #676a6c;
          }
        }
        .content {
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          cursor: pointer;
          margin-bottom: 6px;
        }
      }
    }
    .mask {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
    .main-content {
      background-color: white;
      width: 384px;
      position: absolute;
      right: 0;
      top:0;
      bottom: 0;
    }
  }
  .msg-enter-from {
    opacity: 0;
    .main-content {
      transform: translateX(100%);
    }
  }

  .msg-enter-to {
    opacity: 1;
    .main-content {
      transform: translateX(0%);
    }
  }

  .msg-enter-active {
    transition: all 0.3s ease;
    .main-content {
      transition: all 0.3s ease;
    }
  }

  .msg-leave-to {
    opacity: 0;
    .main-content {
      transform: translateX(100%);
    }
  }

  .msg-leave-from {
    opacity: 1;
    .main-content {
      transform: translateX(0%);
    }
  }
  .msg-leave-active {
    transition: all 0.3s ease;
    .main-content {
      transition: all 0.3s ease;
    }
  }
</style>

<template>
  <div class="btnMenuList">
    <div class="menuList">
      <span v-if="showBtnList.length === 0">--</span>
      <template v-else-if="showBtnList.length < 3">
        <template v-for="(item, index) in showBtnList" :key="index">
          <span
            class="btnSpan"
            :class="item.class + (item.isDisable ? ' disabled' : '')"
            @click.stop="clickItem(item)"
            >{{ typeof item.btnName === 'function' ? item.btnName(rowData) : item.btnName }}</span
          >
          <span class="spliceSpan" v-if="index < showBtnList.length - 1">|</span>
        </template>
      </template>
      <template v-else>
        <el-dropdown
          overlayClassName="btnMenus-overlay"
          placement="bottom"
          class="btnMenus"
        >
          <el-icon><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(item, index) in showBtnList"
                :key="index"
                :disabled="item.isDisable"
                @click="clickItem(item)"
              >
                <span :class="item.class">{{ typeof item.btnName === 'function' ? item.btnName(rowData) : item.btnName }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
  </div>
</template>

<script>
import { isPermission } from "@/main";

export default {
  name: 'YtBtnMenuList',
  props: {
    rowData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    dataIndex: {
      type: Number,
      default: undefined
    },
    /**
     * {Array}
     * btnName: '删除',
     * permArray: 权限code数组
     * isShow(){return true},
     * class: 'yt-color-error-hover',
     * isDisable: true, false,是否禁用按钮
     * clickEvent: this.del
     * */
    btnList: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    computedRowData() {
      return { ...this.rowData, _isList: true }
    },
    showBtnList() {
      return this.btnList?.filter((item) => isPermission(item.permArray) && item.isShow(this.rowData, this.dataIndex))
    }
  },
  data() {
    return {}
  },
  methods: {
    clickItem(item) {
      if (item.isDisable) return
      item.clickEvent && item.clickEvent(this.computedRowData, this.dataIndex)
    },
    getPopupContainer(triggerNode) {
      const dom = triggerNode.closest('#dropDownBtnWrap')
      return dom || document.body
      // return document.body
    }
  }
}
</script>

<style scoped lang="scss">
.btnMenus-overlay .ant-dropdown-menu {
  top: 4px;
  right: -12px;
  border-radius: 8px;
}

:deep(.ant-dropdown-trigger) {
  .icon-select-circle {
    margin-left: 8px;
    font-size: 12px;
    transition: all 0.2s;
    transform: rotate(0deg);
  }

  &.ant-dropdown-open {
    .icon-select-circle {
      transform: rotate(180deg);
    }
  }
}

.btnMenuList {
  display: inline;
  font-size: 0;

  .menuList {
    font-size: 14px;
  }

  .btnSpan {
    cursor: pointer;
    line-height: 1;

    &.disabled {
      cursor: not-allowed;
      color: #838a9b;
    }

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .spliceSpan {
    color: #d7dbe5;
    margin: 0 8px 0 6px;
  }

  .btnMenus {
    .list-menu {
      margin-top: -6px;
    }
  }
}
</style>

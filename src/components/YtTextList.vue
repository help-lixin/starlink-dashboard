<!--详情，展示数据的form-item的list组件-->
<template>
    <div class="YtFormList" :class="{ 'labelBlock': labelBlock }">
        <el-row type="flex" :gutter="32">
            <el-col :style="computedMarginBottom(index)" :class="item.class" :span="item.span || (labelBlock ? 8 : 12)" v-for="(item, index) in showFormList" :key="index">
                <div class="label">
                    <slot :name="item.slotLabel" v-bind:label="item.label" v-bind:item="item">{{item.label}}</slot>
                </div>
                <div class="value">
                    <slot :name="item.slotContent" v-bind:value="item.value" v-bind:item="item">{{item.value}}</slot>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts">
import type {PropType}  from 'vue';
import {defineComponent}  from 'vue';
import { cloneDeep } from 'lodash'

interface FormItem {
  label: string;
  slotLabel?: string;
  slotContent?: string;
  class?: string;
  span?: number;
  value?: any;
  defaultValue?: any;
  format?: (value: any, item: FormItem, index: number) => Promise<any>;
}

export default defineComponent({
  name: 'YtFormList',
  props: {
    formList: {
      type: Array as () => FormItem[],
      default: () => [],
    },
    labelBlock: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const showFormList = ref<FormItem[]>([]);

    const computedMarginBottom = (index: number) => {
      if(props.labelBlock) return {
        marginBottom: '16px'//上下间距24px要加上本身字体的间距
      }
      // 如果最后一个是24，则最后一个margin-bottom为0, span默认为12
      const len = props.formList.length
      if (props.formList[len - 1].span === 24) {
        if (index === len - 1) {
          return {
            marginBottom: '0'
          }
        }
      } else if (props.formList[len - 1].span === undefined) {
        // 最后一个和倒数第二个都为12，则2个都为0
        if (index === len - 1) {
          return {
            marginBottom: '0'
          }
        }
        if (props.formList[len - 2] && props.formList[len - 2].span === undefined) {
          if (index === len - 2) {
            return {
              marginBottom: '0'
            }
          }
        }
      }
      return {
        marginBottom: '20px'
      }
    };

    const getValue = async (item: FormItem, index: number) => {
      const { value, defaultValue, format } = item
      return new Promise((resolve, reject) => {
        if (format instanceof Function) {
          Promise.resolve(format(value, item, index)).then(res => {
            resolve(res)
          })
        } else {
          if (value === undefined || value === null || value === '') {
            resolve(defaultValue || '--')
          } else {
            resolve(value)
          }
        }
      })
    };

    onMounted(() => {
      updateShowFormList();
    });

    onUpdated(() => {
      updateShowFormList();
    });

    const updateShowFormList = () => {
      const copyValue = cloneDeep(props.formList);
      for (let i in copyValue) {
        (async () => {
          copyValue[i].value = await getValue(copyValue[i], Number(i)).catch((e) => console.log(e));
        })();
      }
      showFormList.value = copyValue;
    };

    return {
      showFormList,
      computedMarginBottom,
    };
  },
});
</script>
<style scoped lang="scss">
    .YtFormList {
        ::v-deep(.el-col) {
            display: flex;
            font-size: 14px;
            padding-right: 32px;
            .label {
                flex: 0 0 85px;
                font-weight: 400;
                margin: 0;
                padding: 0;
                background-color: transparent;
                font-size: 14px;
                color: var(--el-text-color-primary);
                text-align: right;
            }
            .value {
              color: var(--el-text-color-primary);
                font-weight: 400;
                flex: 0 0 calc(100% - 95px);
                padding-left: 16px;
                word-break: break-all;
            }
        }
        ::v-deep(.el-col-12 + .el-col-12:nth-child(even)) {
            padding-right: 0;
            padding-left: 16px;
        }
        ::v-deep(.el-col-24) {
            padding-right: 0;
        }
        // 上下结构的
        &.labelBlock{
            .el-row-flex{
                align-items: flex-start;
            }
            .el-col{
                flex-direction: column;
                .label{
                    padding: 0;
                    background-color: transparent;
                    text-align: left;
                    flex: 1;
                }
                .value{
                    padding-left: 0;
                }
            }
        }
    }
</style>

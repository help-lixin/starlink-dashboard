<template>
  <div class="piemain">
    <div ref="myChart" :style="{ width: '99%', height: heights + 'px' }"></div>
    <div class="maysd">
      <div v-for="(item, index) in showLegend" :key="index" class="pielabel">
        <i :style="{ 'background-color': colorList[index] }"></i>
        <label>{{ item.name }}</label>
        <span>{{ showPercent(item) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { shallowRef, ref, toRefs, onMounted, watchEffect, computed } from 'vue'
  import * as echarts from 'echarts'

  const myChart = shallowRef<HTMLElement>() //也可以用const myChart = ref<any>();
  const myCharts = shallowRef()

  interface IPieChartProps {
    heights: number
    dataList: {
      value: number
      name: string
    }[]
  }

  const props = withDefaults(defineProps<IPieChartProps>(), {
    heights: 192,
    dataList: () => [
      {
        name: '测试',
        value: 10
      }
    ]
  })
  const textColor = 'rgba(99,115,129,1)'
  const { heights, dataList } = toRefs<IPieChartProps>(props)

  const showLegend = computed(() => {
    const total = dataList.value.reduce((total, row) => (total += Number(row.value)), 0)
    return dataList.value.map((row) => {
      return {
        ...row,
        percentage: row.value / total
      }
    })
  })
  const showPercent = (item: { name: string; value: number; percentage: number }) => {
    console.log(item.percentage)
    return (item.percentage * 100).toFixed(1) + '%'
  }

  const colorList = ref([
    'rgba(246, 93, 104, 1)',
    'rgba(255, 176, 0, 1)',
    'rgba(250, 243, 0, 1)',
    'rgba(62, 119, 252, 1)',
    'rgba(0, 237, 255, 1)',
    'rgba(0, 255, 185, 1)'
  ])

  function _pie2() {
    let dataArr = []
    for (let i = 0; i < dataList.value.length; i++) {
      if (i % 2 === 0) {
        dataArr.push({
          value: 20,
          itemStyle: {
            normal: {
              color: 'rgba(258, 258, 258, 0.3)',
              borderWidth: 2,
              borderColor: 'rgba(258, 258, 258, 0.3)'
            }
          }
        })
      } else {
        dataArr.push({
          value: 20,
          itemStyle: {
            normal: {
              color: 'rgba(258, 258, 258, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(258, 258, 258, 0.2)'
            }
          }
        })
      }
    }
    return dataArr
  }
  function _pie3() {
    let dataArr = []
    for (let i = 0; i < dataList.value.length; i++) {
      dataArr.push({
        value: 20,
        itemStyle: {
          normal: {
            color: 'rgba(258, 258, 258, 1)',
            borderWidth: 1,
            borderColor: 'rgba(258, 258, 258, 1)'
          }
        }
      })
    }
    return dataArr
  }

  onMounted(() => {
    myCharts.value = echarts.init(myChart.value!)
  })

  const grid = {
    left: '0'
  }

  watchEffect(() => {
    myCharts.value?.setOption({
      color: colorList.value,
      grid,
      series: [
        {
          type: 'pie',
          zlevel: 2,
          center: ['18%', '48%'],
          radius: ['86%', '86%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false
            },
            position: 'center'
          },
          emphasis: {
            label: {
              show: false,
              fontSize: '40',
              color: 'red'
            }
          },
          hoverAnimation: false,
          labelLine: {
            show: false
          },
          data: _pie2()
        },
        {
          type: 'pie',
          zlevel: 2,
          silent: true,
          center: ['18%', '48%'],
          radius: ['60%', '60%'],
          hoverAnimation: false,
          label: {
            normal: {
              show: false
            }
          },
          data: _pie3()
        },

        {
          type: 'pie',
          center: ['18%', '48%'],
          radius: ['67%', '75%'],
          zlevel: 1,
          label: {
            normal: {
              show: false,
              position: 'center',
              formatter: function (data: any) {
                return data.percent.toFixed(1) + '%' + '\n\r' + '{total|' + data.name + '}'
              },
              color: textColor,
              fontFamily: 'DINAlternate-Bold,DINAlternate',
              fontSize: 26,
              rich: {
                total: {
                  color: textColor,
                  fontFamily: 'pingfang',
                  fontSize: 14
                },
                active: {
                  color: textColor,
                  fontFamily: 'DINAlternate-Bold,DINAlternate',
                  fontSize: 26
                }
              }
            },
            emphasis: {
              //中间文字显示
              show: true
            }
          },
          labelLine: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            },
            tooltip: {
              show: false
            }
          },
          data: dataList.value
        }
      ]
    })
    let selectIndex = 1
    //设置默认选中高亮部分
    myCharts.value?.dispatchAction({
      type: 'highlight',
      seriesIndex: 2,
      dataIndex: selectIndex
    })

    myCharts.value?.on('mouseover', function (e: { dataIndex: any }) {
      if (e.dataIndex != selectIndex) {
        myCharts.value?.dispatchAction({
          type: 'downplay',
          seriesIndex: 2,
          dataIndex: selectIndex
        })

        myCharts.value?.dispatchAction({
          type: 'highlight',
          seriesIndex: 2,
          dataIndex: e.dataIndex
        })
        selectIndex = e.dataIndex
      }
    })
  })
</script>

<style scoped lang="scss">
  .piemain {
    position: relative;
  }

  .maysd {
    width: 320px;
    position: absolute;
    left: 35%;
    top: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .pielabel {
      position: relative;
      width: 144px;
      height: 36px;
      line-height: 20%;
      margin: 5px 8px;
      background: #e7e8eb;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      border-top-left-radius: 10px;

      ::after {
        position: absolute;
        left: 0;
        top: 35px;
        content: '';
        width: 6px;
        height: 1px;
        background: rgba(99,115,129,1);
      }

      i {
        float: left;
        width: 4px;
        height: 9px;
        border-radius: 1px;
        margin: 13px 5px 12px 8px;
      }
      label {
        font-size: 12px;
        line-height: 36px;
        font-family: pingfang;
        color: rgba(99,115,129,1);
      }

      span {
        float: right;
        font-size: 14px;
        line-height: 36px;
        margin-right: 16px;
        color: rgba(99,115,129,1);
        font-family: DINAlternate-Bold, DINAlternate;
      }
    }
  }
</style>

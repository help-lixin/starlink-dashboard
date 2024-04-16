<template>
  <div class="asd">
    <div ref="myChart" :style="{ width: '100%', height: heights + 'px' }"></div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, shallowRef, toRefs, watchEffect } from 'vue'
  import * as echarts from 'echarts/core'
  import { LineChart, LineSeriesOption } from 'echarts/charts'
  import {
    DatasetComponent,
    DatasetComponentOption,
    GridComponent,
    GridComponentOption,
    TitleComponent,
    TitleComponentOption,
    TooltipComponent,
    TooltipComponentOption,
    TransformComponent
  } from 'echarts/components'
  import { LabelLayout, UniversalTransition } from 'echarts/features'
  import { CanvasRenderer } from 'echarts/renderers'
  import { deepCopy } from '@/util/deepCopy'

  // 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
  type ECOption = echarts.ComposeOption<
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
  >

  // 注册必须的组件
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LineChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
  ])

  const myChart = shallowRef<HTMLElement>() //也可以用const myChart = ref<any>();
  const myCharts = shallowRef()

  interface ILineChartProps {
    heights: number
    seriesData: Array<{
      name: string
      unit: string | undefined
      data: Array<number>
    }>
    // colNum: number
    xData: {
      data: Array<string | number>
      formatter?: string
    }
    yData: {
      name: string
    }
    yExtraConfig?: object
  }
  const textColor = 'rgba(99,115,129,1)'
  const props = withDefaults(defineProps<ILineChartProps>(), {
    heights: 192,
    seriesData: () => [
      {
        name: '基建',
        unit: undefined,
        data: [120, 150, 210]
      }
    ],
    // colNum: 1,
    xData: () => ({
      data: ['2020', '2021', '2022'],
      formatter: '{value} 年'
    }),
    yData: () => ({
      name: '万元'
    })
  })
  const { seriesData, heights, xData, yData, yExtraConfig } = toRefs<ILineChartProps>(props)
  const legendData = computed(() => {
    return seriesData.value.map((row) => row.name)
  })
  const colorList = [
    'rgba(246, 189, 22, 1)',
    'rgba(62, 119, 252, 1)',
    'rgba(246, 93, 104, 1)',
    'rgba(95, 229, 253, 1)'
  ]
  watchEffect(() => {
    const echartsOption = {
      color: colorList,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(7, 18, 30, 0.8)',
        borderColor: 'rgba(7, 18, 30, 0.8)',
        axisPointer: {
          //鼠标放上，阴影部分
          type: 'shadow',
          shadowStyle: {
            opacity: 0.1,
            color: 'rgba(255, 255, 255, 0.5)',
            shadowBlur: 100,
            shadowOffsetX: 100,
            shadowOffsetY: 10
          },
          crossStyle: {
            width: 5.5
          }
        },
        formatter: function (params: any) {
          var showdata = ''
          params.forEach((item: any) => {
            showdata += `
                <div style='color: #FFFFFF;'>
                <label style='width: 4px;height: 9px;background: ${
                  item.color
                };display: inline-flex;margin-right: 8px;border-radius: 1px'></label>
                ${item.seriesName} : ${item.data || 0} ${
              seriesData.value.find((row) => row.name === item.seriesName)?.unit ??
              yData.value.name ??
              '万元'
            }
                </div>`
          })
          // 根据自己的需求返回数据
          return showdata
        }
        //formatter: '' //{a}（系列名称），{b}（数据项名称），{c}（数值）, {d}（百分比）
      },
      legend: {
        data: [] as string[],
        icon: 'roundRect',
        right: 10,
        itemHeight: 4,
        itemWidth: 12,
        textStyle: {
          color: textColor,
          fontSize: 12,
          fontStyle: 'normal'
        }
      },
      grid: {
        left: '10',
        right: '20',
        bottom: '0',
        top: '25%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [] as Array<string | number>,
        axisLabel: {
          fontSize: 12, //X轴文字大小
          align: 'center',
          interval: 'auto',
          color: textColor,
          formatter: undefined as string | undefined
        },
        axisLine: {
          lineStyle: {
            color: textColor,
            opacity: 0.1
          },
          show: true
        },
        //刻度
        axisTick: {
          show: false,
          alignWithLabel: false,
          inside: true,
          length: 1,
          lineStyle: {
            type: 'dotted',
            width: 6.5
          }
        }
      },
      yAxis: {
        name: '万元',
        type: 'value',
        splitLine: {
          lineStyle: {
            opacity: 0.04
          }
        },
        nameTextStyle: {
          align: 'right',
          color: textColor
        },
        axisLabel: {
          color: textColor,
          fontSize: 12 //Y轴文字大小
        },
        axisLine: {
          lineStyle: {
            color: textColor
          }
        },
        ...(yExtraConfig?.value ?? {})
      },
      series: [] as LineSeriesOption[]
    }

    const defaultService: LineSeriesOption = {
      type: 'line',
      smooth: true,
      symbolSize: 0
    }
    const colorList01 = [
      'rgba(246, 189, 22, 0.1)',
      'rgba(62, 119, 252, 0.1)',
      'rgba(246, 93, 104, 0.1)',
      'rgba(95, 229, 253, 0.1)'
    ]
    const colorList005 = [
      'rgba(246, 189, 22, 0.05)',
      'rgba(62, 119, 252, 0.05)',
      'rgba(246, 93, 104, 0.05)',
      'rgba(95, 229, 253, 0.05)'
    ]
    const colorList0 = [
      'rgba(246, 189, 22, 0)',
      'rgba(62, 119, 252, 0)',
      'rgba(246, 93, 104, 0)',
      'rgba(95, 229, 253, 0)'
    ]
    const myService = seriesData.value.map((row, index) => {
      return {
        ...defaultService,
        ...row,
        areaStyle: {
          opacity: 0.1,
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorList01[index] },
              { offset: 0.5, color: colorList005[index] },
              { offset: 1, color: colorList0[index] }
            ])
          }
        }
      }
    })
    echartsOption.yAxis.name = yData.value.name
    echartsOption.xAxis.data = xData.value.data
    echartsOption.xAxis.axisLabel.formatter = xData.value.formatter ?? '{value}'
    echartsOption.series = myService
    echartsOption.legend.data = legendData.value
    myCharts.value?.setOption(echartsOption)
  })

  onMounted(() => {
    myCharts.value = echarts.init(myChart.value!)
  })
</script>

<style scoped>

</style>

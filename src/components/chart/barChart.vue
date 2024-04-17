<template>
  <div>
    <div ref="myChart" :style="{ width: '99%', height: heights + 'px' }"></div>
  </div>
</template>

<script lang="ts" setup>
  // @ts-nocheck
  // ts不检查该文件,否则,打包都不能通过
  
  import { computed, onMounted, shallowRef, toRefs, watchEffect } from 'vue'
  import * as echarts from 'echarts/core'
  import { BarChart, BarSeriesOption, PictorialBarChart } from 'echarts/charts'
  import {
    DatasetComponent,
    DatasetComponentOption,
    GridComponent,
    GridComponentOption,
    TitleComponent,
    TitleComponentOption,
    TooltipComponent,
    TooltipComponentOption,
    TransformComponent,
    LegendComponent,
    LegendComponentOption,
  } from 'echarts/components'
  import { LabelLayout, UniversalTransition } from 'echarts/features'
  import { CanvasRenderer } from 'echarts/renderers'


  const textColor = 'rgba(99,115,129,1)'
  // 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
  type ECOption = echarts.ComposeOption<
    | BarSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
  >

  // 注册必须的组件
  echarts.use([
    PictorialBarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    BarChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
    LegendComponent
  ])

  const myChart = shallowRef<HTMLElement>() //也可以用const myChart = ref<any>();
  const myCharts = shallowRef()

  interface IBarChartProps {
    heights: number
    seriesData: Array<{
      name: string
      data: Array<number>
    }>
    colNum: number
    xData: {
      data: Array<string | number>
      formatter?: string
    }
    yData: {
      name: string
    }
    yExtraConfig?: object
  }

  const props = withDefaults(defineProps<IBarChartProps>(), {
    heights: 192,
    seriesData: () => [
      {
        name: '基建',
        data: [120, 150, 210]
      }
    ],
    colNum: 1,
    xData: () => ({
      data: ['2020', '2021', '2022'],
      formatter: '{value} 年'
    }),
    yData: () => ({
      name: '万元'
    })
  })
  const { seriesData, heights, xData, yData, yExtraConfig } = toRefs<IBarChartProps>(props)
  const legendData = computed(() => {
    return seriesData.value.map((row) => row.name)
  })
  const color = [
    'rgba(246, 189, 22, 1)',
    'rgba(62, 119, 252, 1)',
    'rgba(246, 93, 104, 1)',
    'rgba(95, 229, 253, 1)'
  ]
  const color1 = [
    'rgba(246, 189, 22, 0.5)',
    'rgba(62, 119, 252, 0.5)',
    'rgba(246, 93, 104, 0.5)',
    'rgba(95, 229, 253, 0.5)'
  ]
  const color2 = [
    'rgba(246, 189, 22, 0.1)',
    'rgba(62, 119, 252, 0.1)',
    'rgba(246, 93, 104, 0.1)',
    'rgba(95, 229, 253, 0.1)'
  ]
  watchEffect(() => {
    const echartsOption = {
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
          var lenght = params.length / 2
          params.forEach((item: any, index: number) => {
            if (lenght <= index) {
              showdata += `
                <div style='color: #FFFFFF;'>
                <label style='width: 4px;height: 9px;background: ${
                  item.color.colorStops[0].color
                };display: inline-flex;margin-right: 8px;border-radius: 1px'></label>
                ${item.seriesName === '' ? item.name : item.seriesName} : ${item.data}
                </div>`
            }
          })
          // 根据自己的需求返回数据
          return showdata
        }
      },
      legend: {
        right: '3%',
        data: [] as string[],
        itemHeight: 4,
        itemWidth: 10,
        textStyle: {
          color: textColor,
          fontSize: 12,
          fontStyle: 'normal'
        },
        // 因为柱子顶部和底部是通过 offset 跟柱子结合起来的，如果取消选中，柱子数量变化，又要重新计算 offset，为了简单点就直接禁掉了
        selectedMode: false
      },
      grid: { left: '5%', right: '0', bottom: '5%', height: '76%', containLabel: true },
      xAxis: {
        type: 'category',
        data: [] as (string | number)[],
        axisLine: { lineStyle: { color: textColor, opacity: 0.1 } },
        axisTick: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: 12, //X轴文字大小
          formatter: '' as undefined | string
        }
      },
      yAxis: {
        boundaryGap: [0, 0.01],
        axisLine: { lineStyle: { color: textColor, opacity: 1 } },
        axisTick: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: 12 //Y轴文字大小
        },
        splitLine: { lineStyle: { color: textColor, opacity: 0.1 } },
        ...(yExtraConfig?.value ?? {})
      },
      series: [] as BarSeriesOption[]
      // legend 对应的 color，实际上柱状图的颜色都是在 itemStyle 里定义的
    }

    console.log(echartsOption, yExtraConfig, 'echartsOption')

    const defaultService1: BarSeriesOption = {
      type: 'pictorialBar',
      symbol: 'rect',
      barWidth: 14,
      symbolSize: [14, 3],
      symbolOffset: [0, 0],
      z: 12,
      symbolPosition: 'end'
    }
    const myService1 = seriesData.value.map((row, index) => {
      defaultService1.itemStyle = {
        //柱子渐变色
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: color[index]
          },
          {
            offset: 1,
            color: color[index]
          }
        ])
      }
      if (seriesData.value.length === 3) {
        if (index === 0) {
          defaultService1.symbolOffset = [-17, 0]
        } else if (index === 1) {
          defaultService1.symbolOffset = [0, 0]
        } else if (index === 2) {
          defaultService1.symbolOffset = [17, 0]
        }
      } else if (seriesData.value.length === 2) {
        console.log(seriesData.value.length, 'seriesData.value.length')
        if (index === 0) {
          defaultService1.symbolOffset = [-8, 0]
        } else if (index === 1) {
          defaultService1.symbolOffset = [9, 0]
        }
      }
      return {
        ...defaultService1,
        ...row
      }
    })
    const defaultService: BarSeriesOption = {
      type: 'bar',
      barWidth: 14,
      showBackground: false,
      data: [],
      itemStyle: {
        // 柱体渐变色
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(246, 189, 22, 1)'
          },
          {
            offset: 1,
            color: 'rgba(246, 189, 22, 0.1)'
          }
        ])
      }
    }
    const myService = seriesData.value.map((row, index) => {
      defaultService.itemStyle = {
        //柱子渐变色
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: color1[index]
          },
          {
            offset: 1,
            color: color2[index]
          }
        ])
      }

      return {
        ...defaultService,
        ...row
      }
    })
    echartsOption.xAxis.data = xData.value.data
    echartsOption.xAxis.axisLabel.formatter = xData.value.formatter ?? '{value}'
    console.log(myService, myService1, 'test123')
    echartsOption.series = myService.concat(myService1)
    // echartsOption.series = myService1
    echartsOption.legend.data = legendData.value
    console.log(echartsOption, 'echartsOption')
    myCharts.value?.setOption(echartsOption)
  })

  onMounted(() => {
    // 绘制图表
    myCharts.value = echarts.init(myChart.value!)
  })
</script>

<style scoped></style>

<script setup lang="ts">
    // import SvgIcon from '@/components/SvgIcon.vue'
    import barChart from "@/components/chart/barChart.vue"
    import lineChart from "@/components/chart/lineChart.vue"
    import pieChart from "@/components/chart/pieChart.vue"
</script>

<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="12">
        <yt-card :title="'柱状图'">
          <barChart :heights="400" :series-data="[{name: '课程', data: [20,40,60]}, {name: '人数', data: [50,58,42]}]" :x-data="{data: ['周一', '周二', '周三']}" :y-data="'课程数量'"></barChart>
        </yt-card>
      </el-col>
      <el-col :span="12">
        <yt-card :title="'折线图'">
          <lineChart :heights="400" :series-data="[{name: '人数', data: [20,40,60]}]" :x-data="{data: ['周一', '周二', '周三']}" :y-data="{name: ''}"></lineChart>
        </yt-card>
      </el-col>
      <el-col :span="12">
        <yt-card :title="'饼图'" style="margin-top: 20px;">
          <pieChart :heights="192" :data-list="[{value: 20, name: '手机'},{value: 20, name: '电脑'}, {value: 20, name: '平板电脑'}]"></pieChart>
        </yt-card>
      </el-col>
    </el-row>

<!--    Welcome To Vue.-->
    <!-- <SvgIcon name="user" color="pink"/> -->
  </div>

</template>

<style lang="scss" scoped>

</style>

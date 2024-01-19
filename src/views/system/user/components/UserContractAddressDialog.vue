<script setup lang="ts">
const props = defineProps<{
  isShowDialog: boolean
  userInfo: string
}>()
const editRow = ref()
const addressList = ref([])
watchEffect(async () => {
  if (props.isShowDialog) {
    // 处理对话框显示逻辑
    console.log('对话框显示')
    // const { userId } = props
    // 这里调接口获取数据
    // const {addressList} = await getUserAddressListByUserId(userId)
    addressList.value = [
      {
        id: '1',
        tel: '13000000000',
        address: '浙江省杭州市西湖区文三路 138 号东方通信大厦 7 楼 501 室',
        isDefault: true,
        createTime: '2021-01-01 12:12:12',
        updateTime: '2021-01-01 12:12:12'
      }
    ]
  }
})

const showUserInfo = computed(() => {
  const defaultUserInfo = [
    {
      label: '用户名',
      field: 'userName'
    },
    {
      label: '手机号',
      field: 'phonenumber'
    },
    {
      label: '邮箱',
      field: 'email'
    }
  ]
  return defaultUserInfo.map(row => ({ ...row, value: props.userInfo[row.field] }))
})
const tableCol = [
  {
    label: '详细地址',
    prop: 'address',
  },
  {
    label: '电话',
    prop: 'tel',
  },
  {
    label: '是否默认',
    prop: 'isDefault',
  }]
</script>

<template>
  <el-dialog :model-value="isShowDialog" width="720px" title="关联地址" :close-on-click-modal="false"  @close="$emit('update:isShowDialog', false)">
    <yt-card :title="'基本信息'" :padding="24">
      <YtTextList :form-list="showUserInfo"></YtTextList>
    </yt-card>
    <yt-card title="关联地址" :padding="24">
      <el-button type="primary" style="float: right;" plain>新增</el-button>
      <el-table :data="addressList">
        <el-table-column v-for="col in tableCol" :key="col.prop" :label="col.label" :prop="col.prop"></el-table-column>
        <el-table-column label="操作">
          <template  #default="scope">
            <el-button type="primary" plain size="small" @click="editRow = scope">编辑</el-button>
            <el-button plain size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </yt-card>
    <template #footer>
      <el-button @click="$emit('update:isShowDialog', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>

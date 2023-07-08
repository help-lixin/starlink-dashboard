<script setup lang="ts">
    // @ts-nocheck  
    import { Plus ,Delete, Edit, Search , RefreshRight} from '@element-plus/icons-vue'
    import {queryMenuList,handleTree,parseTime} from "@/api/menus"
    
    import type {SysMenuItem} from "@/api/menus"

    let loading = true;
    let isExpandAll = true;
    let refreshTable = true;
    // 显示搜索条件
    let showSearch = true;
    
    // 状态管理
    const statusDicts = [
      {
        value: '0',
        label: '正常',
      },
      {
        value: '1',
        label: '停用',
      }];

    // 要定义成:reactive,否则,无法输入内容
    const queryParams = reactive({
      menuName : "",
      status: "0"
    });
    const queryForm = queryParams;

    // 存储数据的引用
    const menuListRef = ref<SysMenuItem[]>([] as SysMenuItem[]);

    const  queryMenus = async (params:any={})=> {
        const menuResult = await queryMenuList(params);
        if(menuResult.code == 200){
            // 把菜单打平,渲染成一颗树(为什么不移交给后端)
            menuListRef.value = handleTree(menuResult.data,"menuId");
        } else {
            ElMessage.error("获取菜单信息失败");
        }
        loading = false;
    }

    // 查询处理
    function handleQuery(){
      queryMenus(queryParams);
    }

    // 重置处理
    function resetQuery(){
      queryForm.menuName="";
      queryForm.status="0";
      handleQuery();
    }
    
    // 更新
    function handleUpdate(row){
      console.log(row);
    }

    // 添加
    function handleAdd(row){
      console.log(row);
    }

    // 删除
    function handleDelete(row){
      console.log(row);
    }

    // 默认进入页面时,先进一次查询
    queryMenus();
</script>

<template>
   <el-card class="box-card">

    <el-form :model="queryParams" ref="queryForm"  :inline="true" v-show="showSearch">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="queryParams.menuName"
          placeholder="请输入菜单名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
          <el-option v-for="dict in statusDicts"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"  @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
        <el-button   @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
      </el-form-item>
    </el-form>


    
    <!-- table -->
    <el-table 
        :data="menuListRef" 
        v-if="refreshTable"
        v-loading="loading"
        row-key="menuId"
        :default-expand-all="isExpandAll"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        border style="width: 100%">
        <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="160" />
        <el-table-column prop="icon" label="图标" align="center" width="80">
          <template v-slot="scope">
            <svg-icon :icon-class="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="perms" label="权限标识" width="180" :show-overflow-tooltip="true"/>
        <!-- <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"/> -->
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template v-slot="scope">
            <span>{{ scope.row.status == 0 ? "正常" : "停用"  }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="200">
          <template v-slot="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column  label="操作" align="center" class-name="small-padding fixed-width">
          <template v-slot="scope">
            <el-button
              size="small"
              :icon="Edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            
            <el-button
              size="small"
              :icon="Plus"
              @click="handleAdd(scope.row)"
            >新增</el-button>
            
            <el-button
              size="small"
              :icon="Delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
    </el-table>

  </el-card>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: auto;
}
</style>
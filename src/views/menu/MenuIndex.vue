<script setup lang="ts">
    // @ts-nocheck  
    import {nextTick} from 'vue';
    import { Plus ,Delete, Edit, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
    import { queryMenuList,addMenu } from "@/api/menus"
    import { handleTree , toTree , parseTime , statusDicts , menuStatus , showStatus} from "@/utils/common"
    import type {SysMenuItem , MenuRequest} from "@/api/menus"

    let loading = true;
    let isExpandAll = ref(false);
    let refreshTable = ref(true);
    // 显示搜索条件
    let showSearch = true;

    // 要定义成:reactive,否则,无法输入内容
    const queryParams = reactive({
      menuName : "",
      status: "0"
    });
    const queryForm = ref(null);

    // 存储数据的引用
    const menuListRef = ref<SysMenuItem[]>([] as SysMenuItem[]);

    const  queryMenus = async (params:any={})=> {
        const menuResult = await queryMenuList(params);
        if(menuResult.code == 200){
            // 把菜单打平,渲染成一颗树
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
      queryForm.value.resetFields();
      handleQuery();
    }

    // 展开/折叠
    function toggleExpandAll(){
      refreshTable.value = false;
      isExpandAll.value = !isExpandAll.value;
      nextTick(() => {
        refreshTable.value = true;
      });
    }
    
    // 更新
    function handleUpdate(row){
      console.log(row);
    }

    // 删除
    function handleDelete(row){
      console.log(row);
    }


    // 弹出层默认是关闭
    let open = ref(false);
    // 弹出层标题
    let title = ref("");

    // 表单验证规则
    const rules = reactive<FormRules>({
        menuName: [
          { required: true, message: "菜单名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "菜单顺序不能为空", trigger: "blur" }
        ],
        path: [
          { required: true, message: "路由地址不能为空", trigger: "blur" }
        ]
    });

    const menuForm = reactive<MenuRequest>({
      menuId: undefined,
      perms : undefined,
      parentId: 0,
      menuName: undefined,
      icon: undefined,
      menuType: "M",
      orderNum: undefined,
      isFrame: "1",
      isCache: "0",
      visible: "0",
      status: "0"
    });


    // 菜单树型存储体
    const menuOptions = reactive([]);
    // 获取菜单树
    const getTreeselect = function(){
      queryMenuList({})
      .then((response)=>{
          //  清空数据
          menuOptions.splice( 0 , menuOptions.length);
          //  构建菜单
          const menu = { value: 0, label: '主类目', children: [] };
          // 转换成一颗树
          menu.children = toTree(response.data, menu.value as string);
          menuOptions.push(menu);
      });
    }

    function reset() {
      menuForm.menuId = undefined;
      menuForm.parentId = 0;
      menuForm.menuName = undefined;
      menuForm.icon = undefined;
      menuForm.menuType = "M";
      menuForm.orderNum = undefined;
      menuForm.isFrame = "1";
      menuForm.isCache = "0";
      menuForm.visible = "0";
      menuForm.status = "0";
    }

    // 添加
    function handleAdd(row){
      open.value = true;
      title.value = "添加菜单";

      reset();
      getTreeselect();
      if (row != null && row.menuId) {
        menuForm.parentId = row.menuId;
      } else {
        menuForm.parentId = 0;
      }
    }

    // 是否加载中
    const isLoading = ref(false);
    const formRef = ref<FormInstance>();
    // 提交表单
    async function submitForm(){
      isLoading.value = true;

      await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage({
                showClose: true,
                message: '表单验证失败',
                type: 'success',
            });
            isLoading.value = false;
            throw err;
        });

        if (menuForm.menuId != undefined) {
          // 修改
          
        }else{
          // 新增
          addMenu(menuForm)
          .then((response)=>{
            if(response.data.code == 200){
              ElMessage({
                showClose: true,
                message: '添加菜单成功',
                type: 'success',
            });
            open.value = false;
            reset();
            // 重新触发查询
            queryMenus();
            }
          });
        }
      isLoading.value = false;
    }

    // 取消
    function cancel(){
      open.value = false;
      reset();
    }

    function selectMenu(data,node){
      menuForm.parentId  = data.value;
    }

    // 默认进入页面时,先进一次查询
    queryMenus();
</script>

<template>
  <div class="app-container">
    <el-card class="box-card">
      <!-- 搜索处理 -->
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
        <el-form-item>
          <el-button type="primary"  @click="handleAdd"><el-icon><Plus /></el-icon>新增</el-button>
          <el-button   @click="toggleExpandAll"><el-icon><Sort /></el-icon>展开/折叠</el-button>
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
          <!-- <el-table-column prop="icon" label="图标" align="center" width="80">
            <template v-slot="scope">
              <svg-icon :icon-class="scope.row.icon" />
            </template>
          </el-table-column> -->
          <el-table-column prop="perms" label="权限标识" width="180" :show-overflow-tooltip="true"/>
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
    
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="formRef" :model="menuForm" :rules="rules"  label-width="100px">
        
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                v-model="menuForm.parentId"
                check-strictly
                highlight-current
                :data="menuOptions"
                size="large"
                :render-after-expand="true"
                @node-click="selectMenu"
                
                :show-count="true"
                placeholder="选择上级菜单"
              />
            </el-form-item>
          </el-col>
          
           <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="menuForm.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">动作(按钮)</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="menuForm.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="menuForm.menuType != 'F'">
            <el-form-item prop="isFrame">
              <span slot="label">
                <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                <el-icon><QuestionFilled /></el-icon> 
                </el-tooltip>
                是否外链
              </span>
              <el-radio-group v-model="menuForm.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="menuForm.menuType != 'F'">
            <el-form-item prop="path">
              <span slot="label">
                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                <el-icon><QuestionFilled /></el-icon> 
                </el-tooltip>
                路由地址
              </span>
              <el-input v-model="menuForm.path"  placeholder="请输入路由地址"/>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="menuForm.menuType == 'C'">
            <el-form-item prop="component">
              <span slot="label">
                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                <el-icon><QuestionFilled /></el-icon> 
                </el-tooltip>
                组件路径
              </span>
              <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="menuForm.menuType != 'M'">
            <el-form-item prop="perms">
              <el-input v-model="menuForm.perms" placeholder="请输入权限标识" maxlength="100" />
              <span slot="label">
                <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                <el-icon><QuestionFilled /></el-icon> 
                </el-tooltip>
                权限字符
              </span>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="menuForm.menuType == 'C'">
            <el-form-item prop="query">
              <el-input v-model="menuForm.query" placeholder="请输入路由参数" maxlength="255" />
              <span slot="label">
                <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                  <el-icon><QuestionFilled /></el-icon> 
                </el-tooltip>
                路由参数
              </span>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="menuForm.menuType == 'C'">
            <el-form-item prop="isCache">
              <span slot="label">
                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                <el-icon><QuestionFilled /></el-icon> 
                </el-tooltip>
                是否缓存
              </span>
              <el-radio-group v-model="menuForm.isCache">
                <el-radio label="0">缓存</el-radio>
                <el-radio label="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>


          <el-col :span="12" v-if="menuForm.menuType != 'F'">
            <el-form-item prop="visible">
              <span slot="label">
                <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                <el-icon><QuestionFilled /></el-icon> 
                </el-tooltip>
                显示状态
              </span>
              <el-radio-group v-model="menuForm.visible">
                <el-radio
                  v-for="dict in showStatus"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="menuForm.menuType != 'F'">
            <el-form-item prop="status">
              <span slot="label">
                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                  <el-icon><QuestionFilled /></el-icon> 
                </el-tooltip> 
                菜单状态
              </span>
              <el-radio-group v-model="menuForm.status">
                 <el-radio
                  v-for="dict in menuStatus"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio> 
              </el-radio-group>
            </el-form-item>
          </el-col>
        
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="isLoading">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
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
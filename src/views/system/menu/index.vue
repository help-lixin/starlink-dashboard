<script setup lang="ts">
    // @ts-nocheck
    import {nextTick} from 'vue';
    import { Plus ,Delete, Edit, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
    import { queryMenuList , addMenu , getMenu , updateMenu , delMenu } from "@/api/menus"
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
      reset();
      getTreeselect();
      getMenu(row.menuId).then(response => {
        Object.assign(menuForm , response.data.data);
        open.value = true;
        title.value = "修改菜单";
      });
    }

    // 删除
    function handleDelete(row){
        ElMessageBox.confirm(
          '是否确认删除名称为"' + row.menuName + '"的数据项？',
          'Warning',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(() => {
          delMenu(row.menuId).then((response)=>{
            if(response.data?.code == 200){
              ElMessage({type: 'info',message: "删除成功"})
              queryMenus();
            } else {
              ElMessage({type: 'warning',message: response.data?.msg})
            }
          })
        }).catch(() => {});
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
      menuForm.path = undefined
      Object.assign(menuForm , {
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
            ElMessage.error('表单验证失败');
            isLoading.value = false;
            throw err;
        });

        if (menuForm.menuId != undefined) {
          // 修改
          updateMenu(menuForm)
          .then((response)=>{
            if(response.data.code == 200){
              ElMessage({
                showClose: true,
                message: '修改菜单成功',
                type: 'success',
            });
            open.value = false;
            reset();
            // 重新触发查询
            queryMenus();
            }
          });
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

    function selectMenu(data){
      menuForm.parentId  = data.value;
    }

    // 默认进入页面时,先进一次查询
    queryMenus();
</script>

<template>
  <div class="app-container">
    <yt-card padding="18px 18px 0">
      <!-- 搜索处理 -->
      <el-form class="form-wrap"  :model="queryParams" ref="queryForm"  :inline="true" v-show="showSearch">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input
                v-model="queryParams.menuName"
                placeholder="请输入菜单名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="菜单状态" clearable >
                <el-option v-for="dict in statusDicts"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary"  @click="handleQuery" v-hasPerms="['/system/menu/list']"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button   @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </yt-card>
    <yt-card>
      <div class="option-wrap">
            <el-button
              type="primary"
              plain
              size="default"
              @click="handleAdd" v-hasPerms="['/system/menu/add']" ><el-icon><Plus /></el-icon>新增</el-button>
            <el-button
              type="primary"
              plain
              size="default"
              @click="toggleExpandAll" v-hasPerms="['/system/menu/add']" ><el-icon><Sort /></el-icon>展开/折叠</el-button>
        </div>
      <!-- table -->
      <el-table
        :data="menuListRef"
        v-if="refreshTable"
        v-loading="loading"
        row-key="menuId"
        :default-expand-all="isExpandAll"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        border style="width: 100%">
        <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="180" />
        <el-table-column prop="perms" label="权限标识" width="140" :show-overflow-tooltip="true"/>
        <el-table-column prop="component" label="组件路径" width="140" :show-overflow-tooltip="true"/>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template v-slot="scope">
            <span>{{ scope.row.status == 0 ? "正常" : "停用"  }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="170">
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
    </yt-card>


    <!-- 添加/修改菜单 -->
    <el-dialog :title="title" v-model="open" width="var(--dialog-lg-w)"  append-to-body>
      <yt-card>

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
              <el-form-item prop="isFrame" label="是否外链">
                <template v-slot:label>
                  <span class="tip-label">是否外链<el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
                <el-radio-group v-model="menuForm.isFrame">
                  <el-radio label="0">是</el-radio>
                  <el-radio label="1">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="menuForm.menuType != 'F'">
              <el-form-item prop="path" label-width="140">
                <template v-slot:label>
                  <span class="tip-label">路由地址<el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
                  <el-input v-model="menuForm.path"  placeholder="请输入路由地址"/>
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="menuForm.menuType == 'C'" >
              <el-form-item prop="component" label="组件路径">
                <template v-slot:label>
                  <span class="tip-label">组件路径<el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
                  <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="menuForm.menuType != 'M'">
              <el-form-item prop="perms" label="权限字符">
                <template v-slot:label>
                  <span class="tip-label">权限字符<el-tooltip content="控制器中定义的权限字符，如：/system/user/addUser" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
                <el-input v-model="menuForm.perms" placeholder="请输入权限标识" maxlength="100" />
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="menuForm.menuType == 'C'">
              <el-form-item prop="query" label="路由参数">
                <template v-slot:label>
                  <span class="tip-label">路由参数<el-tooltip content='访问路由的默认传递参数，如：{"id": 1, "name": "ry"}' placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
                <el-input v-model="menuForm.query" placeholder="请输入路由参数" maxlength="255" />
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="menuForm.menuType == 'C'">
              <el-form-item prop="isCache" label="是否缓存">
                <template v-slot:label>
                  <span class="tip-label">是否缓存<el-tooltip content='选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致' placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
                <el-radio-group v-model="menuForm.isCache">
                  <el-radio label="0">缓存</el-radio>
                  <el-radio label="1">不缓存</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="menuForm.menuType != 'F'">
              <el-form-item prop="visible" label="显示状态">
                <template v-slot:label>
                  <span class="tip-label">显示状态<el-tooltip content='选择隐藏则路由将不会出现在侧边栏，但仍然可以访问' placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
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
              <el-form-item prop="status" label="菜单状态">
                <template v-slot:label>
                  <span class="tip-label">菜单状态<el-tooltip content='选择停用则路由将不会出现在侧边栏，也不能被访问' placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip></span>
                </template>
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
      </yt-card>

      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="isLoading">确 定</el-button>
      </template>
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
.option-wrap {
  margin-bottom: 8px;
  text-align: right;
}

</style>

<script setup lang="ts">
  // @ts-nocheck  
  import { Plus ,Delete, Edit, EditPen, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
  import { parseTime , statusDicts , sexDicts , addDateRangeRuoyi } from "@/utils/common"
  import { listRole , addRole, updateRole , delRole ,getRole , roleMenuTreeSelect , changeRoleStatus } from "@/api/roles"
  import { treeSelect } from '@/api/menus';
  import { nextTick } from 'vue'


  const queryForm = ref(null);
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    roleName: undefined,
    roleKey: undefined,
    status: undefined
  })

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])

  // 选中数组
  const ids = ref([])
  // 非单个禁用
  const single = ref(true)
  // 非多个禁用
  const multiple = ref(true)

  const total= ref(0)
  const roleList = reactive([])

  // 表单
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = reactive({
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: "0",
        menuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined
      })
  const menuOptions = reactive([])
  const menuRef = ref({});
  const title = ref("")
  // 是否显示弹出层（数据权限）
  const menuExpand= ref(false)
  const menuNodeAll= ref(false)
  const defaultProps = {
      children: "children",
      label: "label"
  }

  // 表单规则
  const rules = reactive<FormRules>({
      roleName: [
        { required: true, message: "角色名称不能为空", trigger: "blur" }
      ],
      roleKey: [
        { required: true, message: "权限字符不能为空", trigger: "blur" }
      ],
      roleSort: [
        { required: true, message: "角色顺序不能为空", trigger: "blur" }
      ]
    })

  // 重置表单
  const reset = ()=> {
      Object.assign(form,{
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: "0",
        menuIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined
      })
  }


  // 获取列表
  const getList = ()=>{
    loading.value = true;
    listRole(addDateRangeRuoyi(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            roleList.splice(0,roleList.length);
            Object.assign(roleList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            roleList.splice(0,roleList.length);
            total.value = 0;
          }
        }
    );
  }

  // 处理搜索按钮
  const handleQuery = function(){
    getList()
  }

  // 处理查询按钮
  const resetQuery = function(){
    dateRange.value = [];
    queryForm.value.resetFields();
    handleQuery();
  }

  const getMenuTreeselect = function(){
    return treeSelect();
  }


  // 处理新增按钮
  const handleAdd = function(){
    reset();
    
    getMenuTreeselect().then((data)=>{
      open.value = true;
      title.value = "添加角色";
      menuOptions.slice(0,menuOptions.length);
      Object.assign(menuOptions,data);
    });
  }

  /** 根据角色ID查询菜单树结构 */
  const getRoleMenuTreeselect = (roleId)=> {
      return roleMenuTreeSelect(roleId).then(response => {
        menuOptions.slice(0,menuOptions.length)
        Object.assign(menuOptions,response.menus)
        return response;
      });
    }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset();
    const roleId = row.roleId || ids.value
    const roleMenu = getRoleMenuTreeselect(roleId);

    getRole(roleId).then(response => {
      if(response?.code == 200){
        Object.assign(form,response?.data)
        open.value = true;
        nextTick(() => {
          roleMenu.then(res => {
            let checkedKeys = res.checkedKeys
            checkedKeys.forEach((v) => {
                nextTick(()=>{
                    menuRef.value.setChecked(v, true ,false);
                })
            })
          });
        });
        title.value = "修改角色";
      } 
    });
  }
  
  const handleDelete = function(row){
    const roleId = row.roleId || ids.value;

    ElMessageBox.confirm(
      '是否确认删除用户编号为"' + roleId + '"的数据项？',
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
        delRole(roleId).then((response)=>{
          if(response?.code == 200){
              // 重置查询表单,并进行查询
              queryParams.pageNum=1

              getList()
              ElMessage({ type: 'success', message: '删除成功', })
          }
        })
    }).catch(() => { })

  }

  // 多选框选中数据
  const handleSelectionChange = function(selection){
    ids.value = selection.map(item => item.roleId);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
    console.log(ids.value);
  }

  // 表单提交处理
  const submitForm = async ()=>{
    loading.value = true;
    await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage.error('表单验证失败');
            loading.value = false;
            throw err;
        });

    if (form.roleId != undefined) {
        form.menuIds = getMenuAllCheckedKeys();
        updateRole(form).then(response => {
          if(response?.code == 200){
            ElMessage({ showClose: true, message: '修改成功',type: 'success', });
            open.value = false;
            getList();
          }else{
            ElMessage.error(response?.msg);
            open.value = false;
            getList();
          }
        });
      } else {
        form.menuIds = getMenuAllCheckedKeys();
        addRole(form).then(response => {
          if(response?.code){
            ElMessage({
                  showClose: true,
                  message: '新增成功',
                  type: 'success',
            });
            open.value = false;
            getList();
          }
        });
      }
  }

  const getMenuAllCheckedKeys = ()=>{
      // 目前被选中的菜单节点
      let checkedKeys = menuRef.value.getCheckedKeys();
      // 半选中的菜单节点
      let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    }

  const handleStatusChange = (row)=>{
      let text = row.status === "0" ? "启用" : "停用";
      ElMessageBox.confirm(
        '确认要"' + text + '""' + row.roleName + '"用户吗？',
        'Warning',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
    ).then(() => {
        changeRoleStatus(row.roleId, row.status);
        ElMessage({
          type: 'success',
          message: text + '成功',
        })
    }).catch(() => {
      row.status = row.status === "0" ? "1" : "0";
    })
  }


  // 树权限（全选/全不选）
  const handleCheckedTreeNodeAll = (value, type)=>{
    if (type == 'menu') {
      menuRef.value.setCheckedNodes(value ? menuOptions: []);
    }
  }

  // 树权限（展开/折叠）
  const handleCheckedTreeExpand = (value, type) => {
    if (type == 'menu') {
      let treeList = menuOptions;
      for (let i = 0; i < treeList.length; i++) {
        menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
      }
    }
  }

  // 树权限（父子联动）
  const handleCheckedTreeConnect = (value, type)=>{
    if (type == 'menu') {
        form.menuCheckStrictly = value ? true : false;
      }
  }


  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
    reset();
  }

  // 触发查询
  getList()
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <el-form class="form-wrap" :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="角色名称" prop="roleName">
            <el-input
              v-model="queryParams.roleName"
              placeholder="请输入角色名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col> 
        <el-col :span="8">
          <el-form-item label="权限字符" prop="roleKey">
            <el-input
              v-model="queryParams.roleKey"
              placeholder="请输入权限字符"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col> 
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
          <el-select
              v-model="queryParams.status"
              placeholder="角色状态"
              clearable
              style="width: 240px">
              <el-option v-for="dict in statusDicts"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"/>
              </el-select>
          </el-form-item>
        </el-col> 
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col> 
        <el-col :span="8">
          <div>
            <el-button type="primary" size="small" @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
            <el-button  size="small" @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
          </div>
        </el-col>
      </el-row>  
    </el-form>

    <!--  option-->
    <div class="option-wrap">
      <el-button
        type="primary"
        plain
        size="default"
        @click="handleAdd" v-hasPerms="['/system/role/add']" ><el-icon><Plus /></el-icon>新增</el-button>


      <el-button
        type="success"
        plain
        size="default"
        :disabled="single"
        @click="handleUpdate" v-hasPerms="['/system/role/edit']" ><el-icon><EditPen /></el-icon>修改</el-button>  

      <el-button
        type="danger"
        plain
        size="default"
        :disabled="multiple"
        @click="handleDelete" v-hasPerms="['/system/role/del/*']" ><el-icon><Delete /></el-icon>删除</el-button>

    </div>

    <!--table  -->
    <div class="table-wrap">
      <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column label="角色编号" prop="roleId" width="120" />
          <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="显示顺序" prop="roleSort" width="100" />
          <el-table-column label="状态" align="center" key="status"  width="100">
            <template v-slot="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime"  width="180">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="220"
          >
            <template v-slot="scope">
             <div class="action-btn">
              <el-button
                size="default"
                @click="handleUpdate(scope.row)"
                v-hasPerms="['/system/role/edit']"
              >修改</el-button>
              
              <el-button
                size="default"
                @click="handleDelete(scope.row)"
                v-hasPerms="['/system/role/del/*']" 
              >删除</el-button>
             </div>
            </template>
          </el-table-column>
    </el-table>
    </div>
    <div class="page-wrap">
      <el-pagination
      v-show="total>0"
      :total="total"
      :page-sizes=[10,20]
      background layout="prev, pager, next" 
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      @current-change="getList"
    />
    </div>


    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
                  v-for="dict in statusDicts"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
        </el-form-item>
        <el-form-item label="">
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuRef"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.main-wrap {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background: #fff;

}

.option-wrap {
  margin-bottom: 8px;
  .el-button {
    // margin-right: 6px;
  }
}
.table-wrap {
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  .action-btn {
    display: flex;
  }
}

.page-wrap {
  padding: 20px 0;
  .el-pagination {
    display: flex;
    align-items: center;
    justify-content: end;
  }

}

/* tree border */
.tree-border {
    margin-top: 5px;
    border: 1px solid #e5e6e7;
    background: #FFFFFF none;
    border-radius:4px;
}
</style>
<style>
 .el-form-item__label {
  font-size: 14px;
 }

.search-select .el-input {
  --el-input-width: 240px;
}
</style>

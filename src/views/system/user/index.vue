<script setup lang="ts">
// @ts-nocheck
import { Plus ,Delete, Edit, Link, More, EditPen, Search , RefreshRight , Sort , QuestionFilled} from '@element-plus/icons-vue'
import { parseTime , statusDicts , sexDicts , addDateRangeRuoyi } from "@/utils/common"
import { listUser , getUser , addUser , updateUser , delUser , changeUserStatus , resetUserPwd } from "@/api/users"
import { getRoles } from "@/api/roles"
import { useTokenStore } from "@/stores/token.ts";
const queryForm = ref(null);
const contractAddress = (row => {
  selectRow.value = row
  isShowContractDialog.value = true
})
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined
})

const loading = ref(false)
const isShowContractDialog = ref(false)
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
const userList = reactive([])

// 表单
const open = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({})
const initPassword = "123456"
const title = ref("")
const roleOptions = reactive([]);
const selectRow = ref({})

// 表单规则
const rules = reactive<FormRules>({
    userName: [
        { required: true, message: "用户名称不能为空", trigger: "blur" },
        { pattern: /^[-_a-zA-Z0-9]*$/, message: '只可以输入字母、数字、下划线及中划线', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
    ],
    nickName: [
        { required: true, message: "用户昵称不能为空", trigger: "blur" }
    ],
    password: [
        { required: true, message: "用户密码不能为空", trigger: "blur" },
        { pattern: /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d@$!%*?&]*$/, message: '必须包含大小写字母', trigger: 'blur' },
        { min: 8, max: 20, message: '用户密码长度必须介于 8 和 20 之间', trigger: 'blur' }
    ],
    email: [
        {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
        }
    ],
    phonenumber: [
        {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
        }
    ]
})

// 重置表单
const reset = ()=> {
    formRef.value?.clearValidate()
    Object.assign(form,{
        userId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        roleIds: undefined,
        status: "0",
        remark: undefined
    })
}


// 获取列表
const getList = ()=>{
    loading.value = true;
    listUser(addDateRangeRuoyi(queryParams, dateRange.value))
        .then(response => {
                loading.value = false
                if(response?.data?.records.length > 0){
                    userList.splice(0,userList.length);
                    Object.assign(userList, response?.data?.records)
                    total.value = response?.data?.total
                }else{
                    userList.splice(0,userList.length);
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

// 处理新增按钮
const handleAdd = function(){
    reset();

    getRoles().then((res)=>{
        if(res.code == 200){
            open.value = true;
            title.value = "添加用户";
            form.password = initPassword;
            Object.assign(roleOptions,res?.data)
        }
    });
}

// 处理更新按钮
const handleUpdate = function(row){
    reset();
    const userId = row.userId || ids.value
    getUser(userId).then(response => {
        if(response?.code == 200){
            Object.assign(form,response?.data?.user)
            Object.assign(roleOptions,response?.data?.roles)
            form.roleIds = response?.data?.roleIds
            open.value = true;
            title.value = "修改用户";
            form.password = "";
        }
    });
}

const handleDelete = function(row){
    const userIds = row.userId || ids.value;

    ElMessageBox.confirm(
        '是否确认删除用户编号为"' + userIds + '"的数据项？',
        'Warning',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        delUser(userIds)
        // 重置查询表单,并进行查询
        queryParams.pageNum=1

        getList()
        ElMessage({
            type: 'success',
            message: '删除成功',
        })
    }).catch(() => { })

}

// 多选框选中数据
const handleSelectionChange = function(selection){
    ids.value = selection.map(item => item.userId);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
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

    if (form.userId != undefined) {
        updateUser(form).then(response => {
            if(response?.code == 200){
                ElMessage({
                    showClose: true,
                    message: '修改成功',
                    type: 'success',
                });

            }else{
              ElMessage({
                    showClose: true,
                    message: '修改失败',
                    type: 'warning',
                });
            }
            open.value = false;
            getList();
        });
    } else {
        addUser(form).then(response => {
            if(response?.code == 200){
                ElMessage({
                    showClose: true,
                    message: '新增成功',
                    type: 'success',
                });

            }else{
              ElMessage({
                    showClose: true,
                    message: '新增失败',
                    type: 'warning',
                });
            }
            open.value = false;
            getList();
        });
    }
}

const handleStatusChange = (row)=>{
    let text = row.status === "0" ? "启用" : "停用";
    ElMessageBox.confirm(
        '确认要"' + text + '""' + row.userName + '"用户吗？',
        'Warning',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        changeUserStatus(row.userId, row.status);
        ElMessage({
            type: 'success',
            message: text + '成功',
        })
    }).catch(() => {
        row.status = row.status === "0" ? "1" : "0";
    })
}

// 命令处理
const handleCommand = (command, row)=>{
    switch (command) {
        case "handleResetPwd":
            handleResetPwd(row);
            break;
        case "handleAuthRole":
            handleAuthRole(row);
            break;
        default:
            break;
    }
}

/** 重置密码按钮操作 */
const handleResetPwd = (row) => {
    ElMessageBox.prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: '用户密码长度必须介于 5 和 20 之间',
    }).then(({ value }) => {
        resetUserPwd(row.userId, value).then(response => {
            if(response?.code == 200){
                ElMessage({
                    type: 'success',
                    message: "修改成功",
                })
            }
        });
    }).catch(() => { })
}

/** 分配角色操作 */
const handleAuthRole = (row) => {

    // const userId = row.userId;
    // this.$router.push("/system/user-auth/role/" + userId);
}

// 表单取消处理
const cancel = ()=>{
    loading.value = false;
    open.value = false;
    reset();
}

// 按钮
const btnList = ref([
  {
    btnName: '修改',
    permArray: ['/system/user/edit'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleUpdate
  },
  {
    btnName: '删除',
    class: 'yt-color-error-hover',
    permArray: ['/system/user/del/*'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleDelete
  },
  {
    btnName: '重置密码',
    permArray: ['/system/user/resetPwd'],
    isShow: () => true,
    isDisable: false,
    clickEvent: handleResetPwd
  }
])

// 触发查询
getList()
</script>

<template>
    <div class="main-wrapp">
      <yt-card>
        <el-form class="form-wrap" :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="用户名称" prop="userName">
                <el-input
                  v-model="queryParams.userName"
                  placeholder="请输入用户名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="手机号码" prop="phonenumber">
                <el-input
                  v-model="queryParams.phonenumber"
                  placeholder="请输入手机号码"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态" prop="status">
                <el-select
                  class="search-select"
                  v-model="queryParams.status"
                  placeholder="用户状态"
                  clearable
                >
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
                  value-format="YYYY-MM-DD"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  clearable
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>搜索</el-button>
                <el-button @click="resetQuery"><el-icon><RefreshRight /></el-icon>重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </yt-card>
        <!--  option-->
      <!-- <div class="test">
        <formilyjsTest></formilyjsTest>
      </div> -->
      <yt-card>
        <div class="option-wrap">
          <el-button
            type="primary"
            plain
            size="default"
            @click="handleAdd" v-hasPerms="['/system/user/add']" ><el-icon><Plus /></el-icon>新增</el-button>

          <el-button
            type="danger"
            plain
            size="default"
            :disabled="multiple"
            @click="handleDelete" v-hasPerms="['/system/user/del/*']" ><el-icon><Delete /></el-icon>删除</el-button>

        </div>

        <!--table  -->
        <div class="table-wrap">
          <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="60" align="center" fixed="left" />
            <el-table-column label="用户编号" align="left" key="userId" prop="userId"/>
            <el-table-column label="用户名称" align="left" key="userName" prop="userName"  :show-overflow-tooltip="true" />
            <el-table-column label="用户昵称" align="left" key="nickName" prop="nickName" :show-overflow-tooltip="true" />
            <el-table-column label="手机号码" align="left" width="150" key="phonenumber" prop="phonenumber" />
            <el-table-column label="状态" align="center" key="status">
              <template #default="{row}">
                <el-switch
                  v-model="row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="statusText">
              <template #default="{row}">
                <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ row.status === '0' ? '启用' : '禁用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="left" prop="createTime" width="200">
              <template v-slot="scope">
                <span>{{ parseTime(scope?.row?.createTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column
                label="操作"
                align="center"
                width="220"
            >
              <template v-slot="scope">
                <yt-btn-menu-list :btn-list="btnList" :row-data="scope.row"></yt-btn-menu-list>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="page-wrap">
          <yt-page :total="total" v-model="queryParams" @change="getList"></yt-page>        </div>
      </yt-card>


        <!-- 添加或修改用户配置对话框 -->
        <el-dialog :title="title" v-model="open" width="var(--dialog-lg-w)" append-to-body>
            <yt-card>
              <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="用户昵称" prop="nickName">
                      <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
                    </el-form-item>
                  </el-col>

                  <el-col :span="12">
                    <el-form-item label="角色">
                      <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
                        <el-option
                          v-for="item in roleOptions"
                          :key="item.roleId"
                          :label="item.roleName"
                          :value="item.roleId"
                          :disabled="item.status == 1"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="手机号码" prop="phonenumber">
                      <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
                      <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
                      <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="用户性别">
                      <el-select v-model="form.sex" placeholder="请选择性别">
                        <el-option
                          v-for="dict in sexDicts"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.value"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="状态">
                      <el-radio-group v-model="form.status">
                        <el-radio
                          v-for="dict in statusDicts"
                          :key="dict.value"
                          :label="dict.value"
                        >{{dict.label}}</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-form-item label="备注">
                      <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </yt-card>
            <template v-slot:footer>
              <el-button @click="cancel">取 消</el-button>
              <el-button type="primary" @click="submitForm">确 定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>

</style>

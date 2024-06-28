<script setup lang="ts">
  // @ts-nocheck
  import { showStatusOperateFun , status , showStatusFun , addDateRange, getStatusIcon } from "@/utils/common"
  import { queryInstanceInfoByPluginCode,pluginOptionSelect } from "@/api/common-api"
  import { dayjs } from "@/utils/common-dayjs"
  import {sysCredentialList, addCredential, queryCredentialInfoById, checkKey , nameSpaceList,
    removeCredential,changeStatus ,credentialTypes,syncAllCredential} from "@/api/sys_credential/credential"

  const queryFormRef = ref(null);
  //查询列表信息
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    beginTime: undefined,
    endTime: undefined,
    status: undefined,
    instanceCode:undefined,
    credentialType:undefined,
    credentialName: undefined,
    credentialKey: undefined
  })

  const handleSyncAllCredential = () =>{
      syncAllCredential().then((res)=>{
          if(res.code == 200){
            ElMessage({
                  showClose: true,
                  message: '同步消息已成功发送',
                  type: 'success',
            });
          }
      })
  }

  const loading = ref(false)

  // 显示搜索条件
  const showSearch = ref(true)
  // 日期范围
  const dateRange = ref([])
  const nameSpaces = reactive([])

  const total= ref(0)
  const sysCredentialPageList = reactive([])
  const curCredentialKey = ref(null)

  // 表单
  const open = ref(false);
  // 插件编码下拉列表框对象
  const pluginCodes = reactive([]);
  const formPluginCodes = reactive([]);
  const formRef = ref<FormInstance>();

  const validKey = (rule:any,value:any, callback:any)=>{
      // if(form.id != undefined){
      //   queryCredentialInfoById(form.id).then((res) =>{
      //     if(res.code == 200){
      //       if(form.credentialKey == res?.data?.credentialKey){
      //         callback()
      //       }
      //     }
      //   })

      // }

      if(curCredentialKey.value == form.credentialKey){
        callback()
      }

      const checkValue = reactive({
        credentialKey:undefined,
        instanceCode:undefined
      })

      checkValue.credentialKey = form.credentialKey
      checkValue.instanceCode = form.instanceCode


      checkKey(checkValue).then((res)=>{
        if(res?.data){
          callback(new Error('名称已存在:'+value));
        }else{
          callback();
        }
      })
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
      credentialKey: [
        { required: true, message: "任务名称不能为空", trigger: "blur" },
        { min: 2, max: 20, message: '任务名称长度必须介于 2 和 20 之间', trigger: 'blur' },
        { validator:validKey, trigger: "blur"}
      ],
      instanceCode : [
        { required: true,  message: "实例编码不能为空", trigger: "blur" }
      ],
      pluginCode : [
        { required: true,  message: "插件编码不能为空", trigger: "blur" }
      ],
      credentialName : [
        { required: true,  message: "凭证名称不能为空", trigger: "blur" }
      ],
      credentialType : [
        { required: true,  message: "凭证类型不能为空", trigger: "blur" }
      ]
  })

  const form = reactive({
        id: undefined,
        credentialKey: undefined,
        credentialName: undefined,
        nameSpace:undefined,
        key:undefined,
        value:undefined,
        secret:undefined,
        userName:undefined,
        privateKey:undefined,
        certificate:undefined,
        passphrase:undefined,
        publicKey:undefined,
        password:undefined,
        imgDomain:undefined,
        token:undefined,
        dataList:[],
        credentialType:undefined,
        pluginCode: undefined,
        remark: undefined,
        status: undefined,
        instanceCode: undefined
  })

  const handleCredentialType = (type)=>{
    form.credentialType = type;

    if(form.credentialType == 'OPAQUE'){
      form.dataList = []
      form.dataList.push({key:"", value:""})
    }else if(form.dataList != undefined){
      form.dataList.splice(0,form.dataList.length)
    }
  }

  const addDataList = ()=>{
    form.dataList.push({key:"", value:""})
  }

  const deleteDataList = (index)=>{
    if(form.dataList.length != 1){
      form.dataList.splice(index,1)
    }
  }

  const title = ref("")
  // 查询页面的实例编码
  const pluginInstance = reactive([]);
  // 表单中的实例编码
  const formPluginInstance = reactive([]);

  // 重置表单
  const reset = ()=> {
    formRef.value?.clearValidate()
    Object.keys(form).forEach(key => (form[key] = undefined));
  }


  // 获取列表
  const getList = ()=>{
    loading.value = true;
    sysCredentialList(addDateRange(queryParams, dateRange.value))
    .then(response => {
          loading.value = false
          if(response?.data?.records.length > 0){
            sysCredentialPageList.splice(0,sysCredentialPageList.length);
            Object.assign(sysCredentialPageList, response?.data?.records)
            total.value = response?.data?.total
          }else{
            sysCredentialPageList.splice(0,sysCredentialPageList.length);
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
    queryFormRef.value.resetFields();
    handleQuery();
  }


  // 处理新增按钮
  const handleAdd = function(){
    reset()
    pluginOptionSelect().then((res)=>{
      Object.assign(formPluginCodes,res?.data);
    })
    form.status = 1
    open.value = true
    title.value = "添加凭证信息"
  }

  // 处理更新按钮
  const handleUpdate = function(row){
    reset();
    pluginOptionSelect().then((res)=>{
      Object.assign(formPluginCodes,res?.data);
    })

    queryCredentialInfoById(row.id).then(response => {
      if(response?.code == 200){
        let data = response?.data
        Object.assign(form,data)
        curCredentialKey.value = form.credentialKey
        changeInstance(data.pluginCode)
        form.type = data.credentialType
        open.value = true;
        title.value = "修改凭证信息";
      }
    });
  }

  // 表单切换插件编码是修改实例编码下拉列表数据
  const changeInstance = (pluginCode)=>{
    formPluginInstance.splice(0,formPluginInstance.length)
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      Object.assign(formPluginInstance,res?.data)
    })

    if(pluginCode == "k8s"){
      nameSpaceList().then((res)=>{
        Object.assign(nameSpaces ,res.data)
      })
    }else{
      Object.assign(nameSpaces ,[])
    }
  }


  // 多选框选中数据
  const handleSelectionChange = function(selection){

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

    if (form.id != undefined) {
        addCredential(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '修改成功',
                  type: 'success',
            });
          }else{
            ElMessage.error('修改出现异常');
            throw err;
          }
          loading.value = false;
          open.value = false;
          getList();
        });
      } else {
        addCredential(form).then(response => {
          if(response?.code == 200){
            ElMessage({
                  showClose: true,
                  message: '新增成功',
                  type: 'success',
            });
          }else{
            ElMessage.error('新增出现异常');
            throw err;
          }
          loading.value = false;
          open.value = false;
          getList();
        });
      }
  }

  // 处理删除按钮
  const handleDelete = function(row){
    const credentialKey = row.credentialKey
    let msg = ""
    msg = '是否删除凭证【"' + credentialKey + '"】的数据项？'

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      removeCredential(row.id).then((res)=>{
          if(res.code == 200){
              // 重置查询表单,并进行查询
              getList()
              ElMessage({
                type: 'success',
                message: '删除成功',
              })
          }else{
              ElMessage({
                type: 'error',
                message: '删除失败:'+res.msg,
              })
          }
      })
    })
  }

  const handleStatusChange = (row)=>{
    const id = row.id
    const status = row.status
    let msg = ""
    if(status == 1){
      msg = '是否禁用编号为"' + id + '"的数据项？'
    }else{
      msg = '是否启用编号为"' + id + '"的数据项？'
    }

    ElMessageBox.confirm(
      msg,
      'Warning',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
        let tmpStatus;
        if(status == 0){
          tmpStatus = 1
        }else{
          tmpStatus = 0
        }
        changeStatus(id,tmpStatus).then((res)=>{
            if(res.code == 200){
                getList()
                ElMessage({
                  type: 'success',
                  message: '操作成功',
                })
            }
        })
    })
    .catch(() => { })
  }


  // 表单取消处理
  const cancel = ()=>{
    open.value = false;
    reset();
  }


  // 触发查询
  getList();

  // 初始化插件编码
  pluginOptionSelect().then((res)=>{
    if(res.code == 200){
      Object.assign(pluginCodes,res?.data)
    }
  })

  const queryInstance = (pluginCode)=>{
    queryParams.instanceCode = undefined
    queryInstanceInfoByPluginCode(pluginCode).then((res)=>{
      if(res.code == 200){
        Object.assign(pluginInstance,res?.data)
        queryParams.instanceCode = pluginInstance[0].instanceCode
      }
    });
  }
</script>

<template>
  <div class="main-wrapp">
    <!--sousuo  -->
    <yt-card padding="18px 18px 0">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
        <el-row :gutter="16">
          <el-col :span="8">
              <el-form-item label="插件编码" prop="pluginCode">
                <el-select
                  class="search-select"
                  v-model="queryParams.pluginCode"
                  placeholder="请选择插件编码"
                  @change="queryInstance"
                  clearable
                  style="width: 240px"
                >
                  <el-option v-for="item in pluginCodes"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="插件实例" prop="instanceCode">
              <el-select
                class="search-select"
                v-model="queryParams.instanceCode"
                placeholder="请选择实例"
                clearable
                style="width: 240px"
              >
                <el-option v-for="item in pluginInstance"
                           :key="item.pluginCode"
                           :label="item.instanceName"
                           :value="item.instanceCode"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="凭证别名" prop="credentialName">
              <el-input
                v-model="queryParams.credentialName"
                placeholder="请输入凭证别名"
                clearable
                style="width: 210px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="凭证名称" prop="credentialKey">
              <el-input
                v-model="queryParams.credentialKey"
                placeholder="请输入凭证唯一名称"
                clearable
                style="width: 240px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="凭证类型" prop="credentialType">
              <el-select
                class="search-select"
                v-model="queryParams.credentialType"
                placeholder="请选择插件类型"
                clearable
                style="width: 240px"
              >
                <el-option v-for="item in credentialTypes"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select
                class="search-select"
                v-model="queryParams.status"
                placeholder="工具状态"
                clearable
                style="width: 240px"
              >
                <el-option v-for="dict in status"
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
                style="width: 240px"
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

    <yt-card>
      <!--  option-->
      <div class="option-wrap">
        <el-button
          type="primary"
          plain
          size="default"
          @click="handleAdd" v-hasPerms="['/credential/add']" ><el-icon><Plus /></el-icon>新增</el-button>
        <el-button
          type="primary"
          plain
          size="default"
          @click="handleSyncAllCredential" v-hasPerms="['/credential/syncAllCredential']" ><el-icon><Switch/></el-icon>同步凭证信息</el-button>
      </div>

      <!--table  -->
      <div class="table-wrap">
        <el-table v-loading="loading" :data="sysCredentialPageList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="编号" align="left" key="id" prop="id" v-if="false"/>
          <el-table-column label="凭证唯一名称" align="left" key="credentialKey" prop="credentialKey"  :show-overflow-tooltip="true" />
          <el-table-column label="凭证别名" align="left" key="credentialName" prop="credentialName"  :show-overflow-tooltip="true" />
          <!-- <el-table-column label="凭证类型" align="center" key="credentialType" prop="credentialType"  :show-overflow-tooltip="true"  width="200" /> -->
          <el-table-column label="备注" align="left" key="remark" prop="remark"  :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center" key="status">
            <template #default="scope">
              {{  showStatusFun(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="left" prop="createTime"  width="200">
            <template #default="scope">
              {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")   }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="250"
          >
            <template #default="scope">
              <div class="action-btn">
                <el-button
                  size="small"
                  icon="Edit"
                  @click="handleUpdate(scope.row)"
                  v-hasPerms="['/credential/add']"
                >修改</el-button>
                <el-button
                  size="small"
                  :icon="getStatusIcon(scope.row)"
                  @click="handleStatusChange(scope.row)"
                  v-hasPerms="['/credential/changeStatus/**']"
                >{{ showStatusOperateFun(scope.row.status)  }}</el-button>
                <el-button
                  size="small"
                  icon="Delete"
                  @click="handleDelete(scope.row)"
                  v-hasPerms="['/credential/del/*']"
                >删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-wrap">
        <yt-page :total="total" v-model="queryParams" @change="getList"></yt-page>
      </div>
    </yt-card>


    <!-- 添加或修改工具配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <yt-card>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="插件编码" prop="pluginCode">
                <el-select
                  class="search-select"
                  v-model="form.pluginCode"
                  placeholder="请选择插件编码"
                  style="width: 240px"
                  @change="changeInstance"
                >
                  <el-option v-for="item in formPluginCodes"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="插件实例" prop="instanceCode">
                <el-select
                  class="search-select2"
                  v-model="form.instanceCode"
                  placeholder="请选择插件实例"
                  style="width: 240px"
                  :disabled="form.id != undefined"
              >
                  <el-option v-for="item in formPluginInstance"
                             :key="item.pluginCode"
                             :label="item.instanceName"
                             :value="item.instanceCode"/>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="凭证key" prop="credentialKey" :rules="[
                  { required: true, message: '凭证key不能为空', trigger: 'blur' },
                  { pattern: /^[-a-z0-9]*$/, message: '只可以输入小写字母、数字、中划线', trigger: 'blur' },
                  { min: 2, max: 50, message: '凭证key长度必须介于 2 和 50 之间', trigger: 'blur' } ]">
                <el-input v-model="form.credentialKey" :disabled="form.id != undefined" placeholder="请输入凭证唯一名称" maxlength="50" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="凭证名称" prop="credentialName" :rules="[
                  { required: true, message: '凭证名称不能为空', trigger: 'blur' },
                  { min: 2, max: 50, message: '凭证名称长度必须介于 2 和 50 之间', trigger: 'blur' } ]">
                <el-input v-model="form.credentialName" placeholder="请输入名称" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="凭证类型" prop="credentialType">
                <el-select
                  class="search-select"
                  v-model="form.credentialType"
                  placeholder="请选择凭证类型"
                  style="width: 240px"
                  @change="handleCredentialType"
                  :disabled="form.id != undefined"
                >
                  <el-option v-for="item in credentialTypes"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in status"
                    :key="dict.value"
                    :label="dict.value"
                  >{{dict.label}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

        <el-row v-if="form.pluginCode == 'k8s'">
          <el-col :span="12">
            <el-form-item label="命名空间" prop="nameSpace" :rules="[
                { required: true, message: '命名空间不能为空', trigger: 'blur' }]">
                <el-select
                    class="search-select"
                    v-model="form.nameSpace"
                    placeholder="请选择凭证类型"
                    style="width: 240px"
                  >
                    <el-option v-for="item in nameSpaces"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"/>
                </el-select>
            </el-form-item>
          </el-col>
        </el-row>

          <el-row v-if="form.credentialType == 'SECRET'">
            <el-col :span="24">
              <el-form-item label="密钥" prop="secret" :rules="[
                  { required: true, message: '密钥不能为空', trigger: 'blur' }]">
                <el-input v-model="form.secret" placeholder="请输入密钥信息" type="textarea" />
              </el-form-item>
            </el-col>

          </el-row>

          <el-row v-if="form.credentialType == 'SSH'">
            <el-col :span="12">
              <el-form-item label="用户名" prop="userName" :rules="[
                  { required: true, message: '用户名不能为空', trigger: 'blur' },
                  { min: 2, max: 50, message: '用户名长度必须介于 2 和 50 之间', trigger: 'blur' } ]">
                <el-input v-model="form.userName" placeholder="请输入用户名" maxlength="50" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="公钥" prop="publicKey" :rules="[
                  { required: true, message: '公钥不能为空', trigger: 'blur' },
                  { min: 2, max: 2000, message: '公钥长度必须介于 2 和 2000 之间', trigger: 'blur' } ]">
                <el-input v-model="form.publicKey" placeholder="请输入公钥" type="textarea" maxlength="2000"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="私钥" prop="privateKey" :rules="[
                  { required: true, message: '私钥不能为空', trigger: 'blur' },
                  { min: 2, max: 2000, message: '私钥长度必须介于 2 和 2000 之间', trigger: 'blur' } ]">
                <el-input v-model="form.privateKey" placeholder="请输入私钥" type="textarea" maxlength="2000"/>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="密钥" prop="passphrase" >
                <el-input v-model="form.passphrase" placeholder="请输入密钥" maxlength="2000" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.credentialType == 'USERNAME_PASSWORD'">
            <el-col :span="12">
              <el-form-item label="用户名" prop="userName" :rules="[
                  { required: true, message: '用户名不能为空', trigger: 'blur' },
                  { min: 2, max: 50, message: '用户名长度必须介于 2 和 50 之间', trigger: 'blur' } ]">
                <el-input v-model="form.userName" placeholder="请输入用户名" maxlength="50" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="密码" prop="password" :rules="[
                  { required: true, message: '密码不能为空', trigger: 'blur' },
                  { min: 2, max: 200, message: '密码长度必须介于 2 和 200 之间', trigger: 'blur' } ]">
                <el-input v-model="form.password" type="password" placeholder="请输入密码" maxlength="200" show-password />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="域名" prop="imgDomain" >
                <el-input v-model="form.imgDomain"  placeholder="如：https://starlink.lixin.help" maxlength="1024" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.credentialType == 'TOKEN'">
            <el-col :span="12">
              <el-form-item label="用户名" prop="userName" >
                <el-input v-model="form.userName" placeholder="请输入用户名" maxlength="50" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="token" prop="token" :rules="[
                  { required: true, message: 'token不能为空', trigger: 'blur' },
                  { min: 2, max: 2000, message: 'token长度必须介于 2 和 2000 之间', trigger: 'blur' } ]">
                <el-input v-model="form.token"  placeholder="请输入token" maxlength="2000" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.credentialType == 'TLS'">
            <el-col :span="12">
              <el-form-item label="证书" prop="certificate" :rules="[
                  { required: true, message: '证书不能为空', trigger: 'blur' },
                  { min: 2, max: 2000, message: '证书长度必须介于 2 和 2000 之间', trigger: 'blur' } ]">
                <el-input v-model="form.certificate" placeholder="请输入证书" maxlength="2000" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="私钥" prop="privateKey" :rules="[
                  { required: true, message: '私钥不能为空', trigger: 'blur' },
                  { min: 2, max: 2000, message: '私钥长度必须介于 2 和 2000 之间', trigger: 'blur' } ]">
                <el-input v-model="form.privateKey"  placeholder="请输入私钥" maxlength="2000" />
              </el-form-item>
            </el-col>
          </el-row>

          <div v-if="form.credentialType == 'OPAQUE'" >
            <el-row  v-for="(label,index) in form.dataList" :key="index">
              <el-col :span="12">
                <el-form-item label="键" :prop="`dataList[${index}].key`" :rules="[
                    { required: true, message: '键名不能为空', trigger: 'blur' },
                    { min: 2, max: 255, message: '键名长度必须介于 2 和 255 之间', trigger: 'blur' } ]">
                  <el-input v-model="label.key" placeholder="请输入键名" maxlength="255" />
                </el-form-item>
              </el-col>

              <el-col :span="10">
                <el-form-item label="值" :prop="`dataList[${index}].value`" :rules="[
                    { required: true, message: '值不能为空', trigger: 'blur' },
                    { min: 2, max: 255, message: '值长度必须介于 2 和 255 之间', trigger: 'blur' } ]">
                  <el-input v-model="label.value"  placeholder="请输入值" maxlength="255" />
                </el-form-item>
              </el-col>
              <el-col :span="1">
                <el-button type="danger" @click="deleteDataList(index)" icon="Delete"></el-button>
              </el-col>
            </el-row>
            <el-row >
              <el-col :span="12" style="margin: 0px 0px 10px 80px;">
                <el-button type="primary" @click="addDataList">添加Opaque</el-button>
              </el-col>
            </el-row>
          </div>

          <el-row>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" maxlength="200" />
              </el-form-item>
            </el-col>
          </el-row>

        </el-form>
      </yt-card>
      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>

</style>

export default `
{
  "name": "Jenkins代码编译",
  "group": "tools",
  "icon": "http://gateway.lixin.help/starlink-service/icons/plugin/icon/jenkins.png",
  "enableInstanceSelect" : true,
  "pluginCode": "jenkins",
  "_meta": {
    "scmType": {
      "type": "string",
      "title": "仓库类型",
      "required": true,
      "x-decorator": "FormItem",
      "x-decorator-props": {
        "tooltip": "请选择仓库"
      },
      "default" : "GIT",
      "x-component": "Select",
      "enum": [
        {
          "value": "GIT",
          "label": "Git"
        },
        {
          "value": "SVN",
          "label": "Svn"
        }
      ],
      "x-data": {
        "onChangeCallback": [
          (ctx)=>{
              const field = ctx.field;
              const form = ctx.form;
              const formValues = ctx.formValues;
              const request = ctx.request;
              const urlPrefix = ctx.urlPrefix;

              let isShow = true;
              if(field?.value == 'SVN'){
                isShow = false;
              }

              if(field?.value == 'GIT'){
                isShow = true;
              }

              const address = form.query('*.branch')?.addresses;
              for(let i=0;i<address.length;i++){
                const addr = address[i];
                const targetField = form.fields[addr];
                if(targetField){
                  targetField.visible=isShow;
                }
              }
          }
        ]
      }
    },
    "scm": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "title": "项目地址",
          "required": true,
          "x-decorator": "FormItem",
          "x-visible" : true,
          "x-decorator-props": {
            "tooltip": "请填写项目地址"
          },
          "x-component": "Input",
          "x-component-props": {
            "placeholder": "http://192.168.1.10/root/spring-web-demo.git"
          }
        },
        "branch": {
          "type": "string",
          "title": "项目分支",
          "required": true,
          "x-decorator": "FormItem",
          "x-visible" : true,
          "default" : "*/main",
          "x-decorator-props": {
            "tooltip": "请填写gitlab项目分支"
          },
          "x-component": "Input",
          "x-component-props": {
            "placeholder": "main"
          }
        },
        "credentialId": {
          "type": "string",
          "title": "凭证",
          "required": true,
          "x-decorator": "FormItem",
          "x-visible" : true,
          "x-decorator-props": {
            "tooltip": "请选择凭证"
          },
          "x-component": "Select",
          "x-reactions": {
            "dependencies": ["instanceCode"]
          },
          "x-data": {
            "onInitCallback": [
              (ctx)=>{
                  const field = ctx.field;
                  const form = ctx.form;
                  const formValues = ctx.formValues;
                  const request = ctx.request;
                  const urlPrefix = ctx.urlPrefix;

                  if(formValues?.instanceCode) {
                      request({
                      "url": urlPrefix  + "/credential/option/" + formValues?.instanceCode,
                      method: 'GET'
                    }).then((res)=>{
                      return res?.data
                    }).then((res)=>{
                      if(res.code == 200) {
                      field.dataSource = res?.data
                    }
                  });
              }
            }
            ],
            "onChangeCallback": [
                (ctx)=>{
                  const field = ctx.field;
                  const form = ctx.form;
                  const formValues = ctx.formValues;
                  const request = ctx.request;
                  const urlPrefix = ctx.urlPrefix;

                    if(formValues?.instanceCode) {
                      request({
                        "url": urlPrefix  + "/credential/option/" + formValues?.instanceCode,
                        method: 'GET'
                      }).then((res)=>{
                        return res?.data
                      }).then((res)=>{
                        if(res.code == 200){
                        field.dataSource = res?.data
                      }
                    });
                }
              }
            ]
          }
        }
      }
    },
    "jdkId": {
      "type": "string",
      "title": "Java版本(隐藏域)",
      "required": true,
      "x-decorator": "FormItem",
      "x-hidden" : true,
      "x-component": "Input"
    },
    "toolsType": {
      "type": "string",
      "title": "打包工具",
      "required": true,
      "x-decorator": "FormItem",
      "x-decorator-props": {
        "tooltip": "请选择打包工具"
      },
      "x-component": "Select",
      "enum": [
        {
          "value": "MAVEN",
          "label": "Maven"
        },
        {
          "value": "GRADLE",
          "label": "Gradle"
        },
        {
          "value": "PYTHON",
          "label": "Python"
        },
        {
          "value": "GO",
          "label": "Go"
        },
        {
          "value": "NODE_JS",
          "label": "NodeJS"
        },
        {
          "value": "ANT",
          "label": "Ant"
        },
        {
          "value": "SHELL",
          "label": "Shell命令"
        }
      ],
      "x-data": {
        "onChangeCallback": [
           (ctx)=>{
            const field = ctx.field;
            const form = ctx.form;

            const address = form.query('*.setups')?.addresses;
            if(address.length > 0){
                const addr = address[0];
                const targetField = form.fields[addr];
                // 先清空所有的
                 const len = targetField.value.length;
                 for(let i=0;i<len;i++){
                  targetField.remove(i);
                 }

                // 添加一行数据
                targetField.insert(0,{});
            } //end if
          },
          (ctx)=>{
              const field = ctx.field;
              const form = ctx.form;

              const address = form.query('*.toolsType')?.addresses;
              if(address.length > 0){
                 const addr = address[0];
                 const targetField = form.fields[addr];
                 const val = targetField?.value;

                 const jdkIdaddress = form.query('*.jdkId')?.addresses;
                 if( val && jdkIdaddress.length > 0 ) {
                    const jdkIdName = jdkIdaddress[0];
                    const jdkIdField = form.fields[jdkIdName];

                    if(val == "GIT" || val == "PYTHON" || val == "GO" || val == "NODE_JS" || val == "SHELL" ) {
                      jdkIdField.value=undefined;
                      jdkIdField.visible=false;
                      jdkIdField.hidden=true;
                    } else {
                      jdkIdField.visible=true;
                      jdkIdField.hidden=true;
                    }
                 }
              }
          }
        ]
      }
    },
    "setups": {
      "type": "array",
      "x-component": "ArrayItems",
      "x-decorator": "FormItem",
      "items": {
        "type": "object",
        "properties": {
          "layout": {
            "type": "void",
            "x-component": "FormLayout",
            "x-component-props": {
              "labelAlign": "left",
              "wrapperAlign": "left",
              "labelCol": 24,
              "wrapperCol": 24,
              "layout": "vertical"
            },
            "properties": {
              "setupType": {
                "type": "string",
                "title": "Setup类型(隐藏域)",
                "x-decorator": "FormItem",
                "x-hidden" : true,
                "x-component": "Input",
                "x-data": {
                  "onInitCallback": [
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeName];
                    field.value = toolsTypeField.value;
                  }
                  }
                  ]
                }
              },
              "jdk" : {
                "type": "string",
                "title": "JDK",
                "required": true,
                "x-decorator": "FormItem",
                "x-decorator-props": {
                  "tooltip": "请选择JDK版本"
                },
                "x-component": "Select",
                "x-component-props": {
                },
                "x-data": {
                  "onInitCallback": [
                    // 只有在gradle/maven/ant时,jdk下拉列表框才会展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    // GRADLE
                    // ANT
                    // MAVEN
                    if(toolsTypeField?.value == 'MAVEN' ||
                    toolsTypeField?.value == 'GRADLE'||
                    toolsTypeField?.value == 'ANT' ) {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  },
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      // ajax获取jdk信息
                      if(field.visible){
                      request({
                      "url": urlPrefix  + "/jenkins/systemConfig/optionSelect/JDK/" + formValues?.instanceCode,
                      method: 'GET'
                    }).then((res)=>{
                      return res?.data;
                    }).then((res)=>{
                      if(res.code == 200){
                      field.dataSource = res?.data
                    }
                  });
                  }
                  }
                  ],
                  "onChangeCallback": [
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      // 当选择jdk时,给最外层隐藏的:jdkId进行赋值.
                      const jdkIdAddress = form.query('*.jdkId')?.addresses;
                      if(jdkIdAddress.length > 0) {
                      const jdkIdName = jdkIdAddress[0];
                    const jdkIdField = form.fields[jdkIdName];
                    jdkIdField.value = field.value;
                  }
                  }
                  ]
                }
              },
              "mavenId" : {
                "type": "number",
                "title": "Maven",
                "required": true,
                "x-decorator": "FormItem",
                "x-decorator-props": {
                  "tooltip": "请选择Maven版本"
                },
                "x-component": "Select",
                "x-component-props": {
                },
                "x-data": {
                  "onInitCallback": [
                    // maven时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'MAVEN') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  },
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      // ajax获取maven版本信息
                      if(field.visible) {
                      request({
                      "url": urlPrefix  + "/jenkins/systemConfig/optionSelect/MAVEN/" + formValues?.instanceCode,
                      method: 'GET'
                    }).then((res)=>{
                      return res?.data;
                    }).then((res)=>{
                      if(res.code == 200){
                      field.dataSource = res?.data
                    }
                  });
                  }
                  }
                  ]
                }
              },
              "goals": {
                "type": "string",
                "title": "Script",
                "required": true,
                "x-decorator": "FormItem",
                "x-component": "Input.TextArea",
                "default" : "clean install -DskipTests -X",
                "x-component-props": {
                  "placeholder": "clean install -DskipTests -X",
                },
                "x-decorator-props": {
                  "tooltip": "请输入打包命令"
                },
                "x-data": {
                  "onInitCallback": [
                    // maven时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'MAVEN') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  }
                  ]
                }
              },
              "antId": {
                "type": "number",
                "title": "Ant",
                "required": true,
                "x-decorator": "FormItem",
                "x-decorator-props": {
                  "tooltip": "请选择Ant版本"
                },
                "x-component": "Select",
                "x-component-props": {
                },
                "x-data": {
                  "onInitCallback": [
                    // ant时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'ANT') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  },
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      // ajax获取ANT版本信息
                      if(field.visible) {
                      request({
                      "url": urlPrefix  + "/jenkins/systemConfig/optionSelect/ANT/" + formValues?.instanceCode,
                      method: 'GET'
                    }).then((res)=>{
                      return res?.data;
                    }).then((res)=>{
                      if(res.code == 200){
                      field.dataSource = res?.data
                    }
                  });
                  }
                  }
                  ]
                }
              },
              "targets": {
                "type": "string",
                "title": "target",
                "required": true,
                "x-decorator": "FormItem",
                "x-component": "Input.TextArea",
                "default" : "run",
                "x-component-props": {
                  "placeholder": "run",
                },
                "x-decorator-props": {
                  "tooltip": "请输入打包命令"
                },
                "x-data": {
                  "onInitCallback": [
                    // ant时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'ANT') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  }
                  ]
                }
              },
              "gradleId": {
                "type": "number",
                "title": "Gradle",
                "required": true,
                "x-decorator": "FormItem",
                "x-decorator-props": {
                  "tooltip": "请选择Gradle版本"
                },
                "x-component": "Select",
                "x-component-props": {
                },
                "x-data": {
                  "onInitCallback": [
                    // Gradle时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'GRADLE') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  },
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      // ajax获取GRADLE版本信息
                      if(field.visible) {
                      request({
                      "url": urlPrefix  + "/jenkins/systemConfig/optionSelect/GRADLE/" + formValues?.instanceCode,
                      method: 'GET'
                    }).then((res)=>{
                      return res?.data;
                    }).then((res)=>{
                      if(res.code == 200){
                      field.dataSource = res?.data
                    }
                  });
                  }
                  }
                  ]
                }
              },
              "task": {
                "type": "string",
                "title": "task",
                "required": true,
                "x-decorator": "FormItem",
                "x-component": "Input.TextArea",
                "default" : "run",
                "x-component-props": {
                  "placeholder": "run",
                },
                "x-decorator-props": {
                  "tooltip": "请输入打包命令"
                },
                "x-data": {
                  "onInitCallback": [
                    // GRADLE时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'GRADLE') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  }
                  ]
                }
              },
              "goId": {
                "type": "number",
                "title": "Go",
                "required": true,
                "x-decorator": "FormItem",
                "x-decorator-props": {
                  "tooltip": "请选择Go版本"
                },
                "x-component": "Select",
                "x-component-props": {
                },
                "x-data": {
                  "onInitCallback": [
                    // GO时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'GO') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  },
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      // ajax获取Go版本信息
                      if(field.visible) {
                      request({
                      "url": urlPrefix  + "/jenkins/systemConfig/optionSelect/GO/" + formValues?.instanceCode,
                      method: 'GET'
                    }).then((res)=>{
                      return res?.data;
                    }).then((res)=>{
                      if(res.code == 200){
                      field.dataSource = res?.data
                    }
                  });
                  }
                  }
                  ]
                }
              },
              "pythonId": {
                "type": "number",
                "title": "Python",
                "required": true,
                "x-decorator": "FormItem",
                "x-decorator-props": {
                  "tooltip": "请选择Python版本"
                },
                "x-component": "Select",
                "x-component-props": {
                },
                "x-data": {
                  "onInitCallback": [
                    // PYTHON时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'PYTHON') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  },
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      // ajax获取PYTHON版本信息
                      if(field.visible) {
                      request({
                      "url": urlPrefix  + "/jenkins/systemConfig/optionSelect/PYTHON/" + formValues?.instanceCode,
                      method: 'GET'
                    }).then((res)=>{
                      return res?.data;
                    }).then((res)=>{
                      if(res.code == 200){
                      field.dataSource = res?.data
                    }
                  });
                  }
                  }
                  ]
                }
              },
              "nodejsId": {
                "type": "number",
                "title": "NodeJS",
                "required": true,
                "x-decorator": "FormItem",
                "x-decorator-props": {
                  "tooltip": "请选择NodeJS版本"
                },
                "x-component": "Select",
                "x-component-props": {
                },
                "x-data": {
                  "onInitCallback": [
                    // NODEJS时展示
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if(toolsTypeField?.value == 'NODE_JS') {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  },
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      // ajax获取NODEJS版本信息
                      if(field.visible) {
                      request({
                      "url": urlPrefix  + "/jenkins/systemConfig/optionSelect/NODE_JS/" + formValues?.instanceCode,
                      method: 'GET'
                    }).then((res)=>{
                      return res?.data;
                    }).then((res)=>{
                      if(res.code == 200){
                      field.dataSource = res?.data
                    }
                  });
                  }
                  }
                  ]
                }
              },
              "script": {
                "type": "string",
                "title": "Script",
                "required": true,
                "x-decorator": "FormItem",
                "x-component": "Input.TextArea",
                "default" : "run",
                "x-component-props": {
                  "placeholder": "",
                },
                "x-decorator-props": {
                  "tooltip": "请输入打包命令"
                },
                "x-data": {
                  "onInitCallback": [
                    // GO
                    // NODEJS
                    // PYTHON
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if( toolsTypeField?.value == 'GO' ||
                    toolsTypeField?.value == 'NODE_JS' ||
                    toolsTypeField?.value == 'PYTHON' ) {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  }
                  ]
                }
              },
              "shellScript": {
                "type": "string",
                "title": "Shell",
                "required": true,
                "x-decorator": "FormItem",
                "x-component": "Input.TextArea",
                "default" : "run",
                "x-component-props": {
                  "placeholder": "",
                },
                "x-decorator-props": {
                  "tooltip": "请输入Shell命令"
                },
                "x-data": {
                  "onInitCallback": [
                    (ctx)=>{
                      const field = ctx.field;
                      const form = ctx.form;
                      const formValues = ctx.formValues;
                      const request = ctx.request;
                      const urlPrefix = ctx.urlPrefix;

                      const toolsTypeAddress = form.query('*.toolsType')?.addresses;
                      if(toolsTypeAddress.length > 0) {
                      const toolsTypeAddressName = toolsTypeAddress[0];
                    const toolsTypeField = form.fields[toolsTypeAddressName];
                    if( toolsTypeField?.value == 'SHELL' ) {
                      field.visible=true;
                    } else {
                      field.visible=false;
                    }
                  }
                  }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
}
`
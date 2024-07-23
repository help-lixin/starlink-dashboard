export default `
{
  "name": "Deployment",
  "group": "tools",
  "icon": "/icons/plugin/icon/k8s-deploy.png",
  "enableInstanceSelect" : true,
  "pluginCode": "k8s",
  "_meta": {
    "namespace": {
      "type": "string",
      "title": "命名空间",
      "required": true,
      "x-decorator": "FormItem",
      "x-component": "Select",
      "x-reactions": {
        "dependencies": ["instanceCode"]
      },
      "x-decorator-props": {
        "tooltip": "请选择命名空间"
      },
      "x-component-props": {
        "placeholder": "default"
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
                    "url" : urlPrefix  + "/credential/"+formValues?.instanceCode+"/nameSpace/list",
                    method: 'GET'
                  }).then((res)=>{
                    return res?.data
                  }).then((res)=>{
                    if(res.code == 200) {
                    field.dataSource = res?.data
                  }
                });
            }
        },
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
                    "url" : urlPrefix  + "/credential/"+formValues?.instanceCode+"/nameSpace/list",
                    method: 'GET'
                  }).then((res)=>{
                    return res?.data
                  }).then((res)=>{
                    if(res.code == 200) {
                    field.dataSource = res?.data
                  }
                });
            }
        },
        ]
      }
    },

    "credentialName": {
      "type": "string",
      "title": "凭证",
      "required": true,
      "x-decorator": "FormItem",
      "x-decorator-props": {
        "tooltip": "请选择凭证"
      },
      "x-component": "Select",
      "x-reactions": {
        "dependencies": ["namespace"]
      },
      "x-data": {
        "onInitCallback": [
          (ctx)=>{
            const field = ctx.field;
            const form = ctx.form;
            const formValues = ctx.formValues;
            const request = ctx.request;
            const urlPrefix = ctx.urlPrefix;

            const instanceCode = formValues?.instanceCode;
            const namespace = formValues?.namespace;
            if(instanceCode && namespace) {
                request({
                    "url": urlPrefix  + "/credential/option/" + instanceCode + "/" + namespace + "/USERNAME_PASSWORD/false",
                    method: 'GET'
                  }).then((res)=>{
                    return res?.data
                  }).then((res)=>{
                    if(res.code == 200) {
                    field.dataSource = res?.data
                  }
                });
            } //end if
          }
        ],
        "onChangeCallback": [
          (ctx)=>{
            const field = ctx.field;
            const form = ctx.form;
            const formValues = ctx.formValues;
            const request = ctx.request;
            const urlPrefix = ctx.urlPrefix;

            const instanceCode = formValues?.instanceCode;
            const namespace = formValues?.namespace;
            if(instanceCode && namespace) {
                  request({
                    "url": urlPrefix  + "/credential/option/" + instanceCode + "/" + namespace + "/USERNAME_PASSWORD/false",
                    method: 'GET'
                  }).then((res)=>{
                    return res?.data
                  }).then((res)=>{
                    if(res.code == 200) {
                    field.dataSource = res?.data
                  }
                });
            } //end if
          }
        ]
      }
    },

    "deployTemplateId": {
      "type": "string",
      "title": "yaml模板",
      "required": true,
      "x-decorator": "FormItem",
      "x-decorator-props": {
        "tooltip": "请选择YAML模板"
      },
      "x-component": "Select",
      "x-data": {
        "onInitCallback": [
          (ctx)=>{
            const field = ctx.field;
            const form = ctx.form;
            const formValues = ctx.formValues;
            const request = ctx.request;
            const urlPrefix = ctx.urlPrefix;
              request({
                "url": urlPrefix  + "/kubernetes/deployment/yaml/template/options",
                method: 'GET'
              }).then((res)=>{
                return res?.data
              }).then((res)=>{
                if(res.code == 200) {
                field.dataSource = res?.data
              }
            });
          }
        ],
        "onChangeCallback": [
          (ctx)=>{
            const field = ctx.field;
            const form = ctx.form;
            const formValues = ctx.formValues;
            const request = ctx.request;
            const urlPrefix = ctx.urlPrefix;
              request({
                "url": urlPrefix  + "/kubernetes/deployment/yaml/template/options",
                method: 'GET'
              }).then((res)=>{
                return res?.data
              }).then((res)=>{
                if(res.code == 200) {
                field.dataSource = res?.data
              }
            });
          }
       ]
      }
    },
    
    "vars": {
        "type": "array",
        "x-component": "ArrayItems",
        "x-decorator": "FormItem",
        "title": "变量配置",
        "properties": {
            "add": {
              "type": "void",
              "title": "添加条目",
              "x-component": "ArrayItems.Addition",
            },
        },
        "items": {
            "type": "object",
            "x-decorator": "ArrayItems.Item",
            "properties": {
                "space": {
                    "type": "void",
                    "x-component": "Space",
                    "properties": {
                        "sort": {
                            "type": "void",
                            "x-decorator": "FormItem",
                            "x-component": "ArrayItems.SortHandle"
                        },
                        "name": {
                            "type": "string",
                            "title": "name",
                            "x-decorator": "FormItem",
                            "x-hidden" : false,
                            "x-component": "Input"
                        },
                        "value": {
                            "type": "string",
                            "title": "value",
                            "x-decorator": "FormItem",
                            "x-hidden" : false,
                            "x-component": "Input"
                        },
                        "remove": {
                            "type": "void",
                            "x-decorator": "FormItem",
                            "x-component": "ArrayItems.Remove"
                        },
                    }
                }
            }
        }
    },

  }
}
`

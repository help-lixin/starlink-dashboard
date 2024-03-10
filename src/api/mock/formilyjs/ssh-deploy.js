export default `
{
  "name": "SSH部署",
  "group": "tools",
  "icon": "http://gateway.lixin.help/starlink-service/icons/plugin/icon/ssh-deploy.png",
  "enableInstanceSelect": false,
  "pluginCode": "jsch",
  "_meta": {

    "localDir": {
      "type": "object",
      "properties": {
        "localDir": {
          "type": "string",
          "title": "构建品目录",
          "required": true,
          "x-decorator": "FormItem",
          "x-decorator-props": {
            "tooltip": "请配置构建品目录"
          },
          "default" : "#{REPOSITORY_WORKSPACE}/target/",
          "x-component": "Input",
          "x-component-props": {
            "placeholder": "#{REPOSITORY_WORKSPACE}/target/"
          }
        },
        "includes": {
          "type": "string",
          "title": "构建品包含表达式",
          "required": true,
          "x-decorator": "FormItem",
          "default" : "**/*.jar",
          "x-decorator-props": {
            "tooltip": "请配置构建品包含表达式"
          },
          "x-component": "Input",
          "x-component-props": {
            "placeholder": "*.jar"
          }
        },
        "excludes": {
          "type": "string",
          "title": "构建品包含排除表达式",
          "required": false,
          "x-decorator": "FormItem",
          "x-decorator-props": {
            "tooltip": "请配置构建品包含排除表达式"
          },
          "x-component": "Input",
          "x-component-props": {
            "placeholder": "**/*.class"
          }
        }
      }
    },

    "labels": {
      "type": "array",
      "title": "SSH标签",
      "required": true,
      "x-decorator": "FormItem",
      "x-decorator-props": {
        "tooltip": "请选择标签"
      },
      "x-component": "Checkbox.Group",
      "x-data": {
        "onInitCallback": [
          (ctx)=>{
              const field = ctx.field;
              const form = ctx.form;
              const request = ctx.request;
              const urlPrefix = ctx.urlPrefix;

              request({"url": urlPrefix  + "/ssh/label/optionSelect",method: 'GET'})
              .then((res)=>{
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

    "beforeCommand": {
      "type": "string",
      "title": "部署之前运行脚本",
      "x-decorator": "FormItem",
      "x-component": "Input.TextArea",
      "x-component-props": {
        "placeholder": "sudo systemctl stop spring-web-demo.service",
      },
      "x-decorator-props": {
        "tooltip": "请配置部署之前运行脚本"
      }
    },

    "remoteDir": {
      "type": "string",
      "title": "SSH远程服务器目录",
      "required": true,
      "x-decorator": "FormItem",
      "x-decorator-props": {
        "tooltip": "请配置SSH远程服务器目录"
      },
      "default" : "/home/app/app/spring-web-demo",
      "x-component": "Input",
      "x-component-props": {
        "placeholder": "/home/app/app/spring-web-demo"
      }
    },

    "afterCommand": {
      "type": "string",
      "title": "部署之后执行脚本",
      "x-decorator": "FormItem",
      "x-component": "Input.TextArea",
      "required": true,
      "x-component-props": {
        "placeholder": "sudo systemctl start spring-web-demo.service",
      },
      "x-decorator-props": {
        "tooltip": "请配置部署之后脚本"
      }
    },

    "executeMaxWaitTime": {
      "type": "number",
      "title":  "执行最大等待时间(分钟)",
      "x-decorator": "FormItem",
      "default" : "10",
      "x-component": "InputNumber",
      "x-component-props": {
        "min": 1
      }
    },

    "executeStrategy": {
      "type": "string",
      "title": "执行策略",
      "default" : "SERIAL",
      "enum": [{
        "label": "SERIAL",
        "value": "SERIAL",
      },
        {
          "label": "PARALLEL",
          "value": "PARALLEL",
        }
      ],
      "x-decorator": "FormItem",
      "x-component": "Select"
    },

    "executeSuccessStrategy": {
      "type": "string",
      "title": "执行成功策略",
      "default" : "LEAST_ONCE",
      "enum": [{
        "label": "ALL_SUCCESS",
        "value": "ALL_SUCCESS",
        },
        {
          "label": "LEAST_ONCE",
          "value": "LEAST_ONCE",
        }
      ],
      "x-decorator": "FormItem",
      "x-component": "Select"
    },

  }
}
`

/**
 * {
 *  // 文本框配置
 *  "localDir":{
 *     "localDir" : "/home/app/app/jenkins/workspace/spring-web-demo-git/target",
 *     "includes" : "**//*.jar",
*     "excludes" : "",
*   },
*   //  下拉复选框
*   "labels":[ "spring-web-demo" ],
*    //  单行文本框
*   "remoteDir" : "/home/app/app/spring-web-demo",
*  //  富文本框
*   "beforeCommand" : null,
*   //  富文本框
*   "afterCommand":" sudo systemctl stop spring-web-demo.service && sudo systemctl start spring-web-demo.service ",
*    // 下拉框 
*   "executeStrategy" : "SERIAL"
* }
*/
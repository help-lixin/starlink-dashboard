export default `
{
  "name": "Shell编译",
  "group": "tools",
  "icon": "http://gateway.lixin.help/starlink-service/icons/plugin/icon/ssh-shell.png",
  "enableInstanceSelect": false,
  "pluginCode": "jsch",
  "_meta": {

    "labels": {
      "type": "array",
      "title": "SSH服务器",
      "required": true,
      "x-decorator": "FormItem",
      "x-decorator-props": {
        "tooltip": "SSH服务器"
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

    "command": {
      "type": "string",
      "title": "脚本",
      "x-decorator": "FormItem",
      "x-component": "Input.TextArea",
      "x-component-props": {
        "placeholder": "ps -ef",
      },
      "x-decorator-props": {
        "tooltip": "请配置脚本"
      }
    },

    "executeMaxWaitTime": {
      "type": "number",
      "title":  "执行最大等待时间(分钟)",
      "x-decorator": "FormItem",
      "default" : "60",
      "x-component": "InputNumber",
      "x-component-props": {
        "min": 1
      }
    },

    "loadBalance": {
      "type": "string",
      "title": "负载均衡策略",
      "default" : "RANDOM",
      "enum": [{
        "label": "RANDOM",
        "value": "RANDOM",
      },
        {
          "label": "ROUND",
          "value": "ROUND",
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
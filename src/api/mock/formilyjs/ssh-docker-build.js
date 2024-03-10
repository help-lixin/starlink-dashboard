export default `
{
    "name": "生成Docker镜像",
    "group": "tools",
    "icon": "http://gateway.lixin.help/starlink-service/icons/plugin/icon/ssh-docker-build.png",
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
  
      "workDir": {
        "type": "string",
        "title": "工作目录",
        "required": false,
        "x-decorator": "FormItem",
        "x-visible" : true,
        "default" : "#{REPOSITORY_WORKSPACE}",
        "x-decorator-props": {
          "tooltip": "请配置工作目录"
        },
        "x-component": "Input",
        "x-component-props": {
          "placeholder": "/tmp/spring-web-demo"
        }
      },
  
      "dockerFile": {
        "type": "string",
        "title": "Dockerfile",
        "required": false,
        "x-decorator": "FormItem",
        "x-visible" : true,
        "default" : "#{REPOSITORY_WORKSPACE}/Dockerfile",
        "x-decorator-props": {
          "tooltip": "请配置Dockerfile位置"
        },
        "x-component": "Input",
        "x-component-props": {
          "placeholder": "./Dockerfile"
        }
      },
  
      "targetImage": {
        "type": "string",
        "title": "目标镜像",
        "required": true,
        "x-decorator": "FormItem",
        "x-visible" : true,
        "default" : "#{IMAGE_REPOSITORY}/#{IMAGE_PROJECT}/spring-web-demo:#{BUILD_NUMBER}",
        "x-decorator-props": {
          "tooltip": "请配置Docker构建后,生成的目标镜像"
        },
        "x-component": "Input",
        "x-component-props": {
          "placeholder": "registry.lixin.help/spring-web-demo/spring-web-demo:1.0.0"
        }
      },
  
  
      "buildContext": {
        "type": "string",
        "title": "构建上下文",
        "required": false,
        "x-decorator": "FormItem",
        "x-visible" : true,
        "default" : "#{REPOSITORY_WORKSPACE}",
        "x-decorator-props": {
          "tooltip": "请配置docker build时的上下文"
        },
        "x-component": "Input",
        "x-component-props": {
          "placeholder": "."
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
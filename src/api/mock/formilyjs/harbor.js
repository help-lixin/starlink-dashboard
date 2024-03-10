export default `
{
    "name": "Harbor配置",
    "group": "tools",
    "icon": "http://gateway.lixin.help/starlink-service/icons/plugin/icon/harbor.png",
    "enableInstanceSelect": true,
    "pluginCode": "harbor",
    "_meta": {

        "projectId": {
            "type": "string",
            "title": "项目",
            "required": true,
            "x-decorator": "FormItem",
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
                            "url": urlPrefix  + "/harbor/project/optionSelect/" + formValues?.instanceCode,
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
                            "url": urlPrefix  + "/harbor/project/optionSelect/" + formValues?.instanceCode,
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
            }    
          },

    }
  }
`
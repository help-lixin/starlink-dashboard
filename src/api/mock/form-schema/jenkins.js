export default `
{
    name: "Jenkins代码编译",
    group: "tools",
    icon: "http://gateway.lixin.help/starlink-service/icons/plugin/icon/jenkins.png",
    enableInstanceSelect : true,
    pluginCode: "jenkins",
    meta: [
        {
            type: "select",
            field: "instanceCode",
            title: "实例",
            value: [],
            options: [],
            props: {
                multiple: false
            },
            validate:[
                { required: true, message: '请选择实例', trigger: 'blur' },
            ],
            update(val, rule, fApi, arg){
                if(val.length > 0){
                    // 发布instanceCode事件
                    mitt.emit("instanceCode",val);
                }  
            },
            effect:{
                fetch:{
                    action: ()=>{

                        function toSelect(instances){
                            let datas = [];
                            for(let i=0;i<instances.length;i++){
                                const item= {
                                    label: instances[i].instanceName,
                                    value: instances[i].instanceCode
                                };
                                datas.push(item);
                            }
                            return datas;
                        }


                        return new Promise((resolve)=>{
                            fetch('/api/system-service/system/plugin/instance/optionSelects/jenkins',{
                                headers: {
                                    "Authorization" : "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc5ODgzMTksImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiS0NQQlp0MzczaElLNDhnNVZoeXM5TDVyNXpnIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.lxwystBgPNkMoRlw3GG4H0ViGM7Fr5g7Rbr4JaDoVoLBD6SXSMr9iXp29cmUY4CzKWQ3zRai37yrKL_SsOeIJwcGDilw8Lkd_-m4KT1R4N9oXWzqH0zkFH37Y9JALkn2c3S_scBUl_VSDTw7v1_IYQ6EZq7QYTIh1f42meP3BP5Y4fqRTPpK40C69Clk8rAqlrHb04XoUkVLWAAvmwlTroTmPhJ3RLCIxU7pAhUUP9MP-OapNufzvWmIuvrEuwbjaZm1-yIEIyptQ-bcQIZW_EzKaew1qNjKHDqb6ZBmSD-ZgxshpGcIVjNgBR0GuoRFZxH1Gm3crdY8Uix5xTKtzA"
                                }
                            })
                            .then(res => {
                                res.json().then(res => { 
                                    if(res?.code == 200){
                                        resolve(toSelect(res.data)); 
                                        // 发布instanceCode事件
                                        mitt.emit("instanceCode",undefined);
                                    }
                                })
                            })
                        });
                    },
                    to: "options"
                }
            }
        },
        {
            type: "select",
            field: "scmType",
            title: "仓库",
            value: ["GIT"],
            validate:[
                { required: true, message: '请选择仓库', trigger: 'blur' },
            ],
            options: [
                { "value": "GIT", "label": "Git" },
                { "value": "SVN", "label": "Svn" }
             ],
            props: {
                multiple: false
            },
            update(val, rule, fApi, arg){
                if(arg?.origin == "init"){
                }else if(arg?.origin == "change" && val.length > 0){
                    // 找到分支
                    const scm = fApi.getRule("scm");
                    const scmRules = scm?.props?.rule;
                    let  branch = undefined;
                    if(scmRules.length > 0){
                        for(let i=0;i<scmRules.length;i++){
                            const scmRule = scmRules[i];
                            if(scmRule.field == "branch"){
                                branch = scmRule;
                            }
                        }
                    }
    
                    if("GIT" == val) {
                        if(branch){
                            branch.hidden = false;
                        }
                    } else if("SVN" == val) {
                        if(branch){
                            branch.hidden = true;
                        }
                    }   
                }
            },
        },
        {
            type: 'subForm',
            field: 'scm',
            title: '',
            value: { url: 'http://192.168.1.10/root/spring-web-demo.git', branch: '*/main' },
            props: {
                rule: [
                    {  type: 'input', field: 'url', title: '项目地址', validate:[ { required: true, message: '请配置项子地址', trigger: 'blur' } ],   },
                    {  type: 'input', field: 'branch', title: '项目分支' , validate:[ { required: true, message: '请配置项目分支', trigger: 'blur' } ], },
                    {  type: 'select', field: 'credentialId', title: '凭证' , validate:[ { required: true, message: '请选择凭证', trigger: 'blur' } ] ,
                       effect: {
                            dependencies: 'instanceCode'
                       },
                       update(val, rule, fApi, arg){
                            if(arg?.origin == "dependencies"){
                                const instanceCode = fApi.getValue(val);
                                
                                fetch('/api/starlink-service/credential/option/'+instanceCode , {
                                    headers: {
                                        "Authorization" : "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc5ODgzMTksImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiS0NQQlp0MzczaElLNDhnNVZoeXM5TDVyNXpnIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.lxwystBgPNkMoRlw3GG4H0ViGM7Fr5g7Rbr4JaDoVoLBD6SXSMr9iXp29cmUY4CzKWQ3zRai37yrKL_SsOeIJwcGDilw8Lkd_-m4KT1R4N9oXWzqH0zkFH37Y9JALkn2c3S_scBUl_VSDTw7v1_IYQ6EZq7QYTIh1f42meP3BP5Y4fqRTPpK40C69Clk8rAqlrHb04XoUkVLWAAvmwlTroTmPhJ3RLCIxU7pAhUUP9MP-OapNufzvWmIuvrEuwbjaZm1-yIEIyptQ-bcQIZW_EzKaew1qNjKHDqb6ZBmSD-ZgxshpGcIVjNgBR0GuoRFZxH1Gm3crdY8Uix5xTKtzA"
                                    }
                                })
                                .then(res => {
                                    res.json().then(res => { 
                                        if(res?.code == 200){
                                            rule.options=res.data
                                        }
                                    })
                                })
                            }else if(arg?.origin == "change" && val.length > 0){
                                
                            }
                       },
                    }, 
                ]
            }
        },
        {
            type:"hidden",
            field:"jdkId", 
            value:""
        },
        {
            type: "select",
            field: "toolsType",
            title: "语言",
            value: [],
            options: [
                { "value": "MAVEN", "label": "Maven" },
                { "value": "GRADLE", "label": "Gradle" },
                { "value": "PYTHON","label": "Python" },
                { "value": "GO", "label": "Go" }, 
                { "value": "NODE_JS", "label": "NodeJS" },
                { "value": "ANT", "label": "Ant" },
                { "value": "SHELL", "label": "Shell命令" }
             ],
            props: {
                multiple: false
            },
            update(val, rule, fApi, arg){
               if(arg?.origin == "init"){
               }else if(arg?.origin == "change" && val.length > 0){
                  console.log("====================================")
                  const setups = fApi.getRule("setups");
                  setups.value=[];
                  console.log("====================================")
               }
            },
        },
        {
            type: 'group',
            field: 'setups',
            title: '步骤',
            value: [],
            props: {
              rule: [
                { type:"hidden", field:"setupType",  value:"" },
                // jdk
                { type: 'select', field: 'jdk', title: 'JDK版本', props:{ options:[] } },
                // mavenId
                {type: 'select', field: 'mavenId', title: 'Maven版本'},
                // goals
                {
                    type:"textarea",
                    title:"Script",
                    field:"goals",
                    value:"clean install -DskipTests -X",
                    col:{
                        span:12,
                        labelWidth:150
                    },
                    props: {
                        type: "text",
                    },
                    validate:[
                        { required: true, message: '请输入打包脚本', trigger: 'blur' },
                    ],
                },
                // antId
                {type: 'select', field: 'antId', title: 'Ant版本'},
                // targets
                {
                    type:"textarea",
                    title:"Script",
                    field:"targets",
                    value:"clean install -DskipTests -X",
                    col:{
                        span:12,
                        labelWidth:150
                    },
                    props: {
                        type: "text",
                    },
                    validate:[
                        { required: true, message: '请输入打包脚本', trigger: 'blur' },
                    ],
                },
                // gradleId
                {type: 'select', field: 'gradleId', title: 'Gradle版本'},
                // task
                {
                    type:"textarea",
                    title:"Script",
                    field:"task",
                    value:"clean install -DskipTests -X",
                    col:{
                        span:12,
                        labelWidth:150
                    },
                    props: {
                        type: "text",
                    },
                    validate:[
                        { required: true, message: '请输入打包脚本', trigger: 'blur' },
                    ],
                },
                // goId
                {type: 'select', field: 'goId', title: 'Go版本'},
                // pythonId
                {type: 'select', field: 'pythonId', title: 'Python版本'},
                // nodejsId
                {type: 'select', field: 'nodejsId', title: 'NodeJS版本'},
                // script
                {
                    type:"textarea",
                    title:"Script",
                    field:"script",
                    value:"",
                    props: {
                        type: "text",
                    },
                    validate:[
                        { required: true, message: '请输入打包脚本', trigger: 'blur' },
                    ],
                },
                // shellScript
                {
                    type:"textarea",
                    title:"Script",
                    field:"shellScript",
                    value:"",
                    col:{
                        span:12,
                        labelWidth:150
                    },
                    props: {
                        type: "text",
                    },
                    validate:[
                        { required: true, message: '请输入打包脚本', trigger: 'blur' },
                    ],
                },
              ]
            }
          }
    ]
}`
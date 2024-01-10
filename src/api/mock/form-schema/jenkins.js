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
            placeholder : "请选择Jenkins实例" ,
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
            placeholder : "请选择仓库" ,
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
                    {  type: 'select', field: 'credentialId', title: '凭证' , placeholder : "请选择凭证"  , validate:[ { required: true, message: '请选择凭证', trigger: 'blur' } ] ,
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
            title: "打包工具",
            value: [],
            placeholder : "请选择打包工具" ,
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
            //    if(arg?.origin == "init"){
            //    }else if(arg?.origin == "change"){
                  const setups = fApi.getRule("setups")
                  if(setups.value.length == 0 && val.length > 0 ){
                    setups.value.push({});
                  }

                  if(setups.value.length > 0) {

                    const childRules = setups?.props?.rule
                    // 先把所有的元素全部隐藏掉
                    for(let i=0;i<childRules.length;i++){
                        childRules[i].hidden=true;
                    }

                    // setupType
                    childRules.filter((item,index,self)=>{
                        if(item.field == "setupType"){
                            return item;
                        }
                    }).forEach((item)=>{
                        item.value=val;
                    });
                    
                    // 针对不同的value对UI进行展示
                    let filterRules = [];
                    if(val == "MAVEN"){
                        // maven-> 
                        // mavenId:undefined,
                        // goals:undefined,
                        filterRules = childRules.filter((item,index,self)=>{
                            const field =  item.field;
                            if(field == "mavenId" || field == "goals" || field == "jdk"){
                                return item;
                            }
                        });
                    } else if(val == "GRADLE"){
                        // gradle-> 
                        // gradleId:undefined,
                        // task:undefined,
                        filterRules = childRules.filter((item,index,self)=>{
                            const field =  item.field;
                            if(field == "gradleId" || field == "task" || field == "jdk"){
                                return item;
                            }
                        });
                    } else if(val == "ANT"){
                        // ant->
                        // antId
                        // targets:undefined,

                        filterRules = childRules.filter((item,index,self)=>{
                            const field =  item.field;
                            if(field == "antId" || field == "targets" || field == "jdk" ){
                                return item;
                            }
                        });
                    } else if(val == "GO"){
                        // go-> 
                        // goId:undefined,
                        // script:undefined,
                        filterRules = childRules.filter((item,index,self)=>{
                            const field =  item.field;
                            if(field == "goId" || field == "script"){
                                return item;
                            }
                        });
                    } else if(val == "NODE_JS"){
                        // nodejs-> 
                        // nodejsId:undefined,
                        // script:undefined,
                        filterRules = childRules.filter((item,index,self)=>{
                            const field =  item.field;
                            if(field == "nodejsId" || field == "script"){
                                return item;
                            }
                        });
                    } else if(val == "PYTHON"){
                        // python-> 
                        // pythonId:undefined,
                        // script:undefined,
                        filterRules = childRules.filter((item,index,self)=>{
                            const field =  item.field;
                            if(field == "pythonId" || field == "script"){
                                return item;
                            }
                        });
                    } else if(val == "SHELL"){
                        // shell-> 
                        // shellScript:undefined
                        filterRules = childRules.filter((item,index,self)=>{
                            const field =  item.field;
                            if(field == "shellScript"){
                                return item;
                            }
                        });
                    } 

                    // 显示指定的UI
                    filterRules.forEach((item)=>{
                        item.hidden=false;
                    });

                  }
            //    }
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
                { type: 'select', field: 'jdk', hidden: true,  title: 'JDK版本' , placeholder : "请选择JDK版本" , props:{ options:[] } , validate:[
                    // { required: true, message: '请选择JDK版本', trigger: 'blur' },
                ], update(val, rule, fApi, arg){
                    // 为什么获取不到:instanceCode
                    const instanceCode = fApi.getValue("instanceCode");
                    

                    fetch('/jenkins/systemConfig/optionSelect/JAVA/'+ instanceCode , {
                        headers: {
                            "Authorization" : "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc5ODgzMTksImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiS0NQQlp0MzczaElLNDhnNVZoeXM5TDVyNXpnIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.lxwystBgPNkMoRlw3GG4H0ViGM7Fr5g7Rbr4JaDoVoLBD6SXSMr9iXp29cmUY4CzKWQ3zRai37yrKL_SsOeIJwcGDilw8Lkd_-m4KT1R4N9oXWzqH0zkFH37Y9JALkn2c3S_scBUl_VSDTw7v1_IYQ6EZq7QYTIh1f42meP3BP5Y4fqRTPpK40C69Clk8rAqlrHb04XoUkVLWAAvmwlTroTmPhJ3RLCIxU7pAhUUP9MP-OapNufzvWmIuvrEuwbjaZm1-yIEIyptQ-bcQIZW_EzKaew1qNjKHDqb6ZBmSD-ZgxshpGcIVjNgBR0GuoRFZxH1Gm3crdY8Uix5xTKtzA"
                        }
                    }).then(res => {
                        res.json().then(res => { 
                            if(res?.code == 200){
                                rule.options=res.data
                            }
                        })
                    });

                } },
                // mavenId
                { type: 'select', field: 'mavenId', hidden: true,  title: 'Maven版本' , placeholder : "请选择Maven版本" , validate: [  ] , 
                    update(val, rule, fApi, arg){
                        // if(arg?.origin == "init"){
                        //     return;
                        // }
                        // const instanceCode = fApi.getValue("instanceCode");
                        // fetch('/jenkins/systemConfig/optionSelect/MAVEN/'+instanceCode , {
                        //     headers: {
                        //         "Authorization" : "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc5ODgzMTksImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiS0NQQlp0MzczaElLNDhnNVZoeXM5TDVyNXpnIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.lxwystBgPNkMoRlw3GG4H0ViGM7Fr5g7Rbr4JaDoVoLBD6SXSMr9iXp29cmUY4CzKWQ3zRai37yrKL_SsOeIJwcGDilw8Lkd_-m4KT1R4N9oXWzqH0zkFH37Y9JALkn2c3S_scBUl_VSDTw7v1_IYQ6EZq7QYTIh1f42meP3BP5Y4fqRTPpK40C69Clk8rAqlrHb04XoUkVLWAAvmwlTroTmPhJ3RLCIxU7pAhUUP9MP-OapNufzvWmIuvrEuwbjaZm1-yIEIyptQ-bcQIZW_EzKaew1qNjKHDqb6ZBmSD-ZgxshpGcIVjNgBR0GuoRFZxH1Gm3crdY8Uix5xTKtzA"
                        //     }
                        // }).then(res => {
                        //     res.json().then(res => { 
                        //         if(res?.code == 200){
                        //             rule.options=res.data
                        //         }
                        //     })
                        // });
                    }  
                },
                // goals
                {
                    type:"textarea",
                    title:"Script",
                    field:"goals",
                    hidden: true, 
                    autosize:true,
                    value: "clean install -DskipTests -X",
                    col:{
                        span:12,
                        labelWidth:150
                    },
                    props: {
                        type: "text",
                    },
                    validate:[
                        // { required: true, message: '请输入打包脚本', trigger: 'blur' },
                    ],
                },
                // antId
                {type: 'select', field: 'antId', hidden: true,  title: 'Ant版本' , validate: [ { required: true, message: '请选择Ant版本', trigger: 'blur' },] , update(val, rule, fApi, arg){
                    // if(arg?.origin == "init"){
                    //     return;
                    // }

                    // const instanceCode = fApi.getValue("instanceCode");
                    // fetch('/jenkins/systemConfig/optionSelect/ANT/'+instanceCode , {
                    //     headers: {
                    //         "Authorization" : "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc5ODgzMTksImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiS0NQQlp0MzczaElLNDhnNVZoeXM5TDVyNXpnIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.lxwystBgPNkMoRlw3GG4H0ViGM7Fr5g7Rbr4JaDoVoLBD6SXSMr9iXp29cmUY4CzKWQ3zRai37yrKL_SsOeIJwcGDilw8Lkd_-m4KT1R4N9oXWzqH0zkFH37Y9JALkn2c3S_scBUl_VSDTw7v1_IYQ6EZq7QYTIh1f42meP3BP5Y4fqRTPpK40C69Clk8rAqlrHb04XoUkVLWAAvmwlTroTmPhJ3RLCIxU7pAhUUP9MP-OapNufzvWmIuvrEuwbjaZm1-yIEIyptQ-bcQIZW_EzKaew1qNjKHDqb6ZBmSD-ZgxshpGcIVjNgBR0GuoRFZxH1Gm3crdY8Uix5xTKtzA"
                    //     }
                    // }).then(res => {
                    //     res.json().then(res => { 
                    //         if(res?.code == 200){
                    //             rule.options=res.data
                    //         }
                    //     })
                    // });
                } },
                // targets
                {
                    type:"textarea",
                    title:"Script",
                    field:"targets",
                    hidden: true, 
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
                {type: 'select', field: 'gradleId', hidden: true,  title: 'Gradle版本' , placeholder : "请选择Gradle版本" , validate: [ { required: true, message: '请选择Gradle版本', trigger: 'blur' },] , update(val, rule, fApi, arg){
                    // if(arg?.origin == "init"){
                    //     return;
                    // }
                } },
                // task
                {
                    type:"textarea",
                    title:"Script",
                    field:"task",
                    hidden: true, 
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
                {type: 'select', field: 'goId', hidden: true,  title: 'Go版本' , placeholder : "请选择Go版本" , validate: [ { required: true, message: '请选择Go', trigger: 'blur' },] , update(val, rule, fApi, arg){
                    // if(arg?.origin == "init"){
                    //     return;
                    // }

                    // const instanceCode = fApi.getValue("instanceCode");
                    // fetch('/jenkins/systemConfig/optionSelect/GO/'+instanceCode , {
                    //     headers: {
                    //         "Authorization" : "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc5ODgzMTksImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiS0NQQlp0MzczaElLNDhnNVZoeXM5TDVyNXpnIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.lxwystBgPNkMoRlw3GG4H0ViGM7Fr5g7Rbr4JaDoVoLBD6SXSMr9iXp29cmUY4CzKWQ3zRai37yrKL_SsOeIJwcGDilw8Lkd_-m4KT1R4N9oXWzqH0zkFH37Y9JALkn2c3S_scBUl_VSDTw7v1_IYQ6EZq7QYTIh1f42meP3BP5Y4fqRTPpK40C69Clk8rAqlrHb04XoUkVLWAAvmwlTroTmPhJ3RLCIxU7pAhUUP9MP-OapNufzvWmIuvrEuwbjaZm1-yIEIyptQ-bcQIZW_EzKaew1qNjKHDqb6ZBmSD-ZgxshpGcIVjNgBR0GuoRFZxH1Gm3crdY8Uix5xTKtzA"
                    //     }
                    // }).then(res => {
                    //     res.json().then(res => { 
                    //         if(res?.code == 200){
                    //             rule.options=res.data
                    //         }
                    //     })
                    // });
                }  },
                // pythonId
                {type: 'select', field: 'pythonId', hidden: true,  title: 'Python版本' , placeholder : "请选择Python版本" ,validate: [ { required: true, message: '请选择Python', trigger: 'blur' },] ,update(val, rule, fApi, arg){
                    // if(arg?.origin == "init"){
                    //     return;
                    // }

                    // const instanceCode = fApi.getValue("instanceCode");
                    // fetch('/jenkins/systemConfig/optionSelect/PYTHON/'+instanceCode , {
                    //     headers: {
                    //         "Authorization" : "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc5ODgzMTksImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiS0NQQlp0MzczaElLNDhnNVZoeXM5TDVyNXpnIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.lxwystBgPNkMoRlw3GG4H0ViGM7Fr5g7Rbr4JaDoVoLBD6SXSMr9iXp29cmUY4CzKWQ3zRai37yrKL_SsOeIJwcGDilw8Lkd_-m4KT1R4N9oXWzqH0zkFH37Y9JALkn2c3S_scBUl_VSDTw7v1_IYQ6EZq7QYTIh1f42meP3BP5Y4fqRTPpK40C69Clk8rAqlrHb04XoUkVLWAAvmwlTroTmPhJ3RLCIxU7pAhUUP9MP-OapNufzvWmIuvrEuwbjaZm1-yIEIyptQ-bcQIZW_EzKaew1qNjKHDqb6ZBmSD-ZgxshpGcIVjNgBR0GuoRFZxH1Gm3crdY8Uix5xTKtzA"
                    //     }
                    // }).then(res => {
                    //     res.json().then(res => { 
                    //         if(res?.code == 200){
                    //             rule.options=res.data
                    //         }
                    //     })
                    // });
                } },
                // nodejsId
                {type: 'select', field: 'nodejsId', hidden: true,  title: 'NodeJS版本' , placeholder : "请选择NodeJS版本" ,validate: [ { required: true, message: '请选择NodeJS', trigger: 'blur' },] , update(val, rule, fApi, arg){
                    // if(arg?.origin == "init"){
                    //     return;
                    // }
                    
                    // const instanceCode = fApi.getValue("instanceCode");
                    // fetch('/jenkins/systemConfig/optionSelect/NODE_JS/'+instanceCode , {
                    //     headers: {
                    //         "Authorization" : "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc5ODgzMTksImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiS0NQQlp0MzczaElLNDhnNVZoeXM5TDVyNXpnIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.lxwystBgPNkMoRlw3GG4H0ViGM7Fr5g7Rbr4JaDoVoLBD6SXSMr9iXp29cmUY4CzKWQ3zRai37yrKL_SsOeIJwcGDilw8Lkd_-m4KT1R4N9oXWzqH0zkFH37Y9JALkn2c3S_scBUl_VSDTw7v1_IYQ6EZq7QYTIh1f42meP3BP5Y4fqRTPpK40C69Clk8rAqlrHb04XoUkVLWAAvmwlTroTmPhJ3RLCIxU7pAhUUP9MP-OapNufzvWmIuvrEuwbjaZm1-yIEIyptQ-bcQIZW_EzKaew1qNjKHDqb6ZBmSD-ZgxshpGcIVjNgBR0GuoRFZxH1Gm3crdY8Uix5xTKtzA"
                    //     }
                    // }).then(res => {
                    //     res.json().then(res => { 
                    //         if(res?.code == 200){
                    //             rule.options=res.data
                    //         }
                    //     })
                    // });
                } },
                // script
                {
                    type:"textarea",
                    title:"Script",
                    field:"script",
                    hidden: true, 
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
                    hidden: true, 
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
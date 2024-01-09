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
            effect:{
                fetch:{
                    action: ()=>{
                        return new Promise((resolve) => {
                            
                            fetch('https://cdn.jsdelivr.net/gh/modood/Administrative-divisions-of-China@2.4.0/dist/pc-code.json').then(res => {
                              console.log(res)
                            //   res.json().then(res => {
                            //     resolve(tidy(res));
                            //   })
                            })
                          })
                    },
                    to: "options"
                }
            }
        },
        {
            type: "select",
            field: "scmType",
            title: "仓库类型",
            value: ["GIT"],
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
                        // fApi.updateRules({'branch': {hidden: false}})
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
            title: '仓库',
            value: { url: 'http://192.168.1.10/root/spring-web-demo.git', branch: '*/main' },
            props: {
                rule: [
                    {  type: 'input', field: 'url', title: '项目地址'   },
                    {  type: 'input', field: 'branch', title: '项目分支'  },
                    {  type: 'input', field: 'credentialId', title: '凭证'  }
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
export const navigation = new Map<string,string[]>([
    [ "/system/user/index" , ["系统管理","用户管理"] ],
    [ "/system/role/index" , ["系统管理","角色管理"] ],
    [ "/system/menu/index" , ["系统管理","菜单管理"] ],
    [ "/system/env/index" ,  ["系统管理","环境管理"] ],
    [ "/system/group/index" ,  ["系统管理","环境组管理"] ],
    [ "/system/credential/index" ,  ["系统管理","凭证管理"] ],
    [ "/system/plugin/definition/index" ,  ["系统管理","插件管理"] ],
    [ "/system/plugin/instance/index" ,  ["系统管理","插件实例管理"] ],

    [ "/workflow/definition/index" ,  ["流水线管理","流水线定义管理"] ],
    [ "/workflow/instance/index" ,  ["流水线管理","流水线实例管理"] ],

    [ "/gitlab/group/index" ,  ["gitlab管理","组管理"] ],
    [ "/gitlab/project/index" ,  ["gitlab管理","项目管理"] ],
    [ "/gitlab/group/member/index" ,  ["gitlab管理","组成员管理"] ],
    [ "/gitlab/project/member/index" ,  ["gitlab管理","项目成员管理"] ],
    [ "/gitlab/user/index" ,  ["gitlab管理","用户管理"] ],

    [ "/jenkins/job/index" ,  ["jenkins管理","Job"] ],
    [ "/jenkins/build/index" ,  ["jenkins管理","Task"] ],
    [ "/jenkins/sys_config/index" ,  ["jenkins管理","系统配置"] ],

    [ "/harbor/project/index" ,  ["harbor管理","项目管理"] ],
    [ "/harbor/log_info/index" ,  ["harbor管理","日志管理"] ],

    [ "/ansible/label/index" ,  ["ansible管理","标签管理"] ],
    [ "/ansible/host/index" ,  ["ansible管理","主机管理"] ],

    [ "/ssh/label/index" ,  ["ssh管理","标签管理"] ],
    [ "/ssh/host/index" ,  ["ssh管理","主机管理"] ],

    [ "/kubernetes/deployment/list/index" ,  ["kubernetes管理","Deployment"] ],
    [ "/kubernetes/daemonset/list/index" ,  ["kubernetes管理","Daemonset"] ],
    [ "/kubernetes/cronjob/list/index" ,  ["kubernetes管理","CronJob"] ],
    [ "/kubernetes/job/list/index" ,  ["kubernetes管理","Job"] ],
    [ "/kubernetes/pod/list/index" ,  ["kubernetes管理","Pod"] ],
    [ "/kubernetes/service/list/index" ,  ["kubernetes管理","Service"] ],
    [ "/kubernetes/node/list/index" ,  ["kubernetes管理","Node"] ],

    [ "/kubernetes/deployment/operate" ,  ["kubernetes管理","Deployment","编辑页面"] ],
    [ "/kubernetes/daemonset/operate" ,  ["kubernetes管理","Daemonset","编辑页面"] ],
    [ "/kubernetes/cronjob/operate" ,  ["kubernetes管理","CronJob","编辑页面"] ],
    [ "/kubernetes/job/operate" ,  ["kubernetes管理","Job","编辑页面"] ],
    [ "/kubernetes/pod/operate" ,  ["kubernetes管理","Pod","编辑页面"] ],
    [ "/kubernetes/service/operate" ,  ["kubernetes管理","Service","编辑页面"] ],


]);


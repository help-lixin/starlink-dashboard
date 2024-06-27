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

    [ "/gitlab/group/index" ,  ["gitlab管理","gitlab组管理"] ],
    [ "/gitlab/project/index" ,  ["gitlab管理","gitlab项目管理"] ],
    [ "/gitlab/group/member/index" ,  ["gitlab管理","gitlab组成员管理"] ],
    [ "/gitlab/project/member/index" ,  ["gitlab管理","gitlab项目成员管理"] ],
    [ "/gitlab/user/index" ,  ["gitlab管理","gitlab用户管理"] ],

    [ "/jenkins/job/index" ,  ["jenkins管理","jenkinsJob管理"] ],
    [ "/jenkins/build/index" ,  ["jenkins管理","jenkins任务管理"] ],
    [ "/jenkins/sys_config/index" ,  ["jenkins管理","jenkins工具管理"] ],

    [ "/harbor/project/index" ,  ["harbor管理","harbor项目管理"] ],
    [ "/harbor/log_info/index" ,  ["harbor管理","harbor日志管理"] ],

    [ "/ansible/label/index" ,  ["ansible管理","ansible标签管理"] ],
    [ "/ansible/host/index" ,  ["ansible管理","ansible主机管理"] ],

    [ "/ssh/label/index" ,  ["ssh管理","ssh标签管理"] ],
    [ "/ssh/host/index" ,  ["ssh管理","ssh主机管理"] ],

    [ "/kubernetes/deployment/list/index" ,  ["kubernetes管理","Deployment管理"] ],
    [ "/kubernetes/daemonset/list/index" ,  ["kubernetes管理","Daemonset管理"] ],
    [ "/kubernetes/cronjob/list/index" ,  ["kubernetes管理","CronJob管理"] ],
    [ "/kubernetes/job/list/index" ,  ["kubernetes管理","Job管理"] ],
    [ "/kubernetes/pod/list/index" ,  ["kubernetes管理","Pod管理"] ],
    [ "/kubernetes/service/list/index" ,  ["kubernetes管理","Service管理"] ],

    [ "/kubernetes/deployment/operate" ,  ["kubernetes管理","Deployment管理","编辑页面"] ],
    [ "/kubernetes/daemonset/operate" ,  ["kubernetes管理","Daemonset管理","编辑页面"] ],
    [ "/kubernetes/cronjob/operate" ,  ["kubernetes管理","CronJob管理","编辑页面"] ],
    [ "/kubernetes/job/operate" ,  ["kubernetes管理","Job管理","编辑页面"] ],
    [ "/kubernetes/pod/operate" ,  ["kubernetes管理","Pod管理","编辑页面"] ],
    [ "/kubernetes/service/operate" ,  ["kubernetes管理","Service管理","编辑页面"] ],


]);


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

    [ "/jenkins/job/index" ,  ["jenkins管理","jenkins任务管理"] ],
    [ "/jenkins/sys_config/index" ,  ["jenkins管理","jenkins工具管理"] ],

    [ "/harbor/project/index" ,  ["harbor管理","harbor项目管理"] ],
    [ "/harbor/log_info/index" ,  ["harbor管理","harbor日志管理"] ],

    [ "/ansible/label/index" ,  ["ansible管理","ansible标签管理"] ],
    [ "/ansible/host/index" ,  ["ansible管理","ansible主机管理"] ],

    [ "/shell/label/index" ,  ["shell管理","shell标签管理"] ],
    [ "/shell/host/index" ,  ["shell管理","shell主机管理"] ],
]);


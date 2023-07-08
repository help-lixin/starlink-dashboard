// @ts-nocheck  
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import {GATEWAY_BASE_URL} from "@/utils/env"

type Response<T> = {
    code:number,
    msg:string,
    data:T
}

export type SysMenuItem = {
    menuId:number,
    menuName:string,
    parentName:string,
    parentId:number,
    orderNum:number,
    path:string,
    component:string,
    query:string,
    isFrame:string,
    isCache:string,
    menuType:string,
    visible:string,
    status:string,
    perms:string,
    icon:string,
    children:Array<SysMenuItem>
}

// SysMenuItem[] : 代表数组
type SysMenuListResult = Response<SysMenuItem[]>;

type SysMenuRequest = {
    menuName:string,
    visible:string,
    status:string
}

// POST  /system-service/system/menu/list
export const queryMenuList = (params:SysMenuRequest)=>{
    return request<SysMenuListResult>({
        url : GATEWAY_BASE_URL + "/system-service/system/menu/list",
        method:'POST',
        headers: {
            "content-type" : "application/json"
        },
        data : params
    }).then((res)=>{
        return res.data;
    });
}

export function handleTree(data, id, parentId, children) {
    const config = {
      id: id || 'id',
      parentId: parentId || 'parentId',
      childrenList: children || 'children'
    };
  
    const childrenListMap = {};
    const nodeIds = {};
    const tree = [];
  
    for (const d of data) {
      const parentId = d[config.parentId];
      if (childrenListMap[parentId] == null) {
        childrenListMap[parentId] = [];
      }
      nodeIds[d[config.id]] = d;
      childrenListMap[parentId].push(d);
    }
  
    for (const d of data) {
      const parentId = d[config.parentId];
      if (nodeIds[parentId] == null) {
        tree.push(d);
      }
    }
  
    for (const t of tree) {
      adaptToChildrenList(t);
    }
  
    function adaptToChildrenList(o:any) {
      if (childrenListMap[o[config.id]] !== null) {
        o[config.childrenList] = childrenListMap[o[config.id]];
      }
      if (o[config.childrenList]) {
        for (const c of o[config.childrenList]) {
          adaptToChildrenList(c);
        }
      }
    }
    return tree;
  }


export function toTree(menus:any,root:string) {
  const menuParentIdGroup = {};
	// 提取出parentId相同的扔在一个数组里
	for(const menuItem of menus){
		if(menuParentIdGroup[menuItem.parentId] == undefined){
			menuParentIdGroup[menuItem.parentId] = [];
		}
		 menuParentIdGroup[menuItem.parentId].push({ value: menuItem.menuId , label : menuItem.menuName , children:[] , parent_id: menuItem.parentId });
	}
	
	
	// 把所有的子节点,添加到父节点上
	for(const menuPropertyName in menuParentIdGroup){
		const propertyName = menuPropertyName;
		const menuArray = menuParentIdGroup[propertyName];
		for(const menu of menuArray) {
			const menuid = menu.value;
			let childMenus = menuParentIdGroup[menuid];
			if(childMenus == undefined){
				childMenus = [];
			}
			menu.children = childMenus;
		}
	}

  // 拿取第一个元素
	const tree = menuParentIdGroup[root];
	return tree;
} 


export function parseTime(time, pattern) {
    if (arguments.length === 0 || !time) {
      return null
    }
    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
      date = time
    } else {
      if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
        time = parseInt(time)
      } else if (typeof time === 'string') {
        time = time.replace(new RegExp(/-/gm), '/').replace('T', ' ').replace(new RegExp(/\.[\d]{3}/gm), '');
      }
      if ((typeof time === 'number') && (time.toString().length === 10)) {
        time = time * 1000
      }
      date = new Date(time)
    }
    const formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
      let value = formatObj[key]
      // Note: getDay() returns 0 on Sunday
      if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
      if (result.length > 0 && value < 10) {
        value = '0' + value
      }
      return value || 0
    })
    return time_str
  }  

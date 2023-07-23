// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from '@/utils/request';
import { GATEWAY_BASE_URL } from '@/utils/env';

type Response<T> = {
	code: number,
	msg: string,
	data: T
};

export type SysMenuItem = {
	menuId: number,
	menuName: string,
	parentName: string,
	parentId: number,
	orderNum: number,
	path: string,
	component: string,
	query: string,
	isFrame: string,
	isCache: string,
	menuType: string,
	visible: string,
	status: string,
	perms: string,
	icon: string,
	children: Array<SysMenuItem>
};

type SysMenuListResult = Response<SysMenuItem[]>;

type SysMenuRequest = {
	menuName: string,
	visible: string,
	status: string
};

export type MenuRequest = {
	menuId: number,
	perms: string,
	parentId: number,
	menuName: string,
	icon: string,
	menuType: string,
	orderNum: number,
	isFrame: string,
	isCache: string,
	visible: string,
	status: string
};


export type Menu = {
	menuId:string,
	parentId:string,
	menuName:string,
	component:string,
	orderNum:number,
	icon:string,
	children: Array<Menu>
}

export type MenuList = Array<Menu>;

// 获取菜单树
export const getMenuTree = ()=> {
	return request<MenuList>({
		url: GATEWAY_BASE_URL + '/system-service/system/menu/menuTree',
		method: 'GET'
	}).then(res => {
		if(res.data?.code == 200){
			return res.data?.data;
		}
		return [];
	});
}

// POST  /system-service/system/menu/list
export const queryMenuList = (params: SysMenuRequest) => {
	return  request <SysMenuListResult>({
			url: GATEWAY_BASE_URL + '/system-service/system/menu/list',
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			data: params
		}).then(res => {
			return res.data;
		});
};

// 添加菜单
export const addMenu = (menu: MenuRequest) => {
	return request({
		url: GATEWAY_BASE_URL + '/system-service/system/menu/add',
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: menu
	});
};

// 更新菜单
export const updateMenu = (menu: MenuRequest) => {
	return request({
		url: GATEWAY_BASE_URL + '/system-service/system/menu/edit',
		method: 'PUT',
		headers: {
			'content-type': 'application/json'
		},
		data: menu
	});
};

// 获取某个菜单id的详细信息
export const getMenu = (menuId: number) => {
	return request({
		url: GATEWAY_BASE_URL + '/system-service/system/menu/' + menuId,
		method: 'GET'
	});
};

// 删除菜单
export function delMenu(menuId) {
	return request({
		url: GATEWAY_BASE_URL + '/system-service/system/menu/del/' + menuId,
		method: 'DELETE'
	});
}

// 菜单树
export function treeSelect(params: SysMenuRequest) {
	return request({
		url: GATEWAY_BASE_URL + '/system-service/system/menu/treeselect',
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: params
	});
}

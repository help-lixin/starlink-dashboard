import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"

                                        
// 获取存储库列表信息
export const getBlobStoreList = (param:any) =>{
    return request({
      url: STARLINK_SERVICE + '/nexus/blobstores/list',
      method: 'post',
      data: param
    }).then((res)=>{
        return res?.data;
    });
}

// 创建存储库
export const createFileBlobStore = (param:any) =>{
  return request({
    url: STARLINK_SERVICE + '/nexus/blobstores/file',
    method: 'post',
    data: param
  }).then((res)=>{
      return res?.data;
  });
}


// 根据仓库名称获取存储库信息
export const getFileBlobStoreInfoByName = (param:any)=> {
  return request({
    url: STARLINK_SERVICE + '/nexus/blobstores/file/list',
    method: 'post',
    data:param
  }).then((res)=>{
      return res?.data;
  });
}

// 根据仓库名称删除存储库信息
export const deleteBlobStoreByName = (param:any)=> {
  return request({
    url: STARLINK_SERVICE + '/nexus/blobstores/file',
    method: 'delete',
    data: param
  }).then((res)=>{
      return res?.data;
  });
}

// 更新存储库信息
export const updateFileBlobStoreInfoByName = (updateInfo:any)=> {
  return request({
    url: STARLINK_SERVICE + '/nexus/blobstores/file',
    method: 'put',
    data: updateInfo
  }).then((res)=>{
      return res?.data;
  });
}



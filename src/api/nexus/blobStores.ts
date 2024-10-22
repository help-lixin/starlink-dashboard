import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"
                                        
// 获取存储库列表信息
export const getBlobStoresList = (param:any) =>{
    return request({
      url: STARLINK_SERVICE + '/nexus/blobstores/list',
      method: 'post',
      data: param
    }).then((res)=>{
        return res?.data;
    });
}

// 创建、更新存储库
export const addOrUpdateFileBlobStores = (param:any) =>{
  return request({
    url: STARLINK_SERVICE + '/nexus/blobstores/file/add',
    method: 'post',
    data: param
  }).then((res)=>{
      return res?.data;
  });
}


// 根据仓库名称获取存储库信息
export const getFileBlobStoresDetails = (id:any)=> {
  return request({
    url: STARLINK_SERVICE + '/nexus/blobstores/file/'+id,
    method: 'get',
  }).then((res)=>{
      return res?.data;
  });
}

// 根据仓库名称删除存储库信息
export const deleteBlobStoresByName = (param:any)=> {
  return request({
    url: STARLINK_SERVICE + '/nexus/blobstores/file',
    method: 'delete',
    data: param
  }).then((res)=>{
      return res?.data;
  });
}
// 修改数据状态
export const changeNexusStatus = (id:any, status:any)=> {
  return request({
    url: STARLINK_SERVICE + '/nexus/blobstores/file/changeStatus/'+ id +'/'+ status,
    method: 'put'
  }).then((res)=>{
      return res?.data;
  });
}

//B转MB
export  const byteToMB = (param:any) => {
  return parseInt(param) / (1024 * 1024);
};


//MB转GB
export const mBToGB = (param:any) => {
  return parseInt(param) / 1024;
};

//显示单位，param=Byte，大于1024转为GB，保留2位小数
export  const unitConversion = (param:string) => {
  const value = byteToMB(param);
  if (mBToGB(value) > 1) {
    return mBToGB(value).toFixed(2) + " GB";
  } 
  // TODO lixin
  // else if (value > 1) {
  //   return parseInt(value).toFixed(2) + ' MB';
  // } else {
  //   return parseInt(value * 1024).toFixed(2) + ' KB';
  // }
};




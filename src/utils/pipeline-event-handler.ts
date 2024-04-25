// @ts-nocheck  
// ts不检查该文件,否则,打包都不能通过

import localStore from '@hooshid/local-store'
import { emitter } from '@/utils/mitt'


export function registerPipelineEventHandler(){
    // 1. pipeline-active-node
    emitter.on('pipeline-active-node', (data) => {
        if (data?.body) {
            const bodyObject = JSON.parse(data.body)
            const businessId = bodyObject?.businessId
            const nodeId = bodyObject?.nodeId
            if(businessId && nodeId){
                localStore.set(businessId , nodeId , "1h")
            }
        }
    });

    // 2. pipeline-complete
    emitter.on("pipeline-complete",(data)=>{
        if(data?.body){
			const bodyObject = JSON.parse(data.body)
			const businessId = bodyObject?.businessId
            if(businessId){
                localStore.remove(businessId)
            }
        }
    })
}

export function getActiveNode(businessId:string){
    return localStore.get(businessId)
}
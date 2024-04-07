// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import SockJs from 'sockjs-client/dist/sockjs.min.js'
import * as stomp from 'stompjs'
import * as decode from 'jwt-decode';

class StompClient {

  constructor(url : String , token : String , reConnectCount : number = 3){
    this.url = url
    this.token = token
    this.reConnectCount = reConnectCount
    this.stompClient = undefined;
    const userInfo = decode.jwtDecode(token)
    if(userInfo?.user_name){
      this.userName = userInfo?.user_name
      this.userId = userInfo?.user_id
    }
  }

  // 连接
  connect() {
        return new Promise((resolve, reject) => {
          const socket = new SockJs(this.url)
          this.stompClient = stomp.over(socket, {
            debug: (msg: string) => {
              console.log(msg, 'debug') // 输出日志信息到控制台
            }
          }) // 覆盖sockjs使用stomp客户端
          this.stompClient.connect({token:this.token},
            (frame: any) => {
              resolve()
            },
            (error: any) => {
              // 异常时进行重连
              console.log('connect error: ' + error)
              if (this.reConnectCount > 3) {
                console.log('温馨提示：您的连接已断开，请退出后重新进入。')
                this.reConnectCount = 0
              } else {
                this.wsReconnect && clearTimeout(this.wsReconnect)
                this.wsReconnect = setTimeout(() => {
                  console.log('开始重连...')
                  this.init()
                  console.log('重连完毕...')
                  this.reConnectCount++
                }, 1000)
              }
              reject(error)
            }
          )
        })
      }

      // 订阅
      subscribe(onMsgCallBack){
        if (!this.stompClient) {
          this.connect(this.url,this.token).then(() => {
                // 添加一个订阅
                this.stompClient.subscribe(
                  `/queue/${this.userName}/message`,
                  (response: any) => {
                    // 对消息进行ack处理
                    const destinationId = response?.headers?._destinationId
                    const messageId = response?.headers?._messageId
                    if (destinationId && messageId) {
                      const payload = {
                        messageId: messageId,
                        destinationId: destinationId
                      }
                      this.stompClient.send('/app/ack', {}, JSON.stringify(payload))
                      // TODO lixin
                      resolve(payload)
                    }
                  },
                  (error: any) => reject(error)
                )
              })
        } 
      }
    
      // 销毁
      destroy() {
        return new Promise((resolve, reject) => {
          // 断开某个链接
          this.stompClient.subscribe(
            `/queue/${this.userName}/disconnect`,
            () => {
              // 删除订阅
              
              // TODO lixin
              resolve(true)
            },
            () => reject(false)
          )
        })
      }

    
      destroyAll() {
        // 断开所有
        this.stompClient.subscribe(`/queue/disconnectAll`)
      }
}

export default StompClient;
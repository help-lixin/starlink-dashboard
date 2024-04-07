// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import SockJs from 'sockjs-client/dist/sockjs.min.js'
import * as stomp from 'stompjs'
import * as decode from 'jwt-decode';

class StompClient {
  // 唯一实例
  private static instance: StompClient;
  public static getInstance(url?: string = "http://starlink.lixin.help/message/websocket" , authInfo?: string = window.localStorage.getItem("_token") , reConnectCount?: number = 3): StompClient {
    if (!StompClient.instance) {
      const authInfoObj = JSON.parse(authInfo);
      const token = authInfoObj.accessToken;

      // 代理实例
      StompClient.instance = new Proxy(new StompClient(url, token, reConnectCount), {
        construct: function(target, args) {
          if (!this.instance) {
            // 手动触发构造函数
            return Reflect.construct(target, args);
          } else {
            throw new Error('Instance already exists');
          }
        }
      });
    }
    return StompClient.instance;
  }
  private constructor(url : String , token : String , reConnectCount : number = 3){
    if (this.stompClient) return this.stompClient
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
        const socket = new SockJs(this.url)
        this.stompClient = stomp.over(socket, {
          debug: (msg: string) => {
            console.log(msg, 'debug') // 输出日志信息到控制台
          }
        })

        // 覆盖sockjs使用stomp客户端
        this.stompClient.connect({token:this.token},
          (frame: any) => {
            // resolve()
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
                this.connect()
                console.log('重连完毕...')
                this.reConnectCount++
              }, 1000)
            }
            reject(error)
          }
        )
    }

      // 订阅
      subscribe(onMsgCallBack){
        this.stompClient.subscribe(
          `/queue/${this.userName}/message`,
          (response: any) => {
              console.log("========================================");
              console.log(response);
              console.log("========================================");
              // TODO lixin
          }
        );
      }

      // 销毁
      destroy() {
        // 断开某个链接
        this.stompClient.disconnect(() => {
          StompClient.instance = undefined
            // 删除订阅
            // TODO lixin
          }
        )
      }

}

export default StompClient;

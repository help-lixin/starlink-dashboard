import io from "socket.io-client"
import stomp from "stompjs"
interface WatcherItem { messageId: string, destinationId: string }
class WsEventBus {
  url = "http://starlink.lixin.help/message/websocket"; // 改成自己的服务端地址
  // 监听器者
  watcher: WatcherItem[] = [];
  stompClient: any;
  reConnectCount = 3;
  wsReconnect: any;
  constructor() {
    this.init()
  }
  init() {
    const socket = io(this.url);
    this.stompClient = stomp.over(socket); // 覆盖sockjs使用stomp客户端
    this.stompClient.connect({ "token" : "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjIsInVzZXJfbmFtZSI6InRlc3QiLCJzY29wZSI6WyJhbGwiXSwibmlja19uYW1lIjoi6Iul5L6dMiIsImF2YXRhciI6IiIsImV4cCI6MTc1NDgxNzU3MCwiZGVwdF9pZCI6MTA1LCJhdXRob3JpdGllcyI6WyJjb21tb24iXSwianRpIjoiYWUwb0FxMEQ3cEpWb3hfeHFCRk11VVZmUHZZIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoidGVzdEBxcS5jb20ifQ.coVDIC0wC5MwLsFOhSl1ngmxkvzTc9aiaH1215frR0bN4qVC26nhdnsf7h-LtuEOMaiXTmqkIkFdXhJDMXyAreeRO5GjLDUdhHiVVzAtEV_I6XOFSuGnD9WF6GjjJhnUFX48032SK_egd9NxXhndLY74N0e9iJo8V_6mLMokvkrP75jjajAa_syMuk2Gax1dynw0wX4VrJuMlrXKoNw2pSvcbWIqjWKY64fnZC_OSjXgnKBhpy4Cxr-gqvfIJRJybLxoqvVZtFJmqu7U5hBRus0xtZhTdFnLKJ2vmZzriQajsQA7a8IcKpvUU4ykwH26K2m5spQTQgrGM0WDYAjTjQ" },  (frame:any) => {
        //    stompClient.connect({ "token" : "admin" }, function (frame) {
        console.log('frame: ' + frame)


        // 广播
        // this.stompClient.subscribe("/topic", function (response:any) {
        //   showMsg(response.body);
        // });


        // 异常时进行重连
      },  (error: any) => {
        console.log('connect error: ' + error)
        if (this.reConnectCount > 3) {
          console.log("温馨提示：您的连接已断开，请退出后重新进入。")
          this.reConnectCount = 0;
        } else {
          this.wsReconnect && clearTimeout(this.wsReconnect);
          this.wsReconnect = setTimeout( () => {
            console.log("开始重连...");
            this.init();
            console.log("重连完毕...");
            this.reConnectCount++;
          }, 1000);
        }
      }
    )
  }
  addWatcher(userId: string = 'test'): Promise<WatcherItem> {
    return new Promise((resolve, reject) => {
      // 添加一个订阅
      this.stompClient.subscribe(`/queue/${userId}/message`,  (response:any) => {

        // 对消息进行ack处理
        const destinationId =  response?.headers?._destinationId;
        const messageId = response?.headers?._messageId;
        if( destinationId &&  messageId){
          const payload = {
            "messageId" : messageId,
            "destinationId" : destinationId
          }
          this.stompClient.send("/app/ack", {}, JSON.stringify(payload));
          // 添加观察者
          this.watcher.push(payload);
          resolve(payload)
        }
      }, (error: any) => reject(error));
    })
  }

  destroy(watcher: WatcherItem) {
    return new Promise((resolve, reject) => {
      // 断开某个链接
      this.stompClient.subscribe(`/queue/${watcher.messageId}/disconnect`,  () => {
          resolve(true)
      }, () => reject(false));
    })
  }

  sendMsg(watcher: WatcherItem, msg: string) {
    return new Promise((resolve, reject) => {
      // 断开某个链接
      this.stompClient.subscribe(`/queue/${watcher.messageId}/message?msg=${msg}`,  () => {
        resolve(true)
      }, () => reject(false));
    })
  }

  destroyAll() {
    // 清空监听者
    this.watcher = [];
    // 断开所有
    this.stompClient.subscribe(`/queue/disconnectAll`);
  }
}

export default new WsEventBus();

// @ts-nocheck  
// ts不检查该文件,否则,打包都不能通过

import * as dayjs from 'dayjs'
import * as isLeapYear from 'dayjs/plugin/isLeapYear' // 导入插件
import 'dayjs/locale/zh-cn' // 导入本地化语言
dayjs.extend(isLeapYear) // 使用插件
dayjs.locale('zh-cn')


export {
    dayjs
}
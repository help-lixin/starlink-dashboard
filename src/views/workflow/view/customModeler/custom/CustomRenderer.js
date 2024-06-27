// @ts-nocheck

/**
 * 定义画布
 */
/* eslint-disable no-unused-vars */
import inherits from 'inherits'

import {STARLINK_SERVICE,ICON_SERVICE} from "@/utils/env"

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
import {
    isObject,
    assign,
    forEach
} from 'min-dash';
import {
    append as svgAppend,
    create as svgCreate,
    classes as svgClasses
} from 'tiny-svg'

import { customElements, customConfig, hasLabelElements } from '@/utils/bpmn-util'
/**
 * A renderer that knows how to render custom elements.
 */
export default function CustomRenderer(eventBus, styles, textRenderer) {
    BaseRenderer.call(this, eventBus, 2000)
    var computeStyle = styles.computeStyle
    function renderLabel(parentGfx, label, options) {
        options = assign({
            size: {
                width: 100
            }
        }, options);
        var text = textRenderer.createText(label || '', options);
        svgClasses(text).add('djs-label');
        svgAppend(parentGfx, text);
        return text;
    }

    this.drawCustomElements = function(parentNode, element) {
        const type = element.type // 获取到类型
        if (type !== 'label') {
            if (customElements.includes(type)) { // or customConfig[type]
                const { url, attr } = customConfig[type]
                const customIconAttr = {
                    ...attr,
                    href: url
                }

                if(element.businessObject.$attrs?.pluginIcon){
                    if(!element.businessObject.$attrs?.pluginIcon.startsWith("http")){ // 不是http或https
                        var tempIcon = element.businessObject.$attrs?.pluginIcon
                        if(!tempIcon.startsWith("/")){
                            tempIcon = "/" + tempIcon;
                        }
                        tempIcon = ICON_SERVICE + tempIcon;
                        customIconAttr.href = tempIcon
                    }else{
                        customIconAttr.href = element.businessObject.$attrs?.pluginIcon
                    }
                }

                const customIcon = svgCreate('image', customIconAttr)
                element['width'] = attr.width // 这里我是取了巧, 直接修改了元素的宽高
                element['height'] = attr.height
                svgAppend(parentNode, customIcon)

				// 判断是否有name属性来决定是否要渲染出label
				if (!hasLabelElements.includes(type) && element.businessObject.name) {
					const text = svgCreate('text', {
						x: attr.x,
						y: attr.y + attr.height + 20, // y取的是父元素的y+height+20
						"font-size": "14",
						"fill": "#000"
					})
					text.innerHTML = element.businessObject.name
					svgAppend(parentNode, text)
				}
                return customIcon
            }
            const shape = this.bpmnRenderer.drawShape(parentNode, element)
            return shape
        } else {
            element
        }
    }
}

inherits(CustomRenderer, BaseRenderer)

CustomRenderer.$inject = ['eventBus', 'styles', 'textRenderer']

CustomRenderer.prototype.canRender = function(element) {
    return true
}

CustomRenderer.prototype.drawShape = function(p, element) {
    if (customElements.includes(element.type)) {
        return this.drawCustomElements(p, element)
    }else if(element?.type == "bpmn:EndEvent") {
        // 针对开始和结束节点添加标签下标
        element.name = element.businessObject.name = "结束";
    } else if(element?.type == "bpmn:StartEvent") {
        element.name = element.businessObject.name = "开始";
    }
}

CustomRenderer.prototype.getShapePath = function(shape) {
}


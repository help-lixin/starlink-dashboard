/* eslint-disable no-unused-vars */
import inherits from 'inherits'

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
import { isObject, assign, forEach } from 'min-dash'
import {
	append as svgAppend,
	create as svgCreate,
	classes as svgClasses,
} from 'tiny-svg'

import {
	customElements,
	customConfig,
	hasLabelElements,
} from '@/utils/bpmn-util'

export default function CustomRenderer(eventBus, styles, textRenderer) {
	BaseRenderer.call(this, eventBus, 2000)
}

inherits(CustomRenderer, BaseRenderer)

CustomRenderer.$inject = ['eventBus', 'styles', 'textRenderer']

CustomRenderer.prototype.canRender = function (element) {
	return true
}

CustomRenderer.prototype.drawShape = function (p, element) {
}

CustomRenderer.prototype.getShapePath = function (shape) {
}

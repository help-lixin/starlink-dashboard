// @ts-nocheck  

/**
 * 定义BPMNJB中左侧的工具栏
 */
export default function PaletteProvider(
	palette,
	create,
	elementFactory,
	globalConnect,
	bpmnFactory,
) {
	this.create = create
	this.elementFactory = elementFactory
	this.globalConnect = globalConnect
	this.bpmnFactory = bpmnFactory

	palette.registerProvider(this)
}

PaletteProvider.$inject = [
	'palette',
	'create',
	'elementFactory',
	'globalConnect',
	'bpmnFactory',
]

PaletteProvider.prototype.getPaletteEntries = function () {
	return {}
}


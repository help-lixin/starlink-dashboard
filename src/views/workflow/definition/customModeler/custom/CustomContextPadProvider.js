
export default function ContextPadProvider(
	contextPad,
	config,
	injector,
	translate,
	bpmnFactory,
	elementFactory,
	create,
	modeling,
	connect,
) {
	this.create = create
	this.elementFactory = elementFactory
	this.translate = translate
	this.bpmnFactory = bpmnFactory
	this.modeling = modeling
	this.connect = connect
	config = config || {}
	if (config.autoPlace !== false) {
		this.autoPlace = injector.get('autoPlace', false)
	}
	contextPad.registerProvider(this)
}

ContextPadProvider.$inject = [
	'contextPad',
	'config',
	'injector',
	'translate',
	'bpmnFactory',
	'elementFactory',
	'create',
	'modeling',
	'connect',
]

ContextPadProvider.prototype.getContextPadEntries = function (element) {
	const { autoPlace, create, elementFactory, translate, modeling, connect } = this


	function startConnect(event, element) {
		connect.start(event, element);
	}

	// 删除功能
	function removeElement(e) {
		modeling.removeElements([element])
	}

	function clickElement(e) {
	}

	function connectElement() {
		// 创建连接图标
		return {
			group: 'edit',
			className: 'bpmn-icon-connection-multi',
			title: translate('连接'),
			action: {
				click: startConnect,
				dragstart: startConnect
			},
		}
	}

	function editElement() {
		// 创建编辑图标
		return {
			group: 'edit',
			className: 'bpmn-icon-screw-wrench',
			title: translate('编辑'),
			action: {
				click: clickElement,
			},
		}
	}

	function deleteElement() {
		return {
			group: 'edit',
			className: 'bpmn-icon-trash',
			title: translate('删除'),
			action: {
				click: removeElement,
			},
		}
	}

	return {
		connect: connectElement(),
		// edit: editElement(),
		delete: deleteElement(),
	}
}

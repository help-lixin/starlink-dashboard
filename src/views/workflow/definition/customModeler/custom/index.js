// @ts-nocheck  

import CustomPalette from './CustomPalette'
// import CustomRenderer from './CustomRenderer'
import CustomContextPadProvider from './CustomContextPadProvider'
export default {
	// __init__: ['paletteProvider', 'customRenderer', 'contextPadProvider'],
	__init__: ['paletteProvider', 'contextPadProvider'],
	paletteProvider: ['type', CustomPalette],
	// customRenderer: ['type', CustomRenderer],
	contextPadProvider: ['type', CustomContextPadProvider]
}

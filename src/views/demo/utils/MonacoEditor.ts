import * as monaco from 'monaco-editor';
import { editor } from 'monaco-editor'
// 启用语言支持
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false
});

// 启用编辑建议
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2015,
  allowNonTsExtensions: true
});

import IStandaloneEditorConstructionOptions = editor.IStandaloneEditorConstructionOptions
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor
export class MonacoEditor {
  editor: IStandaloneCodeEditor;
  containerId: string;
  constructor(containerId) {
    this.containerId = containerId;
    this.editor = null;
  }

  initEditor(options?: IStandaloneEditorConstructionOptions) {
    this.editor = monaco.editor.create(document.getElementById(this.containerId), options ?? {
      value: 'Your code here...',
      language: 'javascript',
      theme: 'vs-dark'
    });
  }

  getValue() {
    return this.editor.getValue();
  }

  dispose() {
    this.editor.dispose();
  }
}

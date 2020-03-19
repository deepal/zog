// @flow
import * as React from 'react';
import classnames from 'classnames';
import autobind from 'autobind-decorator';
import CodeEditor from '../codemirror/code-editor';
import type { Workspace } from '../../../models/workspace';
import type { ApiSpec } from '../../../models/api-spec';
import YAML from 'yaml';
import { showModal } from '../modals';
import SwaggerUI from 'swagger-ui-react';
import { AppHeader, NoticeTable } from 'insomnia-components';
import { Spectral } from '@stoplight/spectral';
import 'swagger-ui-react/swagger-ui.css';
import GenerateConfigModal from '../modals/generate-config-modal';

const spectral = new Spectral();

type Props = {|
  apiSpec: ApiSpec,
  workspace: Workspace,
  editorFontSize: number,
  editorIndentSize: number,
  lineWrapping: boolean,
  editorKeyMap: string,
  onChange: (spec: ApiSpec) => Promise<void>,
  handleTest: () => void,
|};

type State = {|
  previewActive: boolean,
  lintMessages: Array<{
    message: string,
    line: number,
    type: 'error' | 'warning',
  }>,
|};

@autobind
class SpecEditor extends React.PureComponent<Props, State> {
  editor: ?CodeEditor;
  debounceTimeout: IntervalID;

  state = {
    previewActive: true,
    lintMessages: [],
  };

  // Defining it here instead of in render() so it won't act as a changed prop
  // when being passed to <CodeEditor> again
  static lintOptions = {
    delay: 1000,
  };

  _setEditorRef(n: ?CodeEditor) {
    this.editor = n;
  }

  async _showGenerateConfig() {
    const { apiSpec } = this.props;
    showModal(GenerateConfigModal, { apiSpec });
  }

  _togglePreview() {
    this.setState({ previewActive: !this.state.previewActive });
  }

  _handleOnChange(v: string) {
    const { apiSpec, onChange } = this.props;

    // Debounce the update because these specs can get pretty large
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(async () => {
      await onChange({ ...apiSpec, contents: v });
    }, 500);
  }

  setSelection(chStart: number, chEnd: number, lineStart: number, lineEnd: number) {
    const editor = this.editor;

    if (!editor) {
      return;
    }

    editor.setSelection(chStart, chEnd, lineStart, lineEnd);
  }

  _handleLintClick(notice: {}) {
    const { start, end } = notice._range;
    this.setSelection(start.character, end.character, start.line, end.line);
  }

  async _reLint() {
    const { apiSpec } = this.props;
    const results = await spectral.run(apiSpec.contents);

    this.setState({
      lintMessages: results.map(r => ({
        type: r.severity === 0 ? 'error' : 'warning',
        message: `${r.code} ${r.message}`,
        line: r.range.start.line,

        // Attach range that will be returned to our click handler
        _range: r.range,
      })),
    });
  }

  componentDidMount() {
    this._reLint();
  }

  componentDidUpdate(prevProps: Props) {
    const { apiSpec } = this.props;

    // Re-lint if content changed
    if (apiSpec.contents !== prevProps.apiSpec.contents) {
      this._reLint();
    }
  }

  render() {
    const {
      editorFontSize,
      editorIndentSize,
      lineWrapping,
      editorKeyMap,
      apiSpec,
    } = this.props;

    const {
      lintMessages,
      previewActive,
    } = this.state;

    let swaggerSpec;
    try {
      swaggerSpec = YAML.parse(apiSpec.contents) || {};
    } catch (err) {
      swaggerSpec = {};
    }

    return (
      <div
        className={classnames('spec-editor theme--pane', { 'preview-hidden': !previewActive })}>
        <AppHeader className="app-header" />
        <div id="swagger-ui-wrapper">
          <SwaggerUI spec={swaggerSpec} />
        </div>
        <div className="spec-editor__body theme--pane__body">
          <CodeEditor
            manualPrettify
            ref={this._setEditorRef}
            fontSize={editorFontSize}
            indentSize={editorIndentSize}
            lineWrapping={lineWrapping}
            keyMap={editorKeyMap}
            lintOptions={SpecEditor.lintOptions}
            mode="openapi"
            defaultValue={apiSpec.contents}
            onChange={this._handleOnChange}
            uniquenessKey={apiSpec._id}
          />
          {lintMessages.length > 0 && (
            <NoticeTable
              notices={lintMessages}
              onClick={this._handleLintClick}
            />
          )}
        </div>
      </div>
    );
  }
}

export default SpecEditor;
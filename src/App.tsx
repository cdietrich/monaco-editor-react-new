import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override"
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override"

import {
  MonacoEditorReactComp,
} from "@typefox/monaco-editor-react";
import {MonacoEditorLanguageClientWrapper, type WrapperConfig } from 'monaco-editor-wrapper';
import { useWorkerFactory, type WorkerLoader } from 'monaco-languageclient/workerFactory';
import * as monaco from "@codingame/monaco-vscode-editor-api"
import './App.css'
import { Logger } from "monaco-languageclient/tools";
import { useEffect, useState } from "react";

type Model = { content: string; uri: string; languageId: string; }

const languageId = 'hello'

const defineDefaultWorkerLoaders: () => Record<string, WorkerLoader> = () => {
  return {
    TextEditorWorker: () => new Worker(
      new URL('@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js', import.meta.url),
      { type: 'module' }
    ),
    // these are other possible workers not configured by default
    TextMateWorker: undefined,
    OutputLinkDetectionWorker: undefined,
    LanguageDetectionWorker: undefined,
    NotebookEditorWorker: undefined,
    LocalFileSearchWorker: undefined,
  }
}

const configureMonacoWorkers = (logger?: Logger) => {
  useWorkerFactory({
    workerLoaders: defineDefaultWorkerLoaders(),
    logger,
  })
}

const getUserConfig = (
  workerUrl: string,
  fileExt: string,
  htmlElement: HTMLElement,
  model: Model,
  monarch?: monaco.languages.IMonarchLanguage,)
  
  
  
   : WrapperConfig => {
  //const fileExt = model.uri.split('.').pop() ?? 'hello';
  const loadLangiumWorker = () => {
    console.log(`Langium worker URL: ${workerUrl}`)
    const workerURL = new URL('./hello-world-server-worker.js', window.location.origin)
    console.log("new worker", workerURL.toString())
    return new Worker(workerURL, {
      type: "module",
      name: "Lotse Language Server Worker",
    })
  }
  const langiumWorker = loadLangiumWorker()
  return {
    $type: "classic",
    htmlContainer: htmlElement,
    logLevel: 1,
    vscodeApiConfig: {
      serviceOverrides: {
        ...getConfigurationServiceOverride(),
        ...getKeybindingsServiceOverride(),
      },
    },
    editorAppConfig: {
      codeResources: {
        modified: {
          text: model.content,
          uri: model.uri,
          enforceLanguageId: model.languageId,
        },
      },
      useDiffEditor: false,
      languageDef: {
        monarchLanguage: monarch,
        languageExtensionConfig: {
          id: model.languageId,
          extensions: [`.${fileExt}`],
        },
      },
      editorOptions: {
        "semanticHighlighting.enabled": true,
        theme: "vs-dark",
      },
      monacoWorkerFactory: configureMonacoWorkers,
    },
    languageClientConfigs: {
      automaticallyDisposeWorkers: true,
      automaticallyInit: true,
      automaticallyDispose: true,
      automaticallyStart: true,
      
      configs: {
        hello: {
          connection: {
            options: {
              $type: "WorkerDirect",
              worker: langiumWorker,
            },
          },
          clientOptions: {
            documentSelector: [languageId],
          },
        },
      }
    },
  }



};


function App() {
  const [initialModel, setInitialModel] = useState( "person A Hello A! Hello Person1!");
  const wrapperConfig: WrapperConfig = getUserConfig(
    
    './hello-world-server-worker.js', "hello", document.getElementById('root')!, {
    content: initialModel,
    uri: "/workspace/demo.hello",
    languageId: "hello",
  } )

  const [ height, setHeight ] = useState('80vh');

                // useEffect(() => {
                //     const timer = setTimeout(() => {
                //         console.log('Updating styles');
                //         setHeight('85vh');
                //     }, 2000);

                //     return () => clearTimeout(timer);
                // }, []);
                let wrapper: MonacoEditorLanguageClientWrapper;
                const clickMe = async () => {
                  //wrapper.getLanguageClient("hello")?.sendRequest("custom/clear",{})
                   //wrapper.getEditor()?.getModel()!.dispose();
                   await wrapper.updateCodeResources({
                    modified: {
                       uri: "/workspace/demo2.hello",
                       text: "person B Hello B! Hello Person2! Hello A!",
                       enforceLanguageId: "hello",
                       //languageId: "hello",
                     }
                   });
                   console.log("monaco.editor.getModels()", monaco.editor.getModels().map(m => m.uri.toString()));
               
                 }
  return (
    <div style={{ 'height': height }} >
      <button onClick={clickMe}>Click Me</button>
      <MonacoEditorReactComp
      //otherFiles={otherFiles}
      wrapperConfig={wrapperConfig}
      onLoad={(w) => {
        wrapper = w;
      }}
      
    // onTextChanged={(text) => { setModelContent2(text.main) }}
    style={{ 'height': '100%' }}
    
        />
    </div>
  )
}

export default App

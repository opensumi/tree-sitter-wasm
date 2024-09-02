import { LanguageParserService } from '../src';
import { createTestTextModel } from './utils';
import path from 'path';

const code = `
import '@opensumi/ide-i18n/lib/browser';
import '@codeblitzjs/ide-i18n';
import {
  ClientApp,
  HOME_ROOT,
  IAppOpts,
  makeWorkspaceDir,
  RuntimeConfig,
  STORAGE_DIR,
  tryCatchPromise,
} from '@codeblitzjs/ide-sumi-core';
import {
  FILES_DEFAULTS,
  getPreferenceThemeId,
  IAppRenderer,
  IReporter,
  SlotLocation,
  SlotRenderer,
} from '@opensumi/ide-core-browser';
import { BoxPanel, SplitPanel } from '@opensumi/ide-core-browser/lib/components';

import '@opensumi/ide-core-browser/lib/style/entry.less';
import '@opensumi/ide-core-browser/lib/style/codicons/codicon-animations.css';
import './normalize.less';

import { deletionLogPath } from '@codeblitzjs/ide-browserfs/lib/backend/OverlayFS';
import { IPluginConfig } from '@codeblitzjs/ide-plugin';

import '../core/extension/extension.patch';
import { disposableCollection, disposeMode } from '../core/patch';

import { Injector } from '@opensumi/di';
import { EXT_WORKER_HOST, WEBVIEW_ENDPOINT } from '../core/env';
import { IconSlim, IDETheme } from '../core/extension/metadata';
import { getDefaultLayoutConfig, LayoutComponent } from '../core/layout';
import { modules } from '../core/modules';
import { mergeConfig } from '../core/utils';
import { appName } from './constants';
import { interceptAppOpts } from './opts';
import { IAppInstance, IConfig } from './types';

export { BoxPanel, SlotLocation, SlotRenderer, SplitPanel };

export const getDefaultAppConfig = (): IAppOpts => ({
  modules: modules.slice(),
  useCdnIcon: true,
  noExtHost: true,
  extWorkerHost: EXT_WORKER_HOST,
  webviewEndpoint: WEBVIEW_ENDPOINT,
  defaultPreferences: {
    'general.theme': 'opensumi-design-dark-theme',
    'general.icon': 'vsicons-slim',
    'application.confirmExit': 'never',
    'editor.quickSuggestionsDelay': 10,
    'settings.userBeforeWorkspace': true,
    'editor.fixedOverflowWidgets': true,
    // 取消高亮线
    'editor.guides.bracketPairs': false,
    'files.exclude': {
      ...FILES_DEFAULTS.filesExclude,
      // browserfs OverlayFS 用来记录删除的文件
      '**/.codeblitz/**': true,
    },
  },
  layoutConfig: getDefaultLayoutConfig(),
  layoutComponent: LayoutComponent,
  extensionMetadata: [IconSlim, IDETheme],
  defaultPanels: {
    bottom: '',
  },
  preferenceDirName: STORAGE_DIR,
  storageDirName: STORAGE_DIR,
  extensionStorageDirName: STORAGE_DIR,
  appName,
  allowSetDocumentTitleFollowWorkspaceDir: false,
  app: {
    logo: 'https://mdn.alipayobjects.com/huamei_hwfivk/afts/img/A*byvFQJURn0kAAAAAAAAAAAAADlyoAQ/original',
    brandName: 'Codeblitz',
    productName: 'Codeblitz',
    icon: 'https://mdn.alipayobjects.com/huamei_hwfivk/afts/img/A*lZQ5S4UoGoQAAAAAAAAAAAAADlyoAQ/original',
  },
});

export const DEFAULT_APP_CONFIG = getDefaultAppConfig();

export function createApp({ appConfig, runtimeConfig }: IConfig): IAppInstance {
  const opts = interceptAppOpts(mergeConfig(getDefaultAppConfig(), appConfig), runtimeConfig);

  if (!opts.workspaceDir) {
    throw new Error(
      '需工作空间目录，最好确保不同项目名称不同，如 group/repository 的形式，工作空间目录会挂载到 /workspace 目录下',
    );
  }
  opts.workspaceDir = makeWorkspaceDir(opts.workspaceDir);
  const injector = opts.injector || new Injector();

  // 基于场景的运行时数据
  injector.addProviders({
    token: RuntimeConfig,
    useValue: runtimeConfig,
  });

  injector.addProviders({
    token: IPluginConfig,
    useValue: appConfig.plugins,
  });

  if (runtimeConfig.reporter) {
    injector.addProviders({
      token: IReporter,
      useValue: runtimeConfig.reporter,
      override: true,
    });
  }

  const app = new ClientApp({
    ...opts,
    injector,
  }) as IAppInstance;

  let destroyed = false;
  app.destroy = () => {
    if (destroyed) {
      return;
    }
    destroyed = true;
    disposeMode();
    disposableCollection.forEach((d) => d(app.injector));
    tryCatchPromise(() => app.injector.disposeAll());
  };

  return app;
}

`;

async function main() {
  const basePath = path.resolve(__dirname, '..');
  const service = new LanguageParserService(
    // url.pathToFileURL(basePath).toString(),
    basePath,
  );
  const parser = await service.createParser('typescriptreact')!;
  const textModel = createTestTextModel(code.toString(), 'typescriptreact');
  const info = await parser.provideAllFunctionCodeBlockInfo(textModel);
  console.log(`🚀 ~ main ~ info:`, info);
}

main().catch(console.error);

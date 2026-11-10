import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { applyDocumentLang } from './app/i18n';

applyDocumentLang(document);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

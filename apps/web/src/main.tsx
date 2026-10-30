import { render } from 'preact';
import { App } from './App.js';

render(<App />, document.getElementById('app')!);

// Offline működés: a szolgáltatás-munkás a telepített (hosztolt) változatban gyorsítótárazza az alkalmazást.
// Beágyazott előnézetben (pl. Artifact) nem érhető el; ott csendben kimarad.
if ('serviceWorker' in navigator && location.protocol === 'https:' && !document.documentElement.dataset['egyfajlos']) {
  navigator.serviceWorker.register('./sw.js').catch(() => undefined);
}

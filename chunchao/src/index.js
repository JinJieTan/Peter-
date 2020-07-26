import './route'
/**
 *
 * @param {string} entry
 * @param {function} activeRule
 */
const Apps = []; //子应用队列

export function registryApp(entry, activeRule) {
  Apps.push({
    entry: entry,
    activeRule: activeRule,
  });
}

async function loadApp() {
  const shouldMountApp = Apps.filter(shouldBeActive);
  const App = shouldMountApp.pop();
  fetch(App.entry)
    .then(function (response) {
      return response.text();
    })
    .then(async function (text) {
      const dom = document.createElement('div');
      dom.innerHTML = text;
      const entryPath = App.entry;
      const subapp = document.querySelector('#subApp-content');
      subapp.appendChild(dom);
      handleScripts(entryPath, subapp, dom);
      handleStyles(entryPath, subapp, dom);
    });
}

function shouldBeActive(app) {
  return app.activeRule(window.location);
}

export function start() {
  loadApp();
}

async function handleScripts(entryPath, subapp, dom) {
  const scripts = dom.querySelectorAll('script');
  const paromiseArr =
    scripts &&
    Array.from(scripts).map((item) => {
      if (item.src) {
        const url = window.location.protocol + '//' + window.location.host;
        return fetch(`${entryPath}/${item.src}`.replace(url, '')).then(
          function (response) {
            return response.text();
          }
        );
      } else {
        return Promise.resolve(item.textContent);
      }
    });
  const res = await Promise.all(paromiseArr);
  if (res && res.length > 0) {
    res.forEach((item) => {
      const script = document.createElement('script');
      script.innerText = item;
      subapp.appendChild(script);
    });
  }
}

export async function handleStyles(entryPath, subapp, dom) {
  const arr = [];
  const styles = dom.querySelectorAll('style');
  const links = Array.from(dom.querySelectorAll('link')).filter(
    (item) => item.rel === 'stylesheet'
  );
  const realArr = arr.concat(styles,links)
  const paromiseArr =
    arr &&
    Array.from(realArr).map((item) => {
      if (item.rel) {
        const url = window.location.protocol + '//' + window.location.host;
        return fetch(`${entryPath}/${item.href}`.replace(url, '')).then(
          function (response) {
            return response.text();
          }
        );
      } else {
        return Promise.resolve(item.textContent);
      }
    });
  const res = await Promise.all(paromiseArr);
  if (res && res.length > 0) {
    res.forEach((item) => {
      const style = document.createElement('style');
      style.innerHTML = item;
      subapp.appendChild(style);
    });
  }
}

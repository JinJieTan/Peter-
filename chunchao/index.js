import { registryApp, start } from 'chunchao/src/index';
registryApp('http://localhost:8889', (location) => location.pathname === '/subapp1');
registryApp('http://localhost:8890', (location) => location.pathname === '/subapp2');
start();

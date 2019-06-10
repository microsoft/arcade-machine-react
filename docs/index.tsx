/// <reference path="types/styles.d.ts" />

import * as React from 'react';
import { render } from 'react-dom';
import { App } from './app';

import '../node_modules/normalize.css/normalize.css';
import '../node_modules/highlight.js/styles/github.css';
import './index.scss';

const target = document.createElement('div');
document.body.appendChild(target);

render(<App />, target);

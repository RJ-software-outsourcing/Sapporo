import React from 'react';
import { render } from 'react-dom';

import Login from './login.jsx';
import About from './about.jsx';
import Dashboard from './dashboard.jsx';
import ProblemEditor from './problemEditor.jsx';
import System from './admin/system.jsx';
import ProblemConfig from './admin/problemConfig.jsx';
import DockerConfig from './admin/dockerConfig.jsx';
import Rank from './admin/rank.jsx';
import Mailbox from './mailbox.jsx';
import LiveFeed from './admin/liveFeed.jsx';
import PerformanceTest from './admin/performanceTest.jsx';
import BatchAccount from './admin/batchAccount.jsx';

const goPage = function (page, data) {
    const sectionDOM = document.getElementById('section');
    switch (page) {
    case 'dashboard':
        render(<Dashboard/>, sectionDOM);
        break;
    case 'mailbox':
        render(<Mailbox />, sectionDOM);
        break;
    case 'about':
        render(<About />, sectionDOM);
        break;
    case 'problemEditor':
        render(<ProblemEditor data={data}/>, sectionDOM);
        break;
    case 'system':
        render(<System />, sectionDOM);
        break;
    case 'problemConfig':
        render(<ProblemConfig />, sectionDOM);
        break;
    case 'dockerConfig':
        render(<DockerConfig />, sectionDOM);
        break;
    case 'analyse':
        render(<Rank />, sectionDOM);
        break;
    case 'liveFeed':
        render(<LiveFeed />, sectionDOM);
        break;
    case 'performance':
        render(<PerformanceTest />, sectionDOM);
        break;
    case 'login':
        render(<Login />, sectionDOM);
        break;
    case 'batch':
        render(<BatchAccount />, sectionDOM);
        break;
    default:
        break;
    }
};

export {goPage};

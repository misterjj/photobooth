import 'bootstrap/scss/bootstrap.scss'
import '../scss/main.scss'

import * as React from 'react'
import { render } from 'react-dom'
import App from './components/app'

render(
  <App/>,
  document.getElementById('app') as Element
)

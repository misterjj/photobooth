import 'bootstrap/scss/bootstrap.scss'
import '../scss/main.scss'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import * as React from 'react'
import { render } from 'react-dom'
import App from './components/app'

render(
  <App/>,
  document.getElementById('app') as Element
)

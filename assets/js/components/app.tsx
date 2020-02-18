import * as React from 'react'

interface AppProps {
}

interface AppState {
}

export default class App extends React.PureComponent<AppProps, AppState> {

  constructor (props: AppProps) {
    super(props)
  }

  render () {
    return  <div>Hello world</div>
  }
}

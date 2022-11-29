import './App.css';
import React, { Component } from 'react';

class App extends Component {

  state = {tasks: []}
  componentDidMount() {
    fetch('/getAll/')
    .then((res = res.json())
    .then((users => this.setState({tasks})))
    )
  }
  
  render() {
    return {
    }
  }


}

function App() {
  return (
    <div className="App">

    </div>
  );
}

export default App;
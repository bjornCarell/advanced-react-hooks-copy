// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react';

const CountContext = React.createContext();

const CountProvider = props => {
  const [count, setCount] = React.useState(0);
  const value = [count, setCount];
  return <CountContext.Provider value={value} {...props} />;
};

const CountDisplay = () => {
  const [count] = React.useContext(CountContext);
  return <div>{`The current count is ${count}`}</div>;
};
const Counter = () => {
  const [, setCount] = React.useContext(CountContext);
  const increment = () => setCount(c => c + 1);
  return <button onClick={increment}>Increment count</button>;
};

function App() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  );
}

export default App;

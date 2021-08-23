// useDebugValue: useMedia
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react';

// For this use case, formatDebugValue should not be used. 
// The only time to use it is if the calculation of the value we want to use 
// is expensive in any way. Here, in this case, we just make the operation
// more expensive by adding the formatDebugValue to the useDebugValue hook. 
const formatDebugValue = ({state, query}) =>
  `state: ${state}; query: ${query};`;

function useMedia(query, initialState = false) {
  const [state, setState] = React.useState(initialState);
  // 🐨 call React.useDebugValue here.
  // 💰 here's the formatted label I use: `\`${query}\` => ${state}`
  React.useDebugValue({state, query}, formatDebugValue);

  React.useEffect(() => {
    let mounted = true;
    const mql = window.matchMedia(query);
    function onChange() {
      if (!mounted) {
        return;
      }
      setState(Boolean(mql.matches));
    }

    mql.addListener(onChange);
    setState(mql.matches);

    return () => {
      mounted = false;
      mql.removeListener(onChange);
    };
  }, [query]);

  return state;
}

function Box() {
  const isBig = useMedia('(min-width: 1000px)');
  const isMedium = useMedia('(max-width: 999px) and (min-width: 700px)');
  const isSmall = useMedia('(max-width: 699px)');
  const color = isBig ? 'green' : isMedium ? 'yellow' : isSmall ? 'red' : null;

  return <div style={{width: 200, height: 200, backgroundColor: color}} />;
}

function App() {
  return <Box />;
}

export default App;

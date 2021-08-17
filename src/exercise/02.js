// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react';
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon';

const STATUSES = {
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
};

const {IDLE, PENDING, RESOLVED, REJECTED} = STATUSES;

function asyncReducer(state, action) {
  switch (action.type) {
    case PENDING: {
      return {status: PENDING, data: null, error: null};
    }
    case RESOLVED: {
      return {status: RESOLVED, data: action.data, error: null};
    }
    case REJECTED: {
      return {status: REJECTED, data: null, error: action.error};
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const useSafeDispatch = dispatch => {
  const mountedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);

  return React.useCallback(
    (...args) => {
      if (mountedRef.current) {
        dispatch(...args);
      }
    },
    [dispatch],
  );
};

const useAsync = initState => {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: IDLE,
    data: null,
    error: null,
    ...initState,
  });

  const dispatch = useSafeDispatch(unsafeDispatch);

  const run = React.useCallback(
    promise => {
      unsafeDispatch({type: PENDING});
      promise.then(
        data => {
          dispatch({type: RESOLVED, data});
        },
        error => {
          dispatch({type: REJECTED, error});
        },
      );
    },
    [dispatch],
  );

  return {...state, run};
};

function PokemonInfo({pokemonName}) {
  const {
    data: pokemon,
    status,
    error,
    run,
  } = useAsync({status: pokemonName ? PENDING : IDLE});

  React.useEffect(() => {
    if (!pokemonName) {
      return;
    }

    run(fetchPokemon(pokemonName));
  }, [pokemonName, run]);

  if (status === IDLE || !pokemonName) {
    return 'Submit a pokemon';
  } else if (status === PENDING) {
    return <PokemonInfoFallback name={pokemonName} />;
  } else if (status === REJECTED) {
    throw error;
  } else if (status === RESOLVED) {
    return <PokemonDataView pokemon={pokemon} />;
  }

  throw new Error('This should be impossible');
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('');

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName);
  }

  function handleReset() {
    setPokemonName('');
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  );
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true);
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  );
}

export default AppWithUnmountCheckbox;

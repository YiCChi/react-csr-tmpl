import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

interface CounterContextProps {
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
}

const CountContext = createContext<CounterContextProps>({
  count: 0,
  setCount: () => {},
});

function CounterContextProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return <CountContext.Provider value={{ count, setCount }}>{children}</CountContext.Provider>;
}

function useCounter() {
  return useContext(CountContext);
}

export { CountContext, CounterContextProvider, useCounter };

import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() 
{
  return <h1>Hello, TV Dashboard!</h1>
}

function Widget({ title }: {title: string})
{
  return <h2>{title}</h2>
}
export default App;

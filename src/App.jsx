import { useState } from 'react'
// import './App.css'
import Header from "./components/Header"
import AddOrder from "./components/AddOrder"
import AddVolume from "./components/AddVolume"
import VolumeForm from "./components/VolumeForm"
import OrderForm from "./components/OrderForm"
import DisplayOrders from "./components/DisplayOrders"


function App() {
  
  return (
    <div>
      <Header />
      <VolumeForm/>
      <OrderForm/>
      <DisplayOrders/>
    </div>
    )
}

export default App;

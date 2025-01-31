import React, { useState } from "react";
import AddOrder from './AddOrder';
import '../styles/header.css';

function Header()
{
    const [showOrderForm, setShowOrderForm] = useState(false);

    function handleAddOrder()
    {
        document.getElementById("orderform").style.display = "block";
    }

    function handleAddVolume()
    {
        document.getElementById("volumeform").style.display = "block";
    }

    return(
        <header>
            <div className="headerButtons">
                <button onClick={handleAddVolume}>Add Volume</button>
                <button onClick={handleAddOrder}>Add New Order</button>
            </div>
            <h1>Uravu Order Manager</h1>
        </header>
    )
}

export default Header;
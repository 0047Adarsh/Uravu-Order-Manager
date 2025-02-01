import React, { useState } from "react";
import AddOrder from './AddOrder';
import '../styles/header.css';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ListAltIcon from '@mui/icons-material/ListAlt';


function Header()
{
    const [showOrderForm, setShowOrderForm] = useState(false);

    function handleAddOrder()
    {
        document.getElementById("orderForm").style.display = "block";
    }

    function handleAddVolume()
    {
        document.getElementById("volumeForm").style.display = "block";
    }

    return(
        <header>
            <div className="headerButtons">
                <button onClick={handleAddVolume}><WaterDropIcon/>Add Volume</button>
                <button onClick={handleAddOrder}><ListAltIcon/>Add New Order</button>
            </div>
            <h1>Uravu Order Manager</h1>
        </header>
    )
}

export default Header;
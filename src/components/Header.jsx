import React from "react";
import '../styles/header.css';

function Header()
{
    return(
        <header>
            <div className="headerButtons">
                <button>Add Volume</button>
                <button>Add New Order</button>
            </div>
            <h1>Uravu Order Manager</h1>
        </header>
    )
}

export default Header;
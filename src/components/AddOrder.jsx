import React, {useState, useEffect} from "react";
import '../styles/addorder.css';

function AddOrder()
{
    const [name, setName] = useState("");
    const [volume, setVolume] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [totalVolume, setTotalVolume] = useState(0);
    const [orderDate, setOrderDate] = useState();

    useEffect(()=>{
            const today = new Date().toISOString().split("T")[0];
            setOrderDate(today);
    },[])

    function handleNameChange(e)
    {
        setName(e.target.value);
    }

    function handleVolumeChange(e)
    {
        setVolume(e.target.volume);
    }
    
    function handleQuantityChange(e)
    {
        const quantityValue = e.target.value;
        setQuantity(quantityValue);
        setTotalVolume(quantityValue * volume);
    }

    function closeForm()
    {
        document.getElementById("dataForm").style.display = "none";
    }

    return(
        <div className="orderForm" id="orderform">
            <button className="closeButton" onClick={closeForm}>X</button>
            <h1>Order Form</h1>
            <form >
                <label>
                    Order Date:
                </label>
                    <input type="date" name="orderDate" value={orderDate}/>
                    <br/>
                <label>
                    Client Name:
                    <select value={name} onChange={handleNameChange}>
                        <option>Select a Customer</option>
                        <option>Leela</option>
                        <option>GCBC</option>
                    </select>
                </label>
                <br />
                <label>
                    Volume (L):
                    <select value={volume} onChange={handleVolumeChange}>
                        <option>Select Volume</option>
                        <option value={0.25}>250mL</option>
                        <option value={0.5}>500mL</option>
                        <option value={0.75}>750mL</option>
                    </select>          
                </label>
                <br />
                <label>
                    Quantity:
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Volume Required:
                    <input
                        type="number"
                        value={totalVolume}
                        readOnly
                    />
                </label>
                <br />

                <button className='orderButton' type="submit">Add Order</button>
            </form>
        </div>
    )
}

export default AddOrder;
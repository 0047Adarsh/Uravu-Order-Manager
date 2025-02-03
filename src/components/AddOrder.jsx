import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/addorder.css";

function AddOrder() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [volumes, setVolumes] = useState([]);
    const [selectedVolume, setSelectedVolume] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [totalVolume, setTotalVolume] = useState(0);
    const [orderDate, setOrderDate] = useState("");

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setOrderDate(today);

        axios.get("http://localhost:3000/customers")
            .then(response => {
                setCustomers(response.data);
            })
            .catch(error => {
                console.error("Error fetching customers:", error);
            });
    }, []);

    function handleCustomerChange(e) {
        const customerName = e.target.value;
        setSelectedCustomer(customerName);

        const customerData = customers.find(c => c.name === customerName);
        setVolumes(customerData ? customerData.volumes : []);
    }

    function handleVolumeChange(e) {
        setSelectedVolume(parseFloat(e.target.value));
    }

    function handleQuantityChange(e) {
        const quantityValue = parseInt(e.target.value) || 0;
        setQuantity(quantityValue);
        setTotalVolume(quantityValue * selectedVolume);
    }

    function closeForm() {
        document.getElementById("orderform").style.display = "none";
    }

    return (
        <div className="orderForm" id="orderform">
            <button className="closeButton" onClick={closeForm}>X</button>
            <h1>Order Form</h1>
            <form>
                <label>Order Date:</label>
                <input type="date" name="orderDate" value={orderDate} readOnly />
                <br />

                <label>Client Name:</label>
                <select value={selectedCustomer} onChange={handleCustomerChange}>
                    <option>Select a Customer</option>
                    {customers.map((customer) => (
                        <option key={customer.id} value={customer.name}>{customer.name}</option>
                    ))}
                </select>
                <br />

                <label>Volume (L):</label>
                <select value={selectedVolume} onChange={handleVolumeChange} disabled={!volumes.length}>
                    <option>Select Volume</option>
                    {volumes.map((vol, index) => (
                        <option key={index} value={vol}>{vol} L</option>
                    ))}
                </select>
                <br />

                <label>Quantity:</label>
                <input type="number" value={quantity} onChange={handleQuantityChange} required />
                <br />

                <label>Volume Required:</label>
                <input type="number" value={totalVolume} readOnly />
                <br />

                <button className="orderButton" type="submit">Add Order</button>
            </form>
        </div>
    );
}

export default AddOrder;

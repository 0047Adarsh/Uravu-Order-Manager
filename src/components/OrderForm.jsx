import React, { useState, useEffect } from "react";
import "../styles/VolumeForm.css";
import CloseIcon from '@mui/icons-material/Close';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';

function OrderForm() {
  const [orderData, setOrderData] = useState({
    orderDate: new Date().toISOString().split("T")[0],
    customerId: "",
    customerName: "",
    capColor: "",
    volume: 0,
    quantity: 0,
    totalVolume: 0,
  });

  const [customers, setCustomers] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetch('http://localhost:3000/customers')
      .then(response => response.json())
      .then(data => setCustomers(data))
      .catch(error => setError("Failed to load customers"));
  }, []);

  useEffect(() => {
    if (orderData.customerId) { 
      fetch(`http://localhost:3000/volumes/${orderData.customerId}`)
        .then(response => response.json())
        .then(data => {
          console.log("Fetched volumes for customer:", data);
          setVolumes(data.map(volume => volume.volume));
        })
        .catch(error => setError("Failed to load volumes"));
    }
  }, [orderData.customerId]); 

  useEffect(() => {
    const total = orderData.volume * orderData.quantity;
    setOrderData(prevData => ({
      ...prevData,
      totalVolume: total,
    }));
  }, [orderData.volume, orderData.quantity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const closeForm = () => {
    document.getElementById("orderForm").style.display = "none";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage("");
 

    fetch('http://localhost:3000/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        setOrderData({
          orderDate: new Date().toISOString().split("T")[0],
          customerId: "",
          customerName: "",
          capColor: "",
          volume: 0,
          quantity: 0,
          totalVolume: 0,
        });
        setSuccessMessage("Order data submitted successfully!");
      })
      .catch((error) => {
        console.error('Error:', error);
        setError('Submission failed. Please try again.');
      });
  };

  return (
    <div className="dataForm" id="orderForm">
      <button className="closeFormButton" onClick={closeForm}><CloseIcon /></button>
      <h1>Order Form</h1>
      <form className="theForm" onSubmit={handleSubmit}>
        <div className="formGroup">
          <label><DateRangeIcon /> Order Date:</label>
          <input
            type="date"
            name="orderDate"
            value={orderData.orderDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="formGroup">
          <label><PersonIcon /> Client Name:</label>
          {/* <select
            name="customerId"
            value={orderData.customerId}
            onChange={(e) => {
              const customerId = e.target.value;
              const customerName = customers.find(customer => customer.id === customerId)?.name || "";
              setOrderData(prevData => ({
                ...prevData,
                customerId,
                customerName,
              }));
            }}
          >
            <option value="">Select a Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select> */}
          <select
            name="customerId"
            value={orderData.customerId}
            onChange={(e) => {
              const customerId = e.target.value;
              const customer = customers.find(customer => customer.id === customerId);
              
              setOrderData(prevData => ({
                ...prevData,
                customerId,
                customerName: customer ? customer.name : "",
              }));
            }}
          >
            <option value="">Select a Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

        </div>

        <input name="customerId" type="number" value={"0"} />


        <div className="formGroup">
          <label><PersonIcon /> Cap Color:</label>
          <select
            name="capColor"
            value={orderData.capColor}
            onChange={handleInputChange}
          >
            <option value="">Select a Cap Color</option>
            <option value="Orange">Orange</option>
            <option value="Blue">Blue</option>
          </select>
        </div>

        <div className="formGroup">
          <label><ProductionQuantityLimitsIcon /> Volume (L):</label>
          <select
            name="volume"
            value={orderData.volume}
            onChange={handleInputChange}
            required
          >
            <option value={0}>Select Volume</option>
            {volumes.map((volume, index) => (
              <option key={index} value={volume/1000}>
                {volume} mL
              </option>
            ))}
          </select>
        </div>

        <div className="formGroup">
          <label><ProductionQuantityLimitsIcon /> Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={orderData.quantity}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="formGroup">
          <label>Volume Required:</label>
          <input
            type="number"
            name="totalVolume"
            value={orderData.totalVolume}
            readOnly
          />
        </div>

        <button className="orderButton" type="submit">Add Order</button>
      </form>

      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  );
}

export default OrderForm;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/DisplayOrders.css";

const ProductionOrders = () => {
  const [productionData, setProductionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch production data on component mount
  useEffect(() => {
    axios.get('http://localhost:3000/productiondata')
      .then((response) => {
        setProductionData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching production data:', error);
        setLoading(false);
      });
  }, []);

  // Fetch orders for a specific production date
  const getOrdersForDate = (productionDate) => {
    return axios.get(`http://localhost:3000/orders/${productionDate}`)
      .then((response) => response.data.data)
      .catch((error) => {
        console.error('Error fetching order data:', error);
        return [];
      });
  };

  // Group orders by production date
  const [ordersByDate, setOrdersByDate] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      let ordersGrouped = {};

      // Loop through each production date and fetch the corresponding orders
      for (let data of productionData) {
        const orders = await getOrdersForDate(data.production_date);
        ordersGrouped[data.production_date] = orders;
      }

      setOrdersByDate(ordersGrouped);
    };

    if (!loading) {
      fetchOrders();
    }
  }, [loading, productionData]);

  return (
    <div className="container">
  <h1>Production Volume and Orders</h1>
  
  {productionData.map((data) => (
    <div key={data.production_date} className="production-card">
      <h2>Production Date: {data.production_date} | Production Volume: {data.production_volume} Lts</h2>
      <h3>Orders:</h3>
      <ul className="order-list">
        {ordersByDate[data.production_date] && ordersByDate[data.production_date].length > 0 ? (
          ordersByDate[data.production_date].map((order, index) => (
            <li key={index}>
              Order {index + 1} - Customer: <span>{order.customer_name}</span>, Volume: <span>{order.volume}</span>, Quantity: <span>{order.quantity}</span>
            </li>
          ))
        ) : (
          <p>No orders for this date</p>
        )}
      </ul>
    </div>
  ))}
</div>

  );
};

export default ProductionOrders;

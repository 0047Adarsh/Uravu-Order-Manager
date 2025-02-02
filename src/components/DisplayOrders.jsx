import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment'; // Moment to format date
import "../styles/DisplayOrders.css"; // Assuming your CSS is here

const ProductionOrders = () => {
  const [productionData, setProductionData] = useState([]);
  const [ordersByDate, setOrdersByDate] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch production data on component mount
  // useEffect(() => {
  //   axios.get('http://localhost:3000/productiondata')
  //     .then((response) => {
  //       setProductionData(response.data.data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching production data:', error);
  //       setLoading(false);
  //     });
  // }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/productiondata')
      .then((response) => {
        const sortedData = response.data.data.sort((a, b) => 
          moment(b.production_date).isBefore(moment(a.production_date)) ? 1 : -1
        );
        setProductionData(sortedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching production data:', error);
        setLoading(false);
      });
  }, []);
  

  // Fetch orders for a specific production date
  const getOrdersForDate = (productionDate) => {
    // Ensure we're comparing dates without time part
    const formattedDate = moment(productionDate).format('YYYY-MM-DD');

    return axios.get(`http://localhost:3000/orders/${formattedDate}`)
      .then((response) => {
        return response.data; // Returning both orders and total volume
      })
      .catch((error) => {
        console.error('Error fetching order data:', error);
        return { data: [], totalVolume: 0 };
      });
  };

  // Group orders by production date
  useEffect(() => {
    const fetchOrders = async () => {
      let ordersGrouped = {};

      // Loop through each production date and fetch the corresponding orders
      for (let data of productionData) {
        const ordersData = await getOrdersForDate(data.production_date);
        ordersGrouped[data.production_date] = ordersData;
      }

      setOrdersByDate(ordersGrouped);
    };

    if (!loading) {
      fetchOrders();
    }
  }, [loading, productionData]);

  // Function to format date using moment.js (handling UTC and converting to local time)
  const formatDate = (date) => {
    // Ensure we're parsing in UTC and formatting as YYYY-MM-DD (no time), converted to local time
    return moment.utc(date).local().format('YYYY-MM-DD');
  };

  // Function to determine if an order can be filled
  const canOrderBeFilled = (orderTotalVolume, productionVolume) => {
    return productionVolume >= orderTotalVolume;
  };

  // Function to calculate remaining volume after fulfilling orders
  const calculateRemainingVolume = (orders, productionVolume) => {
    let remainingVolume = productionVolume;

    // Subtract the total volume of the orders that can be fulfilled
    orders.forEach((order) => {
      if (canOrderBeFilled(order.total_volume, remainingVolume)) {
        remainingVolume -= order.total_volume; // Subtract the total volume
      }
    });

    return remainingVolume;
  };

  // Handle button actions (placeholders for now)
  const handleEdit = (orderId) => {
    console.log(`Edit Order: ${orderId}`);
    // Logic for editing the order
  };

  const handleDelete = (orderId) => {
    console.log(`Delete Order: ${orderId}`);
    // Logic for deleting the order
  };

  const handleSplit = (orderId) => {
    console.log(`Split Order: ${orderId}`);
    // Logic for splitting the order
  };

  return (
    <div className="container">
      <h1>Production Volume and Orders</h1>

      {productionData.map((data) => {
        // Get the orders for this production date
        const { data: orders } = ordersByDate[data.production_date] || { data: [] };

        // Calculate the remaining volume after fulfilling orders
        const remainingVolume = calculateRemainingVolume(orders, data.production_volume);

        return (
          <div key={data.production_date} className="production-card">
            <div className="card-header">
              <h2>Production Date: {formatDate(data.production_date)} | Production Volume: {data.production_volume} Lts</h2>
            </div>

            <h3>Orders:</h3>
            <div className="table-container">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Volume</th>
                    <th>Quantity</th>
                    <th>Total Volume</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.length > 0 ? (
                    orders.map((order, index) => {
                      const isFulfilled = canOrderBeFilled(order.total_volume, data.production_volume);
                      const orderStatusClass = isFulfilled ? 'fulfilled' : 'not-fulfilled'; // CSS class for coloring

                      return (
                        <tr key={index} className={orderStatusClass}>
                          <td>{index + 1}</td>
                          <td>{order.customer_name}</td>
                          <td>{order.volume}</td>
                          <td>{order.quantity}</td>
                          <td>{order.total_volume}</td>
                          <td>{isFulfilled ? 'Can be Fulfilled' : 'Cannot be Fulfilled'}</td>
                          <td>
                            <button onClick={() => handleEdit(order.id)} className="btn btn-edit">Edit</button>
                            <button onClick={() => handleDelete(order.id)} className="btn btn-delete">Delete</button>
                            <button onClick={() => handleSplit(order.id)} className="btn btn-split">Split</button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7">No orders for this date</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Display remaining water volume at the bottom of the card */}
            <div className="remaining-volume">
              <p><strong>Remaining Volume:</strong> {remainingVolume} Lts</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductionOrders;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import "../styles/DisplayOrders.css";

const ProductionOrders = () => {
  const [productionData, setProductionData] = useState([]);
  const [ordersByDate, setOrdersByDate] = useState({});
  const [loading, setLoading] = useState(true);
  
  const customers = ["Customer A", "Customer B", "Customer C"];
  const volumes = [100, 200, 300, 400]; 
    


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

  const getOrdersForDate = (productionDate) => {
    const formattedDate = moment(productionDate).format('YYYY-MM-DD');

    return axios.get(`http://localhost:3000/orders/${formattedDate}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error('Error fetching order data:', error);
        return { data: [], totalVolume: 0 };
      });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      let ordersGrouped = {};

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

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editedOrderData, setEditedOrderData] = useState({});

  const handleEdit = (orderId, order) => {
    setEditingOrderId(orderId);
    setEditedOrderData({ ...order });
  };

  const handleSave = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:3000/orders/${orderId}`, editedOrderData);
      
      if (response.status === 200) {
        alert(`Order ${orderId} updated successfully`);

        setOrdersByDate((prevOrders) => {
          const updatedOrders = { ...prevOrders };
          updatedOrders[editedOrderData.production_date].data = updatedOrders[editedOrderData.production_date].data.map(order =>
            order.id === orderId ? { ...order, ...editedOrderData } : order
          );
          return updatedOrders;
        });

        setEditingOrderId(null);
      }
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      alert('Failed to update the order. Please try again.');
    }
  };

  

  const handleDelete = async (orderId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/orders/${orderId}`);
      
      if (response.status === 200) {
        alert(`Order ${orderId} deleted successfully`);
  
        // Remove the deleted order from the state
        setOrdersByDate((prevOrders) => {
          const updatedOrders = { ...prevOrders };
  
          // Filter out the deleted order
          for (const date in updatedOrders) {
            updatedOrders[date].data = updatedOrders[date].data.filter(
              (order) => order.id !== orderId
            );
          }
  
          return updatedOrders;
        });
      }
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
      alert('Failed to delete the order. Please try again.');
    }
  };
  

  const handleCancel = () => {
    setEditingOrderId(null);
  };

//   const handleChange = (e, field) => {
//     setEditedOrderData((prevData) => ({
//       ...prevData,
//       [field]: e.target.value,
//     }));
//   };

  const handleChange = (e, field) => {
    const value = e.target.value;
  
    setEditedOrderData((prevData) => {
      const updatedData = { ...prevData, [field]: value };
  
      if (field === "quantity" || field === "volume") {
        const quantity = Number(updatedData.quantity) || 0;
        const volume = Number(updatedData.volume) || 0;
        updatedData.total_volume = quantity * volume;
      }
  
      return updatedData;
    });
  };
  

  return (
    <div className="container">
      <h1>Production Volume and Orders</h1>

      {productionData.map((data) => {
        const { data: orders } = ordersByDate[data.production_date] || { data: [] };

        return (
          <div key={data.production_date} className="production-card">
            <div className="card-header">
              <h2>Production Date: {moment(data.production_date).format('YYYY-MM-DD')} | Production Volume: {data.production_volume} Lts</h2>
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
                      const isEditing = editingOrderId === order.id;

                      return (
                        // <tr key={order.id}>
                        <tr key={order.id} className={isEditing ? 'editing' : ''}>

                          <td>{index + 1}</td>
                          <td>{isEditing ? (
                            <select
                              value={editedOrderData.customer_name || ''}
                              onChange={(e) => handleChange(e, 'customer_name')}
                            >
                              <option value="">Select Customer</option>
                              {customers.map((customer, idx) => (
                                <option key={idx} value={customer}>{customer}</option>
                              ))}
                            </select>
                          ) : order.customer_name}</td>
                          <td>{isEditing ? (
                            <select
                              value={editedOrderData.volume|| ''}
                              onChange={(e) => handleChange(e, 'volume')}
                            >
                              <option value="">Select Volume</option>
                              {volumes.map((volume, idx) => (
                                <option key={idx} value={volume}>{volume} L</option>
                              ))}
                            </select>
                          ) : order.volume * 1000}</td>
                          <td>{isEditing ? (
                            <input
                              type="number"
                              value={editedOrderData.quantity || ''}
                              onChange={(e) => handleChange(e, 'quantity')}
                            />
                          ) : order.quantity}</td>
                          <td>{isEditing ? (
                            <input
                              type="number"
                              value={editedOrderData.total_volume || ''}
                              onChange={(e) => handleChange(e, 'total_volume')}
                              readOnly/>
                          ) : order.total_volume}</td>
                          <td>{isEditing ? 'Editing...' : 'Can be Fulfilled'}</td>
                          <td>
                            {isEditing ? (
                              <>
                                <button onClick={() => handleSave(order.id)} className="btn btn-save">Save</button>
                                <button onClick={handleCancel} className="btn btn-cancel">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleEdit(order.id, order)} className="btn btn-edit">Edit</button>
                                <button onClick={() => handleDelete(order.id)} className="btn btn-delete">Delete</button>
                                <button onClick={() => handleSplit(order.id)} className="btn btn-split">Split</button>
                              </>
                            )}
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
          </div>
        );
      })}
    </div>
  );
};

export default ProductionOrders;

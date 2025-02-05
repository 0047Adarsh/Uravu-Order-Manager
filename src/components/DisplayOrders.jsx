import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import '../styles/DisplayOrders.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const ProductionOrders = () => {
  const [productionData, setProductionData] = useState([]);
  const [ordersByDate, setOrdersByDate] = useState({});
  const [loading, setLoading] = useState(true);

  const [splittingOrderId, setSplittingOrderId] = useState(null);
  const [splitQuantity, setSplitQuantity] = useState(0);
  const [splitDate, setSplitDate] = useState('');

  const [editingProductionId, setEditingProductionId] = useState(null);
  const [editedProductionData, setEditedProductionData] = useState({});

  const customers = ['Customer A', 'Customer B', 'Customer C'];
  const volumes = [100, 200, 300, 400];

  useEffect(() => {
    axios
      .get('http://localhost:3000/productiondata')
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

    return axios
      .get(`http://localhost:3000/orders/${formattedDate}`)
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
      const response = await axios.put(
        `http://localhost:3000/orders/${orderId}`,
        editedOrderData
      );

      if (response.status === 200) {
        alert(`Order ${orderId} updated successfully`);

        setOrdersByDate((prevOrders) => {
          const updatedOrders = { ...prevOrders };
          updatedOrders[editedOrderData.production_date].data = updatedOrders[
            editedOrderData.production_date
          ].data.map((order) =>
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

        setOrdersByDate((prevOrders) => {
          const updatedOrders = { ...prevOrders };

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

  const handleChange = (e, field) => {
    const value = e.target.value;

    setEditedOrderData((prevData) => {
      const updatedData = { ...prevData, [field]: value };

      if (field === 'quantity' || field === 'volume') {
        const quantity = Number(updatedData.quantity) || 0;
        const volume = Number(updatedData.volume) || 0;
        updatedData.total_volume = quantity * volume;
      }

      return updatedData;
    });
  };

  const handleSplit = (orderId) => {
    setSplittingOrderId(orderId);
  };

  const handleSplitSubmit = async () => {
    if (!splitQuantity || !splitDate) {
      alert('Please enter valid split quantity and date.');
      return;
    }

    try {
      const originalOrder = productionData
        .flatMap((data) => ordersByDate[data.production_date]?.data || [])
        .find((order) => order.id === splittingOrderId);

      if (!originalOrder) {
        alert('Order not found.');
        return;
      }

      if (splitQuantity >= originalOrder.quantity) {
        alert('Split quantity must be less than the original order quantity.');
        return;
      }

      const updatedOriginalOrder = {
        ...originalOrder,
        quantity: originalOrder.quantity - splitQuantity,
        total_volume: (originalOrder.quantity - splitQuantity) * originalOrder.volume,
      };

      const newSplitOrder = {
        customerId: 1,
        customerName: originalOrder.customer_name,
        volume: originalOrder.volume,
        quantity: splitQuantity,
        totalVolume: splitQuantity * originalOrder.volume,
        orderDate: splitDate,
        capColor: originalOrder.cap_color,
      };

      console.log("Hello");
      await axios.put(`http://localhost:3000/orders/${originalOrder.id}`, updatedOriginalOrder);
      await axios.post('http://localhost:3000/order', newSplitOrder);

     
      setOrdersByDate((prevOrders) => {
        const updatedOrders = { ...prevOrders };

        updatedOrders[originalOrder.production_date].data = updatedOrders[
          originalOrder.production_date
        ].data.map((order) =>
          order.id === originalOrder.id ? updatedOriginalOrder : order
        );

        if (!updatedOrders[splitDate]) {
          updatedOrders[splitDate] = { data: [], totalVolume: 0 };
        }
        updatedOrders[splitDate].data.push(newSplitOrder);

        return updatedOrders;
      });

      setSplittingOrderId(null);
      setSplitQuantity(0);
      setSplitDate('');
      alert('Order split successfully.');
    } catch (error) {
      console.error('Error splitting order:', error);
      alert('Failed to split the order. Please try again.');
    }
  };

  const handleEditProduction = (productionId, production) => {
    setEditingProductionId(productionId);
    setEditedProductionData({ ...production });
  };

  const handleSaveProduction = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/productiondata/${editingProductionId}`,
        editedProductionData
      );

      if (response.status === 200) {
        alert(`Production data updated successfully`);

        setProductionData((prevData) =>
          prevData.map((data) =>
            data.id === editingProductionId ? { ...data, ...editedProductionData } : data
          )
        );
        setEditingProductionId(null);
      }
    } catch (error) {
      console.error('Error updating production data:', error);
      alert('Failed to update the production data. Please try again.');
    }
  };

  const handleCancelProductionEdit = () => {
    setEditingProductionId(null);
  };

  const handleChangeProduction = (e, field) => {
    const value = e.target.value;

    setEditedProductionData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleDeleteProduction = async (productionId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/productiondata/${productionId}`);

      if (response.status === 200) {
        alert(`Production data ${productionId} deleted successfully`);

        setProductionData((prevData) => prevData.filter((data) => data.id !== productionId));
      }
    } catch (error) {
      console.error(`Error deleting production data ${productionId}:`, error);
      alert('Failed to delete the production data. Please try again.');
    }
  };

//   const calculateOrderStatus = (order, remainingVolume) => {
//     console.log(`Order Quantity: ${order.quantity}, Remaining Volume: ${remainingVolume}`);
//     return order.quantity <= remainingVolume ? 'Can be filled' : 'Cannot be filled';
//   };


const calculateOrderStatus = (order, remainingVol) => {
    const orderVolume = Number(order.total_volume);
    const remainingVolu = Number(remainingVol);
  
    if (isNaN(orderVolume) || isNaN(remainingVolu)) {
      console.error('Invalid order quantity or remaining volume:', order, remainingVolu);
      return 'Invalid data';
    }
  
    return orderVolume <= remainingVol ? 'Can be filled' : 'Cannot be filled';
   
  };


  return (
    <div className="container">
      <h1>Production Volume and Orders</h1>

      {splittingOrderId && (
        <div className="split-modal">
          <div className="split-modal-content">
            <h3>Split Order</h3>
           <label>Customer Name:</label>
            <label>
              Quantity to Split:
              <input
                type="number"
                value={splitQuantity}
                onChange={(e) => setSplitQuantity(Number(e.target.value))}
              />
            </label>
            <label>
              New Production Date:
              <input
                type="date"
                value={splitDate}
                onChange={(e) => setSplitDate(e.target.value)}
              />
            </label>
            <button onClick={handleSplitSubmit} className="btn btn-save">
              Split
            </button>
            <button onClick={() => setSplittingOrderId(null)} className="btn btn-cancel">
              <CancelIcon/>Cancel
            </button>
          </div>
        </div>
      )}

      {productionData.map((data) => {
        const { data: orders } = ordersByDate[data.production_date] || { data: [] };


        let productionVolume = Number(data.production_volume);
        if (isNaN(productionVolume)) {
          console.error(`Invalid production volume for date ${data.production_date}:`, data.production_volume);
          productionVolume = 0;
        }


        const totalOrdersVolume = orders.reduce((total, order) => {
          const orderTotalVolume = Number(order.total_volume);
          if (isNaN(orderTotalVolume)) {
            console.error(`Invalid total volume for order ID ${order.id}:`, order.total_volume);
            return total;
          }
          return total + orderTotalVolume;
        }, 0);

        let remainingVolume = Math.max(0, productionVolume - totalOrdersVolume);
        let remVolume = productionVolume;
        console.log(`Production Volume: ${productionVolume}, Total Orders Volume: ${totalOrdersVolume}, Remaining Volume: ${remainingVolume}`);

        return (
          <div key={data.production_date} className="production-card">
            <div className="card-header">
              <h2>
                Production Date: {moment(data.production_date).format('YYYY-MM-DD')} | Production
                Volume: {data.production_volume} Lts
              </h2>
              {editingProductionId === data.id ? (
                <>
                  <button onClick={handleSaveProduction} className="btn btn-save">
                    <SaveIcon/>Save Production
                  </button>
                  <button onClick={handleCancelProductionEdit} className="btn btn-cancel">
                    <CancelIcon/>Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditProduction(data.id, data)} className="btn btn-edit"><EditIcon/>
                    Edit Production
                  </button>
                  <button onClick={() => handleDeleteProduction(data.id)} className="btn btn-delete"><DeleteIcon/>
                    Delete Production
                  </button>
                </>
              )}
            </div>

            <div className="edit-production-form">
              {editingProductionId === data.id && (
                <div>
                  <label>Production Volume (L):</label>
                  <input
                    type="number"
                    value={editedProductionData.production_volume || ''}
                    onChange={(e) => handleChangeProduction(e, 'production_volume')}
                  />
                </div>
              )}
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
                    <th>Cap Color</th>
                    <th>Total Volume</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>

                {
                    orders && orders.length > 0 ? ( 
                    orders.map((order, index) => {
                      const isEditing = editingOrderId === order.id;
                      
                    //   let remainingVol = data.production_volume;
        
                      const orderStatus = calculateOrderStatus(order, remVolume);
                      if(orderStatus=='Can be filled')
                      {
                        remVolume-=order.total_volume;
                      }
                      const statusClass = orderStatus === 'Can be filled'
                    ? 'status-can-be-filled'
                    : 'status-cannot-be-filled';
                    //   remainingVol = orderStatus ? remainingVol - order.total_volume : remainingVol;


                      return (
                        <tr key={order.id} className={statusClass} id='editing'>
                          <td>{index + 1}</td>
                          <td>
                            {isEditing ? (
                              <select
                                value={editedOrderData.customer_name || ''}
                                onChange={(e) => handleChange(e, 'customer_name')}
                              >
                                <option value="">Select Customer</option>
                                {customers.map((customer, idx) => (
                                  <option key={idx} value={customer}>
                                    {customer}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              order.customer_name
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <select
                                value={editedOrderData.volume || ''}
                                onChange={(e) => handleChange(e, 'volume')}
                              >
                                <option value="">Select Volume</option>
                                {volumes.map((volume, idx) => (
                                  <option key={idx} value={volume}>
                                    {volume} L
                                  </option>
                                ))}
                              </select>
                            ) : (
                              order.volume * 1000
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editedOrderData.quantity || ''}
                                onChange={(e) => handleChange(e, 'quantity')}
                              />
                            ) : (
                              order.quantity
                            )}
                          </td>
                          <td>{order.cap_color}</td>
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editedOrderData.total_volume || ''}
                                onChange={(e) => handleChange(e, 'total_volume')}
                                readOnly
                              />
                            ) : (
                              order.total_volume
                            )}
                          </td>
                          <td>{orderStatus}</td>
                          <td>
                            {isEditing ? (
                              <>
                                <button onClick={() => handleSave(order.id)} className="btn btn-save">
                                  <SaveIcon/>Save
                                </button>
                                <button onClick={handleCancel} className="btn btn-cancel">
                                  <CancelIcon/>Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleEdit(order.id, order)} className="btn btn-edit"><EditIcon/>
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(order.id)} className="btn btn-delete"><DeleteIcon/>
                                  Delete
                                </button>
                                <button onClick={() => handleSplit(order.id)} className="btn btn-split"><AltRouteIcon/>
                                  Split
                                </button>
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

            <div className="remaining-volume">
              <h4>Remaining Volume: {remainingVolume} Lts</h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductionOrders;
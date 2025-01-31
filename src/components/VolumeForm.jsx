import React, {useState} from "react";

function VolumeForm()
{
    const [productionData, setproductionData] = useState({productionDate:new Date().toISOString().split("T")[0], productionVolume:0});
    const [error, setError] = useState(null);

    function handleChange(event){
        const {name, value} = event.target;
        setproductionData(prevData=>({
            ...prevData, [name]: value
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        fetch('http://localhost:3000/volume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productionData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            setproductionData(prevData => ({
                ...prevData,
                productionVolume: 0
            }));
        })
        .catch((error) => {
            console.error('Error:', error);
            setError('Submission failed. Please try again.');
        });
    }

    return(<div className="orderForm">
        <h1>Add Volume Data</h1>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
            <input type="date" value={productionData.productionDate} name="productionDate" onChange={handleChange}/>
            <input type="number" value={productionData.productionVolume} name="productionVolume" onChange={handleChange}/>
            <button type="submit">Submit</button>
        </form>
    </div>)
}

export default VolumeForm;

import React, {useState} from "react";
import "../styles/VolumeForm.css"
import CloseIcon from '@mui/icons-material/Close';
import DateRangeIcon from '@mui/icons-material/DateRange';
import WaterIcon from '@mui/icons-material/Water';

function VolumeForm()
{
    const [productionData, setproductionData] = useState({productionDate:new Date().toISOString().split("T")[0], productionVolume:0});
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    function handleChange(event){
        const {name, value} = event.target;
        setproductionData(prevData=>({
            ...prevData, [name]: value
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        setSuccessMessage("");
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
            setSuccessMessage("Volume data submitted successfully!");
        })
        .catch((error) => {
            console.error('Error:', error);
            setError('Submission failed. Please try again.');
        });
    }

    function closeForm()
    {
        document.getElementById("volumeForm").style.display = "none";
    }

    return(<div className="dataForm" id="volumeForm">
        <button className="closeFormButton" onClick={closeForm}><CloseIcon/></button>
        <h1>Add Volume Data</h1>
        {error && <p style={{color: 'red'}}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <form onSubmit={handleSubmit} className="theForm">
            <label><DateRangeIcon/>Production Date:</label>
            <input type="date" value={productionData.productionDate} name="productionDate" onChange={handleChange}/>
            <label><WaterIcon/>Production Volume:</label>
            <input type="number" value={productionData.productionVolume} name="productionVolume" onChange={handleChange}/>
            <button type="submit">Submit</button>
        </form>
    </div>)
}

export default VolumeForm;

import React, { useState, useEffect, useRef } from "react";
import "../styles/addorder.css";

function AddVolume() {
    const [productionDate, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [productionVolume, setVolume] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const formRef = useRef(null);

    function closeForm() {
        if (formRef.current) {
            formRef.current.style.display = "none";
        }
    }

    function handleDateChange(e) {
        setDate(e.target.value);
    }

    function handleVolumeChange(e) {
        const value = parseInt(e.target.value, 10);
        setVolume(value >= 0 ? value : 0);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        if (productionVolume <= 0) {
            setError("Volume must be greater than zero.");
            return;
        }

        const formData = { productionDate, productionVolume };

        try {
            const response = await fetch("http://localhost:3000/volume", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            setSuccessMessage(result.message);
            setDate(new Date().toISOString().split("T")[0]);
            setVolume("");
        } catch (error) {
            setError("Error submitting data. Please try again.");
        }
    }

    return (
        <div className="orderForm" id="volumeform" ref={formRef}>
            <button className="closeButton" onClick={closeForm} aria-label="Close form">X</button>
            <h2>Add Volume</h2>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <form>
                <label htmlFor="prodDate">Production Date:</label>
                <input type="date" id="prodDate" name="productionDate" value={productionDate} onChange={handleDateChange} required />
                <br />
                <label htmlFor="prodVol">Volume:</label>
                <input placeholder="0" id="prodVol" type="number" name="volume" value={productionVolume} onChange={handleVolumeChange} min="1" required />
                <button type="submit" onClick={handleSubmit}>Submit</button>
            </form>
        </div>
    );
}

export default AddVolume;

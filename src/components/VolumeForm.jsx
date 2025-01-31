import React, {useState} from "react";

function VolumeForm()
{
    const [productionData, setproductionData] = useState({productionDate:new Date().toISOString().split("T")[0], productionVolume:0});

    return(<div>
        <form>
            <input type="date" value={productionData.productionDate} name="productionDate" onChange={handleChange}/>
        </form>
    </div>)
}

export default VolumeForm;
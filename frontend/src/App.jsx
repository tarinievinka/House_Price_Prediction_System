import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // State layout to capture user input form entries matching our backend API fields
  const [formData, setFormData] = useState({
    area: '',
    bedrooms: '2',
    bathrooms: '1',
    stories: '1',
    mainroad: '1',
    guestroom: '0',
    basement: '0',
    hotwaterheating: '0',
    airconditioning: '0',
    parking: '0',
    prefarea: '0',
    furnishingstatus_semi_furnished: '0',
    furnishingstatus_unfurnished: '0'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle value changes when users toggle values or input sizes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Explicitly handle furnishing category radio selectors
  const handleFurnishingChange = (status) => {
    if (status === 'furnished') {
      setFormData((prev) => ({ ...prev, furnishingstatus_semi_furnished: '0', furnishingstatus_unfurnished: '0' }));
    } else if (status === 'semi-furnished') {
      setFormData((prev) => ({ ...prev, furnishingstatus_semi_furnished: '1', furnishingstatus_unfurnished: '0' }));
    } else {
      setFormData((prev) => ({ ...prev, furnishingstatus_semi_furnished: '0', furnishingstatus_unfurnished: '1' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Convert everything to numbers before transmitting via JSON payload strings
    const payload = Object.keys(formData).reduce((acc, key) => {
      acc[key] = Number(formData[key]);
      return acc;
    }, {});

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', payload);
      setPrediction(response.data.estimated_price);
    } catch (err) {
      setError("Failed to get prediction from model server. Check if backend is running!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#1e1e1e', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#2d2d2d', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#4caf50' }}>🏠 Real Estate Valuation Engine</h2>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Core Property Architecture Metrics */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Property Size (sq ft):</label>
            <input type="number" name="area" value={formData.area} onChange={handleChange} required placeholder="e.g. 3500" style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#3d3d3d', color: '#fff' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Bedrooms:</label>
              <select name="bedrooms" value={formData.bedrooms} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#3d3d3d', color: '#fff' }}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Bathrooms:</label>
              <select name="bathrooms" value={formData.bathrooms} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#3d3d3d', color: '#fff' }}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Section 2: Amenity Infrastructure Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', padding: '15px', backgroundColor: '#333', borderRadius: '8px' }}>
            <label><input type="checkbox" name="airconditioning" checked={formData.airconditioning === '1'} onChange={(e) => setFormData(p => ({...p, airconditioning: e.target.checked ? '1' : '0'}))} /> Air Conditioning</label>
            <label><input type="checkbox" name="mainroad" checked={formData.mainroad === '1'} onChange={(e) => setFormData(p => ({...p, mainroad: e.target.checked ? '1' : '0'}))} /> Main Road Access</label>
            <label><input type="checkbox" name="basement" checked={formData.basement === '1'} onChange={(e) => setFormData(p => ({...p, basement: e.target.checked ? '1' : '0'}))} /> Has Basement</label>
            <label><input type="checkbox" name="guestroom" checked={formData.guestroom === '1'} onChange={(e) => setFormData(p => ({...p, guestroom: e.target.checked ? '1' : '0'}))} /> Has Guestroom</label>
          </div>

          {/* Section 3: Furnishing Layout Selector */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Furnishing Status:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['furnished', 'semi-furnished', 'unfurnished'].map((status) => (
                <button key={status} type="button" onClick={() => handleFurnishingChange(status)} style={{ flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: (status === 'furnished' && formData.furnishingstatus_semi_furnished === '0' && formData.furnishingstatus_unfurnished === '0') || (status === 'semi-furnished' && formData.furnishingstatus_semi_furnished === '1') || (status === 'unfurnished' && formData.furnishingstatus_unfurnished === '1') ? '#4caf50' : '#444', color: '#fff', fontWeight: 'bold' }}>
                  {status.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#008cba', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
            {loading ? "Processing Calculation..." : "Predict Valuation Price →"}
          </button>
        </form>

        {/* Section 4: Display Output Result Badges */}
        {error && <div style={{ color: '#ff5722', marginTop: '20px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

        {prediction !== null && (
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#383838', borderRadius: '10px', borderLeft: '5px solid #4caf50', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated Value</span>
            <h2 style={{ fontSize: '36px', margin: '5px 0', color: '#4caf50' }}>LKR {(prediction / 1000000).toFixed(2)}M</h2>
            <p style={{ fontSize: '12px', color: '#888', margin: '0' }}>Calculated live using your trained Linear Regression Model pipeline</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
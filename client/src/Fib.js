import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Fib = () => {
    const [seenIndices, setSeenIndices] = useState([]);
    const [values, setValues] = useState({});
    const [index, setIndex] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const valPromise = axios.get('/api/values/current');
            const indPromise = axios.get('/api/values/all');
            const [valRes, indRes] = await Promise.all([
                valPromise,
                indPromise,
            ]);
            if (!valRes.error) setValues(valRes.data);
            if (!indRes.error) setSeenIndices(indRes.data);
        }

        fetchData();
    }, [setValues, setSeenIndices]);

    const handleSumbit = async e => {
        e.preventDefault();
        await axios.post('/api/values', { index });
        setIndex('');
    };
    const renderIndices = () => seenIndices.map(({ number }) => number).join(', ');
    const renderCalculatedValues = () => Object.keys(values).map(key => (
        <div key={key}>
            For index {key} I calculated value {values[key]}
        </div>
    ));

    return (
        <div>
            <form onSubmit={handleSumbit}>
                <label>Enter your index:</label>
                <input
                    value={index}
                    onChange={e => setIndex(e.target.value)}
                />
                <button>Submit</button>
            </form>
            <h3>Indices I have seen:</h3>
            {renderIndices()}
            <h3>Calculated Values:</h3>
            {renderCalculatedValues()}
        </div>
    );
}

export default Fib;
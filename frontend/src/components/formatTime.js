import React from 'react';

export const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) {
        return <span style={{ color: 'grey', textDecoration: 'underline' }}>Veiling verlopen</span>;
    }

    const longUnits = [
        { label: 'week', labels: 'weken', seconds: 604800 },
        { label: 'dag', labels: 'dagen', seconds: 86400 },
        { label: 'uur', labels: 'uur', seconds: 3600 }
    ];

    const shortUnits = [
        { label: 'uur', labels: 'uur', seconds: 3600 },
        { label: 'min', labels: 'min', seconds: 60 },
        { label: 'sec', labels: 'sec', seconds: 1 }
    ];

    const units = totalSeconds < 86400 ? shortUnits : longUnits;

    let remaining = totalSeconds;
    const parts = [];

    for (const unit of units) {
        const value = Math.floor(remaining / unit.seconds);
        if (value > 0 || parts.length > 0) {
            parts.push(`${value} ${value === 1 ? unit.label : unit.labels}`);
            remaining %= unit.seconds;
        }
        if (parts.length === (totalSeconds < 86400 ? 3 : 2)) break;
    }

    return parts.join(' ');
};
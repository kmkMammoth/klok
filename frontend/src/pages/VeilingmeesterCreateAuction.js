import { useState, useEffect, useCallback } from 'react';
import '../styles/VeilingmeesterCreateAuction.css';

// 圆形倒计时时钟组件
function CircularCountdownClock({ startTime, endTime, status, currentTime, size = 80 }) {
    const now = currentTime;
    const start = startTime;
    const end = endTime;
    const totalDuration = end - start;
    const elapsed = now - start;
    const remaining = Math.max(0, end - now);
    
    // 计算剩余时间百分比 (1-0，倒计时)
    // progress = 1 表示满圆（刚开始），progress = 0 表示空圆（结束）
    let progress = 1;
    if (status === 'Active') {
        progress = Math.max(0, Math.min(1, remaining / totalDuration));
    } else if (status === 'Finished') {
        progress = 0;
    } else if (status === 'Idle') {
        progress = 1; // 等待开始时显示满圆
    }
    
    // 格式化剩余时间
    const formatRemainingTime = () => {
        if (status === 'Idle') {
            // 显示距离开始的时间
            const timeUntilStart = Math.max(0, start - now);
            const hours = Math.floor(timeUntilStart / 3600000);
            const minutes = Math.floor((timeUntilStart % 3600000) / 60000);
            const seconds = Math.floor((timeUntilStart % 60000) / 1000);
            if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
        if (status === 'Finished') return '0:00';
        
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };
    
    // 根据状态和剩余时间确定颜色
    const getColor = () => {
        if (status === 'Idle') return '#FFC107'; // 黄色 - 等待中
        if (status === 'Finished') return '#9E9E9E'; // 灰色 - 已结束
        
        // Active 状态根据剩余时间变色
        const remainingMinutes = remaining / 60000;
        if (remainingMinutes < 1) return '#E74C3C'; // 红色 - 紧急
        if (remainingMinutes < 5) return '#FF9800'; // 橙色 - 即将结束
        return '#4CAF50'; // 绿色 - 正常
    };
    
    const color = getColor();
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);
    
    // 确定动画类
    const getAnimationClass = () => {
        if (status !== 'Active') return '';
        const remainingMinutes = remaining / 60000;
        if (remainingMinutes < 1) return 'countdown-clock-urgent';
        if (remainingMinutes < 5) return 'countdown-clock-warning';
        return '';
    };
    
    return (
        <div 
            className={getAnimationClass()}
            style={{ 
                position: 'relative', 
                width: size, 
                height: size,
                flexShrink: 0
            }}
        >
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* 背景圆环 */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E0E0E0"
                    strokeWidth={strokeWidth}
                />
                {/* 进度圆环 */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ 
                        transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease',
                    }}
                />
            </svg>
            {/* 中心文字 */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                lineHeight: 1.2
            }}>
                <div style={{ 
                    fontSize: size > 70 ? '1rem' : '0.75rem', 
                    fontWeight: 'bold',
                    color: color,
                    fontFamily: 'monospace'
                }}>
                    {formatRemainingTime()}
                </div>
                <div style={{ 
                    fontSize: '0.6rem', 
                    color: '#888',
                    marginTop: '2px'
                }}>
                    {status === 'Idle' ? 'START' : status === 'Active' ? 'REST' : 'EINDE'}
                </div>
            </div>
        </div>
    );
}

function CreateAuction({ auctions, addAuction }) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localAuctions, setLocalAuctions] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        veilingmeesterId: 1, // Default to 1, can be changed later
        startTime: '',
        endTime: '',
        adres: '', // Veiling locatie/adres
        products: [] // Array of {productId, startPrice, priceReductionAmount, priceReductionInterval}
    });
    const [expandedAuctions, setExpandedAuctions] = useState({});
    const [currentTime, setCurrentTime] = useState(Date.now());

    // 计算产品当前价格和状态（基于拍卖开始时间和减价规则）
    // 返回 { price: number, status: 'normal' | 'warning' | 'unsold' }
    const calculateCurrentPrice = useCallback((product, auctionStartTime, auctionStatus) => {
        const minimumPrice = product.minimumPrijs || 0;
        
        // 如果拍卖还未开始或已结束，返回起始价格
        if (auctionStatus !== 'Active') {
            return { price: product.startPrice, status: 'normal' };
        }

        const now = currentTime;
        const startTime = auctionStartTime;
        const elapsedSeconds = Math.floor((now - startTime) / 1000);

        if (elapsedSeconds <= 0) {
            return { price: product.startPrice, status: 'normal' };
        }

        // 计算应该减价的次数
        const reductionCount = Math.floor(elapsedSeconds / product.priceReductionInterval);
        
        // 计算当前价格 = 起始价格 - (减价次数 × 每次减价金额)
        let currentPrice = product.startPrice - (reductionCount * product.priceReductionAmount);
        
        // 检查是否达到最低价（流拍）
        if (currentPrice <= minimumPrice) {
            return { price: minimumPrice, status: 'unsold' }; // 流拍
        }
        
        // 检查是否接近最低价（警告）
        const priceAboveMinimum = currentPrice - minimumPrice;
        const totalPriceRange = product.startPrice - minimumPrice;
        const percentAboveMinimum = totalPriceRange > 0 ? (priceAboveMinimum / totalPriceRange) * 100 : 100;
        
        if (percentAboveMinimum < 20) {
            return { price: currentPrice, status: 'warning' }; // 即将流拍
        }
        
        return { price: Math.max(minimumPrice, currentPrice), status: 'normal' };
    }, [currentTime]);

    const fetchAuctions = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5102/api/auctions');
            if (!response.ok) {
                throw new Error('Fout bij het ophalen van veilingen');
            }
            const data = await response.json();
            
            // Update auctions while preserving expanded state
            setLocalAuctions(prevAuctions => {
                // Check if data actually changed to avoid unnecessary re-renders
                if (JSON.stringify(prevAuctions) === JSON.stringify(data)) {
                    return prevAuctions;
                }
                return data;
            });
        } catch (err) {
            console.error('Error fetching auctions:', err);
        }
    }, []);

    // Load veilingen op pagina load en wanneer de pagina weer zichtbaar wordt
    useEffect(() => {
        fetchAuctions();
        fetchAvailableProducts();

        // Auto-refresh elke 10 seconden om status updates te tonen (langzamer om expand state te behouden)
        const intervalId = setInterval(() => {
            fetchAuctions();
        }, 10000);

        // Update currentTime elke seconde voor prijs berekening
        const priceUpdateInterval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        const onFocus = () => {
            fetchAuctions();
            fetchAvailableProducts();
        };
        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                fetchAuctions();
                fetchAvailableProducts();
            }
        };

        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            clearInterval(intervalId);
            clearInterval(priceUpdateInterval);
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [fetchAuctions]);

    const toggleAuction = (id, event) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        // 切换当前卡片的展开状态，不影响其他卡片
        setExpandedAuctions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchAvailableProducts = async () => {
        setLoadingProducts(true);
        try {
            const response = await fetch('http://localhost:5102/api/auctions/products/available');
            if (!response.ok) {
                throw new Error('Fout bij het ophalen van beschikbare producten');
            }
            const data = await response.json();
            setAvailableProducts(data);
        } catch (err) {
            console.error('Error fetching available products:', err);
            setError('Fout bij het ophalen van beschikbare producten');
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Weet je zeker dat je deze veiling wilt verwijderen?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5102/api/auctions/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Fout bij het verwijderen van de veiling');
            }

            setLocalAuctions(localAuctions.filter(a => a.id !== id));
            fetchAvailableProducts(); // Refresh available products
        } catch (err) {
            alert('Fout bij het verwijderen: ' + err.message);
            console.error('Error deleting auction:', err);
        }
    };

    const addProductToForm = () => {
        const selectedIds = formData.products
            .map(p => parseInt(p.productId))
            .filter(Boolean);
        const remaining = availableProducts.filter(p => !selectedIds.includes(p.id));

        if (remaining.length === 0) {
            setError('Geen beschikbare producten');
            return;
        }

        setFormData({
            ...formData,
            products: [
                ...formData.products,
                {
                    productId: remaining[0].id,
                    startPrice: '',
                    priceReductionAmount: '',
                    priceReductionInterval: ''
                }
            ]
        });
    };

    const removeProductFromForm = (index) => {
        const newProducts = formData.products.filter((_, i) => i !== index);
        setFormData({ ...formData, products: newProducts });
    };

    const updateProductInForm = (index, field, value) => {
        const newProducts = [...formData.products];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setFormData({ ...formData, products: newProducts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name) {
            setError('Veilingnaam is verplicht');
            return;
        }

        if (!formData.startTime || !formData.endTime) {
            setError('Starttijd en eindtijd zijn verplicht');
            return;
        }

        if (formData.products.length === 0) {
            setError('Er moet minimaal één product worden toegevoegd');
            return;
        }

        // Validate all products have required fields
        for (let i = 0; i < formData.products.length; i++) {
            const product = formData.products[i];
            if (!product.productId || !product.startPrice || !product.priceReductionAmount || !product.priceReductionInterval) {
                setError(`Product ${i + 1} heeft onvolledige gegevens`);
                return;
            }
            if (parseFloat(product.startPrice) <= 0) {
                setError(`Product ${i + 1}: Startprijs moet groter dan 0 zijn`);
                return;
            }
            if (parseFloat(product.priceReductionAmount) < 0) {
                setError(`Product ${i + 1}: Prijsreductie kan niet negatief zijn`);
                return;
            }
            if (parseInt(product.priceReductionInterval) <= 0) {
                setError(`Product ${i + 1}: Prijsreductie interval moet groter dan 0 zijn`);
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const requestBody = {
                name: formData.name,
                veilingmeesterId: parseInt(formData.veilingmeesterId),
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                adres: formData.adres,
                products: formData.products.map(p => ({
                    productId: parseInt(p.productId),
                    startPrice: parseFloat(p.startPrice),
                    priceReductionAmount: parseFloat(p.priceReductionAmount),
                    priceReductionInterval: parseInt(p.priceReductionInterval)
                }))
            };

            const response = await fetch('http://localhost:5102/api/auctions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Fout bij het aanmaken van de veiling' }));
                throw new Error(errorData.message || 'Fout bij het aanmaken van de veiling');
            }

            const newAuction = await response.json();
            addAuction(newAuction);
            setLocalAuctions([...localAuctions, newAuction]);
            
            // Reset form
            setFormData({
                name: '',
                veilingmeesterId: 1,
                startTime: '',
                endTime: '',
                products: []
            });
            setShowForm(false);
            fetchAvailableProducts(); // Refresh available products
        } catch (err) {
            setError(err.message || 'Er is een fout opgetreden');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '€ 0.00';
        return `€ ${parseFloat(price).toFixed(2)}`;
    };

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <div className="create-container">
            <div className="create-header">
                <h1>Veilingen</h1>
                <button
                    className="add-button"
                    onClick={() => {
                        setShowForm(!showForm);
                        if (!showForm) {
                            fetchAvailableProducts();
                        }
                    }}
                >
                    <span className="plus-icon">+</span>
                    Nieuwe Veiling
                </button>
            </div>

            {showForm && (
                <div className="form-overlay">
                    <div className="form-modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="form-header">
                            <h2>Nieuwe Veiling Aanmaken</h2>
                            <button
                                className="close-button"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="form-group">
                                <label>Veilingnaam *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Bijv. Rode Rozen Boeket"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Veilingmeester ID *</label>
                                <input
                                    type="number"
                                    value={formData.veilingmeesterId}
                                    onChange={(e) => setFormData({...formData, veilingmeesterId: e.target.value})}
                                    min="1"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Starttijd *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Eindtijd *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Adres / Locatie</label>
                                <input
                                    type="text"
                                    value={formData.adres}
                                    onChange={(e) => setFormData({...formData, adres: e.target.value})}
                                    placeholder="Bijv. Aalsmeer, Hal 3"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Producten *</label>
                                <button
                                    type="button"
                                    onClick={addProductToForm}
                                    disabled={loading || loadingProducts || availableProducts.filter(p => !formData.products.map(pr => parseInt(pr.productId)).filter(Boolean).includes(p.id)).length === 0}
                                    style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    + Product Toevoegen
                                </button>
                                
                                {loadingProducts && <div>Producten laden...</div>}
                                
                                {formData.products.map((product, index) => (
                                    <div key={index} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <strong>Product {index + 1}</strong>
                                            <button
                                                type="button"
                                                onClick={() => removeProductFromForm(index)}
                                                disabled={loading}
                                                style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                            >
                                                Verwijderen
                                            </button>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>Product *</label>
                                            <select
                                                value={product.productId}
                                                onChange={(e) => updateProductInForm(index, 'productId', e.target.value)}
                                                required
                                                disabled={loading}
                                                style={{ width: '100%', padding: '8px' }}
                                            >
                                                <option value="">Selecteer product</option>
                                                {availableProducts
                                                    .filter(p => {
                                                        const selectedIds = formData.products
                                                            .map(pr => parseInt(pr.productId))
                                                            .filter(Boolean);
                                                        // allow current selection to stay visible
                                                        return !selectedIds.includes(p.id) || p.id === parseInt(product.productId);
                                                    })
                                                    .map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.soort} - €{p.minimumprijs?.toFixed(2) || '0.00'} - {p.hoeveelheid} stuks
                                                    </option>
                                                    ))}
                                            </select>
                                            {product.productId && (() => {
                                                const selectedProduct = availableProducts.find(p => p.id === parseInt(product.productId));
                                                return selectedProduct ? (
                                                    <div style={{ 
                                                        marginTop: '10px', 
                                                        padding: '10px', 
                                                        backgroundColor: '#f5f5f5', 
                                                        borderRadius: '4px',
                                                        border: '1px solid #ddd'
                                                    }}>
                                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                                            {selectedProduct.afbeelding && (
                                                                <img 
                                                                    src={selectedProduct.afbeelding} 
                                                                    alt={selectedProduct.soort}
                                                                    style={{ 
                                                                        width: '80px', 
                                                                        height: '80px', 
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid #ccc'
                                                                    }}
                                                                />
                                                            )}
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>
                                                                    {selectedProduct.soort}
                                                                </div>
                                                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                                                                    <strong>Minimumprijs:</strong> €{selectedProduct.minimumprijs?.toFixed(2) || '0.00'}
                                                                </div>
                                                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                                                                    <strong>Hoeveelheid:</strong> {selectedProduct.hoeveelheid} stuks
                                                                </div>
                                                                {selectedProduct.potmaat && (
                                                                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                                                                        <strong>Potmaat:</strong> {selectedProduct.potmaat} cm
                                                                    </div>
                                                                )}
                                                                {selectedProduct.steellengte && (
                                                                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                                                                        <strong>Steellengte:</strong> {selectedProduct.steellengte} cm
                                                                    </div>
                                                                )}
                                                                <div style={{ fontSize: '14px', color: '#666' }}>
                                                                    <strong>Locatie:</strong> {selectedProduct.kloklokatie || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>

                                        <div className="form-group">
                                            <label>Startprijs (€) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={product.startPrice}
                                                onChange={(e) => updateProductInForm(index, 'startPrice', e.target.value)}
                                                placeholder="Bijv. 100.00"
                                                min="0.01"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Prijsreductie Bedrag (€ per interval) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={product.priceReductionAmount}
                                                onChange={(e) => updateProductInForm(index, 'priceReductionAmount', e.target.value)}
                                                placeholder="Bijv. 0.50"
                                                min="0"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Prijsreductie Interval (seconden) *</label>
                                            <input
                                                type="number"
                                                value={product.priceReductionInterval}
                                                onChange={(e) => updateProductInForm(index, 'priceReductionInterval', e.target.value)}
                                                placeholder="Bijv. 10"
                                                min="1"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Bezig met opslaan...' : 'Bevestigen'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="auctions-list-create">
                <h2>Huidige Veilingen</h2>
                <div className="auctions-grid-create">
                    {localAuctions.length === 0 ? (
                        <div className="no-auctions">Geen veilingen gevonden.</div>
                    ) : (
                        localAuctions.map((auction) => {
                            const isExpanded = expandedAuctions[auction.id] === true;
                            const hasProducts = auction.products && auction.products.length > 0;
                            const showProducts = isExpanded && hasProducts;
                            
                            return (
                                <div 
                                    key={auction.id}
                                    className="auction-item" 
                                    onClick={(e) => toggleAuction(auction.id, e)}
                                    style={{ 
                                        cursor: 'pointer',
                                        border: isExpanded ? '3px solid #4CAF50' : '3px solid transparent'
                                    }}
                                >
                                    <div className="auction-item-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {/* 圆形倒计时时钟 */}
                                            <CircularCountdownClock
                                                startTime={auction.startTime}
                                                endTime={auction.endTime}
                                                status={auction.status}
                                                currentTime={currentTime}
                                                size={70}
                                            />
                                            <div>
                                                <h3 style={{ margin: 0 }}>{auction.name}</h3>
                                                <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span className="auction-badge">#{auction.id}</span>
                                                    <span 
                                                        style={{
                                                            padding: '3px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            backgroundColor: 
                                                                auction.status === 'Active' ? '#4CAF50' : 
                                                                auction.status === 'Idle' ? '#FFC107' : 
                                                                '#9E9E9E',
                                                            color: auction.status === 'Idle' ? '#333' : 'white'
                                                        }}
                                                    >
                                                        {auction.status === 'Active' ? '🟢 Actief' : 
                                                         auction.status === 'Idle' ? '🟡 In wachtrij' : 
                                                         '⚫ Beëindigd'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="auction-item-actions">
                                            <button 
                                                className="delete-button"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(auction.id); }}
                                                title="Verwijder veiling"
                                            >
                                                🗑️
                                            </button>
                                            <span style={{ fontSize: '1.2rem' }}>
                                                {isExpanded ? '▾' : '▸'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="auction-item-details">
                                        <div className="detail-small">
                                            <span>Start tijd:</span>
                                            <strong>{new Date(auction.startTime).toLocaleString('nl-NL', { 
                                                day: '2-digit', 
                                                month: '2-digit', 
                                                year: 'numeric',
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}</strong>
                                        </div>
                                        <div className="detail-small">
                                            <span>Eind tijd:</span>
                                            <strong>{new Date(auction.endTime).toLocaleString('nl-NL', { 
                                                day: '2-digit', 
                                                month: '2-digit', 
                                                year: 'numeric',
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}</strong>
                                        </div>
                                        {auction.adres && (
                                            <div className="detail-small">
                                                <span>Locatie:</span>
                                                <strong>{auction.adres}</strong>
                                            </div>
                                        )}
                                        {isExpanded && (
                                            <div className="detail-small">
                                                <span>Max. Tijd:</span>
                                                <strong>{formatTime(auction.maxTime)}</strong>
                                            </div>
                                        )}
                                        {showProducts && (
                                            <div style={{ 
                                                marginTop: '10px', 
                                                borderTop: '2px solid #E0DDCF', 
                                                paddingTop: '10px'
                                            }}>
                                                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#463239' }}>
                                                    📦 Producten ({auction.products.length}):
                                                </div>
                                                {auction.products.map((p, idx) => {
                                                    const priceResult = calculateCurrentPrice(p, auction.startTime, auction.status);
                                                    const currentPrice = priceResult.price;
                                                    const priceStatus = priceResult.status;
                                                    const isUnsold = priceStatus === 'unsold';
                                                    const isWarning = priceStatus === 'warning';
                                                    const isPriceDropping = auction.status === 'Active' && currentPrice < p.startPrice && !isUnsold;
                                                    
                                                    // 根据状态确定颜色
                                                    const statusColor = isUnsold ? '#666' : isWarning ? '#FF6B00' : '#E74C3C';
                                                    const statusBgColor = isUnsold ? '#f5f5f5' : isWarning ? '#FFF3E0' : '#FEE';
                                                    const borderColor = isUnsold ? '#999' : isWarning ? '#FF6B00' : '#E74C3C';
                                                    
                                                    return (
                                                        <div key={idx} style={{ 
                                                            marginBottom: '10px', 
                                                            padding: '12px',
                                                            backgroundColor: isUnsold ? '#fafafa' : '#ffffff',
                                                            border: `2px solid ${isUnsold ? '#ccc' : '#E0DDCF'}`,
                                                            borderRadius: '8px',
                                                            opacity: isUnsold ? 0.7 : 1
                                                        }}>
                                                            {/* 产品名称 + 流拍标签 */}
                                                            <div style={{ 
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '10px'
                                                            }}>
                                                                <div style={{ 
                                                                    fontWeight: '600', 
                                                                    fontSize: '1rem',
                                                                    color: isUnsold ? '#888' : '#463239',
                                                                    textDecoration: isUnsold ? 'line-through' : 'none'
                                                                }}>
                                                                    {p.name || `Product ${p.productId}`}
                                                                </div>
                                                                {isUnsold && (
                                                                    <span style={{
                                                                        backgroundColor: '#666',
                                                                        color: 'white',
                                                                        padding: '3px 10px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '700'
                                                                    }}>
                                                                        ❌ NIET VERKOCHT
                                                                    </span>
                                                                )}
                                                                {isWarning && !isUnsold && (
                                                                    <span style={{
                                                                        backgroundColor: '#FF6B00',
                                                                        color: 'white',
                                                                        padding: '3px 10px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '700',
                                                                        animation: 'pulse-urgent 1s ease-in-out infinite'
                                                                    }}>
                                                                        ⚠️ BIJNA MINIMUM
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {/* 价格信息 - 横向布局 */}
                                                            <div style={{ 
                                                                display: 'grid',
                                                                gridTemplateColumns: '1fr 1fr',
                                                                gap: '8px',
                                                                fontSize: '0.85rem',
                                                                marginBottom: '10px'
                                                            }}>
                                                                <div>
                                                                    <span style={{ color: '#666' }}>Start:</span>{' '}
                                                                    <strong>{formatPrice(p.startPrice)}</strong>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#666' }}>Min:</span>{' '}
                                                                    <strong style={{ color: '#888' }}>{formatPrice(p.minimumPrijs || 0)}</strong>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#666' }}>Reductie:</span>{' '}
                                                                    <strong>€{p.priceReductionAmount?.toFixed(2) ?? '0.00'}</strong>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#666' }}>Interval:</span>{' '}
                                                                    <strong>{p.priceReductionInterval}s</strong>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* 当前价格 - 大号显示 */}
                                                            <div style={{ 
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                padding: '8px 12px',
                                                                backgroundColor: statusBgColor,
                                                                borderRadius: '6px',
                                                                borderLeft: `4px solid ${borderColor}`
                                                            }}>
                                                                <span style={{ 
                                                                    fontSize: '0.9rem',
                                                                    color: '#666',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {isUnsold ? 'Eindprijs:' : 'Huidige prijs:'}
                                                                </span>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div style={{ 
                                                                        fontSize: '1.5rem',
                                                                        fontWeight: '700',
                                                                        color: statusColor,
                                                                        lineHeight: '1.2',
                                                                        textDecoration: isUnsold ? 'line-through' : 'none'
                                                                    }}>
                                                                        {formatPrice(currentPrice)}
                                                                    </div>
                                                                    {isPriceDropping && (
                                                                        <div style={{ 
                                                                            fontSize: '0.7rem',
                                                                            color: statusColor,
                                                                            marginTop: '2px',
                                                                            fontWeight: '600'
                                                                        }}>
                                                                            📉 DALEND
                                                                        </div>
                                                                    )}
                                                                    {isUnsold && (
                                                                        <div style={{ 
                                                                            fontSize: '0.7rem',
                                                                            color: '#666',
                                                                            marginTop: '2px',
                                                                            fontWeight: '600'
                                                                        }}>
                                                                            NIET VERKOCHT
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateAuction;

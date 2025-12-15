import './App.css';
import Overview from './pages/VeilingmeesterOverview';
import CreateAuction from './pages/VeilingmeesterCreateAuction';
import KoperOverview from "./pages/AanvoerderKoperOverview";
import AanvoerderCreateProduct from './pages/AanvoerderCreateProduct';
import {Routes, Route} from 'react-router-dom';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

function App() {
    return (
        <div className="App">
            <Navbar />

            <div className="content">
                <Routes>
                    <Route path="/" element={
                        <>
                            <div className="welcome-section">
                                <h2>Welkom bij Flora Veiling</h2>
                                <p>Ontdek de beste bloemen tegen de beste prijzen via ons unieke aflopende veiling
                                    systeem</p>
                            </div>
                            <Overview/>
                        </>
                    }/>
                    <Route path="/create-auction" element={<CreateAuction/>}/>
                    <Route path="/create-product" element={<AanvoerderCreateProduct/>}/>
                    <Route path="/koper-overview" element={<KoperOverview/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/account" element={<div><h1>Welkom, (actor)! (accountinformatie volgt...)</h1></div>}/>
                </Routes>
            </div>
        </div>
    );
}

export default App;

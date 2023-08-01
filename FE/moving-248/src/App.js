import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './routes/Home/Home';
import Login from './routes/Login/Login';
import MoverSignUp from './routes/SignUp/MoverSignUp';
import PartnerSignUp from './routes/SignUp/PartnerSignUp';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 정적 url 사용 */}
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/mover-sign-up' element={<MoverSignUp />} />
                <Route path='/partner-sign-up' element={<PartnerSignUp />} />
                {/* 동적 url 사용 */}
                {/* <Route path='/movie/:id' element={<Detail />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;

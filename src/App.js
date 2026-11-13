import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Courses from "./components/Courses";
import Register from "./components/Register";
import AboutContact from "./components/AboutContact";
import CourtBooking from "./components/CourtBooking";
import Shop from "./components/Shop";
import AdminDashboard from "./components/AdminDashboard";
import MyAccount from "./components/MyAccount";
import Login from "./components/Login";
import Blogs from "./components/Blogs";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about-contact" element={<AboutContact />} />
          <Route path="/court-booking" element={<CourtBooking />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blogs" element={<Blogs />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

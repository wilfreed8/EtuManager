import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ user, onLogout }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar user={user} onLogout={onLogout} />

            <div className="pl-64">
                <Header user={user} />

                <motion.main
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
                >
                    <Outlet />
                </motion.main>
            </div>
        </div>
    );
};

export default MainLayout;

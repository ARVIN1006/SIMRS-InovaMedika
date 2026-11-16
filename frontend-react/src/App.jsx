import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import Patients from './pages/Patients';
import DoctorQueue from './pages/DoctorQueue';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';
import Cashier from './pages/Cashier';
import MasterData from './pages/MasterData';
import { DEMO_ROLES } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedRole = localStorage.getItem('simrs_role');
    const matched = DEMO_ROLES.find((r) => r.role === savedRole);
    return matched || DEMO_ROLES[0]; // Default to Admin for comprehensive overview
  });

  const [currentTab, setCurrentTab] = useState('dashboard');

  useEffect(() => {
    localStorage.setItem('simrs_role', currentUser.role);
    localStorage.setItem('simrs_token', currentUser.token);
  }, [currentUser]);

  const handleSwitchRole = (roleObj) => {
    setCurrentUser(roleObj);
    localStorage.setItem('simrs_role', roleObj.role);
    localStorage.setItem('simrs_token', roleObj.token);

    // Auto navigate to role's primary workplace
    switch (roleObj.role) {
      case 'REGISTRATION':
        setCurrentTab('registration');
        break;
      case 'DOCTOR':
        setCurrentTab('doctor');
        break;
      case 'PHARMACY':
        setCurrentTab('pharmacy');
        break;
      case 'LAB':
        setCurrentTab('lab');
        break;
      case 'CASHIER':
        setCurrentTab('cashier');
        break;
      default:
        setCurrentTab('dashboard');
        break;
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'registration':
        return <Registration />;
      case 'patients':
        return <Patients />;
      case 'doctor':
        return <DoctorQueue />;
      case 'pharmacy':
        return <Pharmacy />;
      case 'lab':
        return <Laboratory />;
      case 'cashier':
        return <Cashier />;
      case 'master':
        return <MasterData />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar currentUser={currentUser} onSwitchRole={handleSwitchRole} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} setTab={setCurrentTab} userRole={currentUser.role} />
        <main className="flex-1 p-6 overflow-y-auto w-full">
          <div className="w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

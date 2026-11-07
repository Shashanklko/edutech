import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import CentralDashboard from '../components/dashboards/CentralDashboard';
import StateDashboard from '../components/dashboards/StateDashboard';
import BoardDashboard from '../components/dashboards/BoardDashboard';
import InstitutionDashboard from '../components/dashboards/InstitutionDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            let url = '/api/stats/overview';
            const uId = (user?.id || user?.authorityCode || user?.username || '').toUpperCase();
            if (user?.state) {
                url += `?state=${encodeURIComponent(user.state)}`;
            } else if (uId.includes('UP')) {
                url += `?state=Uttar%20Pradesh`;
            } else if (uId.includes('DL')) {
                url += `?state=Delhi`;
            } else if (user?.tier === 'board' || ['CBSE', 'UP-BOARD', 'CISCE'].includes(uId)) {
                const bd = uId.includes('UP') ? 'UP-BOARD' : (uId.includes('CISCE') ? 'CISCE' : 'CBSE');
                url += `?board=${encodeURIComponent(bd)}`;
            }
            const res = await axios.get(url);
            setStats(res.data);
        } catch (err) {
            console.error("Failed to load platform stats", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    // Determine user tier & administrative domain
    const uId = (user?.id || user?.authorityCode || user?.username || '').toUpperCase();
    const uTier = user?.tier || (
        ['ADMIN', 'MOE', 'MIN-EDU', 'UGC', 'AICTE'].includes(uId) ? 'central' :
        ['UP-MOE', 'STATE-DL', 'STATE-WB'].includes(uId) || uId.startsWith('STATE-') ? 'state' :
        ['CBSE', 'CISCE', 'UP-BOARD'].includes(uId) || uId.includes('BOARD') ? 'board' :
        (uId.startsWith('UNIV') || uId.startsWith('IIT') ? 'university' : (uId.startsWith('CLG') ? 'college' : 'school'))
    );

    if (loading && !stats) {
        return (
            <div className="py-24 text-center text-slate-400 font-mono text-xs">
                Connecting to EduVera Secure Statutory Depository Node...
            </div>
        );
    }

    // 1. Central Government Portal
    if (uTier === 'central') {
        return <CentralDashboard stats={stats} user={user} onRefresh={fetchStats} />;
    }

    // 2. State Government Portal
    if (uTier === 'state') {
        return <StateDashboard stats={stats} user={user} onRefresh={fetchStats} />;
    }

    // 3. Independent Education Boards Portal (CBSE, CISCE, UP-BOARD, etc.)
    if (uTier === 'board') {
        return <BoardDashboard stats={stats} user={user} onRefresh={fetchStats} />;
    }

    // 4. Educational Institution Portal (School, College, or University)
    return <InstitutionDashboard stats={stats} user={user} onRefresh={fetchStats} />;
};

export default Dashboard;

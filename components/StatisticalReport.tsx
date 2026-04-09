import React from 'react';
import { Assignment, TaskStatus, Department } from '../types';
import { DEPARTMENTS } from '../constants';

interface Props {
  tasks: Assignment[];
}

export const StatisticalReport: React.FC<Props> = ({ tasks }) => {
  const getStats = (deptName: string) => {
    const deptTasks = tasks.filter(t => t.assignedTo === deptName);
    const total = deptTasks.length;
    
    // Completed Logic
    const completed = deptTasks.filter(t => t.status === TaskStatus.COMPLETED);
    const completedOnTime = completed.filter(t => {
        if (!t.deadline || !t.completedDate) return true; // Assume on time if no dates
        return t.completedDate <= t.deadline;
    }).length;
    const completedLate = completed.length - completedOnTime;

    // In Progress Logic
    const inProgress = deptTasks.filter(t => t.status !== TaskStatus.COMPLETED);
    const inProgressOnTime = inProgress.filter(t => {
        if (!t.deadline) return true;
        return new Date(t.deadline) >= new Date();
    }).length;
    // Overdue or explicitly marked as overdue
    const inProgressLate = inProgress.length - inProgressOnTime; 

    return { total, completedCount: completed.length, completedOnTime, completedLate, inProgressCount: inProgress.length, inProgressOnTime, inProgressLate };
  };

  // Calculate Grand Totals
  const totals = DEPARTMENTS.reduce((acc, dept) => {
    const stats = getStats(dept.name);
    return {
        total: acc.total + stats.total,
        compTotal: acc.compTotal + stats.completedCount,
        compOnTime: acc.compOnTime + stats.completedOnTime,
        compLate: acc.compLate + stats.completedLate,
        progTotal: acc.progTotal + stats.inProgressCount,
        progOnTime: acc.progOnTime + stats.inProgressOnTime,
        progLate: acc.progLate + stats.inProgressLate
    };
  }, { total: 0, compTotal: 0, compOnTime: 0, compLate: 0, progTotal: 0, progOnTime: 0, progLate: 0 });

  return (
    <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-8 overflow-x-auto print:shadow-none print:border-none print:p-0">
        <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase text-center">I. Báo cáo rà soát văn bản các cơ quan, đơn vị thực hiện</h3>
        <table className="w-full text-sm text-center border-collapse border border-black">
            <thead>
                <tr className="bg-gray-100 font-bold">
                    <th rowSpan={2} className="border border-black px-2 py-2 w-12">STT</th>
                    <th rowSpan={2} className="border border-black px-4 py-2 text-left">Tên cơ quan, đơn vị</th>
                    <th rowSpan={2} className="border border-black px-2 py-2 w-24">Tổng số văn bản</th>
                    <th colSpan={3} className="border border-black px-2 py-2">Đã hoàn thành</th>
                    <th colSpan={3} className="border border-black px-2 py-2">Đang triển khai</th>
                </tr>
                <tr className="bg-gray-50 font-semibold text-xs">
                    <th className="border border-black px-2 py-1">Tổng</th>
                    <th className="border border-black px-2 py-1">Đúng hạn</th>
                    <th className="border border-black px-2 py-1">Trễ hạn</th>
                    <th className="border border-black px-2 py-1">Tổng</th>
                    <th className="border border-black px-2 py-1">Trong hạn</th>
                    <th className="border border-black px-2 py-1">Trễ hạn</th>
                </tr>
            </thead>
            <tbody>
                {DEPARTMENTS.map((dept, index) => {
                    const stats = getStats(dept.name);
                    return (
                        <tr key={dept.id}>
                            <td className="border border-black px-2 py-2">{index + 1}</td>
                            <td className="border border-black px-4 py-2 text-left font-medium">{dept.name}</td>
                            <td className="border border-black px-2 py-2 font-bold">{stats.total}</td>
                            
                            <td className="border border-black px-2 py-2 bg-green-50">{stats.completedCount}</td>
                            <td className="border border-black px-2 py-2 bg-green-50">{stats.completedOnTime}</td>
                            <td className="border border-black px-2 py-2 bg-green-50 text-red-600">{stats.completedLate > 0 ? stats.completedLate : '-'}</td>
                            
                            <td className="border border-black px-2 py-2 bg-yellow-50">{stats.inProgressCount}</td>
                            <td className="border border-black px-2 py-2 bg-yellow-50">{stats.inProgressOnTime}</td>
                            <td className="border border-black px-2 py-2 bg-yellow-50 text-red-600">{stats.inProgressLate > 0 ? stats.inProgressLate : '-'}</td>
                        </tr>
                    );
                })}
                <tr className="font-bold bg-gray-200">
                    <td colSpan={2} className="border border-black px-4 py-2 text-center uppercase">Tổng cộng</td>
                    <td className="border border-black px-2 py-2">{totals.total}</td>
                    <td className="border border-black px-2 py-2">{totals.compTotal}</td>
                    <td className="border border-black px-2 py-2">{totals.compOnTime}</td>
                    <td className="border border-black px-2 py-2">{totals.compLate}</td>
                    <td className="border border-black px-2 py-2">{totals.progTotal}</td>
                    <td className="border border-black px-2 py-2">{totals.progOnTime}</td>
                    <td className="border border-black px-2 py-2">{totals.progLate}</td>
                </tr>
            </tbody>
        </table>
    </div>
  );
};

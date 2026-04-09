
import React from 'react';
import { 
  Squares2X2Icon, 
  InboxArrowDownIcon, 
  BriefcaseIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronRightIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

interface Props {
  currentView: string;
  onChangeView: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<Props> = ({ currentView, onChangeView, isOpen, onToggle }) => {
  const menuItems = [
    { id: 'dashboard', label: 'TỔNG QUAN HỆ THỐNG', icon: Squares2X2Icon },
    { id: 'reception', label: 'TIẾP NHẬN & THAM MƯU', icon: InboxArrowDownIcon },
    { id: 'tasks', label: 'QUẢN LÝ NHIỆM VỤ', icon: BriefcaseIcon },
    { id: 'reports', label: 'BÁO CÁO THỐNG KÊ', icon: ChartBarIcon },
    { id: 'settings', label: 'CẤU HÌNH HỆ THỐNG', icon: Cog6ToothIcon },
  ];

  return (
    <div className={`h-screen fixed left-0 top-0 flex flex-col z-50 bg-[#d32f2f] shadow-2xl border-r border-white/10 transition-all duration-300 ${isOpen ? 'w-72' : 'w-20'}`}>
      {/* Toggle Button */}
      <div className="absolute -right-3 top-6 bg-white rounded-full shadow-md p-1 cursor-pointer text-gray-600 hover:text-eakar-primary z-50" onClick={onToggle}>
        <Bars3Icon className="w-4 h-4" />
      </div>

      {/* Logo Chữ Ea Kar Cách Điệu */}
      <div className={`p-6 text-center border-b border-white/10 mb-4 ${isOpen ? '' : 'px-2'}`}>
        <div className="flex justify-center mb-3">
            <div className={`bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-yellow-400 ${isOpen ? 'w-16 h-16' : 'w-10 h-10'}`}>
                <div className="text-center leading-none">
                    <p className={`text-[#d32f2f] font-black uppercase ${isOpen ? 'text-[10px]' : 'text-[6px]'}`}>UBND Xã</p>
                    <p className={`text-[#d32f2f] font-black uppercase tracking-tighter ${isOpen ? 'text-sm' : 'text-[8px]'}`}>EA KAR</p>
                </div>
            </div>
        </div>
        {isOpen && (
          <>
            <h1 className="text-white font-bold text-sm tracking-wide leading-tight">VĂN PHÒNG ĐIỀU HÀNH</h1>
            <p className="text-yellow-400 text-[10px] font-bold mt-1 uppercase tracking-widest">Tỉnh Đắk Lắk</p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              title={!isOpen ? item.label : undefined}
              className={`w-full flex items-center ${isOpen ? 'justify-between px-4' : 'justify-center px-0'} py-3.5 rounded-md transition-all group ${
                isActive 
                  ? 'bg-white/20 text-white shadow-inner font-bold' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-400' : 'text-white/50'}`} />
                {isOpen && <span className="text-xs uppercase tracking-wider">{item.label}</span>}
              </div>
              {isOpen && isActive && <ChevronRightIcon className="w-3 h-3 text-yellow-400" />}
            </button>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="p-4 bg-black/10">
        <div className={`flex items-center ${isOpen ? 'gap-3 p-2' : 'justify-center p-0'}`}>
            <UserCircleIcon className="w-8 h-8 text-white/50" />
            {isOpen && (
              <div className="truncate">
                  <p className="text-white text-xs font-bold truncate">Quản trị viên</p>
                  <p className="text-white/50 text-[10px]">Hệ thống trực tuyến</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

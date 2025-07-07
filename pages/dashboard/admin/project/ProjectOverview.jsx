import { IconChartBar } from '@tabler/icons-react';

const ProjectOverview = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <IconChartBar size={32} className="text-blue-500" />
    </div>
    <h2 className="text-2xl font-bold mb-2 text-gray-800">Ikhtisar Admin</h2>
    <p className="text-gray-600 text-center max-w-md">
      Selamat datang di panel admin. Di sini Anda dapat melihat statistik umum, aktivitas terbaru, dan ringkasan performa sistem.
    </p>
  </div>
);

export default ProjectOverview;

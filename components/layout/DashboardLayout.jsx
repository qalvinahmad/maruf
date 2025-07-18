import Head from 'next/head';

const DashboardLayout = ({ children, title = "Dashboard Pembelajaran • Makhrojul Huruf" }) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen font-inter antialiased">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Platform pembelajaran makhrojul huruf interaktif dengan progress tracking" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      
      <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-16 pb-32 space-y-20">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

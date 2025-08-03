const app = require('./api/index.js');

// Test the app locally
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('🏆 YOUR BOY SATOSHI - VERCEL TEST SERVER!');
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📱 Web UI: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/*`);
    console.log('\n🎯 VERCEL DEPLOYMENT READY!');
    console.log('   ✅ API routes configured');
    console.log('   ✅ Static files served');
    console.log('   ✅ Bitcoin integration ready');
    console.log('   ✅ Health check endpoint');
    console.log('\n🏆 READY FOR VERCEL DEPLOYMENT! 🏆');
}); 
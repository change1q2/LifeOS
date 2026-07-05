import { Download, Smartphone, Shield, Zap, FileText, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function DownloadPage() {
  const handleApkDownload = () => {
    const link = document.createElement('a');
    link.href = '/downloads/lifeos.apk';
    link.download = 'lifeos.apk';
    link.click();
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">📱 下载 LifeOS</h1>
        <p className="text-muted-foreground">获取最新版本的移动应用，随时随地管理你的人生</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Android 应用</h3>
          <p className="text-sm text-muted-foreground mb-6">适用于 Android 8.0 及以上版本</p>
          <Button className="w-full" size="lg" onClick={handleApkDownload}>
            <Download className="w-4 h-4 mr-2" />
            下载 APK
          </Button>
          <div className="mt-4 text-xs text-muted-foreground">
            文件大小：约 35 MB
          </div>
          <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
            ✅ APK 已准备就绪，点击下载按钮即可获取
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Web 版本</h3>
          <p className="text-sm text-muted-foreground mb-6">无需安装，直接在浏览器中使用</p>
          <Button className="w-full" variant="outline" size="lg" onClick={() => {
            window.location.href = '/';
          }}>
            打开 Web 版
          </Button>
          <div className="mt-4 text-xs text-muted-foreground">
            支持 Chrome、Safari、Edge 等主流浏览器
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-medium text-sm">安全可靠</h4>
            <p className="text-xs text-muted-foreground mt-1">所有数据本地加密存储，保护你的隐私</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-medium text-sm">快速响应</h4>
            <p className="text-xs text-muted-foreground mt-1">优化的性能体验，流畅的操作感受</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium text-sm">跨平台同步</h4>
            <p className="text-xs text-muted-foreground mt-1">支持多设备数据同步，随时访问</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-200">
        <h3 className="font-semibold mb-3">📖 安装指南</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-200 text-cyan-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
            <span>点击上方按钮下载 APK 文件到你的手机</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-200 text-cyan-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
            <span>打开手机的"文件管理器"，找到下载的 APK 文件</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-200 text-cyan-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
            <span>点击安装，如有提示请允许"未知来源"应用安装</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-200 text-cyan-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
            <span>安装完成后，打开应用即可开始使用</span>
          </li>
        </ol>
      </Card>

      <Card className="p-6 mt-6 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <h3 className="font-semibold mb-3">🔧 自行构建 APK（开发者）</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>如需自行构建 APK，请确保环境已安装以下工具：</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Java JDK 17+</li>
            <li>Android Studio 或 Android SDK</li>
            <li>Node.js 18+</li>
          </ul>
          <p className="mt-3 font-medium text-foreground">构建步骤：</p>
          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono">
            <p>$ cd client</p>
            <p>$ npm run build</p>
            <p>$ npx cap sync</p>
            <p>$ cd android &amp;&amp; .\gradlew assembleDebug</p>
          </div>
          <p className="mt-2">构建完成后，APK 文件位于：</p>
          <p className="text-xs font-mono">android/app/build/outputs/apk/debug/app-debug.apk</p>
        </div>
      </Card>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        <p>版本: 2.0.0 | 更新日期: 2026年7月</p>
        <p className="mt-1">如有问题，请联系我们的支持团队</p>
      </div>
    </div>
  );
}
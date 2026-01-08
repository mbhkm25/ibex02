import { useState } from 'react';
import { 
  Settings,
  Bell,
  Shield,
  DollarSign,
  Globe,
  Mail,
  Lock,
  Save,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { AdminLayout } from './AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

export function AdminSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'محفظتي',
    platformDescription: 'منصة مالية متكاملة',
    supportEmail: 'support@example.com',
    supportPhone: '+966501234567',
    defaultCurrency: 'SAR',
    defaultLanguage: 'ar'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newUserAlerts: true,
    newBusinessAlerts: true,
    paymentAlerts: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireStrongPassword: true
  });

  const [feeSettings, setFeeSettings] = useState({
    transactionFee: 2.5,
    subscriptionFee: 0,
    currencyExchangeFee: 1.5
  });

  const handleSave = (section: string) => {
    toast.success(`تم حفظ إعدادات ${section} بنجاح`);
  };

  return (
    <AdminLayout 
      title="إعدادات المنصة" 
      subtitle="إدارة إعدادات المنصة العامة"
    >
      <div className="space-y-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 rounded-xl bg-gray-100 p-1 h-11">
            <TabsTrigger value="general" className="rounded-lg text-xs font-bold">عامة</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-xs font-bold">الإشعارات</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg text-xs font-bold">الأمان</TabsTrigger>
            <TabsTrigger value="fees" className="rounded-lg text-xs font-bold">الرسوم</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card className="p-5 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-black text-gray-900">الإعدادات العامة</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">اسم المنصة</Label>
                  <Input
                    value={generalSettings.platformName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">وصف المنصة</Label>
                  <Textarea
                    value={generalSettings.platformDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformDescription: e.target.value })}
                    className="rounded-xl border-2 border-gray-200 focus:border-red-400"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-2 block">البريد الإلكتروني للدعم</Label>
                    <Input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                      className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-2 block">رقم هاتف الدعم</Label>
                    <Input
                      value={generalSettings.supportPhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                      className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-2 block">العملة الافتراضية</Label>
                    <Select value={generalSettings.defaultCurrency} onValueChange={(v) => setGeneralSettings({ ...generalSettings, defaultCurrency: v })}>
                      <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                        <SelectItem value="YER">ريال يمني (ر.ي)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-2 block">اللغة الافتراضية</Label>
                    <Select value={generalSettings.defaultLanguage} onValueChange={(v) => setGeneralSettings({ ...generalSettings, defaultLanguage: v })}>
                      <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => handleSave('العامة')}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-5 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-black text-gray-900">إعدادات الإشعارات</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-bold text-gray-900">الإشعارات عبر البريد الإلكتروني</div>
                    <div className="text-xs text-gray-500">إرسال إشعارات عبر البريد الإلكتروني</div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-bold text-gray-900">الإشعارات عبر الرسائل النصية</div>
                    <div className="text-xs text-gray-500">إرسال إشعارات عبر الرسائل النصية</div>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-bold text-gray-900">الإشعارات الفورية</div>
                    <div className="text-xs text-gray-500">إرسال إشعارات فورية للمستخدمين</div>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                  />
                </div>
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="text-sm font-bold text-gray-900 mb-2">تنبيهات المدير</div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="text-sm font-bold text-gray-900">تنبيهات المستخدمين الجدد</div>
                      <div className="text-xs text-gray-500">إشعار عند تسجيل مستخدم جديد</div>
                    </div>
                    <Switch
                      checked={notificationSettings.newUserAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newUserAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="text-sm font-bold text-gray-900">تنبيهات الأعمال الجديدة</div>
                      <div className="text-xs text-gray-500">إشعار عند طلب عمل جديد</div>
                    </div>
                    <Switch
                      checked={notificationSettings.newBusinessAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newBusinessAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="text-sm font-bold text-gray-900">تنبيهات المدفوعات</div>
                      <div className="text-xs text-gray-500">إشعار عند معاملات كبيرة</div>
                    </div>
                    <Switch
                      checked={notificationSettings.paymentAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, paymentAlerts: checked })}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => handleSave('الإشعارات')}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card className="p-5 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-black text-gray-900">إعدادات الأمان</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-bold text-gray-900">المصادقة الثنائية</div>
                    <div className="text-xs text-gray-500">تفعيل المصادقة الثنائية للمديرين</div>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">مهلة انتهاء الجلسة (دقيقة)</Label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    min="5"
                    max="120"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">الحد الأدنى لطول كلمة المرور</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    min="6"
                    max="20"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-bold text-gray-900">طلب كلمة مرور قوية</div>
                    <div className="text-xs text-gray-500">إجبار المستخدمين على استخدام كلمات مرور قوية</div>
                  </div>
                  <Switch
                    checked={securitySettings.requireStrongPassword}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireStrongPassword: checked })}
                  />
                </div>
                <Button
                  onClick={() => handleSave('الأمان')}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Fee Settings */}
          <TabsContent value="fees" className="space-y-4">
            <Card className="p-5 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-black text-gray-900">إعدادات الرسوم</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <strong>ملاحظة:</strong> الرسوم تُحسب كنسبة مئوية من قيمة المعاملة. تأكد من مراجعة القوانين المحلية قبل تحديد الرسوم.
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">رسوم المعاملات (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={feeSettings.transactionFee}
                    onChange={(e) => setFeeSettings({ ...feeSettings, transactionFee: parseFloat(e.target.value) })}
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    min="0"
                    max="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">نسبة مئوية من قيمة كل معاملة</p>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">رسوم الاشتراك (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={feeSettings.subscriptionFee}
                    onChange={(e) => setFeeSettings({ ...feeSettings, subscriptionFee: parseFloat(e.target.value) })}
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    min="0"
                    max="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">نسبة مئوية من قيمة الاشتراك</p>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">رسوم تحويل العملات (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={feeSettings.currencyExchangeFee}
                    onChange={(e) => setFeeSettings({ ...feeSettings, currencyExchangeFee: parseFloat(e.target.value) })}
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    min="0"
                    max="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">نسبة مئوية من قيمة التحويل</p>
                </div>
                <Button
                  onClick={() => handleSave('الرسوم')}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}


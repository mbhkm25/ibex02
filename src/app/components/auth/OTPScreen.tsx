import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';

export function OTPScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '+966 5XXXXXXXX';
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to dashboard after OTP verification
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen p-6 bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl">تأكيد رقم الجوال</h1>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              أدخل الرمز المرسل إلى
            </p>
            <p className="font-medium mt-1" dir="ltr">{phone}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center" dir="ltr">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-14 w-12 rounded-xl text-lg" />
                  <InputOTPSlot index={1} className="h-14 w-12 rounded-xl text-lg" />
                  <InputOTPSlot index={2} className="h-14 w-12 rounded-xl text-lg" />
                  <InputOTPSlot index={3} className="h-14 w-12 rounded-xl text-lg" />
                  <InputOTPSlot index={4} className="h-14 w-12 rounded-xl text-lg" />
                  <InputOTPSlot index={5} className="h-14 w-12 rounded-xl text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                إعادة إرسال الرمز
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl"
              disabled={otp.length < 6}
            >
              تأكيد
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

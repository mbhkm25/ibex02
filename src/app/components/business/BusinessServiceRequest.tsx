/**
 * BusinessServiceRequest Component
 * 
 * Architecture: Multi-step wizard for service request creation
 * 
 * Product Principle: Users choose HOW they work, not WHAT template they want.
 * The system uses businessModel to determine structure, pricing, and features.
 * 
 * Steps:
 * 1. Business Identity (name, contact, address, logo)
 * 2. Business Model Selection (HOW the business works) - FOUNDATIONAL
 * 3. Business Description (contextualized by model)
 * 4. Manager Account Info (phone, email, password)
 * 5. Review & Submit
 * 
 * State Management:
 * - Uses ServiceRequest state machine for status handling
 * - Auto-saves draft to localStorage
 * - Validates before allowing step progression
 * - Prevents submission if form is invalid
 * 
 * UX Principles:
 * - Mobile-first design
 * - Low cognitive load (one step at a time)
 * - Clear progress indicator
 * - Trustworthy, business-grade appearance
 * - NO template selection (templates are backend-driven)
 * - Business Model is the ONLY visible decision
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  Lock, 
  FileText,
  ShoppingCart,
  UtensilsCrossed,
  UserCog,
  Home,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { DashboardLayout } from '../layout/DashboardLayout';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';
import { ServiceRequestFormData, BusinessModel } from '../../types/serviceRequest';
import { getStateConfig, getStatusMessage } from '../../utils/serviceRequestStateMachine';

const STORAGE_KEY = 'serviceRequestDraft';
const MAX_STEPS = 5;

interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    id: 1,
    title: 'هوية العمل',
    description: 'المعلومات الأساسية للعمل',
    icon: <Building2 className="w-5 h-5" />
  },
  {
    id: 2,
    title: 'طريقة العمل',
    description: 'اختر طريقة عملك',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 3,
    title: 'وصف العمل',
    description: 'أخبرنا عن عملك',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 4,
    title: 'حساب المدير',
    description: 'معلومات تسجيل الدخول',
    icon: <Lock className="w-5 h-5" />
  },
  {
    id: 5,
    title: 'مراجعة',
    description: 'تأكد من صحة المعلومات',
    icon: <CheckCircle className="w-5 h-5" />
  }
];

/**
 * Business Model Options
 * 
 * Product Decision: These 4 models cover 95% of business use cases.
 * Each model maps to different backend templates, pricing, and features.
 * Users describe HOW they work, system decides structure.
 */
const BUSINESS_MODELS: {
  value: BusinessModel;
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string;
}[] = [
  {
    value: 'commerce',
    icon: <ShoppingCart className="w-6 h-6" />,
    title: 'أبيع منتجات',
    description: 'متاجر، بقالات، سوبر ماركت، صيدليات، جملة، تجزئة',
    examples: 'متاجر، بقالات، سوبر ماركت، صيدليات، جملة، تجزئة'
  },
  {
    value: 'food',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    title: 'أقدّم طعام',
    description: 'مطاعم، كافيهات، مطابخ، وجبات سريعة',
    examples: 'مطاعم، كافيهات، مطابخ، وجبات سريعة'
  },
  {
    value: 'services',
    icon: <UserCog className="w-6 h-6" />,
    title: 'أقدّم خدمات',
    description: 'مراكز خدمية، عيادات، تدريب، صالات رياضية',
    examples: 'مراكز خدمية، عيادات، تدريب، صالات رياضية'
  },
  {
    value: 'rental',
    icon: <Home className="w-6 h-6" />,
    title: 'أؤجّر أصول',
    description: 'شقق، شاليهات، قاعات، وحدات، إيجار',
    examples: 'شقق، شاليهات، قاعات، وحدات، إيجار'
  }
];

/**
 * Get contextual help text based on business model
 * 
 * Product Decision: Contextualize copy to reduce cognitive load.
 * Each model has different priorities and workflows.
 */
function getContextualHelp(businessModel: BusinessModel | null): {
  descriptionLabel: string;
  descriptionPlaceholder: string;
  descriptionHint: string;
} {
  if (!businessModel) {
    return {
      descriptionLabel: 'وصف العمل',
      descriptionPlaceholder: 'اكتب وصفاً مختصراً عن عملك',
      descriptionHint: '20 حرف على الأقل'
    };
  }

  const contexts: Record<BusinessModel, {
    descriptionLabel: string;
    descriptionPlaceholder: string;
    descriptionHint: string;
  }> = {
    commerce: {
      descriptionLabel: 'وصف المتجر',
      descriptionPlaceholder: 'ما المنتجات التي تبيعها؟ ما هي فئات المنتجات الرئيسية؟',
      descriptionHint: 'ركز على المنتجات والفئات والمخزون'
    },
    food: {
      descriptionLabel: 'وصف المطعم',
      descriptionPlaceholder: 'ما نوع الطعام الذي تقدمه؟ ما هي القائمة الرئيسية؟',
      descriptionHint: 'ركز على نوع الطعام والسرعة والطلبات'
    },
    services: {
      descriptionLabel: 'وصف الخدمة',
      descriptionPlaceholder: 'ما الخدمات التي تقدمها؟ كيف يتم الحجز؟',
      descriptionHint: 'ركز على الخدمات والمواعيد والعملاء'
    },
    rental: {
      descriptionLabel: 'وصف الأصول',
      descriptionPlaceholder: 'ما نوع الأصول التي تؤجرها؟ ما هي مدة الإيجار؟',
      descriptionHint: 'ركز على نوع الأصول والمدة والعقود'
    }
  };

  return contexts[businessModel];
}

export function BusinessServiceRequest() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ServiceRequestFormData>({
    businessName: '',
    contactInfo: '',
    address: '',
    logo: null,
    managerPhone: '',
    email: '',
    password: '',
    description: '',
    businessType: 'both', // Legacy, auto-set based on businessModel
    businessModel: null // Primary decision axis
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceRequestFormData, string>>>({});

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
        if (parsed.logoPreview) {
          setLogoPreview(parsed.logoPreview);
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const saveData = {
      ...formData,
      logoPreview, // Save preview URL, not File object
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, [formData, logoPreview]);

  // Auto-set businessType based on businessModel (for backward compatibility)
  useEffect(() => {
    if (formData.businessModel) {
      if (formData.businessModel === 'commerce' || formData.businessModel === 'rental') {
        setFormData(prev => ({ ...prev, businessType: 'products' }));
      } else if (formData.businessModel === 'services') {
        setFormData(prev => ({ ...prev, businessType: 'services' }));
      } else if (formData.businessModel === 'food') {
        setFormData(prev => ({ ...prev, businessType: 'both' }));
      }
    }
  }, [formData.businessModel]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('الملف يجب أن يكون صورة');
        return;
      }
      
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof ServiceRequestFormData, string>> = {};

    if (step === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = 'اسم العمل مطلوب';
      if (!formData.contactInfo.trim()) newErrors.contactInfo = 'معلومات التواصل مطلوبة';
      if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب';
      if (!formData.logo) newErrors.logo = 'لوقو العمل مطلوب';
    } else if (step === 2) {
      if (!formData.businessModel) {
        newErrors.businessModel = 'يجب اختيار طريقة العمل';
      }
    } else if (step === 3) {
      if (!formData.description.trim()) newErrors.description = 'وصف العمل مطلوب';
      if (formData.description.trim().length < 20) {
        newErrors.description = 'الوصف يجب أن يكون 20 حرف على الأقل';
      }
    } else if (step === 4) {
      if (!formData.managerPhone.trim()) newErrors.managerPhone = 'رقم الجوال مطلوب';
      if (formData.managerPhone.trim().length < 10) {
        newErrors.managerPhone = 'رقم الجوال غير صحيح';
      }
      if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
      if (formData.password.length < 8) {
        newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'البريد الإلكتروني غير صحيح';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < MAX_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('يرجى إكمال جميع الحقول المطلوبة');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      toast.error('يرجى إكمال جميع الحقول المطلوبة');
      setCurrentStep(1); // Go back to first step with errors
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessDialog(true);
      localStorage.removeItem(STORAGE_KEY); // Clear draft
      toast.success('تم إرسال طلبك بنجاح! سيتم مراجعته من قبل المسؤول');
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    navigate('/dashboard');
  };

  const progress = (currentStep / MAX_STEPS) * 100;
  const contextualHelp = getContextualHelp(formData.businessModel);

  return (
    <DashboardLayout 
      title="طلب خدمة إدارة العملاء" 
      subtitle="أكمل البيانات التالية لطلب خدمة إدارة العملاء"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Indicator */}
        <Card className="p-4 bg-white border-2 border-gray-200 rounded-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-2">
              <span>الخطوة {currentStep} من {MAX_STEPS}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-1 flex-1 ${
                    step.id === currentStep
                      ? 'text-gray-900'
                      : step.id < currentStep
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                      step.id === currentStep
                        ? 'bg-gray-900 text-white border-gray-900'
                        : step.id < currentStep
                        ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-center hidden sm:block">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="p-6 sm:p-10 border-2 border-gray-200 rounded-2xl bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Business Identity */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    {STEPS[0].title}
                  </h3>
                  <p className="text-sm text-gray-500">{STEPS[0].description}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-bold text-gray-900">
                      اسم العمل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => {
                        setFormData({ ...formData, businessName: e.target.value });
                        if (errors.businessName) setErrors({ ...errors, businessName: undefined });
                      }}
                      className={`h-12 rounded-xl border-2 ${
                        errors.businessName ? 'border-red-300' : 'border-gray-200'
                      } focus:border-gray-900`}
                      placeholder="أدخل اسم العمل"
                      required
                    />
                    {errors.businessName && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactInfo" className="text-sm font-bold text-gray-900">
                      معلومات التواصل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactInfo"
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => {
                        setFormData({ ...formData, contactInfo: e.target.value });
                        if (errors.contactInfo) setErrors({ ...errors, contactInfo: undefined });
                      }}
                      className={`h-12 rounded-xl border-2 ${
                        errors.contactInfo ? 'border-red-300' : 'border-gray-200'
                      } focus:border-gray-900`}
                      placeholder="رقم الهاتف، الموقع الإلكتروني، إلخ"
                      required
                    />
                    {errors.contactInfo && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.contactInfo}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-bold text-gray-900">
                      العنوان <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (errors.address) setErrors({ ...errors, address: undefined });
                      }}
                      className={`h-12 rounded-xl border-2 ${
                        errors.address ? 'border-red-300' : 'border-gray-200'
                      } focus:border-gray-900`}
                      placeholder="العنوان الكامل للعمل"
                      required
                    />
                    {errors.address && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo" className="text-sm font-bold text-gray-900">
                      لوقو العمل <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className={`h-12 rounded-xl border-2 ${
                            errors.logo ? 'border-red-300' : 'border-gray-200'
                          } focus:border-gray-900`}
                          required
                        />
                      </div>
                      {logoPreview && (
                        <div className="relative w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden shrink-0">
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 left-1 h-6 w-6 rounded-lg bg-white/90 hover:bg-white"
                            onClick={() => {
                              setLogoPreview(null);
                              setFormData({ ...formData, logo: null });
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {errors.logo && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.logo}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">الحد الأقصى 5 ميجابايت (JPG, PNG)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Model Selection - FOUNDATIONAL */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                    {STEPS[1].title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    اختر طريقة عملك. النظام سيتولى باقي الإعدادات تلقائياً.
                  </p>
                </div>

                <div className="space-y-3">
                  {BUSINESS_MODELS.map((model) => (
                    <Card
                      key={model.value}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.businessModel === model.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => {
                        setFormData({ ...formData, businessModel: model.value });
                        if (errors.businessModel) setErrors({ ...errors, businessModel: undefined });
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            formData.businessModel === model.value
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {model.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-black text-gray-900">{model.title}</h4>
                            {formData.businessModel === model.value && (
                              <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{model.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {errors.businessModel && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.businessModel}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-900 font-bold mb-1">💡 ملاحظة</p>
                  <p className="text-xs text-blue-700">
                    بناءً على اختيارك، سيقوم النظام تلقائياً بإعداد الأدوات والخصائص المناسبة لعملك.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Business Description (Contextualized) */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    {STEPS[2].title}
                  </h3>
                  <p className="text-sm text-gray-500">{contextualHelp.descriptionHint}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold text-gray-900">
                      {contextualHelp.descriptionLabel} <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: undefined });
                      }}
                      className={`min-h-32 rounded-xl border-2 ${
                        errors.description ? 'border-red-300' : 'border-gray-200'
                      } focus:border-gray-900`}
                      placeholder={contextualHelp.descriptionPlaceholder}
                      required
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.description.length} / 20 حرف (الحد الأدنى)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Manager Account Info */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    {STEPS[3].title}
                  </h3>
                  <p className="text-sm text-gray-500">{STEPS[3].description}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="managerPhone" className="text-sm font-bold text-gray-900">
                      جوال التواصل مع مدير العمل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="managerPhone"
                      type="tel"
                      dir="ltr"
                      value={formData.managerPhone}
                      onChange={(e) => {
                        setFormData({ ...formData, managerPhone: e.target.value });
                        if (errors.managerPhone) setErrors({ ...errors, managerPhone: undefined });
                      }}
                      className={`h-12 rounded-xl border-2 ${
                        errors.managerPhone ? 'border-red-300' : 'border-gray-200'
                      } focus:border-gray-900`}
                      placeholder="+966 5XXXXXXXX"
                      required
                    />
                    {errors.managerPhone && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.managerPhone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-gray-900">
                      البريد الإلكتروني <span className="text-gray-400 text-xs">(اختياري)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      dir="ltr"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`h-12 rounded-xl border-2 ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      } focus:border-gray-900`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-bold text-gray-900">
                      كلمة المرور <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      className={`h-12 rounded-xl border-2 ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      } focus:border-gray-900`}
                      placeholder="كلمة مرور قوية (8 أحرف على الأقل)"
                      required
                      minLength={8}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.password.length} / 8 أحرف (الحد الأدنى)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    {STEPS[4].title}
                  </h3>
                  <p className="text-sm text-gray-500">{STEPS[4].description}</p>
                </div>

                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold text-gray-500 mb-1 block">اسم العمل</Label>
                      <p className="text-sm font-bold text-gray-900">{formData.businessName || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-500 mb-1 block">معلومات التواصل</Label>
                      <p className="text-sm font-bold text-gray-900">{formData.contactInfo || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-500 mb-1 block">العنوان</Label>
                      <p className="text-sm font-bold text-gray-900">{formData.address || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-500 mb-1 block">طريقة العمل</Label>
                      <p className="text-sm font-bold text-gray-900">
                        {formData.businessModel 
                          ? BUSINESS_MODELS.find(m => m.value === formData.businessModel)?.title 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-500 mb-1 block">جوال المدير</Label>
                      <p className="text-sm font-bold text-gray-900">{formData.managerPhone || '-'}</p>
                    </div>
                    {formData.email && (
                      <div>
                        <Label className="text-xs font-bold text-gray-500 mb-1 block">البريد الإلكتروني</Label>
                        <p className="text-sm font-bold text-gray-900">{formData.email}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-gray-500 mb-1 block">الوصف</Label>
                    <p className="text-sm text-gray-700 p-3 bg-white rounded-lg border border-gray-200">
                      {formData.description || '-'}
                    </p>
                  </div>
                  {logoPreview && (
                    <div>
                      <Label className="text-xs font-bold text-gray-500 mb-1 block">لوقو العمل</Label>
                      <div className="w-20 h-20 rounded-lg border-2 border-gray-200 overflow-hidden">
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="rounded-xl h-12 border-2 border-gray-300 font-bold flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </Button>
              )}
              <div className="flex-1" />
              {currentStep < MAX_STEPS ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 px-6 font-black flex items-center gap-2"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 px-6 font-black flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-xl font-black">
              تم إرسال طلبك بنجاح
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              سيتم مراجعة طلبك من قبل المسؤول. سيتم إشعارك عند الموافقة على الطلب.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleCloseSuccess}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-black"
            >
              العودة للوحة التحكم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

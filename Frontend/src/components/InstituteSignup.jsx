import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import show from '../assets/img/show.png';
import hide from '../assets/img/hide.png';
import { checkEmailUsed, sendOtp, verifyOtp } from '../routes/authRoutes';
import { instituteSignup } from '../routes/insRoutes';

const InstituteSignUp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    insName: '',
    insCode: '',
    insMob: '',
    insMail: '',
    insAddress: '',
    adName: '',
    adMob: '',
    adMail: '',
    photo: null,
    pass: '',
    CNFpass: '',
    insOTP: '',
    adOTP: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [passMatch, setPassMatch] = useState(null);
  const [insOTPSent, setInsOTPSent] = useState(false);
  const [adOTPSent, setAdOTPSent] = useState(false);
  const [insVerified, setInsVerified] = useState(false);
  const [adVerified, setAdVerified] = useState(false);
  const [insResendTime, setInsResendTime] = useState(0);
  const [adResendTime, setAdResendTime] = useState(0);
  const [showPassword, setShowPassword] = useState({
    pass: false,
    CNFpass: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData({ ...formData, [name]: files[0] });
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Password validation
    if (name === 'pass' || name === 'CNFpass') {
      const pass = name === 'pass' ? value : formData.pass;
      const CNFpass = name === 'CNFpass' ? value : formData.CNFpass;
      
      if (CNFpass && pass) {
        setPassMatch(pass === CNFpass);
      } else {
        setPassMatch(null);
      }
    }
  };

  const nextStep = async (e) => {
    e.preventDefault();
    const { insName, insCode, insMob, insMail, insAddress, adName, adMob, adMail } = formData;
    
    if (!insName || !insCode || !insMob || !insMail || !insAddress || !adName || !adMail || !adMob) {
      toast.error('Please fill all fields');
      return;
    }
    
    if (insMail === adMail) {
      toast.error('Institute Email and Admin Email should be different!');
      return;
    }
    
    if (insMob === adMob) {
      toast.error('Institute Mobile and Admin Mobile should be different!');
      return;
    }
    const response1 = await checkEmailUsed(insMail);
    const response2 = await checkEmailUsed(adMail);
    console.log(response1, response2);
    if(response1.success) return toast.error("institute email is in used!");
    if(response2.success) return toast.error("admin email is in used!");
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
    setInsOTPSent(false);
    setAdOTPSent(false);
    setInsResendTime(0);
    setAdResendTime(0);
    setInsVerified(false);
    setAdVerified(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const sendOTP1 = async () => {
    setInsOTPSent(true);
    setInsResendTime(59);
    
    const timer = setInterval(() => {
      setInsResendTime(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const res = await sendOtp(formData.insMail);
    if(res.success) toast.success(res.message);
    else toast.error(res.message);
  };

  const sendOTP2 = async() => {
    setAdOTPSent(true);
    setAdResendTime(59);

    const timer = setInterval(() => {
      setAdResendTime(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const res = await sendOtp(formData.adMail);
    if(res.success) toast.success(res.message);
    else toast.error(res.message);
  };

  const validateInsOTP = async() => {
    const res = await verifyOtp(formData.insMail, formData.insOTP)
    if(res.success) {
      toast.success(res.message);
      setInsVerified(true);
      setInsResendTime(0);
    }
    else toast.error(res.message);
  };

  const validateAdOTP = async() => {
    const res = await verifyOtp(formData.adMail, formData.adOTP)
    if(res.success){ 
      toast.success(res.message);
      setAdVerified(true);
      setAdResendTime(0);
    }
    else toast.error(res.message);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    const { photo, pass, CNFpass, insOTP, adOTP } = formData;
    
    if (!photo || !pass || !CNFpass) {
      toast.error('Please fill in all the required fields.');
      return;
    }
    
    if (pass !== CNFpass) {
      toast.error('Passwords do not match.');
      return;
    }
    
    if (!insOTP || !adOTP) {
      toast.error('Please verify your mail!');
      return;
    }
    
    if (!insVerified || !adVerified) {
      toast.error('Please verify your emails before signing up.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await toast.promise(
        instituteSignup(formData),
        {
          pending: 'Signing up...',
          success: 'Signup successful! Redirecting to login...',
          error: {
            render({ data }) {
              return data?.message || 'Signup failed!';
            }
          }
        }
      );

      if (result.success) {
        setTimeout(() => {
          navigate('/instituteLogin');
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };  

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-amber-100 to-orange-200">
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl animate-[slideIn_1s]">
          <h2 className="text-2xl font-bold mb-6 text-center">Institute Sign Up</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            <div className={`step ${currentStep === 1 ? 'block' : 'hidden'}`}>
              <div className="mb-4">
                <label htmlFor="insName" className="block mb-2 font-medium">Institute Name:</label>
                <input
                  type="text"
                  name="insName"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  value={formData.insName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="insCode" className="block mb-2 font-medium">Institute Code:</label>
                <input
                  type="text"
                  name="insCode"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  value={formData.insCode}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="insMob" className="block mb-2 font-medium">Institute Contact Number:</label>
                <input
                  type="text"
                  name="insMob"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  value={formData.insMob}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="insMail" className="block mb-2 font-medium">Institute Email ID:</label>
                <input
                  type="email"
                  name="insMail"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  value={formData.insMail}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="insAddress" className="block mb-2 font-medium">Institute Address:</label>
                <input
                  type="text"
                  name="insAddress"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  value={formData.insAddress}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="adName" className="block mb-2 font-medium">Administrator Name:</label>
                <input
                  type="text"
                  name="adName"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  value={formData.adName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="adMob" className="block mb-2 font-medium">Administrator Mobile Number:</label>
                <input
                  type="text"
                  name="adMob"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  value={formData.adMob}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="adMail" className="block mb-2 font-medium">Administrator Email ID:</label>
                <input
                  type="email"
                  name="adMail"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  value={formData.adMail}
                  onChange={handleChange}
                />
              </div>
              
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition"
              >
                Next
              </button>
            </div>
            
            {/* Step 2 */}
            <div className={`step ${currentStep === 2 ? 'block' : 'hidden'}`}>
              {previewImage && (
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-w-[200px] mb-4"
                />
              )}
              
              <div className="mb-4">
                <label htmlFor="photo" className="block mb-2 font-medium">Passport Size Photo:</label>
                <input
                  type="file"
                  name="photo"
                  accept="image/jpeg"
                  className="w-full p-2 border border-gray-300 rounded"
                  title="Upload Profile Picture"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="pass" className="block mb-2 font-medium">Create Password:</label>
                <div className="flex items-center border-2 border-gray-800 rounded p-1 mb-1">
                  <input
                    type={showPassword.pass ? "text" : "password"}
                    name="pass"
                    className="flex-grow p-1 outline-none"
                    placeholder="Password"
                    required
                    value={formData.pass}
                    onChange={handleChange}
                  />
                  <img
                    src={showPassword.pass ? hide : show}
                    width="23"
                    className="cursor-pointer"
                    onClick={() => togglePasswordVisibility('pass')}
                    alt={showPassword.pass ? "Hide password" : "Show password"}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="CNFpass" className="block mb-2 font-medium">Confirm Password:</label>
                <div className="flex items-center border-2 border-gray-800 rounded p-1 mb-1">
                  <input
                    type={showPassword.CNFpass ? "text" : "password"}
                    name="CNFpass"
                    className="flex-grow p-1 outline-none"
                    placeholder="Confirm Password"
                    required
                    value={formData.CNFpass}
                    onChange={handleChange}
                  />
                  <img
                    src={showPassword.CNFpass ? hide : show}
                    width="23"
                    className="cursor-pointer"
                    onClick={() => togglePasswordVisibility('CNFpass')}
                    alt={showPassword.CNFpass ? "Hide password" : "Show password"}
                  />
                </div>
                {passMatch !== null && (
                  <span 
                    className={`text-sm ${passMatch ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {passMatch ? '* Password match.' : '* Passwords do not match.'}
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="insMailverify" className="block mb-2 font-medium">Verify your mail:</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    className="flex-grow p-2 border border-gray-300 rounded"
                    readOnly
                    value={formData.insMail}
                  />
                  <button
                    type="button"
                    className="w-1/4 bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition disabled:bg-gray-400"
                    onClick={sendOTP1}
                    disabled={insResendTime > 0 || insVerified}
                  >
                    {insResendTime > 0 ? `Resend in 0:${insResendTime < 10 ? '0' : ''}${insResendTime}` : 'Send OTP'}
                  </button>
                </div>
                
                {insOTPSent && (
                  <>
                    <label htmlFor="insOTP" className="block mb-2 font-medium">Enter OTP:</label>
                    <div className="flex gap-2 mb-6">
                      <input
                        type="text"
                        name="insOTP"
                        className="flex-grow p-2 border border-gray-300 rounded"
                        value={formData.insOTP}
                        onChange={handleChange}
                        readOnly={insVerified}
                      />
                      <button
                        type="button"
                        className={`w-1/4 text-white py-2 rounded transition ${insVerified ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                        onClick={validateInsOTP}
                        disabled={insVerified}
                      >
                        {insVerified ? 'Verified' : 'Verify'}
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    className="flex-grow p-2 border border-gray-300 rounded"
                    readOnly
                    value={formData.adMail}
                  />
                  <button
                    type="button"
                    className="w-1/4 bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition disabled:bg-gray-400"
                    onClick={sendOTP2}
                    disabled={adResendTime > 0 || adVerified}
                  >
                    {adResendTime > 0 ? `Resend in 0:${adResendTime < 10 ? '0' : ''}${adResendTime}` : 'Send OTP'}
                  </button>
                </div>
                
                {adOTPSent && (
                  <>
                    <label htmlFor="adOTP" className="block mb-2 font-medium">Enter OTP:</label>
                    <div className="flex gap-2 mb-6">
                      <input
                        type="text"
                        name="adOTP"
                        className="flex-grow p-2 border border-gray-300 rounded"
                        value={formData.adOTP}
                        onChange={handleChange}
                        readOnly={adVerified}
                      />
                      <button
                        type="button"
                        className={`w-1/4 text-white py-2 rounded transition ${adVerified ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                        onClick={validateAdOTP}
                        disabled={adVerified}
                      >
                        {adVerified ? 'Verified' : 'Verify'}
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition disabled:bg-gray-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default InstituteSignUp;
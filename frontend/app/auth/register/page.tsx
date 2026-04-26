"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, X } from "lucide-react";
import { authApi } from "@/app/lib/api";

interface RegisterFormProps {
  onSuccess?: () => void;
  onNavigate?: (view: "login" | "forgot") => void;
  onClose?: () => void;
}

export function RegisterForm({ onSuccess, onNavigate, onClose }: RegisterFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", phone: "", password: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Nhập họ";
    if (!form.lastName.trim()) e.lastName = "Nhập tên";
    if (!form.username.trim() || form.username.length < 4) e.username = "Username tối thiểu 4 ký tự";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email không hợp lệ";
    if (!form.phone.match(/^(0[3|5|7|8|9])+([0-9]{8})$/)) e.phone = "Số điện thoại không hợp lệ";
    if (form.password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Mật khẩu không khớp";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await authApi.signUp({
        username: form.username,
        password: form.password,
        email: form.email,
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName,
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else router.push("/auth/login");
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const f = (field: string, val: string) => {
    setForm((p) => ({ ...p, [field]: val }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  if (success) return (
    <div className="text-center bg-white rounded-2xl shadow-xl px-10 py-12 max-w-sm w-full">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={32} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-serif text-gray-800 mb-2">Đăng ký thành công!</h2>
      <p className="text-sm text-gray-500">Đang chuyển đến trang đăng nhập...</p>
    </div>
  );

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10 relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition" aria-label="Đóng">
          <X size={20} />
        </button>
      )}

      <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">Witchy Bakery</p>
      <h1 className="text-3xl font-serif text-gray-800 mb-2">Tạo tài khoản mới.</h1>
      <p className="text-sm text-gray-500 mb-6">
        Đã có tài khoản?{" "}
        {onNavigate
          ? <button onClick={() => onNavigate("login")} className="text-[#c8a46b] hover:underline font-medium">Đăng nhập</button>
          : <Link href="/auth/login" className="text-[#c8a46b] hover:underline font-medium">Đăng nhập</Link>
        }
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[{ field: "firstName", label: "Họ", placeholder: "Nguyễn" }, { field: "lastName", label: "Tên", placeholder: "An" }].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <div className={`flex items-center border rounded-xl px-3 py-2.5 transition ${errors[field] ? "border-red-300" : "border-gray-200 focus-within:border-[#C8A96A]"}`}>
                <User size={14} className="text-[#c8a46b] mr-2 shrink-0" />
                <input type="text" placeholder={placeholder} value={(form as Record<string, string>)[field]}
                  onChange={(e) => f(field, e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400" />
              </div>
              {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
            </div>
          ))}
        </div>

        {[
          { field: "username", label: "Tên đăng nhập", type: "text", placeholder: "vd: nguyenan123", icon: <User size={15} /> },
          { field: "email", label: "Email", type: "email", placeholder: "email@example.com", icon: <Mail size={15} /> },
          { field: "phone", label: "Số điện thoại", type: "tel", placeholder: "0912345678", icon: <Phone size={15} /> },
        ].map(({ field, label, type, placeholder, icon }) => (
          <div key={field}>
            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
            <div className={`flex items-center border rounded-xl px-4 py-2.5 transition ${errors[field] ? "border-red-300" : "border-gray-200 focus-within:border-[#C8A96A]"}`}>
              <span className="text-[#c8a46b] mr-3">{icon}</span>
              <input type={type} placeholder={placeholder} value={(form as Record<string, string>)[field]}
                onChange={(e) => f(field, e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400" />
            </div>
            {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
          </div>
        ))}

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Mật khẩu</label>
          <div className={`flex items-center border rounded-xl px-4 py-2.5 transition ${errors.password ? "border-red-300" : "border-gray-200 focus-within:border-[#C8A96A]"}`}>
            <Lock size={15} className="text-[#c8a46b] mr-3 shrink-0" />
            <input type={showPw ? "text" : "password"} placeholder="Tối thiểu 6 ký tự" value={form.password}
              onChange={(e) => f("password", e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 ml-2">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Xác nhận mật khẩu</label>
          <div className={`flex items-center border rounded-xl px-4 py-2.5 transition ${errors.confirmPassword ? "border-red-300" : "border-gray-200 focus-within:border-[#C8A96A]"}`}>
            <Lock size={15} className="text-[#c8a46b] mr-3 shrink-0" />
            <input type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPassword}
              onChange={(e) => f("confirmPassword", e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400" />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[#1c1a17] text-white py-3.5 rounded-xl font-semibold tracking-wide hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang đăng ký...</> : "TẠO TÀI KHOẢN"}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f3efe9] flex items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  );
}
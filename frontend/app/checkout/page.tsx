"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, MapPin, Phone, User, CreditCard,
  Truck, Wallet, Building2, CheckCircle2, Plus,
  AlertCircle, Trash2, Loader2, Tag, X, Check,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { orderApi, paymentApi, addressApi, voucherApi, formatPrice, type Address, type VoucherApplyResult } from "@/app/lib/api";
import Image from "next/image";

const SHIPPING_FEE = 30000;
const SHIPPING_THRESHOLD = 500000;
type PaymentMethod = "cod" | "momo" | "vnpay";

const PLACEHOLDERS = ["/cake.jpg", "/cake1.jpg", "/cake2.jpg", "/cake3.jpg"];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, openLoginModal } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses]           = useState<Address[]>([]);
  const [selectedAddressId, setSelectedId]  = useState<string>("");
  const [paymentMethod, setPaymentMethod]   = useState<PaymentMethod>("cod");
  const [placing, setPlacing]               = useState(false);
  const [placed, setPlaced]                 = useState(false);
  const [orderId, setOrderId]               = useState("");
  const [error, setError]                   = useState("");
  const [loadingAddr, setLoadingAddr]       = useState(true);

  // form thêm địa chỉ
  const [showForm, setShowForm]   = useState(false);
  const [addrForm, setAddrForm]   = useState({ receiverName: "", phone: "", address: "", isDefault: false });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});
  const [savingAddr, setSavingAddr] = useState(false);

  // Voucher states
  const [voucherCode, setVoucherCode]           = useState("");
  const [voucherResult, setVoucherResult]       = useState<VoucherApplyResult | null>(null);
  const [voucherError, setVoucherError]         = useState("");
  const [applyingVoucher, setApplyingVoucher]   = useState(false);

  const shippingFee   = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discountAmt   = voucherResult?.discountAmount ?? 0;
  const finalTotal    = totalPrice + shippingFee - discountAmt;

  // redirect nếu chưa login hoặc giỏ trống
  // Không redirect khi đã đặt hàng thành công (placed=true) để màn hình success hiện được
  useEffect(() => {
    if (placed) return;
    if (!user) { openLoginModal(); return; }
    if (items.length === 0) { router.push("/cart"); return; }
  }, [user, items, router, placed]);

  // Load địa chỉ từ DB
  useEffect(() => {
    if (!user) return;
    setLoadingAddr(true);
    addressApi.getAll()
      .then((list) => {
        setAddresses(list);
        const def = list.find(a => a.isDefault) || list[0];
        if (def) setSelectedId(def._id);
        if (list.length === 0) setShowForm(true);
      })
      .catch(() => setShowForm(true))
      .finally(() => setLoadingAddr(false));
  }, [user]);

  // Lưu địa chỉ mới vào DB
  const handleSaveAddress = async () => {
    const e: Record<string, string> = {};
    if (!addrForm.receiverName.trim()) e.receiverName = "Nhập tên người nhận";
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(addrForm.phone)) e.phone = "Số điện thoại không hợp lệ";
    if (!addrForm.address.trim()) e.address = "Nhập địa chỉ giao hàng";
    if (Object.keys(e).length > 0) { setAddrErrors(e); return; }

    setSavingAddr(true);
    try {
      const saved = await addressApi.create(addrForm);
      setAddresses(prev => addrForm.isDefault
        ? [saved, ...prev.map(a => ({ ...a, isDefault: false }))]
        : [...prev, saved]);
      setSelectedId(saved._id);
      setShowForm(false);
      setAddrForm({ receiverName: "", phone: "", address: "", isDefault: false });
      setAddrErrors({});
    } catch (err: unknown) {
      setAddrErrors({ address: err instanceof Error ? err.message : "Lỗi lưu địa chỉ" });
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    await addressApi.remove(id).catch(() => {});
    const updated = addresses.filter(a => a._id !== id);
    setAddresses(updated);
    if (selectedAddressId === id) setSelectedId(updated[0]?._id || "");
    if (updated.length === 0) setShowForm(true);
  };

  // ── VOUCHER ────────────────────────────────────────────────────────────────
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) { setVoucherError("Vui lòng nhập mã giảm giá"); return; }
    setVoucherError("");
    setApplyingVoucher(true);
    try {
      const result = await voucherApi.apply({ code: voucherCode.trim(), orderTotal: totalPrice });
      setVoucherResult(result);
      setVoucherError("");
    } catch (err: unknown) {
      setVoucherResult(null);
      setVoucherError(err instanceof Error ? err.message : "Mã giảm giá không hợp lệ");
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherResult(null);
    setVoucherCode("");
    setVoucherError("");
  };

  // ── ĐẶT HÀNG ──────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setError("");
    if (!selectedAddressId) { setError("Vui lòng chọn địa chỉ giao hàng"); return; }
    setPlacing(true);
    try {
      // Bước 1: tạo order
      const { orderId: newOrderId } = await orderApi.createFromCart({
        addressId: selectedAddressId,
        paymentMethod,
        voucherCode: voucherResult?.voucher.code,
      });
      setOrderId(newOrderId);

      // Bước 2: xử lý theo phương thức thanh toán
      if (paymentMethod === "vnpay") {
        const { payUrl } = await paymentApi.createVNPay(newOrderId);
        window.location.href = payUrl;
        return;
      }

      if (paymentMethod === "momo") {
        const data = await paymentApi.createMomo(newOrderId);
        // MoMo trả về payUrl hoặc deeplink
        const url = (data as { payUrl?: string; deeplink?: string }).payUrl
          || (data as { payUrl?: string; deeplink?: string }).deeplink;
        if (url) { window.location.href = url; return; }
        throw new Error("Không lấy được link MoMo");
      }

      // COD: ghi payment record
      await paymentApi.createCOD(newOrderId).catch(() => {}); // non-blocking
      await clearCart();
      setPlaced(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setPlacing(false);
    }
  };

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (placed) return (
    <main className="min-h-screen flex items-center justify-center px-6 page-fade" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          Đặt hàng thành công!
        </h1>
        <p className="text-sm text-gray-500 mb-1">Mã đơn hàng: <span className="font-mono font-semibold text-gray-700">#{orderId.slice(-8).toUpperCase()}</span></p>
        <p className="text-gray-400 text-sm mb-8">Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất!</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold">Xem đơn hàng</Link>
          <Link href="/products" className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#C8A96A] hover:text-[#C8A96A] transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </main>
  );

  return (
    <main className="w-full bg-gray-100 page-fade">
      <div className="bg-[#1c1d21]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#A79F91]" style={{ fontFamily: "var(--font-heading)" }}>
              Thanh toán
            </h1>
            <p className="text-sm text-[#A79F91] mt-0.5">
              {items.length} sản phẩm
            </p>
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-sm text-[#C8A96A] hover:underline font-medium"
          >
            <ChevronLeft size={13} /> Quay lại giỏ hàng
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Địa chỉ giao hàng */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <MapPin size={16} className="text-[#C8A96A]" /> Địa chỉ giao hàng
                </h2>
                <button onClick={() => setShowForm(!showForm)}
                  className="text-xs text-[#C8A96A] font-medium flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Thêm địa chỉ mới
                </button>
              </div>

              {loadingAddr ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                  <Loader2 size={14} className="animate-spin" /> Đang tải địa chỉ...
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr._id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddressId === addr._id ? "border-[#C8A96A] bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="address" value={addr._id} checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedId(addr._id)} className="mt-1 accent-[#C8A96A]" />
                      <div className="flex-1 text-sm">
                        <p className="font-semibold text-gray-800">{addr.receiverName}
                          {addr.isDefault && <span className="ml-2 text-xs text-[#C8A96A] font-medium bg-amber-50 px-1.5 py-0.5 rounded-full border border-[#C8A96A]/20">Mặc định</span>}
                        </p>
                        <p className="text-gray-500 mt-0.5">{addr.phone}</p>
                        <p className="text-gray-500">{addr.address}</p>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); handleDeleteAddress(addr._id); }}
                        className="text-red-500 mt-0.5">
                        <Trash2 size={14} />
                      </button>
                    </label>
                  ))}
                </div>
              )}

              {/* Form thêm địa chỉ */}
              {showForm && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-3 mt-4">
                  <p className="text-sm font-semibold text-gray-700">Địa chỉ giao hàng mới</p>
                  {[
                    { key: "receiverName", label: "Tên người nhận", icon: <User size={14} />, placeholder: "Nguyễn Văn A" },
                    { key: "phone", label: "Số điện thoại", icon: <Phone size={14} />, placeholder: "0912345678" },
                    { key: "address", label: "Địa chỉ chi tiết", icon: <MapPin size={14} />, placeholder: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" },
                  ].map(({ key, label, icon, placeholder }) => (
                    <div key={key}>
                      <div className={`flex items-center border rounded-xl px-3 py-2.5 transition ${addrErrors[key] ? "border-red-300" : "border-gray-200 focus-within:border-[#C8A96A]"}`}>
                        <span className="text-[#C8A96A] mr-2 shrink-0">{icon}</span>
                        <input type="text" placeholder={placeholder}
                          value={(addrForm as Record<string, string>)[key]}
                          onChange={(e) => { setAddrForm(p => ({ ...p, [key]: e.target.value })); setAddrErrors(p => ({ ...p, [key]: "" })); }}
                          className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400" />
                      </div>
                      {addrErrors[key] && <p className="text-red-500 text-xs mt-1">{addrErrors[key]}</p>}
                    </div>
                  ))}
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={addrForm.isDefault}
                      onChange={(e) => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                      className="accent-[#C8A96A]" />
                    Đặt làm địa chỉ mặc định
                  </label>
                  <div className="flex gap-2">
                    <button onClick={handleSaveAddress} disabled={savingAddr}
                      className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                      {savingAddr ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</> : "Lưu địa chỉ"}
                    </button>
                    {addresses.length > 0 && (
                      <button onClick={() => { setShowForm(false); setAddrErrors({}); }}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-red-600 hover:border-red-300 hover:bg-red-50">
                        Huỷ
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-[#C8A96A]" /> Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {([
                  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: <Truck size={18} />, desc: "Trả tiền mặt khi nhận hàng" },
                  { id: "momo", label: "Ví MoMo", icon: <Wallet size={18} />, desc: "Quét QR hoặc thanh toán qua app MoMo" },
                  { id: "vnpay", label: "VNPay", icon: <Building2 size={18} />, desc: "Thanh toán online qua cổng VNPay" },
                ] as const).map((m) => (
                  <label key={m.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === m.id ? "border-[#C8A96A] bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)} className="accent-[#C8A96A]" />
                    <span className={paymentMethod === m.id ? "text-[#C8A96A]" : "text-gray-400"}>{m.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Đơn hàng */}
          <div className="h-full">
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>
                Đơn hàng
              </h2>

              {/* Sản phẩm */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => {
                  const name = item.product?.name || "Sản phẩm";
                  const idx = name.charCodeAt(0) % PLACEHOLDERS.length;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-amber-50 shrink-0">
                        <Image src={PLACEHOLDERS[idx]} alt={name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                        {item.variant && <p className="text-xs text-gray-400">{item.variant.size}</p>}
                        <p className="text-xs text-gray-400">{formatPrice(item.price)} x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-700 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* MÃ GIẢM GIÁ */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag size={14} className="text-[#C8A96A]" /> Mã giảm giá
                </h3>

                {voucherResult ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-green-400 bg-green-50">
                    <Check size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-green-700">{voucherResult.voucher.code}</p>
                      <p className="text-xs text-green-600">
                        {voucherResult.voucher.description || "Áp dụng thành công"}
                      </p>
                    </div>
                    <button onClick={handleRemoveVoucher} className="text-gray-400 hover:text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className={`flex-1 flex items-center border rounded-xl px-3 py-2.5 ${
                      voucherError ? "border-red-300" : "border-gray-200"
                    }`}>
                      <Tag size={14} className="text-[#C8A96A] mr-2" />
                      <input
                        type="text"
                        placeholder="Nhập mã ưu đãi"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value.toUpperCase());
                          setVoucherError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                        className="w-full bg-transparent outline-none text-sm"
                      />
                    </div>

                    <button
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode.trim() || applyingVoucher}
                      className="px-4 py-2 btn-gold rounded-xl text-sm disabled:opacity-50"
                    >
                      {applyingVoucher ? <Loader2 size={14} className="animate-spin" /> : "Áp dụng"}
                    </button>
                  </div>
                )}

                {voucherError && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {voucherError}
                  </p>
                )}
              </div>

              {/* Tính tiền */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span>Giao hàng</span>
                  <span className={shippingFee === 0 ? "text-green-500 font-medium" : ""}>
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>

                {discountAmt > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> {voucherResult?.voucher.code}
                    </span>
                    <span className="font-medium">-{formatPrice(discountAmt)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
                  <span>Tổng cộng</span>
                  <span className="text-[#C8A96A]">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddressId || loadingAddr}
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {placing
                  ? <><Loader2 size={15} className="animate-spin" /> Đang xử lý...</>
                  : paymentMethod === "cod"
                  ? "Đặt hàng ngay"
                  : paymentMethod === "vnpay"
                  ? "Thanh toán VNPay"
                  : paymentMethod === "momo"
                  ? "Thanh toán MoMo": "Thanh toán"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
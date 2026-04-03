import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBfM0_6bnEhqMGhO1tufVLK1ucQs_qn2utr--3EGwIPC9MenTe02BiZsCIk79N5macjEmwUCtdEvwd2fvvns2VGfTntlVBLLE-8LmyoWWC6T0TaGnEbvnazsx-9avY2Op7RIZYLMH2BlL5grbznxfKxM36_0ojpQHfQQv6wqiZRuEK3_k9QfyyauXQXAvqSWzSbbaijWnMyXkw8nr9EAoQ72FZ-PBGlH7iHdbKGRl9Obe9ZwOiEyvjXERo43oVnr0EDQElpWq6boGU";

const MISSION_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBIDY9omZPmKn11ue85xx0RpjGRwFfsQzvzBU6azsNFAtSgloGFzPLjFZ1asuuz432Ho4xrajHSrrVX8oqUUhvEdjuE9XJ3gQmuWw26EyP-UJoBIn26w_xLnOS01_04kiEXQ6YZq0DV1gEhsFCMPLKwybei0B5xZTY4ruw19bKIwqfTyhJDQ48xzFZpRFtgG9BZojbve3J3qNkQzfcgfKOkpU_rxpkr40fc9oxfT41ZMoNP88QkC9v_Hhv3ZbKKiZL2zaN4YUMd70M";

export default function AboutContact() {
  const [sent, setSent] = useState(false);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getContactConfig()
      .then((c) => {
        if (!cancelled) setContact(c);
      })
      .catch(() => {
        if (!cancelled) setContact({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hotlineDisplay = (contact?.hotline || contact?.phone || "").trim() || "1900 1234";
  const emailDisplay = (contact?.email || "").trim() || "hello@pqlfood.vn";
  const addressDisplay =
    (contact?.address || "").trim() ||
    "Tòa nhà Botanica, Quận 1,\nTP. Hồ Chí Minh, Việt Nam";

  function onSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="bg-surface text-on-surface">
      <section className="relative min-h-[420px] md:min-h-[520px] flex items-center overflow-hidden">
        <img alt="" src={HERO_IMG} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary-container/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-none mb-4 md:mb-6 font-headline">
            Câu chuyện của PQLFood
          </h1>
          <p className="text-emerald-50 text-lg md:text-xl font-medium max-w-xl opacity-90 leading-relaxed">
            Mang sự tươi ngon từ nông trại đến tận bàn ăn của mọi gia đình Việt.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-6 md:pr-8">
              <h2 className="text-primary-container text-3xl md:text-5xl font-bold tracking-tight leading-tight font-headline">
                Tại sao chọn PQLFood?
              </h2>
              <div className="space-y-4 text-on-surface-variant text-base md:text-lg leading-relaxed">
                <p>
                  Tại PQLFood, chúng tôi tin rằng thực phẩm tốt bắt đầu từ sự tôn trọng thiên nhiên. Quy trình
                  khép kín đảm bảo mỗi sản phẩm giữ trọn dinh dưỡng và hương vị.
                </p>
                <p>
                  Minh bạch nguồn gốc và tiêu chuẩn an toàn — để bạn an tâm cho bữa ăn gia đình.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-3 bg-primary-container text-white px-6 py-3.5 rounded-md font-semibold hover:opacity-95 transition-opacity"
              >
                Mua sắm ngay
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low">
                <img src={MISSION_IMG} alt="Nông trại" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-primary-fixed/20 rounded-full blur-3xl -z-10 hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { icon: "eco", t: "Khắt khe trong lựa chọn nguồn gốc thực phẩm." },
              { icon: "local_shipping", t: "Giao trong ngày, giữ độ tươi và lạnh." },
              { icon: "verified_user", t: "Giá minh bạch, chất lượng rõ ràng." },
            ].map((v) => (
              <div
                key={v.t}
                className="p-8 md:p-10 bg-surface-container-lowest rounded-xl flex flex-col gap-5 hover:-translate-y-1 transition-transform shadow-sm"
              >
                <div className="w-14 h-14 rounded-full bg-secondary-fixed-dim flex items-center justify-center text-on-secondary-fixed-variant">
                  <span className="material-symbols-outlined text-3xl">{v.icon}</span>
                </div>
                <p className="text-lg md:text-xl font-bold text-primary leading-snug font-headline">{v.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-primary-container text-3xl md:text-5xl font-bold tracking-tight mb-12 md:mb-16 font-headline">
            Liên hệ chúng tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div>
              {sent ? (
                <p className="text-primary-container font-semibold">
                  Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất có thể.
                </p>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-outline block mb-2">
                        Họ tên
                      </label>
                      <input
                        required
                        className="w-full bg-surface-container-highest/40 border-none focus:ring-1 focus:ring-primary/20 rounded-md py-3.5 px-4 outline-none"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-outline block mb-2">
                        SĐT
                      </label>
                      <input
                        className="w-full bg-surface-container-highest/40 border-none focus:ring-1 focus:ring-primary/20 rounded-md py-3.5 px-4 outline-none"
                        type="tel"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-outline block mb-2">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-surface-container-highest/40 border-none focus:ring-1 focus:ring-primary/20 rounded-md py-3.5 px-4 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-outline block mb-2">
                      Lời nhắn
                    </label>
                    <textarea
                      rows={4}
                      className="w-full bg-surface-container-highest/40 border-none focus:ring-1 focus:ring-primary/20 rounded-md py-3.5 px-4 outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-primary-container text-white px-10 py-4 rounded-md font-extrabold tracking-widest text-sm hover:opacity-95"
                  >
                    GỬI NGAY
                  </button>
                </form>
              )}
            </div>
            <div className="bg-surface-container-low rounded-xl p-8 md:p-12 relative overflow-hidden">
              <div className="space-y-10 relative z-10">
                <div>
                  <h3 className="text-on-secondary-fixed-variant text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    Hotline
                  </h3>
                  <p className="text-2xl md:text-3xl font-bold text-primary font-headline">
                    <a href={`tel:${String(hotlineDisplay).replace(/\s/g, "")}`} className="hover:underline">
                      {hotlineDisplay}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-on-secondary-fixed-variant text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    Email
                  </h3>
                  <p className="text-xl md:text-2xl font-bold text-primary font-headline break-all">
                    <a href={`mailto:${emailDisplay}`} className="hover:underline">
                      {emailDisplay}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-on-secondary-fixed-variant text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    Văn phòng
                  </h3>
                  <p className="text-base md:text-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {addressDisplay}
                  </p>
                </div>
                {(contact?.openingHours || "").trim() ? (
                  <div>
                    <h3 className="text-on-secondary-fixed-variant text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                      Giờ làm việc
                    </h3>
                    <p className="text-base text-on-surface-variant whitespace-pre-line">
                      {contact.openingHours.trim()}
                    </p>
                  </div>
                ) : null}
                {(contact?.zalo || "").trim() || (contact?.facebookUrl || "").trim() ? (
                  <div className="flex flex-wrap gap-4 pt-2">
                    {(contact?.zalo || "").trim() ? (
                      <span className="text-sm text-primary font-semibold">
                        Zalo: {contact.zalo.trim()}
                      </span>
                    ) : null}
                    {(contact?.facebookUrl || "").trim() ? (
                      <a
                        href={contact.facebookUrl.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary font-semibold underline"
                      >
                        Facebook
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="absolute -right-16 -bottom-16 opacity-[0.07] pointer-events-none">
                <span className="material-symbols-outlined text-[200px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                  eco
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

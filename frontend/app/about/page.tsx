"use client";

import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="bg-[#F7F6F3] text-stone-700 font-sans antialiased">
      {/* HERO – có ảnh nền */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
        {/* Ảnh nền */}
        <Image
          src="/cake.jpg"
          alt="Witchy Bakery - Bánh kem thủ công"
          fill
          className="object-cover"
          priority
        />
        {/* Lớp phủ tối để text nổi bật */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Nội dung text */}
        <div className="relative z-10 text-center px-4 max-w-2xl text-white">
          <span className="text-xs tracking-[0.2em] font-light uppercase text-white/80 mb-3 block">
            Về chúng tôi
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-light leading-tight">
            Câu chuyện &<br />Giá trị cốt lõi
          </h1>
        </div>
      </section>

      {/* Nội dung chính (giữ nguyên như cũ) */}
      <div className="max-w-3xl mx-auto px-6 py-8 md:py-12 space-y-16">
        
        {/* 1. Câu chuyện thương hiệu */}
        <section>
          <h2 className="text-sm uppercase tracking-[0.2em] font-medium mb-4">
            Câu chuyện
          </h2>
          <p className="text-2xl md:text-3xl font-serif font-light text-stone-800 leading-relaxed mb-6">
            Những chiếc bánh kem đầu tiên từ một tình yêu ngọt ngào.
          </p>
          <div className="space-y-5 text-stone-600 leading-relaxed">
            <p>
              Witchy Bakery bắt đầu bằng những lần thử nghiệm bánh kem trong căn bếp nhỏ giữa Sài Gòn. Chúng tôi không qua trường lớp bài bản, nhưng có niềm đam mê mãnh liệt với việc tạo ra những lớp bông lan mềm mịn, những lớp kem tươi thơm bơ, và những chiếc bánh không chỉ đẹp mà còn chạm đến cảm xúc.
            </p>
            <p>
              Từ chiếc bánh sinh nhật đầu tiên cho một người bạn, những đơn hàng nhỏ lẻ dần trở thành tiệm bánh nhỏ nhưng đầy ắp tiếng cười. Chúng tôi không muốn mở rộng ồ ạt, chỉ muốn mỗi chiếc bánh kem ra lò đều được làm thủ công, tỉ mỉ từ khâu chọn nguyên liệu đến từng đường phun kem. Witchy Bakery là nơi những chiếc bánh kể chuyện bằng vị ngọt và sự chân thành.
            </p>
          </div>
          <div className="mt-8 border-l-2 border-stone-200 pl-6 py-2">
            <p className="text-stone-500 italic text-lg">
              “Mỗi chiếc bánh kem của chúng tôi như một lời chúc viết bằng kem – ngọt ngào, cá tính và không bao giờ lặp lại.”
            </p>
            <p className="mt-2 text-sm text-stone-400">— Linh Nguyễn, Founder & Head Baker</p>
          </div>
          {/* Ảnh minh họa căn bếp */}
          <div className="mt-10 relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-200">
            <Image
              src="/cake1.jpg"
              alt="Căn bếp làm bánh kem của Witchy Bakery"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-sm text-stone-500 text-xs px-3 py-1.5 text-center">
              Căn bếp nhỏ – nơi những chiếc bánh kem đầu tiên ra đời
            </div>
          </div>
        </section>

        {/* 2. Ý nghĩa thương hiệu */}
        <section>
          <h2 className="text-sm uppercase tracking-[0.2em] font-medium mb-4">
            Ý nghĩa thương hiệu
          </h2>
          <div className="space-y-5 text-stone-600 leading-relaxed">
            <p>
              <span className="font-serif text-xl text-stone-700">Witchy</span> – 
              không phải phù thủy theo nghĩa huyền bí, mà là sự “phù” (giúp đỡ) và “thủy” (nước, sự mềm mại). Chúng tôi muốn mỗi chiếc bánh kem giống như một phép màu nhỏ: từ bột, trứng, bơ, đường – qua đôi tay nhào nặn và trái tim yêu nghề – hóa thành niềm vui trên bàn tiệc.
            </p>
            <p>
              Witchy Bakery ra đời với mong muốn làm bánh kem cho người Việt từ những nguyên liệu Việt thân thuộc: bột gạo, bột nếp, đậu xanh, khoai môn, dừa, gấc, lá dứa… Chúng tôi tin rằng hương vị quê nhà luôn có cách chạm đến trái tim một cách tự nhiên nhất.
            </p>
          </div>
        </section>

        {/* 3. Triết lý */}
        <section>
          <h2 className="text-sm uppercase tracking-[0.2em] font-medium mb-4">
            Triết lý
          </h2>
          <div className="space-y-5 text-stone-600 leading-relaxed">
            <p>
              Chúng tôi yêu việc khám phá các nguyên liệu bản địa và biến chúng thành những chiếc bánh kem độc đáo. Khoai lang tím, bơ sáp, chanh dây, trà xanh – tất cả đều có thể trở thành linh hồn cho một lớp kem hoặc một tầng bánh. Bánh kem của Witchy Bakery không chỉ ngon ở vị ngọt đầu lưỡi, mà còn để lại dư vị tự nhiên, thanh khiết.
            </p>
            <p>
              Đối với chúng tôi, một chiếc bánh kem ngon phải đạt ba tiêu chí: <strong>an toàn</strong> (không phẩm màu, không chất bảo quản), <strong>tinh tế</strong> (cân bằng vị ngọt – béo – chua), và <strong>yêu thương</strong> (được làm bằng tất cả sự tập trung và niềm vui).
            </p>
          </div>
        </section>

        {/* 4. Sứ mệnh */}
        <section>
          <h2 className="text-sm uppercase tracking-[0.2em] font-medium mb-4">
            Sứ mệnh
          </h2>
          <div className="space-y-5 text-stone-600 leading-relaxed">
            <p>
              Chúng tôi sinh ra để mang đến những chiếc bánh kem tươi ngon, lành mạnh từ các nguyên liệu gần gũi, đáng tin cậy. Sứ mệnh của Witchy Bakery là áp dụng lợi ích của thực phẩm sạch vào nghệ thuật làm bánh, tạo ra các sản phẩm phù hợp cho mọi lứa tuổi, kể cả người ăn chay, người dị ứng hoặc trẻ nhỏ.
            </p>
            <p className="italic text-stone-500">
              Hành trình tìm kiếm một chiếc bánh kem trọn vẹn không phải là nhiệm vụ của riêng bạn. Chúng tôi sẽ cùng bạn đi trên hành trình đó – từ khâu chọn bánh đến giây phút thưởng thức.
            </p>
          </div>
        </section>

        {/* 5. Cam kết */}
        <section>
          <h2 className="text-sm uppercase tracking-[0.2em] font-medium mb-4">
            Cam kết
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-800 mb-1">Bánh kem tươi mỗi ngày</h3>
              <p className="text-stone-500 text-sm uppercase tracking-wide mb-1">BỘT MỚI – KEM TƯƠI – BÁNH KHÔNG QUA ĐÊM</p>
              <p className="text-stone-600 leading-relaxed">
                Mỗi chiếc bánh kem của Witchy Bakery đều được làm trong ngày, sử dụng kem tươi, bơ lạt nhập khẩu, trứng gà ta và sữa tươi không đường. Chúng tôi không bao giờ bán bánh để qua đêm.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-800 mb-1">Không chất bảo quản – không phẩm màu</h3>
              <p className="text-stone-500 text-sm uppercase tracking-wide mb-1">MÀU TỰ NHIÊN TỪ RAU CỦ</p>
              <p className="text-stone-600 leading-relaxed">
                Màu sắc trên bánh được lấy từ củ dền, bột matcha, than tre, gấc, lá dứa… tuyệt đối không dùng phẩm màu công nghiệp hay chất bảo quản. An toàn cho cả mẹ bầu và trẻ nhỏ.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-800 mb-1">Tận tâm từ khâu nhào bột đến phun kem</h3>
              <p className="text-stone-500 text-sm uppercase tracking-wide mb-1">100% THỦ CÔNG – KHÔNG KHUÔN MÁY</p>
              <p className="text-stone-600 leading-relaxed">
                Mỗi chiếc bánh đều được trộn bột bằng tay, cán bông lan thủ công, và phun kem trực tiếp theo yêu cầu. Không có hai chiếc bánh giống hệt nhau, bởi mỗi chiếc đều có dấu ấn riêng của người thợ.
              </p>
            </div>
          </div>
          {/* Ảnh minh họa bánh kem */}
          <div className="mt-10 relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-200">
            <Image
              src="/cake.jpg"
              alt="Bàn tay tỉ mỉ trang trí bánh kem"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-sm text-stone-500 text-xs px-3 py-1.5 text-center">
              Từng đường kem – từng trái tim
            </div>
          </div>
        </section>

        {/* 6. Hành động & chứng nhận */}
        <section>
          <h2 className="text-sm uppercase tracking-[0.2em] font-medium mb-4">
            Hành động đi đôi với cam kết
          </h2>
          <div className="space-y-5 text-stone-600 leading-relaxed">
            <p>
              Witchy Bakery áp dụng bộ tiêu chuẩn <strong>“Bánh kem không tàn ác” (Cruelty Free Cake)</strong> – 
              không sử dụng mật ong, sáp ong, sữa từ động vật nuôi nhốt trong các dòng bánh thuần chay. Với bánh kem thông thường, chúng tôi chỉ dùng trứng gà thả vườn và sữa bò hữu cơ, đảm bảo động vật được đối xử nhân đạo.
            </p>
            <p>
              Chúng tôi cũng hạn chế tối đa rác thải nhựa, khuyến khích khách hàng sử dụng hộp giấy tái chế và mang theo hộp đựng bánh riêng. Mỗi chiếc bánh xuất xưởng đều in biểu tượng <span className="font-serif italic">“Bánh từ trái tim”</span> – 
              lời cam kết trực quan: <strong>bánh tươi – bánh thật – bánh có trách nhiệm</strong>.
            </p>
            <div className="border-l-2 border-stone-200 pl-6 py-2">
              <p className="text-stone-700 text-sm">
                Witchy Bakery tự hào là thương hiệu bánh kem thủ công 100% sản xuất tại Việt Nam, 
                với tình yêu dành cho thiên nhiên và con người. Mỗi chiếc bánh ra đi đều kèm theo một tấm thiệp viết tay – bởi chúng tôi tin, ngọt ngào nhất vẫn là sự chân thành.
              </p>
            </div>
            <p className="text-stone-400 text-sm italic">
              Hãy để Witchy Bakery cùng bạn tạo nên những kỷ niệm ngọt ngào qua từng chiếc bánh kem.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
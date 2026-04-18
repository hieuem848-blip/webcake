import Review from "../models/Review.js";
import Order from "../models/Order.js";

// Tạo review
export const createReview = async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body;

    // Kiểm tra order tồn tại
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order không tồn tại" });
    }

    // Tạo review
    const review = await Review.create({
      user: req.user._id,
      order: orderId,
      product: productId,
      rating,
      comment,
    });

    // Sau 15 phút tự động phản hồi
    setTimeout(
      async () => {
        await Review.findByIdAndUpdate(review._id, {
          autoReply:
            "Cảm ơn bạn đã đánh giá sản phẩm. Chúng tôi rất trân trọng góp ý của bạn ❤️",
          autoReplyAt: new Date(),
        });
      },
      15 * 60 * 1000,
    ); // 15 phút

    res.status(201).json({
      message: "Đánh giá thành công. Hệ thống sẽ phản hồi sau 15 phút.",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Lỗi tạo đánh giá" });
  }
};

// Lấy review của product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy review" });
  }
};

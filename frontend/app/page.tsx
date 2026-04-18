import BrandSectionPage from "./components/home/BrandSection";
import CommitmentSectionPage from "./components/home/CommitmentSection";
import HeroBannerPage from "./components/home/HeroBanner";
import NewsSectionPage from "./components/home/NewsSection";
import OrderCakePage from "./components/home/OrderCake";
import SubscribePage from "./components/home/Subscribe";
import FeaturedProducts from "./components/home/FeaturedProducts";

export default function Home() {
  return (
    <main>
      <HeroBannerPage />
      <OrderCakePage />
      <FeaturedProducts />
      <CommitmentSectionPage />
      <BrandSectionPage />
      <NewsSectionPage />
      <SubscribePage />
    </main>
  );
}

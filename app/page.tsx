import Link from "next/link";
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <main className="landing">
      {/* Подключаем умную навигацию */}
      <Navbar />

      <div className="hero hero-centered">
        <div className="hero-content">
          <span className="eyebrow">✦ BUILT FOR MINECRAFT</span>
          
          <h1>
            Femboy<span>Client</span>
          </h1>
          
          <p>
            Discover a new Minecraft experience.
            <br />
            Everything you need in one client.
          </p>

          <div className="hero-buttons">
            <Link href="/register" className="hero-primary">
              Create an account ↗
            </Link>
            <Link href="/pricing" className="hero-secondary">
              See pricing
            </Link>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <span>FEMBOYCLIENT © 2026</span>
        <span>MADE FOR MINECRAFT</span>
      </div>
    </main>
  );
}
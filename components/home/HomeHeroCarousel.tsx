"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { HomeHeroSlide } from "../../lib/home";
import styles from "./HomeHeroCarousel.module.css";

type HomeHeroCarouselProps = {
  slides: HomeHeroSlide[];
};

const ROTATION_INTERVAL_MS = 5000;

function getSlideSubtitle(slide: HomeHeroSlide) {
  if (slide.targetType === "ACTIVITY_PAGE") {
    return "Campaign page preview is live now. Tap to open the placeholder page.";
  }

  return "Discover this featured product and continue to the product detail page.";
}

function getSlideBadge(slide: HomeHeroSlide) {
  return slide.targetType === "ACTIVITY_PAGE" ? "Campaign" : "Featured Product";
}

export function HomeHeroCarousel({ slides }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex > slides.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const activeSlide = slides[activeIndex];

  if (!activeSlide) {
    return null;
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.card}>
        {activeSlide.imageUrl ? (
          <img alt={activeSlide.title} className={styles.imageLayer} src={activeSlide.imageUrl} />
        ) : (
          <div aria-hidden="true" className={styles.imageFallback} />
        )}
        <div aria-hidden="true" className={styles.overlay} />
        <div className={styles.content}>
          <span className={styles.badge}>{getSlideBadge(activeSlide)}</span>
          <h1 className={styles.title}>{activeSlide.title}</h1>
          <p className={styles.subtitle}>{getSlideSubtitle(activeSlide)}</p>
          <Link className={styles.cta} href={activeSlide.href}>
            View banner →
          </Link>
        </div>
        {slides.length > 1 ? (
          <div className={styles.dots}>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                aria-label={`Go to banner ${index + 1}`}
                className={index === activeIndex ? styles.dotActive : styles.dot}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
